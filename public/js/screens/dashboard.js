/**
 * WWSC — Dashboard Screen
 */
async function renderDashboard() {
  const data = await API.getDashboard();
  const el = document.getElementById('content');

  const hasEvent = !!data.currentEvent;
  const status = data.currentEvent?.status || 'none';

  let actionBtn = '';
  if (!hasEvent) {
    actionBtn = `<button class="btn btn-accent btn-lg btn-block" onclick="navigate('event-setup')">🏊 Start New Week</button>`;
  } else if (status === 'setup') {
    actionBtn = `<button class="btn btn-accent btn-lg btn-block" onclick="navigate('event-setup')">📅 Continue Event Setup</button>`;
  } else if (status === 'racing') {
    actionBtn = `<button class="btn btn-accent btn-lg btn-block" onclick="navigate('heat-builder')">🔀 Continue Racing</button>`;
  }

  el.innerHTML = `
    <h1>Dashboard</h1>
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">${data.totalMembers}</div>
        <div class="stat-label">Active Members</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${hasEvent ? data.presentCount : '—'}</div>
        <div class="stat-label">Present Today</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${hasEvent ? data.racesCount : '—'}</div>
        <div class="stat-label">Events Selected</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${hasEvent ? data.currentEvent.date : '—'}</div>
        <div class="stat-label">Event Date</div>
      </div>
    </div>

    ${hasEvent ? `<div class="card"><strong>Status:</strong> <span class="tag tag-active">${status.toUpperCase()}</span></div>` : ''}

    <div class="quick-actions">
      ${actionBtn}
      ${hasEvent ? `<button class="btn btn-danger btn-lg" onclick="handleWeeklyReset()">🔄 New Week</button>` : ''}
    </div>
  `;
}

async function handleWeeklyReset() {
  confirmDialog('Start New Week?', 'Current event data will be archived. A backup will be created automatically.', async () => {
    await API.resetWeek();
    navigate('dashboard');
  });
}
