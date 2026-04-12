/**
 * WWSC — Numpad Overlay (Centiseconds)
 * On confirm, sends parseTime(value) — centiseconds integer.
 */
function showNumpad(currentValue, onConfirm) {
  let value = (currentValue === 0 || currentValue) ? currentValue : '';
  if (typeof value === 'number') value = formatTime(value);
  value = String(value);
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');

  function displayValue(raw) {
    if (!raw) return '0.00';
    if (raw === '.') return '0.';
    const parsed = parseTime(raw);
    return parsed != null ? formatTime(parsed) : raw;
  }

  function render() {
    overlay.innerHTML = `
      <div class="modal" style="max-width:340px">
        <div style="font-size:36px;font-weight:700;text-align:center;padding:16px;background:var(--bg);border-radius:var(--radius);margin-bottom:16px;min-height:60px">${displayValue(value)}<span style="font-size:18px;color:var(--text-secondary)">s</span></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          ${[1,2,3,4,5,6,7,8,9,'.',0,'⌫'].map(k => `
            <button type="button" class="btn btn-outline" data-numpad-key="${k}" style="font-size:24px;min-height:60px">${k}</button>
          `).join('')}
          <button type="button" class="btn btn-success" data-numpad-key="✓" style="grid-column: span 3; font-size:24px;min-height:60px;margin-top:8px">OK ✓</button>
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

  const clickHandler = (e) => {
    const btn = e.target.closest('[data-numpad-key]');
    if (!btn) return;
    e.preventDefault();
    const key = btn.getAttribute('data-numpad-key');
    window.numpadKey(key);
  };
  overlay.addEventListener('click', clickHandler);

  const originalHideModal = window.hideModal;
  window.hideModal = () => {
    document.removeEventListener('keydown', keyHandler);
    overlay.removeEventListener('click', clickHandler);
    window.hideModal = originalHideModal;
    delete window.numpadKey;
    originalHideModal();
  };

  window.numpadKey = (key) => {
    if (key === '⌫') { value = String(value).slice(0, -1); render(); }
    else if (key === '✓') { hideModal(); onConfirm(value ? parseTime(value) : null); }
    else if (key === '.') {
      if (!String(value).includes('.')) {
        value = value === '' ? '0.' : value + '.';
        render();
      }
    } else {
      // Enforce max 2 decimal places
      const dotIdx = String(value).indexOf('.');
      if (dotIdx >= 0) {
        const decimals = String(value).slice(dotIdx + 1);
        if (decimals.length >= 2) return;
      }
      value += key;
      render();
    }
  };
  render();
}
