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
      // R13: Unified format matching R10
      return `
        <tr>
          <td class="name-cell">${b.member_name}</td>
          <td style="text-align:center">${b.stroke}</td>
          <td style="text-align:center">${oldPb}</td>
          <td style="text-align:center;font-weight:700">${newTime}</td>
          <td style="text-align:center;color:var(--success);font-weight:700">${improvement}</td>
        </tr>
      `;
    }).join('');

    sections += `
      <div class="card" style="margin-bottom:16px;padding:0;overflow:hidden">
        <div style="background:var(--primary);color:white;padding:10px 16px;font-weight:700">${date}</div>
        <div style="overflow-x:auto">
          <table class="report-table" style="width:100%;border-collapse:collapse;table-layout:fixed">
            <thead>
              <tr>
                <th style="text-align:left;width:25%">Swimmer</th>
                <th style="text-align:center;width:25%">Event/Heat</th>
                <th style="text-align:center;width:15%">Old PB</th>
                <th style="text-align:center;width:15%">New Time</th>
                <th style="text-align:center;width:20%">Variance</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  });

  // BF2.6-20: Also load exceeded swimmers (>2s over PB)
  let exceededHtml = '';
  try {
    const exceeded = await API.getExceededReport();
    if (exceeded && exceeded.length > 0) {
      const exGrouped = {};
      exceeded.forEach(s => {
        const dateKey = s.event_date || 'Unknown Date';
        if (!exGrouped[dateKey]) exGrouped[dateKey] = [];
        exGrouped[dateKey].push(s);
      });

      const exDates = Object.keys(exGrouped).sort((a, b) => b.localeCompare(a));
      let exSections = '';
      exDates.forEach(date => {
        const rows = exGrouped[date].map(s => {
          const stroke = (s.race_type || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          // R13: Unified format
          return `
            <tr>
              <td class="name-cell">${s.name}</td>
              <td style="text-align:center">${stroke}</td>
              <td style="text-align:center">${formatWhole(s.pb)}</td>
              <td style="text-align:center;font-weight:700">${formatTime(s.net_time)}</td>
              <td style="text-align:center;color:#e65100;font-weight:700">+${formatTime(s.variance)}</td>
            </tr>
          `;
        }).join('');

        exSections += `
          <div class="card" style="margin-bottom:16px;padding:0;overflow:hidden">
            <div style="background:#e65100;color:white;padding:10px 16px;font-weight:700">${date}</div>
            <div style="overflow-x:auto">
              <table class="report-table" style="width:100%;border-collapse:collapse;table-layout:fixed">
                <thead>
                  <tr>
                    <th style="text-align:left;width:25%">Swimmer</th>
                    <th style="text-align:center;width:25%">Event/Heat</th>
                    <th style="text-align:center;width:15%">Old PB</th>
                    <th style="text-align:center;width:15%">New Time</th>
                    <th style="text-align:center;width:20%">Variance</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </div>
        `;
      });

      exceededHtml = `
        <div style="margin-top:32px">
          <h2 style="color:#e65100">⚠️ Swimmers Exceeding PB (>2 seconds)</h2>
          ${exSections}
        </div>
      `;
    }
  } catch (e) { console.error('Failed to load exceeded report:', e); }

  el.innerHTML = `
    <div class="toolbar" style="align-items:flex-start">
      <h1 style="margin:0">Breaker Report</h1>
      <div class="toolbar-spacer"></div>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Print</button>
    </div>
    ${sections}
    ${exceededHtml}
  `;
}
