/**
 * WWSC — Sidebar Navigation (Clean & Simple)
 * F27: Removed race links — all race navigation happens via Heat Builder's Progress Tracker
 */

function renderSidebar(activeScreen) {
  const items = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'members', icon: '👥', label: 'Members' },
    { id: 'event-setup', icon: '📋', label: 'Times Sheet' },
    { id: 'heat-builder', icon: '🔧', label: 'Heat Builder' },
    { id: 'results', icon: '🏆', label: 'Results' },
    { id: 'calendar', icon: '📅', label: 'Season Calendar' },
  ];

  let html = `<div class="sidebar-title">🏊 WWSC</div>`;

  for (const it of items) {
    const active = activeScreen === it.id ? 'active' : '';
    html += `<button class="nav-item ${active}" onclick="navigate('${it.id}')">
      <span class="icon">${it.icon}</span><span>${it.label}</span>
    </button>`;
  }

  html += `<div class="sidebar-version">v2.1.3-m1</div>`;
  document.getElementById('sidebar').innerHTML = html;
}
