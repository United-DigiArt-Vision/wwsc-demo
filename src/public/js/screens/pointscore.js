/**
 * WWSC — Pointscore / Reports screen (M3).
 *
 * Read-only views over the additively-written pointscore data:
 *  - Event tab: each event keeps its own pointscore (event-separated).
 *  - Monthly tab: monthly overall winners by simple addition.
 *  - Season tab: season overall winners by simple addition.
 *  - Swimmer tab: per-swimmer contribution detail.
 *
 * Every view shows a rule-transparency banner stating the Excel sheets are
 * the working scoring source and the Constitution is not confirmed
 * (UIT-M3-021/022). CSV export + print-friendly per view.
 */

// Bryan 2026-06-10 ("we have over engineered the pointscore — there are 3
// main reports, as per the spreadsheet"): the screen now leads with exactly
// those 3 main reports. The earlier detail views stay available, collapsed
// under "More reports", so nothing previously accepted is lost.
let psTab = 'r1';           // r1 | r2 | r3 | event | month | season | swimmer | breaks | improvement | coverage | export
let psRules = null;         // cached /api/pointscore/rules
let psMoreOpen = false;     // "More reports" group expanded?

const PS_MAIN_TABS = ['r1', 'r2', 'r3'];
const PS_MORE_TABS = ['event', 'month', 'season', 'swimmer', 'breaks', 'improvement', 'coverage', 'export'];

async function renderPointscore() {
  const el = document.getElementById('content');
  el.innerHTML = '<h1>🎯 Pointscore & Reports</h1><p>Loading…</p>';
  if (!psRules) {
    try { psRules = await API.get('/api/pointscore/rules'); } catch (e) { psRules = null; }
  }
  const banner = psRuleBanner();
  const mainTabs = PS_MAIN_TABS.map(t => `
    <button class="btn ${psTab === t ? 'btn-primary' : 'btn-outline'}" style="min-height:48px;font-weight:700"
      onclick="psSetTab('${t}')">${psTabLabel(t)}</button>`).join('');
  const moreOpen = psMoreOpen || PS_MORE_TABS.includes(psTab);
  const moreTabs = `
    <div class="toolbar print-hide" style="gap:6px;flex-wrap:wrap">
      ${mainTabs}
      <button class="btn btn-outline" style="min-height:48px;color:var(--text-secondary)" onclick="psToggleMore()">${moreOpen ? '▴ Less' : '▾ More reports'}</button>
    </div>
    ${moreOpen ? `<div class="toolbar print-hide" style="gap:6px;flex-wrap:wrap;border-top:1px dashed #ccc;padding-top:8px">
      ${PS_MORE_TABS.map(t => `
        <button class="btn ${psTab === t ? 'btn-primary' : 'btn-outline'}" style="min-height:36px;font-size:13px;padding:4px 12px"
          onclick="psSetTab('${t}')">${psTabLabel(t)}</button>`).join('')}
    </div>` : ''}`;
  el.innerHTML = `<h1>🎯 Pointscore & Reports</h1>${banner}${moreTabs}<div id="ps-body" class="print-area"><p>Loading…</p></div>`;
  await psRenderBody();
}

function psToggleMore() {
  psMoreOpen = !(psMoreOpen || PS_MORE_TABS.includes(psTab));
  if (!psMoreOpen && PS_MORE_TABS.includes(psTab)) psTab = 'r1';
  renderPointscore();
}

function psTabLabel(t) {
  return {
    r1: '1️⃣ Event Points (weekly)',
    r2: '2️⃣ Total Pointscore',
    r3: '3️⃣ Breakers',
    event: '📋 Per-Event',
    month: '🗓️ Monthly Winners',
    season: '🏆 Season Winners',
    swimmer: '🏊 Swimmer Card',
    breaks: '🏅 Break Counts',
    improvement: '📉 Improvements',
    coverage: '✅ Completed Categories',
    export: '⬇️ DB & Graphs'
  }[t];
}

function psRuleBanner() {
  const src = psRules ? psRules.source : 'Excel pointscore sheets (working assumption)';
  const agg = psRules ? psRules.aggregation : 'Event-separated; monthly/season by simple addition.';
  return `
    <div class="card print-hide" style="border-left:4px solid #f59e0b;background:#fffbeb;margin-bottom:12px">
      <div style="font-weight:700;color:#92400e">ℹ️ How points are scored (working assumption)</div>
      <div style="font-size:13px;color:#78350f;margin-top:4px">
        Scoring source: <strong>${src}</strong>.<br>
        ${agg}<br>
        <em>This is the working assumption sent to Bryan on 2026-06-02. It is not a confirmed separate Constitution rule — the formula, season boundary, and accumulation are isolated and adjustable if Bryan sends the Constitution.</em>
      </div>
    </div>`;
}

function psSetTab(t) { psTab = t; renderPointscore(); }

async function psRenderBody() {
  const body = document.getElementById('ps-body');
  if (!body) return;
  try {
    if (psTab === 'r1') return await psRenderReport1(body);
    if (psTab === 'r2') return await psRenderReport2(body);
    if (psTab === 'r3') return await psRenderReport3(body);
    if (psTab === 'event') return await psRenderEvent(body);
    if (psTab === 'month') return await psRenderMonth(body);
    if (psTab === 'season') return await psRenderSeason(body);
    if (psTab === 'swimmer') return await psRenderSwimmer(body);
    if (psTab === 'breaks') return await psRenderBreaks(body);
    if (psTab === 'improvement') return await psRenderImprovement(body);
    if (psTab === 'coverage') return await psRenderCoverage(body);
    if (psTab === 'export') return await psRenderExport(body);
  } catch (e) {
    body.innerHTML = `<div class="card" style="color:#dc3545">Error: ${e.message}</div>`;
  }
}

// ── Bryan's 3 main reports (2026-06-10, as per the spreadsheet) ──────

function psShortDate(d) {
  const dt = new Date(d + 'T12:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return dt.getDate() + ' ' + months[dt.getMonth()];
}

function psYearSelect(id, years, current) {
  const list = (years && years.length > 0) ? years : [current];
  return `<label>Season</label>
    <select id="${id}" class="form-control" style="max-width:120px" onchange="psRenderBody()">
      ${list.map(y => `<option value="${y}" ${y === current ? 'selected' : ''}>${y}</option>`).join('')}
    </select>`;
}

// Report 1: pick a race type → all members, points per week + total.
async function psRenderReport1(body) {
  const typeSel = document.getElementById('ps-r1-type');
  const yearSel = document.getElementById('ps-r1-year');
  const rt = typeSel ? typeSel.value : '25m';
  const yearQ = yearSel ? '?year=' + yearSel.value : '';
  const data = await API.get('/api/pointscore/by-race-type/' + rt + yearQ);
  const types = (data.availableRaceTypes && data.availableRaceTypes.length > 0) ? data.availableRaceTypes : [rt];
  const controls = `
    <div class="toolbar print-hide">
      <label>Event</label>
      <select id="ps-r1-type" class="form-control" style="max-width:220px" onchange="psRenderBody()">
        ${types.map(t => `<option value="${t}" ${t === data.race_type ? 'selected' : ''}>${categoryDisplay(t)}</option>`).join('')}
      </select>
      ${psYearSelect('ps-r1-year', data.availableYears, data.year)}
      <button class="btn btn-outline" onclick="psExportR1()">⬇️ CSV</button>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Print</button>
    </div>`;
  let table;
  if (data.weeks.length === 0) {
    table = `<div class="card">No completed ${categoryDisplay(data.race_type)} races in ${data.year} yet.</div>`;
  } else {
    table = `<div style="overflow-x:auto"><table class="data-table">
      <thead><tr><th style="text-align:left">Swimmer</th>
        ${data.weeks.map(w => `<th title="${w.date}">${psShortDate(w.date)}</th>`).join('')}
        <th style="background:#0b3d91;color:#fff">Total</th></tr></thead>
      <tbody>${data.members.map(m => `
        <tr><td style="text-align:left;font-weight:600">${m.member_name}</td>
          ${data.weeks.map(w => `<td style="text-align:center">${m.points[w.event_id] != null ? m.points[w.event_id] : ''}</td>`).join('')}
          <td style="text-align:center;font-weight:700;background:#e3f2fd">${m.total}</td></tr>`).join('')}
      </tbody></table></div>`;
  }
  body.innerHTML = controls + `<h2>Report 1 — ${categoryDisplay(data.race_type)} points per week (${data.year})</h2>
    <p style="color:var(--text-secondary);font-size:13px">All members, points scored each week, season total. Empty cell = no points that week.</p>` + table;
  const t2 = document.getElementById('ps-r1-type'); if (t2) t2.value = data.race_type;
  const y2 = document.getElementById('ps-r1-year'); if (y2) y2.value = data.year;
}

function psExportR1() {
  const rt = document.getElementById('ps-r1-type');
  const y = document.getElementById('ps-r1-year');
  if (rt) window.location.href = '/api/pointscore/by-race-type/' + rt.value + '/csv' + (y ? '?year=' + y.value : '');
}

// Report 2: single page — all members × event types, totals + grand total.
async function psRenderReport2(body) {
  const yearSel = document.getElementById('ps-r2-year');
  const yearQ = yearSel ? '?year=' + yearSel.value : '';
  const data = await API.get('/api/pointscore/total' + yearQ);
  const controls = `
    <div class="toolbar print-hide">
      ${psYearSelect('ps-r2-year', data.availableYears, data.year)}
      <button class="btn btn-outline" onclick="psExportR2()">⬇️ CSV</button>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Print</button>
    </div>`;
  let table;
  if (data.raceTypes.length === 0) {
    table = `<div class="card">No completed events in ${data.year} yet.</div>`;
  } else {
    // Season standing order: highest total first, zero rows alphabetical at the end.
    const members = data.members.slice().sort((a, b) => b.total - a.total || a.member_name.localeCompare(b.member_name));
    table = `<div style="overflow-x:auto"><table class="data-table">
      <thead><tr><th>Rank</th><th style="text-align:left">Swimmer</th>
        ${data.raceTypes.map(rt => `<th>${categoryDisplay(rt)}</th>`).join('')}
        <th style="background:#0b3d91;color:#fff">TOTAL</th></tr></thead>
      <tbody>${members.map((m, i) => `
        <tr><td style="text-align:center">${i + 1}</td>
          <td style="text-align:left;font-weight:600">${m.member_name}</td>
          ${data.raceTypes.map(rt => `<td style="text-align:center">${m.byType[rt] != null ? m.byType[rt] : ''}</td>`).join('')}
          <td style="text-align:center;font-weight:700;background:#e3f2fd">${m.total}</td></tr>`).join('')}
      </tbody></table></div>`;
  }
  body.innerHTML = controls + `<h2>Report 2 — Total pointscore ${data.year}</h2>
    <p style="color:var(--text-secondary);font-size:13px">All members, season total per event type and grand total of all events. Single page.</p>` + table;
  const y2 = document.getElementById('ps-r2-year'); if (y2) y2.value = data.year;
}

function psExportR2() {
  const y = document.getElementById('ps-r2-year');
  window.location.href = '/api/pointscore/total/csv' + (y ? '?year=' + y.value : '');
}

// Report 3: breaker counts + breaker amounts on one report.
async function psRenderReport3(body) {
  const yearSel = document.getElementById('ps-r3-year');
  const yearQ = yearSel ? '?year=' + yearSel.value : '';
  const data = await API.get('/api/reports/breakers-summary' + yearQ);
  const controls = `
    <div class="toolbar print-hide">
      ${psYearSelect('ps-r3-year', data.availableYears, data.year)}
      <button class="btn btn-outline" onclick="psExportR3()">⬇️ CSV</button>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Print</button>
    </div>`;
  const anyLogged = data.rows.some(r => r.times_lowered > 0);
  const hint = anyLogged ? '' : `
    <div class="card print-hide" style="border-left:4px solid #1565c0;background:#e3f2fd">
      <strong>ℹ️ No manual PB changes recorded yet in ${data.year}.</strong><br>
      <span style="font-size:13px">This report tracks the manually changed times: when you lower a swimmer's PB in
      Members → edit time, the change is counted here. The amount is the season-start PB minus the current PB.</span>
    </div>`;
  let main;
  if (data.rows.length === 0) {
    main = '<div class="card">No members with PB times yet.</div>';
  } else {
    let lastMember = null;
    const rowsHtml = data.rows.map(r => {
      const first = r.member_id !== lastMember;
      lastMember = r.member_id;
      return `<tr${first ? ' style="border-top:2px solid #90a4ae"' : ''}>
        <td style="text-align:left;font-weight:${first ? 700 : 400};color:${first ? '#111' : '#999'}">${first ? r.member_name : '〃'}</td>
        <td>${categoryDisplay(r.stroke)}</td>
        <td style="text-align:center">${r.season_start != null ? formatWhole(r.season_start) : '—'}</td>
        <td style="text-align:center">${r.current_pb != null ? formatWhole(r.current_pb) : '—'}</td>
        <td style="text-align:center;font-weight:700;${r.times_lowered > 0 ? 'color:#2e7d32' : 'color:#bbb'}">${r.times_lowered}</td>
        <td style="text-align:center;font-weight:700;${r.amount_lowered > 0 ? 'color:#2e7d32' : 'color:#bbb'}">${r.amount_lowered != null ? r.amount_lowered + 's' : '—'}</td>
      </tr>`;
    }).join('');
    const totalsHtml = data.totals.map(t => `
      <tr><td style="text-align:left;font-weight:600">${t.member_name}</td>
        <td style="text-align:center;font-weight:700">${t.times_lowered}</td>
        <td style="text-align:center;font-weight:700">${t.amount_lowered}s</td></tr>`).join('');
    main = `
      <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start">
        <div style="flex:2;min-width:380px;overflow-x:auto">
          <h3>Per stroke</h3>
          <table class="data-table">
            <thead><tr><th style="text-align:left">Swimmer</th><th>Stroke</th><th>Season Start</th><th>Current PB</th><th>Breaker Count</th><th>Breaker Amount</th></tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
        <div style="flex:1;min-width:240px">
          <h3>Totals per swimmer</h3>
          <table class="data-table">
            <thead><tr><th style="text-align:left">Swimmer</th><th>Count</th><th>Amount</th></tr></thead>
            <tbody>${totalsHtml}</tbody>
          </table>
        </div>
      </div>`;
  }
  body.innerHTML = controls + `<h2>Report 3 — Breaker counts &amp; amounts (${data.year})</h2>
    <p style="color:var(--text-secondary);font-size:13px">Count = how many times the PB came down (manual time changes) since season start.
    Amount = season-start PB minus current PB. Whole seconds.</p>` + hint + main;
  const y2 = document.getElementById('ps-r3-year'); if (y2) y2.value = data.year;
}

function psExportR3() {
  const y = document.getElementById('ps-r3-year');
  window.location.href = '/api/reports/breakers-summary/csv' + (y ? '?year=' + y.value : '');
}

// ── Per-event ───────────────────────────────────────────────────────
async function psRenderEvent(body) {
  const events = await API.get('/api/events');
  const completed = events.filter(e => e.status === 'finalized' || e.status === 'completed');
  if (completed.length === 0) {
    body.innerHTML = '<div class="card">No finalized events yet. Pointscore appears here after an event is finalized.</div>';
    return;
  }
  const sel = `
    <div class="toolbar print-hide">
      <label>Event</label>
      <select id="ps-event-select" class="form-control" style="max-width:280px" onchange="psRenderBody()">
        ${completed.map(e => `<option value="${e.id}">${formatDate(e.date)}</option>`).join('')}
      </select>
      <button class="btn btn-outline" onclick="psExportEvent()">⬇️ CSV</button>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Print</button>
    </div>`;
  // Use selected or first event
  const existingSel = document.getElementById('ps-event-select');
  const eventId = existingSel ? existingSel.value : completed[0].id;
  const data = await API.get('/api/events/' + eventId + '/pointscore');
  const totalsTable = data.totals.length === 0
    ? '<div class="card">No pointscore rows for this event.</div>'
    : `<table class="data-table"><thead><tr><th>Rank</th><th>Swimmer</th><th>Event Points</th></tr></thead>
        <tbody>${data.totals.map((t, i) => `<tr><td>${i + 1}</td><td>${t.member_name}</td><td style="font-weight:700">${t.total}</td></tr>`).join('')}</tbody></table>`;
  const detail = data.rows.length === 0 ? '' : `
    <h3 style="margin-top:16px">Per-race detail (event keeps its own pointscore)</h3>
    <table class="data-table"><thead><tr><th>Swimmer</th><th>Race</th><th>Points</th></tr></thead>
    <tbody>${data.rows.map(r => `<tr><td>${r.member_name}</td><td>${r.race_type}</td><td>${r.points}</td></tr>`).join('')}</tbody></table>`;
  body.innerHTML = sel + `<h2>Event ${formatDate(data.event.date)}</h2>` + totalsTable + detail;
  // re-set the dropdown to the chosen value
  const s2 = document.getElementById('ps-event-select');
  if (s2) s2.value = eventId;
}

function psExportEvent() {
  const sel = document.getElementById('ps-event-select');
  if (sel) window.location.href = '/api/events/' + sel.value + '/pointscore/csv';
}

// ── Monthly ─────────────────────────────────────────────────────────
async function psRenderMonth(body) {
  const months = await API.get('/api/pointscore/months');
  if (months.length === 0) {
    body.innerHTML = '<div class="card">No scored events yet, so no monthly winners.</div>';
    return;
  }
  const existing = document.getElementById('ps-month-select');
  const ym = existing ? existing.value : months[0];
  const sel = `
    <div class="toolbar print-hide">
      <label>Month</label>
      <select id="ps-month-select" class="form-control" style="max-width:200px" onchange="psRenderBody()">
        ${months.map(m => `<option value="${m}">${m}</option>`).join('')}
      </select>
      <button class="btn btn-outline" onclick="psExportMonth()">⬇️ CSV</button>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Print</button>
    </div>`;
  const data = await API.get('/api/pointscore/month/' + ym);
  const table = data.standings.length === 0
    ? '<div class="card">No events scored in this month.</div>'
    : `<table class="data-table"><thead><tr><th>Rank</th><th>Swimmer</th><th>Total Points</th><th>Events</th></tr></thead>
        <tbody>${data.standings.map((s, i) => `<tr><td>${i + 1}</td><td>${s.member_name}</td><td style="font-weight:700">${s.total}</td><td>${s.events_counted}</td></tr>`).join('')}</tbody></table>`;
  body.innerHTML = sel + `<h2>Monthly overall winners — ${ym}</h2>
    <p style="color:var(--text-secondary);font-size:13px">Simple addition of ${data.events.length} event(s) in this month.</p>` + table;
  const s2 = document.getElementById('ps-month-select'); if (s2) s2.value = ym;
}

function psExportMonth() {
  const sel = document.getElementById('ps-month-select');
  if (sel) window.location.href = '/api/pointscore/month/' + sel.value + '/csv';
}

// ── Season ──────────────────────────────────────────────────────────
async function psRenderSeason(body) {
  const months = await API.get('/api/pointscore/months');
  const years = Array.from(new Set(months.map(m => m.slice(0, 4)))).sort().reverse();
  if (years.length === 0) {
    body.innerHTML = '<div class="card">No scored events yet, so no season winners.</div>';
    return;
  }
  const existing = document.getElementById('ps-season-select');
  const year = existing ? existing.value : years[0];
  const sel = `
    <div class="toolbar print-hide">
      <label>Season (year)</label>
      <select id="ps-season-select" class="form-control" style="max-width:160px" onchange="psRenderBody()">
        ${years.map(y => `<option value="${y}">${y}</option>`).join('')}
      </select>
      <button class="btn btn-outline" onclick="psExportSeason()">⬇️ CSV</button>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Print</button>
    </div>`;
  const data = await API.get('/api/pointscore/season/' + year);
  const table = data.standings.length === 0
    ? '<div class="card">No events scored in this season.</div>'
    : `<table class="data-table"><thead><tr><th>Rank</th><th>Swimmer</th><th>Total Points</th><th>Events</th></tr></thead>
        <tbody>${data.standings.map((s, i) => `<tr><td>${i + 1}</td><td>${s.member_name}</td><td style="font-weight:700">${s.total}</td><td>${s.events_counted}</td></tr>`).join('')}</tbody></table>`;
  body.innerHTML = sel + `<h2>Season overall winners — ${year}</h2>
    <p style="color:var(--text-secondary);font-size:13px">Season boundary: ${data.seasonBoundary}. Simple addition of ${data.events.length} event(s).</p>` + table;
  const s2 = document.getElementById('ps-season-select'); if (s2) s2.value = year;
}

function psExportSeason() {
  const sel = document.getElementById('ps-season-select');
  if (sel) window.location.href = '/api/pointscore/season/' + sel.value + '/csv';
}

// ── Swimmer card ────────────────────────────────────────────────────
async function psRenderSwimmer(body) {
  const members = await API.getMembers();
  const existing = document.getElementById('ps-swimmer-select');
  const memberId = existing ? existing.value : (members[0] && members[0].id);
  const sel = `
    <div class="toolbar print-hide">
      <label>Swimmer</label>
      <select id="ps-swimmer-select" class="form-control" style="max-width:240px" onchange="psRenderBody()">
        ${members.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
      </select>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Print</button>
    </div>`;
  if (!memberId) { body.innerHTML = sel + '<div class="card">No members.</div>'; return; }
  const data = await API.get('/api/members/' + memberId + '/pointscore');
  const table = data.contributions.length === 0
    ? '<div class="card">No race participations recorded yet for this swimmer.</div>'
    : `<table class="data-table"><thead><tr><th>Date</th><th>Race</th><th>Points</th></tr></thead>
        <tbody>${data.contributions.map(c => `<tr><td>${formatDate(c.event_date)}</td><td>${categoryDisplay(c.race_type) || c.race_type}</td><td style="${c.points === 0 ? 'color:#999' : 'font-weight:700'}">${c.points}</td></tr>`).join('')}</tbody></table>`;
  body.innerHTML = sel + `<h2>${data.member.name} — total ${data.total} points</h2>
    <p style="color:var(--text-secondary);font-size:13px">Every race this swimmer took part in.
    0 points = swam, but no points awarded (e.g. relay/brace/medley teams outside 1st–3rd).</p>` + table;
  const s2 = document.getElementById('ps-swimmer-select'); if (s2) s2.value = memberId;
}

// ── Break counts ───────────────────────────────────────────────────
async function psRenderBreaks(body) {
  const data = await API.get('/api/reports/break-counts');
  const controls = `
    <div class="toolbar print-hide">
      <button class="btn btn-outline" onclick="window.location.href='/api/reports/break-counts/csv'">⬇️ CSV</button>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Print</button>
    </div>`;
  const overall = data.overall.length === 0
    ? '<div class="card">No PB breaks recorded in finalized events yet.</div>'
    : `<table class="data-table"><thead><tr><th>Rank</th><th>Swimmer</th><th>Breaks</th></tr></thead>
      <tbody>${data.overall.map((r, i) => `<tr><td>${i + 1}</td><td>${r.member_name}</td><td style="font-weight:700">${r.break_count}</td></tr>`).join('')}</tbody></table>`;
  const byEvent = data.by_event.length === 0
    ? ''
    : `<h3 style="margin-top:16px">By event</h3><table class="data-table"><thead><tr><th>Date</th><th>Stroke</th><th>Swimmer</th><th>Breaks</th></tr></thead>
      <tbody>${data.by_event.map(r => `<tr><td>${formatDate(r.event_date)}</td><td>${r.stroke}</td><td>${r.member_name}</td><td>${r.break_count}</td></tr>`).join('')}</tbody></table>`;
  body.innerHTML = controls + `<h2>Break counts</h2>
    <p style="color:var(--text-secondary);font-size:13px">${data.source}</p>
    <h3>Overall</h3>` + overall + byEvent;
}

// ── Total improvements ─────────────────────────────────────────────
async function psRenderImprovement(body) {
  const data = await API.get('/api/reports/improvements');
  const controls = `
    <div class="toolbar print-hide">
      <button class="btn btn-outline" onclick="window.location.href='/api/reports/improvements/csv'">⬇️ CSV</button>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Print</button>
    </div>`;
  const overall = data.overall.length === 0
    ? '<div class="card">No faster-than-previous-best rows recorded in finalized events yet.</div>'
    : `<table class="data-table"><thead><tr><th>Rank</th><th>Swimmer</th><th>Total improvement</th><th>Rows</th></tr></thead>
      <tbody>${data.overall.map((r, i) => `<tr><td>${i + 1}</td><td>${r.member_name}</td><td style="font-weight:700">${formatTime(r.total_improvement_cs)}</td><td>${r.improvement_count}</td></tr>`).join('')}</tbody></table>`;
  const byEvent = data.by_event.length === 0
    ? ''
    : `<h3 style="margin-top:16px">By event</h3><table class="data-table"><thead><tr><th>Date</th><th>Stroke</th><th>Swimmer</th><th>Improvement</th><th>Rows</th></tr></thead>
      <tbody>${data.by_event.map(r => `<tr><td>${formatDate(r.event_date)}</td><td>${r.stroke}</td><td>${r.member_name}</td><td>${formatTime(r.total_improvement_cs)}</td><td>${r.improvement_count}</td></tr>`).join('')}</tbody></table>`;
  body.innerHTML = controls + `<h2>Total time improvement</h2>
    <p style="color:var(--text-secondary);font-size:13px">${data.source}</p>
    <h3>Overall</h3>` + overall + byEvent;
}

// ── Completed result categories ────────────────────────────────────
async function psRenderCoverage(body) {
  const data = await API.get('/api/reports/event-coverage');
  const requested = ['25m', '50m', '25m_relay', 'medley_relay', '75m', '25m_brace', '50m_brace', 'breaststroke', 'backstroke', 'butterfly'];
  const summaryByType = {};
  data.summary.forEach(s => { summaryByType[s.race_type] = s; });
  const controls = `
    <div class="toolbar print-hide">
      <button class="btn btn-outline" onclick="window.location.href='/api/reports/event-coverage/csv'">⬇️ CSV</button>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Print</button>
    </div>`;
  const summary = `<table class="data-table"><thead><tr><th>Requested category</th><th>Status</th><th>Completed races</th><th>Saved result rows</th></tr></thead>
    <tbody>${requested.map(rt => {
      const s = summaryByType[rt];
      return `<tr><td>${categoryDisplay(rt)}</td><td>${s && s.result_count > 0 ? 'Covered' : 'Not present'}</td><td>${s ? s.completed_races : 0}</td><td>${s ? s.result_count : 0}</td></tr>`;
    }).join('')}</tbody></table>`;
  const rows = data.rows.length === 0
    ? '<div class="card">No completed result categories yet.</div>'
    : `<h3 style="margin-top:16px">Completed event result rows</h3><table class="data-table"><thead><tr><th>Date</th><th>Race type</th><th>Category</th><th>Result rows</th><th>Teams</th></tr></thead>
      <tbody>${data.rows.map(r => `<tr><td>${formatDate(r.event_date)}</td><td>${r.race_type}</td><td>${r.category}</td><td>${r.result_count}</td><td>${r.team_count}</td></tr>`).join('')}</tbody></table>`;
  body.innerHTML = controls + `<h2>Completed event categories</h2>
    <p style="color:var(--text-secondary);font-size:13px">${data.source}. Bryan listed 75m twice; this report covers the single supported 75m race type once.</p>` + summary + rows;
}

function categoryDisplay(rt) {
  return {
    '25m': '25m',
    '50m': '50m',
    '25m_relay': 'relay',
    'medley_relay': 'medley relay',
    '75m': '75m',
    '25m_brace': '25m brace',
    '50m_brace': '50m brace',
    'breaststroke': 'breast / breaststroke',
    'backstroke': 'back / backstroke',
    'butterfly': 'butterfly'
  }[rt] || rt;
}

// ── DB export + graph explanation ──────────────────────────────────
async function psRenderExport(body) {
  body.innerHTML = `
    <div class="toolbar print-hide">
      <button class="btn btn-primary" onclick="window.location.href='/api/export/db'">⬇️ Download SQLite DB</button>
      <button class="btn btn-outline" onclick="window.location.href='/api/time-history/csv'">⬇️ Time History CSV</button>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Print</button>
    </div>
    <h2>DB export and graphs</h2>
    <div class="card">
      <h3>Database export</h3>
      <p>The SQLite download button creates a safe snapshot of the configured WWSC database and downloads the raw <code>.db</code> file. The filename includes the app version and export date.</p>
    </div>
    <div class="card">
      <h3>How graphs are produced</h3>
      <p>Individual graphs are produced from saved <code>time_history</code> rows after events are finalized. Each row stores swimmer, event date, stroke, current time, previous best, and whether it was a break.</p>
      <p>Open Members, choose a swimmer, then use Graphs to view the same time-history rows as a trend graph. The Time History CSV exports those graph source rows.</p>
    </div>`;
}
