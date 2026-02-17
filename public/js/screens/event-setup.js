/**
 * WWSC — Event Setup Screen
 * Date, Attendance, Event Selection
 */
let currentEvent = null;
let attendanceData = [];
let selectedRaces = new Set();

const RACE_TYPES = {
  standard: [
    { id: '25m', label: '25m Freestyle' },
    { id: '50m', label: '50m Freestyle' },
  ],
  special: [
    { id: '75m', label: '75m Freestyle' },
    { id: 'backstroke', label: 'Backstroke' },
    { id: 'breaststroke', label: 'Breaststroke' },
    { id: 'butterfly', label: 'Butterfly' },
  ],
  relays: [
    { id: '25m_relay', label: '25m Team Relay' },
    { id: '25m_brace', label: '25m Brace Relay' },
    { id: '50m_brace', label: '50m Brace Relay' },
    { id: 'medley_relay', label: 'Medley Relay' },
    { id: 'pogo', label: 'Pogo' },
  ]
};

async function renderEventSetup() {
  currentEvent = await API.getCurrentEvent();
  const el = document.getElementById('content');

  if (!currentEvent) {
    // No event — show create form
    const today = new Date().toISOString().slice(0, 10);
    el.innerHTML = `
      <h1>Event Setup</h1>
      <div class="card">
        <h2>Start New Weekly Event</h2>
        <div class="form-group">
          <label>Event Date</label>
          <input class="form-control" type="date" id="event-date" value="${today}">
        </div>
        <button class="btn btn-primary btn-lg btn-block" onclick="createNewEvent()">🏊 Create Event</button>
      </div>
    `;
    return;
  }

  // Load attendance and races
  attendanceData = await API.getAttendance(currentEvent.id);
  const races = await API.getRaces(currentEvent.id);
  selectedRaces = new Set(races.map(r => r.race_type));

  drawEventSetup();
}

function drawEventSetup() {
  const el = document.getElementById('content');
  const presentCount = attendanceData.filter(a => a.present).length;

  el.innerHTML = `
    <h1>Event Setup — ${currentEvent.date}</h1>

    <!-- Attendance Section -->
    <div class="card">
      <div class="toolbar">
        <h2>Attendance (${presentCount} present)</h2>
        <div class="toolbar-spacer"></div>
        <button class="btn btn-outline" onclick="toggleAllAttendance(true)">✓ All Present</button>
        <button class="btn btn-outline" onclick="toggleAllAttendance(false)">✗ Deselect All</button>
      </div>
      <div class="att-grid">
        ${attendanceData.map(a => `
          <div class="att-row ${a.present ? 'present' : ''}" onclick="toggleAttendance(${a.member_id})">
            <span class="att-name">${a.name}</span>
            <span class="att-status">${a.present ? '✓' : '✗'}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Event Selection -->
    <div class="card">
      <h2>Select Events</h2>
      <div class="section-group">
        <h3>Standard Events</h3>
        ${RACE_TYPES.standard.map(r => raceCheckbox(r)).join('')}
      </div>
      <div class="section-group">
        <h3>Special Events (choose one or more)</h3>
        ${RACE_TYPES.special.map(r => raceCheckbox(r)).join('')}
      </div>
      <div class="section-group">
        <h3>Relays</h3>
        ${RACE_TYPES.relays.map(r => raceCheckbox(r)).join('')}
      </div>
    </div>

    <!-- Actions -->
    <div class="quick-actions">
      <button class="btn btn-success btn-lg" onclick="saveEventSetup()" ${presentCount < 3 ? 'disabled' : ''}>
        ✓ Save & Proceed to Heats →
      </button>
    </div>
    ${presentCount < 3 ? '<p style="color:var(--danger);margin-top:8px">Need at least 3 swimmers present</p>' : ''}
  `;
}

function raceCheckbox(r) {
  return `
    <div class="event-check" onclick="toggleRace('${r.id}')">
      <input type="checkbox" ${selectedRaces.has(r.id) ? 'checked' : ''} onclick="event.stopPropagation();toggleRace('${r.id}')">
      <label>${r.label}</label>
    </div>
  `;
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
  attendanceData.forEach(a => a.present = present ? 1 : 0);
  drawEventSetup();
}

function toggleRace(raceId) {
  if (selectedRaces.has(raceId)) selectedRaces.delete(raceId);
  else selectedRaces.add(raceId);
  drawEventSetup();
}

async function saveEventSetup() {
  if (selectedRaces.size === 0) return alert('Please select at least one event');
  const presentCount = attendanceData.filter(a => a.present).length;
  if (presentCount < 3) return alert('Need at least 3 swimmers present');

  await API.updateAttendance(currentEvent.id, attendanceData.map(a => ({
    member_id: a.member_id, present: a.present
  })));
  await API.updateRaces(currentEvent.id, [...selectedRaces]);

  navigate('heat-builder');
}
