/**
 * WWSC — Season Calendar Screen
 * Shows past events, attendance counts, and current event highlighted.
 */
async function renderCalendar() {
  const content = document.getElementById('content');
  content.innerHTML = '<div class="screen"><h2>📆 Season Calendar</h2><p>Loading events...</p></div>';

  try {
    const res = await fetch('/api/events');
    const events = await res.json();

    if (!events.length) {
      content.innerHTML = `
        <div class="screen">
          <h2>📆 Season Calendar</h2>
          <p class="empty-msg">No events yet. Create one in Times Sheet!</p>
        </div>`;
      return;
    }

    // Sort by date descending (most recent first)
    events.sort((a, b) => b.date.localeCompare(a.date));

    const rows = events.map(ev => {
      const isActive = ev.status !== 'completed';
      const dateStr = new Date(ev.date + 'T00:00:00').toLocaleDateString('en-AU', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
      });
      const statusBadge = isActive
        ? '<span class="badge badge-active">Current</span>'
        : '<span class="badge badge-done">Completed</span>';

      return `
        <div class="cal-card ${isActive ? 'cal-active' : ''}">
          <div class="cal-date">${dateStr}</div>
          <div class="cal-meta">
            <span>👥 ${ev.present_count || 0} swimmers</span>
            <span>🏁 ${ev.race_count || 0} races</span>
            ${statusBadge}
          </div>
        </div>`;
    }).join('');

    content.innerHTML = `
      <div class="screen">
        <h2>📆 Season Calendar</h2>
        <p class="subtitle">${events.length} event${events.length !== 1 ? 's' : ''} this season</p>
        <div class="cal-list">${rows}</div>
      </div>`;
  } catch (e) {
    content.innerHTML = `<div class="screen"><h2>📆 Season Calendar</h2><p class="error">Error loading events: ${e.message}</p></div>`;
  }
}
