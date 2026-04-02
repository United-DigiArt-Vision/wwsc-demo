/**
 * WWSC — Numpad Overlay (Centiseconds)
 * On confirm, sends parseTime(value) — centiseconds integer.
 */
function showNumpad(currentValue, onConfirm) {
  let value = currentValue || '';
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');

  function render() {
    overlay.innerHTML = `
      <div class="modal" style="max-width:340px">
        <div style="font-size:36px;font-weight:700;text-align:center;padding:16px;background:var(--bg);border-radius:var(--radius);margin-bottom:16px;min-height:60px">${value || '0'}<span style="font-size:18px;color:var(--text-secondary)">s</span></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          ${[1,2,3,4,5,6,7,8,9,'.',0,'⌫'].map(k => `
            <button class="btn btn-outline" style="font-size:24px;min-height:60px" onclick="numpadKey('${k}')">${k}</button>
          `).join('')}
          <button class="btn btn-success" style="grid-column: span 3; font-size:24px;min-height:60px;margin-top:8px" onclick="numpadKey('✓')">OK ✓</button>
        </div>
      </div>
    `;
  }

  const keyHandler = (e) => {
    if (e.key >= '0' && e.key <= '9') numpadKey(e.key);
    else if (e.key === '.' || e.key === ',') numpadKey('.');
    else if (e.key === 'Backspace') numpadKey('⌫');
    else if (e.key === 'Enter') numpadKey('✓');
    else if (e.key === 'Escape') hideModal();
  };

  document.addEventListener('keydown', keyHandler);

  const originalHideModal = window.hideModal;
  window.hideModal = () => {
    document.removeEventListener('keydown', keyHandler);
    window.hideModal = originalHideModal;
    originalHideModal();
  };

  window.numpadKey = (key) => {
    if (key === '⌫') { value = String(value).slice(0, -1); render(); }
    else if (key === '✓') { hideModal(); onConfirm(value ? parseTime(value) : null); }
    else if (key === '.') {
      if (!String(value).includes('.')) { value += '.'; render(); }
    } else {
      // Enforce max 2 decimal places
      const dotIdx = String(value).indexOf('.');
      if (dotIdx >= 0 && String(value).length - dotIdx > 2) return;
      value += key;
      render();
    }
  };
  render();
}
