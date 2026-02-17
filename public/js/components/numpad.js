/**
 * WWSC — Numpad Overlay (for future time entry)
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
          ${[1,2,3,4,5,6,7,8,9,'⌫',0,'✓'].map(k => `
            <button class="btn ${k === '✓' ? 'btn-success' : k === '⌫' ? 'btn-danger' : 'btn-outline'}" 
              style="font-size:24px;min-height:60px" onclick="numpadKey('${k}')">${k}</button>
          `).join('')}
        </div>
      </div>
    `;
  }

  window.numpadKey = (key) => {
    if (key === '⌫') { value = value.slice(0, -1); render(); }
    else if (key === '✓') { hideModal(); onConfirm(value ? parseInt(value) : null); }
    else { value += key; render(); }
  };
  render();
}
