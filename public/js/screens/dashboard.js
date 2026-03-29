/**
 * WWSC — Dashboard Screen
 * F9: Intuitive workflow entry point with guided next steps
 */
async function renderDashboard() {
  const data = await API.getDashboard();
  const el = document.getElementById('content');

  const hasEvent = !!data.currentEvent;
  const status = data.currentEvent?.status || 'none';

  // Determine workflow state and next action
  let heroSection = '';
  let nextStepHint = '';

  if (!hasEvent) {
    // No event — big call-to-action to start
    heroSection = `
      <div class="card" style="background:linear-gradient(135deg,#e0f2f1,#b2dfdb);padding:24px;text-align:center;border:2px solid var(--accent)">
        <h2 style="margin:0 0 8px 0;color:var(--primary)">🏊 Ready for a New Event?</h2>
        <p style="margin:0 0 16px 0;color:#555;font-size:15px">
          Start here each week. Set the date, mark who is swimming, and build the heats.
        </p>
        <button class="btn btn-accent btn-lg" onclick="navigate('event-setup')" style="font-size:18px;padding:14px 32px">
          ▶ Start New Event
        </button>
      </div>
    `;
  } else if (status === 'setup') {
    // Event exists but still in setup
    const hasAttendance = data.presentCount > 0;
    const hasRaces = data.racesCount > 0;
    let stepText = '';
    if (!hasAttendance) {
      stepText = 'Mark which swimmers are present, then build the heats.';
    } else if (!hasRaces) {
      stepText = 'Swimmers are marked. Choose distances and build the heats.';
    } else {
      stepText = 'Almost there — review attendance and build the heats when ready.';
    }
    heroSection = `
      <div class="card" style="background:linear-gradient(135deg,#e3f2fd,#bbdefb);padding:24px;text-align:center;border:2px solid var(--primary)">
        <h2 style="margin:0 0 8px 0;color:var(--primary)">📋 Event in Progress — Setup</h2>
        <p style="margin:0 0 16px 0;color:#555;font-size:15px">${stepText}</p>
        <button class="btn btn-accent btn-lg" onclick="navigate('event-setup')" style="font-size:18px;padding:14px 32px">
          ▶ Continue to Times Sheet
        </button>
      </div>
    `;
  } else if (status === 'racing' || status === 'heats_generated') {
    heroSection = `
      <div class="card" style="background:linear-gradient(135deg,#fff3e0,#ffe0b2);padding:24px;text-align:center;border:2px solid var(--warning)">
        <h2 style="margin:0 0 8px 0;color:#e65100">⏱️ Racing — Enter Results</h2>
        <p style="margin:0 0 16px 0;color:#555;font-size:15px">
          Heats are set. Enter finish times as swimmers complete their races.
        </p>
        <button class="btn btn-accent btn-lg" onclick="navigate('results')" style="font-size:18px;padding:14px 32px">
          ▶ Enter Results
        </button>
      </div>
    `;
  } else if (status === 'finalized') {
    heroSection = `
      <div class="card" style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);padding:24px;text-align:center;border:2px solid var(--success)">
        <h2 style="margin:0 0 8px 0;color:var(--success)">✅ Event Complete</h2>
        <p style="margin:0 0 16px 0;color:#555;font-size:15px">
          Results are locked and PBs updated. Start a new event when ready for next week.
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-accent btn-lg" onclick="handleWeeklyReset()" style="font-size:18px;padding:14px 32px">
            ▶ Start New Event
          </button>
          <button class="btn btn-outline" onclick="navigate('results')">📊 View Results</button>
        </div>
      </div>
    `;
  }

  el.innerHTML = `
    <h1>Dashboard</h1>

    ${heroSection}

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

    ${hasEvent && status !== 'finalized' ? `
      <div style="text-align:center;margin-top:12px">
        <button class="btn btn-outline" onclick="handleWeeklyReset()" style="color:#999;border-color:#ccc">🔄 Discard & Start New Event</button>
      </div>
    ` : ''}
  `;
}

async function handleWeeklyReset() {
  confirmDialog('Start New Event?', 'The current event will be archived. All results and PBs are saved. You can view past events in the Season Calendar.', async () => {
    await API.resetWeek();
    navigate('event-setup');
  });
}
