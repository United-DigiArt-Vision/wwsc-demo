/**
 * WWSC — Season Calendar Screen
 * F28: Clear layout, sorted newest first, current event on top, clickable
 */
async function renderCalendar() {
  const content = document.getElementById('content');
  content.innerHTML = '<h1>📅 Season Calendar</h1><p>Loading events...</p>';

  try {
    const res = await fetch('/api/events');
    const events = await res.json();

    if (!events.length) {
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

    // Separate current/active event from completed ones
    const currentEvent = events.find(ev => ev.status !== 'completed');
    const completedEvents = events.filter(ev => ev.status === 'completed');
    
    // Sort completed by date descending (most recent first)
    completedEvents.sort((a, b) => b.date.localeCompare(a.date));

    let html = '<h1>📅 Season Calendar</h1>';

    // Current Event section (always on top if exists)
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
          <div class="card" style="background:#1e293b;margin-bottom:8px;padding:12px 16px">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
              <div style="font-size:16px;font-weight:600;color:#e2e8f0">${formatDate(ev.date)}</div>
              <div style="display:flex;gap:16px;align-items:center">
                <span style="color:#64748b;font-size:14px">👥 ${ev.present_count || 0}</span>
                <span style="color:#64748b;font-size:14px">🏁 ${ev.race_count || 0}</span>
                <span style="background:#334155;color:#94a3b8;padding:3px 10px;border-radius:4px;font-size:12px">
                  ✓ Done
                </span>
              </div>
            </div>
          </div>`;
      }
    }

    // Summary
    const totalSwimmers = events.reduce((sum, ev) => sum + (ev.present_count || 0), 0);
    const totalRaces = events.reduce((sum, ev) => sum + (ev.race_count || 0), 0);
    html += `
      <div style="margin-top:24px;padding:16px;background:#0f172a;border-radius:8px;display:flex;justify-content:space-around;text-align:center">
        <div>
          <div style="font-size:24px;font-weight:700;color:#fff">${events.length}</div>
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
