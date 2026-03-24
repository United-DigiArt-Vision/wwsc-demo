/**
 * WWSC — Touch-Friendly Date Picker
 * Full-screen overlay with big tap targets, like the numpad.
 */
function showDatePicker(currentDate, onConfirm) {
  const d = currentDate ? new Date(currentDate + 'T12:00:00') : new Date();
  let year = d.getFullYear();
  let month = d.getMonth();
  let selectedDay = d.getDate();

  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  function render() {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // Monday = 0, Sunday = 6
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    let cells = '';
    // Empty cells before first day
    for (let i = 0; i < startDay; i++) {
      cells += '<div class="dp-cell dp-empty"></div>';
    }
    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = day === selectedDay;
      const isToday = (day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear());
      let cls = 'dp-cell dp-day';
      if (isSelected) cls += ' dp-selected';
      if (isToday) cls += ' dp-today';
      cells += '<div class="' + cls + '" onclick="dpSelectDay(' + day + ')">' + day + '</div>';
    }

    overlay.innerHTML = '<div class="modal" style="max-width:380px;padding:16px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
        '<button class="btn btn-outline" style="font-size:20px;min-width:48px;min-height:48px" onclick="dpPrevMonth()">◀</button>' +
        '<div style="font-size:20px;font-weight:700">' + MONTHS[month] + ' ' + year + '</div>' +
        '<button class="btn btn-outline" style="font-size:20px;min-width:48px;min-height:48px" onclick="dpNextMonth()">▶</button>' +
      '</div>' +
      '<div class="dp-grid">' +
        DAYS.map(function(d) { return '<div class="dp-cell dp-header">' + d + '</div>'; }).join('') +
        cells +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-top:12px">' +
        '<button class="btn btn-outline" style="flex:1;min-height:48px;font-size:16px" onclick="hideModal()">Cancel</button>' +
        '<button class="btn btn-success" style="flex:2;min-height:48px;font-size:16px;font-weight:700" onclick="dpConfirm()">Confirm</button>' +
      '</div>' +
    '</div>';
  }

  window.dpSelectDay = function(day) {
    selectedDay = day;
    render();
  };

  window.dpPrevMonth = function() {
    month--;
    if (month < 0) { month = 11; year--; }
    selectedDay = 1;
    render();
  };

  window.dpNextMonth = function() {
    month++;
    if (month > 11) { month = 0; year++; }
    selectedDay = 1;
    render();
  };

  window.dpConfirm = function() {
    const m = String(month + 1).padStart(2, '0');
    const dd = String(selectedDay).padStart(2, '0');
    const dateStr = year + '-' + m + '-' + dd;
    hideModal();
    onConfirm(dateStr);
  };

  render();
}
