/**
 * WWSC — Sidebar Navigation
 */
function renderSidebar(activeScreen) {
  const items = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'members', icon: '👥', label: 'Members' },
    { id: 'event-setup', icon: '📅', label: 'Event Setup' },
    { id: 'heat-builder', icon: '🔀', label: 'Heat Builder' },
    { id: 'results', icon: '🏆', label: 'Results' },
    { id: 'calendar', icon: '📆', label: 'Season Calendar' },
  ];

  document.getElementById('sidebar').innerHTML = `
    <div class="sidebar-title">🏊 WWSC</div>
    ${items.map(it => `
      <button class="nav-item ${activeScreen === it.id ? 'active' : ''}" onclick="navigate('${it.id}')">
        <span class="icon">${it.icon}</span>
        <span>${it.label}</span>
      </button>
    `).join('')}
  `;
}
