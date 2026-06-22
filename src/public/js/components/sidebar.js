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
    { id: 'breaker-report', icon: '🏅', label: 'Breaker Report' },
    { id: 'pointscore', icon: '🎯', label: 'Pointscore' },
    { id: 'calendar', icon: '📅', label: 'Season Calendar' },
  ];

  let html = `<div class="sidebar-title">
    <span class="sidebar-title-text">🏊 WWSC</span>
    <button class="sidebar-collapse-btn" onclick="setSidebarCollapsed(true)" title="Hide menu" aria-label="Hide menu">«</button>
  </div>`;

  for (const it of items) {
    const active = activeScreen.startsWith(it.id) ? 'active' : '';
    html += `<button class="nav-item ${active}" onclick="navigate('${it.id}')">
      <span class="icon">${it.icon}</span><span>${it.label}</span>
    </button>`;
  }

  html += `<div class="sidebar-version" id="app-version">v…</div>`;
  document.getElementById('sidebar').innerHTML = html;

  // Load version from SSOT (package.json via /api/version)
  fetch('/api/version').then(r => r.json()).then(d => {
    const el = document.getElementById('app-version');
    if (el) {
      el.textContent = 'v' + d.version;
      el.title = 'Build: ' + d.build;
    }
  }).catch(() => {});
}

/**
 * Sidebar collapse toggle (Bryan v2.12.5 pt.4)
 * Hide the side menu when not in use to free up screen real estate while
 * filling in heats. State persists in localStorage and is mirrored onto
 * <body> so it survives sidebar re-renders on every navigate().
 */
const SIDEBAR_COLLAPSE_KEY = 'wwsc-sidebar-collapsed';

function setSidebarCollapsed(collapsed) {
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  try { localStorage.setItem(SIDEBAR_COLLAPSE_KEY, collapsed ? '1' : '0'); } catch (e) { /* private mode */ }
}

function initSidebarCollapsed() {
  let collapsed = false;
  try { collapsed = localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1'; } catch (e) { /* private mode */ }
  document.body.classList.toggle('sidebar-collapsed', collapsed);
}

// Apply persisted state immediately (script runs after <body> is parsed → no FOUC)
initSidebarCollapsed();
