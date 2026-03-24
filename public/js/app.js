/**
 * WWSC — App Router + State
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
  // F2: Handle race-{type} sidebar links → go to results with that race pre-selected
  if (screen.startsWith('race-')) {
    const raceType = screen.replace('race-', '');
    window._pendingRaceType = raceType;
    currentScreen = 'results';
    renderSidebar(screen);
    renderResults();
    return;
  }
  // F2: Handle relay-{type} sidebar links → go to relays with that race pre-selected
  if (screen.startsWith('relay-')) {
    const raceType = screen.replace('relay-', '');
    window._pendingRelayType = raceType;
    currentScreen = 'relays';
    renderSidebar(screen);
    renderRelays();
    return;
  }
  currentScreen = screen;
  renderSidebar(screen);
  const renderFn = screens[screen];
  if (renderFn) renderFn();
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  navigate('dashboard');
});
