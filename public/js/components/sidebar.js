/**
 * WWSC — Sidebar Navigation (Dynamic based on active races)
 */
window.activeRaces = [];

function renderSidebar(activeScreen) {
  const baseItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'members', icon: '👥', label: 'Members' },
    { id: 'event-setup', icon: '📋', label: 'Times Sheet' },
    { id: 'heat-builder', icon: '🔀', label: 'Heat Builder' },
  ];

  // Dynamic race items based on what was selected in Event Setup
  const raceIcons = {
    '25m': '🏊', '50m': '🏊', '75m': '🏊',
    'backstroke': '🔙', 'breaststroke': '🐸', 'butterfly': '🦋',
    '25m_relay': '👥', '25m_brace': '🤝', '50m_brace': '🤝',
    'medley_relay': '🔄', 'pogo': '🦘'
  };
  const raceLabels = {
    '25m': '25m', '50m': '50m', '75m': '75m',
    'backstroke': 'Backstroke', 'breaststroke': 'Breaststroke', 'butterfly': 'Butterfly',
    '25m_relay': '25m Relay', '25m_brace': '25m Brace', '50m_brace': '50m Brace',
    'medley_relay': 'Medley', 'pogo': 'Pogo'
  };

  const relayTypes = ['25m_relay', '25m_brace', '50m_brace', 'medley_relay', 'pogo'];
  const raceItems = (window.activeRaces || []).map(rt => ({
    id: relayTypes.includes(rt) ? `relay-${rt}` : `race-${rt}`,
    icon: raceIcons[rt] || '🏊',
    label: raceLabels[rt] || rt,
    raceType: rt,
  }));

  const endItems = [
    { id: 'results', icon: '🏆', label: 'Results' },
    { id: 'calendar', icon: '📆', label: 'Season Calendar' },
  ];

  const allItems = [...baseItems, ...raceItems, ...endItems];

  document.getElementById('sidebar').innerHTML = `
    <div class="sidebar-title">🏊 WWSC</div>
    ${allItems.map(it => `
      <button class="nav-item ${activeScreen === it.id ? 'active' : ''}" onclick="navigate('${it.id}')">
        <span class="icon">${it.icon}</span>
        <span>${it.label}</span>
      </button>
    `).join('')}
    <div class="sidebar-version">v2.1.1-m1</div>
  `;
}
