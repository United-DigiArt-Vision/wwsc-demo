/**
 * WWSC — Season Calendar Screen
 * F28: Clear layout, sorted newest first, current event on top, clickable
 * BRY-24: Click on completed event cards to view details (races + breakers)
 */

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
    const [racesRes, breakersRes] = await Promise.all([
      fetch('/api/events/' + eventId + '/races'),
      fetch('/api/events/' + eventId + '/breakers')
    ]);
    const races = await racesRes.json();
    const breakers = await breakersRes.json();

    // Only show races that actually had heats with results entered
    const racesWithResults = races.filter(r => r.heat_count > 0);
    const raceList = racesWithResults.length > 0
      ? racesWithResults.map(r => `<li style="padding:4px 0">${r.race_type}</li>`).join('')
      : '<li style="color:#64748b">No races with results</li>';

    const breakerList = breakers.length > 0
      ? breakers.map(b => `
          <li style="padding:4px 0">
            <strong>${b.member_name}</strong> — ${b.stroke}:
            ${b.old_pb || '?'}s → ${b.new_time}s
            ${b.improvement ? `(⬇️ ${b.improvement.toFixed(1)}s)` : ''}
          </li>
        `).join('')
      : '<li style="color:#64748b">No record breakers</li>';

    modal.querySelector('div > div').innerHTML = `
      <h3 style="margin:0 0 16px;font-size:20px">📊 Event Details</h3>
      <h4 style="margin:16px 0 8px;color:#94a3b8">🏁 Races (${races.length})</h4>
      <ul style="list-style:none;padding:0;margin:0">${raceList}</ul>
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
          <div class="card" style="background:#1e293b;margin-bottom:8px;padding:12px 16px;cursor:pointer;transition:transform 0.15s,box-shadow 0.15s"
               onclick="viewEventDetails(${ev.id})"
               onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.3)'"
               onmouseout="this.style.transform='';this.style.boxShadow=''">
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
            <div style="margin-top:6px;font-size:12px;color:#60a5fa">👁️ Tap to view details</div>
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
