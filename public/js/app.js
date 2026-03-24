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
  // F17: All race links go to Heat Builder with that race pre-selected
  if (screen.startsWith('race-') || screen.startsWith('relay-')) {
    const raceType = screen.replace('race-', '').replace('relay-', '');
    window._pendingHBRaceType = raceType;
    currentScreen = 'heat-builder';
    renderSidebar(screen);
    renderHeatBuilder();
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
