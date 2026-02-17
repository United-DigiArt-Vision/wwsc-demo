/**
 * WWSC — App Router + State
 */
let currentScreen = 'dashboard';

const screens = {
  'dashboard': renderDashboard,
  'members': renderMembers,
  'event-setup': renderEventSetup,
  'heat-builder': renderHeatBuilder,
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
