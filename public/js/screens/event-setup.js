/**
 * WWSC — Times Sheet Screen (Excel-Style Spreadsheet)
 * Matches Bryan's "Times Sheet" + "Event Entry" workflow.
 * Combines: PB times display, attendance marking, event config (Standard/Special).
 */
let currentEvent = null;
let attendanceData = [];
let eventConfig = { standard_event: 'ordinary_swim', special_event: null };

const STANDARD_EVENTS = [
  { id: 'ordinary_swim', label: 'Ordinary Swim' },
  { id: '25m_brace', label: '25m Brace' },
  { id: '50m_brace', label: '50m Brace' },
  { id: 'pogo', label: 'Pogo' },
];

const SPECIAL_EVENTS = [
  { id: '', label: '— None —' },
  { id: '75m', label: '75m' },
  { id: 'backstroke', label: 'Backstroke' },
  { id: 'breaststroke', label: 'Breaststroke' },
  { id: 'butterfly', label: 'Butterfly' },
  { id: 'medley_relay', label: 'Medley Relay' },
];

async function renderEventSetup() {
  currentEvent = await API.getCurrentEvent();
  const el = document.getElementById('content');

  if (!currentEvent) {
    const today = new Date().toISOString().slice(0, 10);
    el.innerHTML = `
      <h1>Times Sheet</h1>
      <div class="card">
        <h2>Start New Weekly Event</h2>
        <div class="form-group">
          <label>Event Date</label>
          <input type="hidden" id="event-date" value="${today}">
          <button class="btn btn-outline" id="event-date-btn" onclick="pickEventDate()" style="font-size:18px;padding:12px 20px;min-height:56px;width:100%;text-align:left">
            📅 ${formatDateNice(today)}
          </button>
        </div>
        <button class="btn btn-primary btn-lg btn-block" onclick="createNewEvent()">🏊 Create Event</button>
      </div>
    `;
    return;
  }

  attendanceData = await API.getAttendance(currentEvent.id);
  try {
    eventConfig = await API.getEventConfig(currentEvent.id);
    if (!eventConfig.standard_event) eventConfig.standard_event = 'ordinary_swim';
  } catch (e) {
    eventConfig = { standard_event: 'ordinary_swim', special_event: null };
  }

  drawEventSetup();
}

function drawEventSetup() {
  const el = document.getElementById('content');
  const attendingCount = attendanceData.filter(a => a.present).length;
  const specialCount = attendanceData.filter(a => 
    a.special_event_entry === 'Y' || ['Back','Breast','Free'].includes(a.special_event_entry)
  ).length;
  const hasSpecial = !!eventConfig.special_event;
  const isMedley = eventConfig.special_event === 'medley_relay';

  // Column header for the combined attendance & entry column
  const entryHeader = hasSpecial ? 'Attendance &amp; entries' : 'Attendance';

  // Right-side columns for special event participation (like Excel shows per-discipline Y/N columns)
  const specialShort = getSpecialShort();

  el.innerHTML = `
    <div class="toolbar" style="align-items:flex-start">
      <h1 style="margin:0">Times Sheet</h1>
      <div class="date-picker-inline">
        <button class="btn btn-outline date-picker-btn" onclick="openEventDatePicker()" style="font-size:16px;padding:8px 16px;min-height:48px">
          📅 ${formatDateNice(currentEvent.date)}
        </button>
      </div>
      <div class="toolbar-spacer"></div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        <button class="btn btn-primary" onclick="doBuildHeats()" style="background:#16a34a;font-size:18px;padding:14px 32px;min-height:52px;border-radius:8px;font-weight:700;letter-spacing:0.5px">
          🏊 Build Heats ${tooltip('Go to Heat Builder to generate randomised heat assignments based on attendance and PB times.')}
        </button>
        <button class="btn btn-outline" onclick="doNewWeek()" style="color:#aaa;border-color:#ddd;font-size:11px;padding:3px 10px;font-weight:400">🔄 Discard & Start New Event</button>
      </div>
    </div>

    <!-- Event Type Dropdowns -->
    <div class="dropdown-row">
      <div class="dropdown-group">
        <label>Standard Distances ${tooltip('<b>Per Bryan\'s Excel (Cell I10):</b><br><br><b>Standard races (always included):</b><br>• 25m Freestyle<br>• 50m Freestyle<br>• 25m Team Relay<br><br><b>Relay Type Options:</b><br>• <b>Ordinary Swim</b> = Standard only (3 races)<br>• <b>25m Brace</b> = +Pairs relay, scored by closest to combined PB<br>• <b>50m Brace</b> = +Pairs relay (50m), scored same way<br>• <b>Pogo</b> = +Alternating laps relay, scored by closest to target')}</label>
        <select id="sel-standard" onchange="onConfigChange()">
          ${STANDARD_EVENTS.map(e => `<option value="${e.id}" ${eventConfig.standard_event === e.id ? 'selected' : ''}>${e.label}</option>`).join('')}
        </select>
      </div>
      <div class="dropdown-group">
        <label>Special Event ${tooltip('<b>Per Bryan\'s Excel (Cell I11):</b><br><br>Optional extra race chosen each week:<br>• <b>75m</b> = Individual 75m freestyle<br>• <b>Backstroke</b> = Individual backstroke<br>• <b>Breaststroke</b> = Individual breaststroke<br>• <b>Butterfly</b> = Individual butterfly<br>• <b>Medley Relay</b> = 3-person team (Back + Breast + Free)<br><br>Only swimmers marked Y (or stroke for Medley) will participate.')}</label>
        <select id="sel-special" onchange="onConfigChange()">
          ${SPECIAL_EVENTS.map(e => `<option value="${e.id}" ${eventConfig.special_event === e.id ? 'selected' : ''}>${e.label}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="card" style="padding:16px;margin-bottom:16px;background:#fff8e1;border-left:8px solid #f59e0b">
      <div style="font-weight:700;margin-bottom:4px">💡 Special Event Entry Rules:</div>
      <div style="font-size:15px">
        <strong>"Y"</strong> = Swimmer is entered into <strong>ALL</strong> events including the Special Event.<br>
        <strong>"N"</strong> = Swimmer is entered into <strong>Standard Events only</strong> (25m/50m/Relays) and NOT the Special Event.
      </div>
    </div>

    <!-- Attendance Info -->
    <div style="display:flex;gap:16px;margin-bottom:8px;align-items:center;flex-wrap:wrap">
      <span><strong>Attendance ${tooltip('Tap a checkbox to mark swimmers as present. Use Select All / Deselect All for quick changes.')}:</strong> ${attendingCount}</span>
      ${hasSpecial ? `<span><strong>${specialShort}:</strong> ${specialCount}</span>` : ''}
      <div class="toolbar-spacer"></div>
      <button class="btn btn-outline" style="min-height:36px;padding:6px 16px;font-size:14px" onclick="toggleAllAttendance(true)">✓ Select All</button>
      <button class="btn btn-outline" style="min-height:36px;padding:6px 16px;font-size:14px" onclick="toggleAllAttendance(false)">✗ Deselect All</button>
    </div>

    <!-- Spreadsheet Table -->
    <div style="overflow-x:auto;margin-bottom:16px">
      <table class="spreadsheet-table">
        <thead>
          <tr>
            <th style="width:35px">No.</th>
            <th style="text-align:left;min-width:150px">Name</th>
            <th>25m</th>
            <th>50m</th>
            <th>75m</th>
            <th>Backstroke</th>
            <th>BreastStroke</th>
            <th>Butterfly</th>
            <th style="min-width:90px">${entryHeader}</th>
          </tr>
        </thead>
        <tbody>
          ${attendanceData.map((a, i) => renderAttRow(a, i)).join('')}
        </tbody>
        <tfoot>
          <tr class="summary-row">
            <td></td>
            <td style="text-align:left"><strong>Attendance</strong></td>
            <td></td><td></td><td></td><td></td><td></td><td></td>
            <td><strong>${attendingCount}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Action Buttons -->
    <div class="quick-actions">
      <button class="btn btn-success btn-lg" onclick="doBuildHeats()" ${attendingCount < 3 ? 'disabled' : ''}>
        🏊 Build Heats ${tooltip('Generates randomised heat assignments (4 lanes per heat) based on PB times. Swimmers without a PB for this distance will be skipped.')}
      </button>
    </div>
    ${attendingCount < 3 ? '<p style="color:var(--danger);margin-top:8px;font-size:14px">Need at least 3 swimmers present</p>' : ''}
  `;
}

function renderAttRow(a, idx) {
  const hasSpecial = !!eventConfig.special_event;
  const isMedley = eventConfig.special_event === 'medley_relay';

  // Combined attendance & entry cell — exactly like Bryan's Excel
  let entryCell;
  if (hasSpecial) {
    if (isMedley) {
      const cls = getEntryCls(a);
      entryCell = `<td class="entry-cell">
        <select class="entry-select ${cls}" 
                onchange="setEntry(${a.member_id}, this.value)" onclick="event.stopPropagation()">
          <option value="" ${!a.present ? 'selected' : ''}>—</option>
          <option value="Y" ${a.present && a.special_event_entry === 'Y' ? 'selected' : ''}>Y</option>
          <option value="N" ${a.present && (!a.special_event_entry || a.special_event_entry === 'N') ? 'selected' : ''}>N</option>
          <option value="Back" ${a.present && a.special_event_entry === 'Back' ? 'selected' : ''}>Back</option>
          <option value="Breast" ${a.present && a.special_event_entry === 'Breast' ? 'selected' : ''}>Breast</option>
          <option value="Free" ${a.present && a.special_event_entry === 'Free' ? 'selected' : ''}>Free</option>
        </select>
      </td>`;
    } else {
      const cls = getEntryCls(a);
      entryCell = `<td class="entry-cell">
        <select class="entry-select ${cls}"
                onchange="setEntry(${a.member_id}, this.value)" onclick="event.stopPropagation()">
          <option value="" ${!a.present ? 'selected' : ''}>—</option>
          <option value="Y" ${a.present && a.special_event_entry === 'Y' ? 'selected' : ''}>Y</option>
          <option value="N" ${a.present && (!a.special_event_entry || a.special_event_entry === 'N') ? 'selected' : ''}>N</option>
        </select>
      </td>`;
    }
  } else {
    // No special event — simple attendance toggle (click to toggle)
    const cls = a.present ? 'attend-yes' : 'attend-no';
    const txt = a.present ? '✓' : '';
    entryCell = `<td class="${cls}" onclick="toggleAttendance(${a.member_id})" style="cursor:pointer;font-weight:700">${txt}</td>`;
  }

  return `
    <tr>
      <td>${idx + 1}</td>
      <td class="name-cell">${a.name}</td>
      <td class="time-cell">${a.time_25m ?? '—'}</td>
      <td class="time-cell">${a.time_50m ?? '—'}</td>
      <td class="time-cell">${a.time_75m ?? '—'}</td>
      <td class="time-cell">${a.time_backstroke ?? '—'}</td>
      <td class="time-cell">${a.time_breaststroke ?? '—'}</td>
      <td class="time-cell">${a.time_butterfly ?? '—'}</td>
      ${entryCell}
    </tr>
  `;
}

function getEntryCls(a) {
  if (!a.present) return 'entry-empty';
  const val = a.special_event_entry || 'N';
  if (val === 'N') return 'entry-no';
  return 'entry-yes'; // Y, Back, Breast, Free = all positive
}

function getSpecialLabel() {
  const found = SPECIAL_EVENTS.find(e => e.id === eventConfig.special_event);
  return found ? found.label : '';
}

function getSpecialShort() {
  const map = { '75m': '75m', 'backstroke': 'Back', 'breaststroke': 'Breast', 'butterfly': 'Fly', 'medley_relay': 'Medley' };
  return map[eventConfig.special_event] || 'Special';
}

function formatDateNice(dateStr) {
  if (!dateStr) return 'Select Date';
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

// ── Actions ─────────────────────────────────────────

function openEventDatePicker() {
  showDatePicker(currentEvent.date, async function(newDate) {
    await updateEventDate(newDate);
    drawEventSetup();
  });
}

async function updateEventDate(newDate) {
  if (!newDate || !currentEvent) return;
  await fetch(`/api/events/${currentEvent.id}/date`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: newDate })
  });
  currentEvent.date = newDate;
}

function pickEventDate() {
  const current = document.getElementById('event-date').value;
  showDatePicker(current, function(newDate) {
    document.getElementById('event-date').value = newDate;
    document.getElementById('event-date-btn').innerHTML = '📅 ' + formatDateNice(newDate);
  });
}

async function createNewEvent() {
  const date = document.getElementById('event-date').value;
  if (!date) return alert('Please select a date');
  await API.createEvent(date);
  renderEventSetup();
}

function toggleAttendance(memberId) {
  const a = attendanceData.find(x => x.member_id === memberId);
  if (a) a.present = a.present ? 0 : 1;
  drawEventSetup();
}

function toggleAllAttendance(present) {
  attendanceData.forEach(a => {
    a.present = present ? 1 : 0;
    if (!present) a.special_event_entry = null;
  });
  drawEventSetup();
}

function setEntry(memberId, value) {
  const a = attendanceData.find(x => x.member_id === memberId);
  if (!a) return;
  if (value === '' || value === '—') {
    // Empty = not attending
    a.present = 0;
    a.special_event_entry = null;
  } else {
    // Any value (Y, N, Back, Breast, Free) = attending
    a.present = 1;
    a.special_event_entry = value;
  }
  drawEventSetup();
}

async function onConfigChange() {
  eventConfig.standard_event = document.getElementById('sel-standard').value;
  eventConfig.special_event = document.getElementById('sel-special').value || null;
  await API.updateEventConfig(currentEvent.id, eventConfig);
  
  // F32: Also update races when config changes (so Heat Builder shows correct races)
  const raceTypes = buildRaceTypes();
  await API.updateRaces(currentEvent.id, raceTypes);
  
  drawEventSetup();
}

async function doNewWeek() {
  if (!confirm('Start a new event? The current event will be saved to the Season Calendar. All results are preserved.')) return;
  await API.resetWeek();
  renderEventSetup();
}

async function doBuildHeats() {
  const attendingCount = attendanceData.filter(a => a.present).length;
  if (attendingCount < 3) return alert('Need at least 3 swimmers present');

  // F32: Explicitly read current values from DOM to avoid stale state
  const standardVal = document.getElementById('sel-standard')?.value || eventConfig.standard_event;
  const specialVal = document.getElementById('sel-special')?.value || eventConfig.special_event;
  
  eventConfig.standard_event = standardVal;
  eventConfig.special_event = specialVal === '' ? null : specialVal;

  // Save attendance
  await API.updateAttendance(currentEvent.id, attendanceData.map(a => ({
    member_id: a.member_id,
    present: a.present,
    special_event_entry: a.special_event_entry || null
  })));

  // Save config
  await API.updateEventConfig(currentEvent.id, eventConfig);

  // Determine race types from config
  const raceTypes = buildRaceTypes();
  const res = await API.updateRaces(currentEvent.id, raceTypes);
  
  if (res.error) {
    alert('Error updating races: ' + res.error);
    return;
  }

  // Update sidebar with active races
  window.activeRaces = raceTypes;
  
  // F32 fix: Clear old state and navigate with reset param to ensure fresh start
  navigate('heat-builder/reset');
}

function buildRaceTypes() {
  const types = [];
  // Standard always includes 25m + 50m individual
  types.push('25m', '50m');
  
  // Add standard event relay
  const std = eventConfig.standard_event;
  if (std === '25m_brace') types.push('25m_brace');
  else if (std === '50m_brace') types.push('50m_brace');
  else if (std === 'pogo') types.push('pogo');
  types.push('25m_relay'); // always have team relay

  // Add special event
  const special = eventConfig.special_event;
  if (special && special !== '') {
    types.push(special);
  }

  return [...new Set(types)];
}
