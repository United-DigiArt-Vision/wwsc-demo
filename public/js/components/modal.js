/**
 * WWSC — Modal Component
 */
function showModal(title, bodyHtml, actions) {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    <div class="modal">
      <h2>${title}</h2>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-actions" id="modal-actions"></div>
    </div>
  `;
  const actionsEl = document.getElementById('modal-actions');
  actions.forEach(a => {
    const btn = document.createElement('button');
    btn.className = `btn ${a.cls || 'btn-outline'}`;
    btn.textContent = a.label;
    btn.onclick = async () => { if (a.action) { await a.action(); } else { hideModal(); } };
    actionsEl.appendChild(btn);
  });
}

function hideModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-overlay').innerHTML = '';
}

function confirmDialog(title, message, onConfirm) {
  showModal(title, `<p>${message}</p>`, [
    { label: 'Cancel', cls: 'btn-outline' },
    { label: 'Confirm', cls: 'btn-primary', action: async () => { hideModal(); await onConfirm(); } }
  ]);
}
