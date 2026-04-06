/**
 * WWSC — Members Screen (v2.6.0+: whole seconds, filter buttons)
 */
let membersCache = [];
let memberSearch = '';
let memberFilter = 'active'; // 'active' | 'inactive' | 'all'

async function renderMembers() {
  membersCache = await API.getMembers();
  drawMembersList();
}

function drawMembersList() {
  const filtered = membersCache.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(memberSearch.toLowerCase());
    let matchesFilter = true;
    if (memberFilter === 'active') matchesFilter = !!m.is_active;
    else if (memberFilter === 'inactive') matchesFilter = !m.is_active;
    // 'all' shows everyone
    return matchesSearch && matchesFilter;
  });
  const el = document.getElementById('content');
  const strokes = ['25m', '50m', '75m', 'Backstroke', 'Breaststroke', 'Butterfly'];
  const strokeKeys = ['time_25m', 'time_50m', 'time_75m', 'time_backstroke', 'time_breaststroke', 'time_butterfly'];

  const previousFocus = document.activeElement && document.activeElement.id === 'members-search';
  const previousCursor = previousFocus ? document.activeElement.selectionStart : null;

  el.innerHTML = `
    <h1>Members</h1>
    <div class="toolbar">
      <button class="btn btn-primary" onclick="showAddMemberModal()">+ Add Member</button>
      <button class="btn btn-outline" onclick="showImportModal()">📁 Import CSV</button>
      <div class="toolbar-spacer"></div>
      <div style="display:flex;gap:4px">
        <button class="btn ${memberFilter === 'active' ? 'btn-primary' : 'btn-outline'}" style="min-height:40px;padding:8px 16px;font-size:14px" onclick="setMemberFilter('active')">Active</button>
        <button class="btn ${memberFilter === 'inactive' ? 'btn-primary' : 'btn-outline'}" style="min-height:40px;padding:8px 16px;font-size:14px" onclick="setMemberFilter('inactive')">Inactive</button>
        <button class="btn ${memberFilter === 'all' ? 'btn-primary' : 'btn-outline'}" style="min-height:40px;padding:8px 16px;font-size:14px" onclick="setMemberFilter('all')">All</button>
      </div>
      <input id="members-search" class="form-control" style="max-width:300px" placeholder="Search members..." value="${memberSearch}" oninput="memberSearch=this.value;drawMembersList()">
    </div>
    <div style="overflow-x:auto">
    <table class="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          ${strokes.map(s => `<th>${s}</th>`).join('')}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(m => {
          const isInactive = !m.is_active;
          const rowStyle = (memberFilter === 'all' && isInactive) ? 'opacity:0.6' : '';
          return `
          <tr style="${rowStyle}">
            <td style="font-weight:600">${m.name}${(memberFilter === 'all' && isInactive) ? ' <span style="color:#999;font-size:12px">(Inactive)</span>' : ''}</td>
            <td><span class="tag ${m.is_active ? 'tag-active' : 'tag-inactive'}">${m.is_active ? 'Active' : 'Inactive'}</span></td>
            ${strokeKeys.map(k => `<td style="font-size:18px;font-weight:600">${formatWhole(m[k])}</td>`).join('')}
            <td><button class="btn btn-outline" onclick="showEditMemberModal(${m.id})">Edit</button></td>
          </tr>
        `}).join('')}
      </tbody>
    </table>
    </div>
    <p style="margin-top:12px;color:var(--text-secondary)">${filtered.length} member${filtered.length !== 1 ? 's' : ''}</p>
  `;

  const searchInput = document.getElementById('members-search');
  if (searchInput && previousFocus) {
    searchInput.focus();
    const cursor = previousCursor != null ? previousCursor : memberSearch.length;
    searchInput.setSelectionRange(cursor, cursor);
  }
}

function setMemberFilter(f) {
  memberFilter = f;
  drawMembersList();
}

function memberFormHtml(m) {
  const fields = [
    { key: 'name', label: 'Full Name', type: 'text' },
    { key: 'time_25m', label: '25m PB (whole seconds, e.g. 13)', type: 'text' },
    { key: 'time_50m', label: '50m PB (whole seconds, e.g. 32)', type: 'text' },
    { key: 'time_75m', label: '75m PB (whole seconds, e.g. 52)', type: 'text' },
    { key: 'time_backstroke', label: 'Backstroke PB (whole seconds, e.g. 36)', type: 'text' },
    { key: 'time_breaststroke', label: 'Breaststroke PB (whole seconds, e.g. 38)', type: 'text' },
    { key: 'time_butterfly', label: 'Butterfly PB (whole seconds, e.g. 42)', type: 'text' },
  ];
  const isActive = m?.is_active ?? 1;
  return fields.map(f => {
    let displayVal = '';
    if (f.key === 'name') {
      displayVal = m?.[f.key] ?? '';
    } else {
      // Show whole seconds for editing
      displayVal = m?.[f.key] != null ? formatWhole(m[f.key]) : '';
      if (displayVal === '—') displayVal = '';
    }
    return `
    <div class="form-group">
      <label>${f.label}</label>
      <input class="form-control" id="mf-${f.key}" type="${f.type}" value="${displayVal}">
    </div>
  `}).join('') + `
    <div class="form-group">
      <label>Status</label>
      <select class="form-control" id="mf-is_active">
        <option value="1" ${isActive ? 'selected' : ''}>Active</option>
        <option value="0" ${!isActive ? 'selected' : ''}>Inactive</option>
      </select>
    </div>
  `;
}

function getMemberFormData(isEdit) {
  const val = (id) => document.getElementById(id)?.value;
  const timeOrNull = (id) => { const v = val(id); return parseWhole(v); };
  const data = {
    name: val('mf-name'),
    time_25m: timeOrNull('mf-time_25m'),
    time_50m: timeOrNull('mf-time_50m'),
    time_75m: timeOrNull('mf-time_75m'),
    time_backstroke: timeOrNull('mf-time_backstroke'),
    time_breaststroke: timeOrNull('mf-time_breaststroke'),
    time_butterfly: timeOrNull('mf-time_butterfly'),
  };
  data.is_active = parseInt(val('mf-is_active') ?? '1');
  return data;
}

function showAddMemberModal() {
  showModal('Add Member', memberFormHtml(null), [
    { label: 'Cancel', cls: 'btn-outline' },
    { label: 'Save', cls: 'btn-primary', action: async () => {
      const data = getMemberFormData(false);
      if (!data.name?.trim()) return alert('Name is required');
      await API.createMember(data);
      hideModal();
      renderMembers();
    }}
  ]);
}

async function showEditMemberModal(id) {
  const m = await API.getMember(id);
  showModal('Edit Member', memberFormHtml(m), [
    { label: 'Cancel', cls: 'btn-outline' },
    { label: 'Save Changes', cls: 'btn-primary', action: async () => {
      const data = getMemberFormData(true);
      if (!data.name?.trim()) return alert('Name is required');
      await API.updateMember(id, data);
      hideModal();
      renderMembers();
    }},
    { label: '🗑️ Delete Member', cls: 'btn-link', style: 'color:#dc3545;font-size:12px;margin-top:20px;width:100%;text-align:center;border:none;background:none;text-decoration:underline', action: async () => {
      await deleteMember(id);
      return false; // deleteMember handles its own closing
    }}
  ]);
}

async function deleteMember(id) {
  const m = membersCache.find(x => x.id === id);
  const name = m ? m.name : 'this member';
  if (!confirm('Delete ' + name + '? This cannot be undone. All history for this member will be lost.')) return;
  const resp = await fetch('/api/members/' + id, { method: 'DELETE' });
  const result = await resp.json();
  if (result.error) { alert('Error: ' + result.error); return; }
  hideModal();
  renderMembers();
}

function showImportModal() {
  showModal('Import Members from CSV', `
    <p style="margin-bottom:12px">CSV format: <code>Name,25m,50m,75m,Backstroke,Breaststroke,Butterfly</code></p>
    <p style="margin-bottom:12px;font-size:13px;color:var(--text-secondary)">Times can be in seconds (e.g. "13.45") or centiseconds (e.g. "1345"). The system detects the format automatically.</p>
    <div class="file-upload" onclick="document.getElementById('csv-file').click()">
      <input type="file" id="csv-file" accept=".csv" onchange="handleCSVSelect(this)">
      <span id="csv-label">Tap to select CSV file</span>
    </div>
    <div id="csv-preview" style="margin-top:12px"></div>
  `, [
    { label: 'Cancel', cls: 'btn-outline' },
    { label: 'Import', cls: 'btn-success', action: async () => { await handleCSVImport(); hideModal(); } }
  ]);
}

let selectedCSVFile = null;
function handleCSVSelect(input) {
  selectedCSVFile = input.files[0];
  if (selectedCSVFile) {
    document.getElementById('csv-label').textContent = `Selected: ${selectedCSVFile.name}`;
  }
}

async function handleCSVImport() {
  if (!selectedCSVFile) return alert('Please select a CSV file');
  const result = await API.importCSV(selectedCSVFile);
  selectedCSVFile = null;
  if (result.error) {
    alert('Import error: ' + result.error);
  } else {
    alert(`Imported ${result.imported} members${result.errors.length ? '\nWarnings: ' + result.errors.join(', ') : ''}`);
    renderMembers();
  }
}
