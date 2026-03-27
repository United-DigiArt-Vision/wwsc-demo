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
};

function navigate(screen) {
  currentScreen = screen;
  renderSidebar(screen);
  const renderFn = screens[screen];
  if (renderFn) renderFn();
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  navigate('dashboard');
});
