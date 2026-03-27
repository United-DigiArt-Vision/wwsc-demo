/**
 * WWSC — Sidebar Navigation (Dynamic based on active races)
 * F13+F19: Individual races first, then separator, then Relays
 */
window.activeRaces = [];

const RELAY_TYPES = ['25m_relay', '25m_brace', '50m_brace', 'medley_relay', 'pogo'];

function renderSidebar(activeScreen) {
  const baseItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'members', icon: '👥', label: 'Members' },
    { id: 'event-setup', icon: '📋', label: 'Times Sheet' },
    { id: 'heat-builder', icon: '🔀', label: 'Heat Builder' },
  ];

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

  const allRaces = window.activeRaces || [];
  const individualRaces = allRaces.filter(rt => !RELAY_TYPES.includes(rt));
  const relayRaces = allRaces.filter(rt => RELAY_TYPES.includes(rt));

  const individualItems = individualRaces.map(rt => ({
    id: `race-${rt}`, icon: raceIcons[rt] || '🏊', label: raceLabels[rt] || rt, raceType: rt,
  }));

  const relayItems = relayRaces.map(rt => ({
    id: `relay-${rt}`, icon: raceIcons[rt] || '🏊', label: raceLabels[rt] || rt, raceType: rt,
  }));

  const endItems = [
    { id: 'results', icon: '🏆', label: 'Results' },
    { id: 'calendar', icon: '📆', label: 'Season Calendar' },
  ];

  let html = `<div class="sidebar-title">🏊 WWSC</div>`;

  // Base nav items (Dashboard, Members, Times Sheet, Heat Builder)
  for (const it of baseItems) {
    html += sidebarButton(it, activeScreen);
  }

  // Results & Season Calendar — app-level, before race sections
  for (const it of endItems) {
    html += sidebarButton(it, activeScreen);
  }

  // Individual races
  if (individualItems.length > 0) {
    html += `<div class="sidebar-separator">── Individual ──</div>`;
    for (const it of individualItems) {
      html += sidebarButton(it, activeScreen);
    }
  }

  // Relay races
  if (relayItems.length > 0) {
    html += `<div class="sidebar-separator">── Relays ──</div>`;
    for (const it of relayItems) {
      html += sidebarButton(it, activeScreen);
    }
  }

  html += `<div class="sidebar-version">v2.1.2-m1</div>`;
  document.getElementById('sidebar').innerHTML = html;
}

function sidebarButton(item, activeScreen) {
  return `<button class="nav-item ${activeScreen === item.id ? 'active' : ''}" onclick="navigate('${item.id}')">
    <span class="icon">${item.icon}</span><span>${item.label}</span>
  </button>`;
}
