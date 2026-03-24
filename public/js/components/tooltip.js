/**
 * WWSC — Info Tooltip Component (ⓘ)
 * Hover (desktop) or tap (mobile) to show/hide explanation.
 * Auto-positions to avoid viewport overflow.
 */

function tooltip(text) {
  return `<span class="info-tip" onclick="event.stopPropagation(); toggleTip(this)">ⓘ<span class="info-tip-box">${text}</span></span>`;
}

function toggleTip(el) {
  const box = el.querySelector('.info-tip-box');
  if (!box) return;
  const wasOpen = box.classList.contains('show');
  
  // Close all open tooltips first
  document.querySelectorAll('.info-tip-box.show').forEach(b => b.classList.remove('show'));
  
  if (!wasOpen) {
    box.classList.add('show');
    // Auto-position: check if box overflows right edge
    const rect = box.getBoundingClientRect();
    if (rect.right > window.innerWidth - 8) {
      box.style.left = 'auto';
      box.style.right = '0';
    }
    if (rect.left < 8) {
      box.style.left = '0';
      box.style.right = 'auto';
    }
  }
}

// Close tooltips when tapping elsewhere
document.addEventListener('click', () => {
  document.querySelectorAll('.info-tip-box.show').forEach(b => b.classList.remove('show'));
});
