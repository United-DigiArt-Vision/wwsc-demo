/**
 * WWSC — Season Calendar Screen
 * F28: Clear layout, sorted newest first, current event on top, clickable
 * BRY-24: Click on completed event cards to view details (races + breakers)
 * F13: Delete → Archive with restore capability
 */

let calShowArchive = false;

// BRY-24: View event details — show summary modal with races and breakers
async function viewEventDetails(eventId) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px';
  modal.innerHTML = `
    <div style="background:#1e293b;border-radius:12px;padding:24px;max-width:600px;width:100%;max-height:80vh;overflow-y:auto;color:#e2e8f0">
      <h3 style="margin:0 0 16px;font-size:20px">📊 Event Details</h3>
      <p style="color:#94a3b8">Loading...</p>
    </div>`;
  document.body.appendChild(modal);
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  try {
    // v2.7.1: Use full report endpoint for attendance + results + breakers
    const reportRes = await fetch('/api/events/' + eventId + '/report');
    const report = await reportRes.json();

    // Attendance list
    const attendees = report.attendance || [];
    const attendeeList = attendees.length > 0
      ? attendees.map(a => `<li style="padding:2px 0">${a.name}</li>`).join('')
      : '<li style="color:#64748b">No attendance data</li>';

    // Races with results
    let racesHtml = '';
    for (const race of (report.races || [])) {
      const label = race.race_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      if (race.heats && race.heats.length > 0) {
        let results = [];
        for (const h of race.heats) {
          for (const l of (h.lanes || [])) {
            if (l.finish_time != null) {
              results.push({ name: l.name, place: l.place || l.manual_place, time: l.finish_time });
            }
          }
        }
        results.sort((a, b) => (a.place || 99) - (b.place || 99));
        const top3 = results.slice(0, 3).map(r =>
          `<span style="margin-right:12px">${r.place ? ordinal(r.place) + ': ' : ''}${r.name} (${formatTime(r.time)})</span>`
        ).join('');
        racesHtml += `<li style="padding:4px 0"><strong>${label}</strong><br><span style="font-size:13px;color:#94a3b8">${top3 || 'No results'}</span></li>`;
      } else if (race.teams && race.teams.length > 0) {
        const ranked = race.teams.filter(t => t.total_time != null).sort((a, b) => (a.place || 99) - (b.place || 99));
        const top3 = ranked.slice(0, 3).map(t =>
          `<span style="margin-right:12px">${t.place ? ordinal(t.place) + ': ' : ''}${t.team_name} (${formatTime(t.total_time)})</span>`
        ).join('');
        racesHtml += `<li style="padding:4px 0"><strong>${label}</strong><br><span style="font-size:13px;color:#94a3b8">${top3 || 'No results'}</span></li>`;
      } else {
        racesHtml += `<li style="padding:4px 0;color:#64748b">${label} — no results</li>`;
      }
    }

    // Breakers — use formatTime for correct display
    const breakers = report.breakers || [];
    const breakerList = breakers.length > 0
      ? breakers.map(b => `
          <li style="padding:4px 0">
            <strong>${b.member_name}</strong> — ${b.stroke}:
            ${b.old_pb != null ? formatTime(b.old_pb) : '?'} → ${b.new_time != null ? formatTime(b.new_time) : '?'}
            ${b.improvement != null ? '(⬇️ ' + formatTime(b.improvement) + ')' : ''}
          </li>
        `).join('')
      : '<li style="color:#64748b">No record breakers</li>';

    modal.querySelector('div > div').innerHTML = `
      <h3 style="margin:0 0 16px;font-size:20px">📊 Event Details</h3>
      <h4 style="margin:16px 0 8px;color:#94a3b8">👥 Participants (${attendees.length})</h4>
      <ul style="list-style:none;padding:0;margin:0;columns:2;font-size:14px">${attendeeList}</ul>
      <h4 style="margin:16px 0 8px;color:#94a3b8">🏁 Races (${(report.races || []).length})</h4>
      <ul style="list-style:none;padding:0;margin:0">${racesHtml}</ul>
      <h4 style="margin:16px 0 8px;color:#94a3b8">🏆 Record Breakers (${breakers.length})</h4>
      <ul style="list-style:none;padding:0;margin:0">${breakerList}</ul>
      <button class="btn" onclick="this.closest('div[style*=fixed]').remove()" style="margin-top:20px;width:100%">Close</button>
    `;
  } catch (e) {
    modal.querySelector('div > div').innerHTML = `
      <h3 style="margin:0 0 16px;font-size:20px">📊 Event Details</h3>
      <p style="color:#ef4444">Error loading event: ${e.message}</p>
      <button class="btn" onclick="this.closest('div[style*=fixed]').remove()" style="margin-top:16px;width:100%">Close</button>
    `;
  }
}

async function archiveEvent(eventId, eventDate) {
  confirmDialog('Archive Event?',
    'This will move the event from ' + eventDate + ' to the archive. You can restore it later from the Archive section.',
    async () => {
      await fetch('/api/events/' + eventId + '/archive', { method: 'PUT' });
      renderCalendar();
    }
  );
}

async function restoreEvent(eventId) {
  await fetch('/api/events/' + eventId + '/restore', { method: 'PUT' });
  renderCalendar();
}

async function renderCalendar() {
  const content = document.getElementById('content');
  content.innerHTML = '<h1>📅 Season Calendar</h1><p>Loading events...</p>';

  try {
    // Load both active and archived events
    const [activeRes, archiveRes] = await Promise.all([
      fetch('/api/events'),
      fetch('/api/events?archived=1')
    ]);
    const activeEvents = await activeRes.json();
    const allEvents = await archiveRes.json();
    const archivedEvents = allEvents.filter(ev => ev.archived === 1);

    if (activeEvents.length === 0 && archivedEvents.length === 0) {
      content.innerHTML = `
        <h1>📅 Season Calendar</h1>
        <div class="card" style="text-align:center;padding:40px">
          <p style="font-size:18px;color:#666">No events yet.</p>
          <button class="btn btn-primary" onclick="navigate('event-setup')" style="margin-top:16px">
            📋 Go to Times Sheet to create one
          </button>
        </div>`;
      return;
    }

    // Separate current/active event from completed/finalized ones
    const currentEvent = activeEvents.find(ev => ev.status === 'setup');
    const completedEvents = activeEvents.filter(ev => ev.status === 'completed' || ev.status === 'finalized');
    
    // Sort completed by date descending (most recent first)
    completedEvents.sort((a, b) => b.date.localeCompare(a.date));

    let html = '<h1>📅 Season Calendar</h1>';

    // Current Event section
    if (currentEvent) {
      html += `
        <div class="card" style="background:#1a365d;border-left:4px solid #16a34a;margin-bottom:24px;cursor:pointer" onclick="navigate('event-setup')">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
            <div>
              <div style="color:#4ade80;font-size:12px;font-weight:700;letter-spacing:1px;margin-bottom:4px">▶ CURRENT EVENT</div>
              <div style="font-size:20px;font-weight:700;color:#fff">${formatDate(currentEvent.date)}</div>
            </div>
            <div style="display:flex;gap:16px;align-items:center">
              <span style="color:#94a3b8">👥 ${currentEvent.present_count || 0} swimmers</span>
              <span style="color:#94a3b8">🏁 ${currentEvent.race_count || 0} races</span>
              <span style="background:#16a34a;color:#fff;padding:4px 12px;border-radius:4px;font-size:13px;font-weight:600">
                ${currentEvent.status === 'setup' ? 'Setup' : 'In Progress'}
              </span>
            </div>
          </div>
          <div style="margin-top:8px;color:#64748b;font-size:13px">
            Tap to continue working on this event →
          </div>
        </div>`;
    }

    // Completed Events section
    if (completedEvents.length > 0) {
      html += `<div style="color:#64748b;font-size:14px;font-weight:600;margin-bottom:12px;margin-top:24px">
        COMPLETED EVENTS (${completedEvents.length})
      </div>`;
      
      for (const ev of completedEvents) {
        html += `
          <div class="card" style="background:#1e293b;margin-bottom:8px;padding:12px 16px;position:relative">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;cursor:pointer" onclick="viewEventDetails(${ev.id})">
              <div style="font-size:16px;font-weight:600;color:#e2e8f0">${formatDate(ev.date)}</div>
              <div style="display:flex;gap:16px;align-items:center">
                <span style="color:#64748b;font-size:14px">👥 ${ev.present_count || 0}</span>
                <span style="color:#64748b;font-size:14px">🏁 ${ev.race_count || 0}</span>
                <span style="background:#334155;color:#94a3b8;padding:3px 10px;border-radius:4px;font-size:12px">✓ Done</span>
                <button class="btn" onclick="event.stopPropagation();archiveEvent(${ev.id},'${formatDate(ev.date)}')" style="background:#991b1b;color:#fff;padding:4px 10px;font-size:12px;border-radius:4px;min-width:auto">🗑️</button>
              </div>
            </div>
            <div style="margin-top:6px;font-size:12px;color:#60a5fa;cursor:pointer" onclick="viewEventDetails(${ev.id})">👁️ Tap to view details</div>
          </div>`;
      }
    }

    // Summary
    const totalSwimmers = activeEvents.reduce((sum, ev) => sum + (ev.present_count || 0), 0);
    const totalRaces = activeEvents.reduce((sum, ev) => sum + (ev.race_count || 0), 0);
    html += `
      <div style="margin-top:24px;padding:16px;background:#0f172a;border-radius:8px;display:flex;justify-content:space-around;text-align:center">
        <div>
          <div style="font-size:24px;font-weight:700;color:#fff">${activeEvents.length}</div>
          <div style="font-size:12px;color:#64748b">Events</div>
        </div>
        <div>
          <div style="font-size:24px;font-weight:700;color:#fff">${totalSwimmers}</div>
          <div style="font-size:12px;color:#64748b">Total Swims</div>
        </div>
        <div>
          <div style="font-size:24px;font-weight:700;color:#fff">${totalRaces}</div>
          <div style="font-size:12px;color:#64748b">Total Races</div>
        </div>
      </div>`;

    // Archive section (subtle, at the bottom)
    if (archivedEvents.length > 0) {
      html += `
        <div style="margin-top:32px;text-align:center">
          <button class="btn" onclick="calShowArchive=!calShowArchive;renderCalendar()" style="background:transparent;color:#475569;font-size:13px;padding:8px 16px;border:1px solid #334155">
            🗑️ Deleted Events (${archivedEvents.length}) ${calShowArchive ? '▲' : '▼'}
          </button>
        </div>`;
      
      if (calShowArchive) {
        html += `<div style="margin-top:12px">`;
        for (const ev of archivedEvents) {
          html += `
            <div class="card" style="background:#1e293b;margin-bottom:8px;padding:12px 16px;opacity:0.6">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
                <div style="font-size:15px;color:#94a3b8">${formatDate(ev.date)}</div>
                <div style="display:flex;gap:12px;align-items:center">
                  <span style="color:#475569;font-size:13px">👥 ${ev.present_count || 0}</span>
                  <span style="color:#475569;font-size:13px">🏁 ${ev.race_count || 0}</span>
                  <span style="background:#1e293b;color:#475569;padding:3px 10px;border-radius:4px;font-size:12px;border:1px solid #334155">Deleted</span>
                  <button class="btn" onclick="restoreEvent(${ev.id})" style="background:#1e40af;color:#fff;padding:4px 10px;font-size:12px;border-radius:4px;min-width:auto">↩️ Restore</button>
                </div>
              </div>
            </div>`;
        }
        html += `</div>`;
      }
    }

    content.innerHTML = html;
  } catch (e) {
    content.innerHTML = `<h1>📅 Season Calendar</h1><div class="card" style="color:#ef4444">Error: ${e.message}</div>`;
  }
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}
