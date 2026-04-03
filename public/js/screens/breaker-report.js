/**
 * WWSC — Breaker Report Screen
 * Lists all record breakers across events.
 */
async function renderBreakerReport() {
  const el = document.getElementById('content');
  el.innerHTML = `
    <div class="toolbar" style="align-items:flex-start">
      <h1 style="margin:0">Breaker Report</h1>
      <div class="toolbar-spacer"></div>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Print</button>
    </div>
    <div class="card"><p>Loading breakers…</p></div>
  `;

  let breakers = [];
  try {
    breakers = await API.getBreakersReport();
  } catch (e) {
    breakers = [];
  }

  if (!breakers || breakers.length === 0) {
    el.innerHTML = `
      <div class="toolbar" style="align-items:flex-start">
        <h1 style="margin:0">Breaker Report</h1>
        <div class="toolbar-spacer"></div>
        <button class="btn btn-outline" onclick="window.print()">🖨️ Print</button>
      </div>
      <div class="card"><p>No record breakers yet.</p></div>
    `;
    return;
  }

  const grouped = {};
  breakers.forEach(b => {
    const dateKey = b.event_date || 'Unknown Date';
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(b);
  });

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  let sections = '';
  dates.forEach(date => {
    const rows = grouped[date].map(b => {
      const oldPb = b.old_pb != null ? formatTime(b.old_pb) : '—';
      const newTime = b.new_time != null ? formatTime(b.new_time) : '—';
      const improvement = b.improvement != null ? '-' + formatTime(b.improvement) : '—';
      return `
        <tr>
          <td class="name-cell">${b.member_name}</td>
          <td>${b.stroke}</td>
          <td class="time-cell">${oldPb}</td>
          <td class="time-cell" style="font-weight:700">${newTime}</td>
          <td class="time-cell" style="color:var(--success);font-weight:700">${improvement}</td>
        </tr>
      `;
    }).join('');

    sections += `
      <div class="card" style="margin-bottom:16px;padding:0;overflow:hidden">
        <div style="background:var(--primary);color:white;padding:10px 16px;font-weight:700">${date}</div>
        <div style="overflow-x:auto">
          <table class="spreadsheet-table">
            <thead>
              <tr>
                <th style="text-align:left">Swimmer</th>
                <th>Stroke</th>
                <th>Old PB</th>
                <th>New Time</th>
                <th>Improved By</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  });

  el.innerHTML = `
    <div class="toolbar" style="align-items:flex-start">
      <h1 style="margin:0">Breaker Report</h1>
      <div class="toolbar-spacer"></div>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Print</button>
    </div>
    ${sections}
  `;
}
