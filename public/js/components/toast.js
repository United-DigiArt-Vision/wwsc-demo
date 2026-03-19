/**
 * WWSC — Toast Notification System
 */
function showToast(message, type = 'success', duration = 3000) {
  const existing = document.getElementById('toast-container');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'toast-container';
  container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;';

  const colors = { success: '#2e7d32', error: '#c62828', info: '#1565c0', warning: '#f57f17' };
  const toast = document.createElement('div');
  toast.style.cssText = `background:${colors[type]||colors.success};color:white;padding:14px 24px;border-radius:8px;font-size:16px;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.3);animation:slideIn 0.3s ease;`;
  toast.textContent = message;
  container.appendChild(toast);
  document.body.appendChild(container);

  setTimeout(() => container.remove(), duration);
}
