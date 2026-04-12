/**
 * WWSC — App Router + State
 * F27: Simplified — no more race-* / relay-* links in sidebar
 */
let currentScreen = 'dashboard';

const screens = {
  'dashboard': renderDashboard,
  'members': renderMembers,
  'event-setup': renderEventSetup,
  'heat-builder': renderHeatBuilder,
  'results': renderResults,
  'relays': renderRelays,
  'calendar': renderCalendar,
  'breaker-report': renderBreakerReport,
};

function navigate(path) {
  const parts = path.split('/');
  const screen = parts[0];
  const param = parts[1];
  currentScreen = screen;
  renderSidebar(path);
  const renderFn = screens[screen];
  if (renderFn) renderFn(param);
}

// Global error handlers — catch unhandled errors to prevent silent tab crashes
window.addEventListener('error', (e) => {
  console.error('WWSC unhandled error:', e.message, e.filename, e.lineno);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('WWSC unhandled rejection:', e.reason);
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.slice(2);
  navigate(hash || 'dashboard');
});

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(2);
  navigate(hash || 'dashboard');
});
