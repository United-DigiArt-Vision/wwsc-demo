/**
 * WWSC — Members Screen
 */
let membersCache = [];
let memberSearch = '';

async function renderMembers() {
  membersCache = await API.getMembers();
  drawMembersList();
}

function drawMembersList() {
  const filtered = membersCache.filter(m =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );
  const el = document.getElementById('content');
  const strokes = ['25m', '50m', '75m', 'Backstroke', 'Breaststroke', 'Butterfly'];
  const strokeKeys = ['time_25m', 'time_50m', 'time_75m', 'time_backstroke', 'time_breaststroke', 'time_butterfly'];

  el.innerHTML = `
    <h1>Members</h1>
    <div class="toolbar">
      <button class="btn btn-primary" onclick="showAddMemberModal()">+ Add Member</button>
      <button class="btn btn-outline" onclick="showImportModal()">📁 Import CSV</button>
      <div class="toolbar-spacer"></div>
      <input class="form-control" style="max-width:300px" placeholder="Search members..." value="${memberSearch}" oninput="memberSearch=this.value;drawMembersList()">
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
        ${filtered.map(m => `
          <tr>
            <td style="font-weight:600">${m.name}</td>
            <td><span class="tag ${m.is_active ? 'tag-active' : 'tag-inactive'}">${m.is_active ? 'Active' : 'Inactive'}</span></td>
            ${strokeKeys.map(k => `<td style="font-size:18px;font-weight:600">${m[k] != null ? m[k] + 's' : '—'}</td>`).join('')}
            <td><button class="btn btn-outline" onclick="showEditMemberModal(${m.id})">Edit</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    </div>
    <p style="margin-top:12px;color:var(--text-secondary)">${filtered.length} member${filtered.length !== 1 ? 's' : ''}</p>
  `;
}

function memberFormHtml(m) {
  const fields = [
    { key: 'name', label: 'Full Name', type: 'text' },
    { key: 'time_25m', label: '25m PB (seconds)', type: 'number' },
    { key: 'time_50m', label: '50m PB (seconds)', type: 'number' },
    { key: 'time_75m', label: '75m PB (seconds)', type: 'number' },
    { key: 'time_backstroke', label: 'Backstroke PB (seconds)', type: 'number' },
    { key: 'time_breaststroke', label: 'Breaststroke PB (seconds)', type: 'number' },
    { key: 'time_butterfly', label: 'Butterfly PB (seconds)', type: 'number' },
  ];
  return fields.map(f => `
    <div class="form-group">
      <label>${f.label}</label>
      <input class="form-control" id="mf-${f.key}" type="${f.type}" value="${m?.[f.key] ?? ''}" ${f.type === 'number' ? 'min="0"' : ''}>
    </div>
  `).join('') + (m?.id ? `
    <div class="form-group">
      <label>Status</label>
      <select class="form-control" id="mf-is_active">
        <option value="1" ${m.is_active ? 'selected' : ''}>Active</option>
        <option value="0" ${!m.is_active ? 'selected' : ''}>Inactive</option>
      </select>
    </div>
  ` : '');
}

function getMemberFormData(isEdit) {
  const val = (id) => document.getElementById(id)?.value;
  const intOrNull = (id) => { const v = val(id); return v !== '' && v != null ? parseInt(v) : null; };
  const data = {
    name: val('mf-name'),
    time_25m: intOrNull('mf-time_25m'),
    time_50m: intOrNull('mf-time_50m'),
    time_75m: intOrNull('mf-time_75m'),
    time_backstroke: intOrNull('mf-time_backstroke'),
    time_breaststroke: intOrNull('mf-time_breaststroke'),
    time_butterfly: intOrNull('mf-time_butterfly'),
  };
  if (isEdit) data.is_active = parseInt(val('mf-is_active'));
  return data;
}

function showAddMemberModal() {
  showModal('Add Member', memberFormHtml(null), [
    { label: 'Cancel', cls: 'btn-outline' },
    { label: 'Save', cls: 'btn-primary', action: async () => {
      const data = getMemberFormData(false);
      if (!data.name?.trim()) return showToast('Name is required', 'warning');
      await API.createMember(data);
      showToast(`${data.name} added successfully`);
      renderMembers();
    }}
  ]);
}

async function showEditMemberModal(id) {
  const m = await API.getMember(id);
  showModal('Edit Member', memberFormHtml(m), [
    { label: 'Cancel', cls: 'btn-outline' },
    { label: 'Deactivate', cls: 'btn-danger', action: async () => {
      confirmDialog('Deactivate Member', `Are you sure you want to deactivate ${m.name}?`, async () => {
        await API.toggleActive(m.id);
        showToast(`${m.name} deactivated`);
        renderMembers();
      });
    }},
    { label: 'Save', cls: 'btn-primary', action: async () => {
      const data = getMemberFormData(true);
      if (!data.name?.trim()) return showToast('Name is required', 'warning');
      await API.updateMember(id, data);
      showToast(`${data.name} updated`);
      renderMembers();
    }}
  ]);
}

function confirmDialog(title, message, onConfirm) {
  showModal(title, `<p style="font-size:16px;margin-bottom:8px">${message}</p>`, [
    { label: 'Cancel', cls: 'btn-outline' },
    { label: 'Confirm', cls: 'btn-danger', action: onConfirm }
  ]);
}

function showImportModal() {
  showModal('Import Members from CSV', `
    <p style="margin-bottom:12px">CSV format: <code>Name,25m,50m,75m,Backstroke,Breaststroke,Butterfly</code></p>
    <div class="file-upload" onclick="document.getElementById('csv-file').click()">
      <input type="file" id="csv-file" accept=".csv" onchange="handleCSVSelect(this)">
      <span id="csv-label">Tap to select CSV file</span>
    </div>
    <div id="csv-preview" style="margin-top:12px"></div>
  `, [
    { label: 'Cancel', cls: 'btn-outline' },
    { label: 'Import', cls: 'btn-success', action: handleCSVImport }
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
  if (!selectedCSVFile) return showToast('Please select a CSV file', 'warning');
  const result = await API.importCSV(selectedCSVFile);
  selectedCSVFile = null;
  if (result.error) {
    showToast('Import error: ' + result.error, 'error');
  } else {
    showToast(`Imported ${result.imported} members`, 'success');
    renderMembers();
  }
}
