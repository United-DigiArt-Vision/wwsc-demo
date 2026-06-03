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

let psTab = 'event';        // 'event' | 'month' | 'season' | 'swimmer'
let psRules = null;         // cached /api/pointscore/rules

async function renderPointscore() {
  const el = document.getElementById('content');
  el.innerHTML = '<h1>🎯 Pointscore & Reports</h1><p>Loading…</p>';
  if (!psRules) {
    try { psRules = await API.get('/api/pointscore/rules'); } catch (e) { psRules = null; }
  }
  const banner = psRuleBanner();
  const tabs = `
    <div class="toolbar" style="gap:6px;flex-wrap:wrap">
      ${['event', 'month', 'season', 'swimmer'].map(t => `
        <button class="btn ${psTab === t ? 'btn-primary' : 'btn-outline'}" style="min-height:40px"
          onclick="psSetTab('${t}')">${psTabLabel(t)}</button>`).join('')}
    </div>`;
  el.innerHTML = `<h1>🎯 Pointscore & Reports</h1>${banner}${tabs}<div id="ps-body" class="print-area"><p>Loading…</p></div>`;
  await psRenderBody();
}

function psTabLabel(t) {
  return { event: '📋 Per-Event', month: '🗓️ Monthly Winners', season: '🏆 Season Winners', swimmer: '🏊 Swimmer Card' }[t];
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
    if (psTab === 'event') return await psRenderEvent(body);
    if (psTab === 'month') return await psRenderMonth(body);
    if (psTab === 'season') return await psRenderSeason(body);
    if (psTab === 'swimmer') return await psRenderSwimmer(body);
  } catch (e) {
    body.innerHTML = `<div class="card" style="color:#dc3545">Error: ${e.message}</div>`;
  }
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
  if (sel) window.location.href = '/api/events/' + sel.value + '/pointscore.csv';
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
  if (sel) window.location.href = '/api/pointscore/month/' + sel.value + '.csv';
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
  if (sel) window.location.href = '/api/pointscore/season/' + sel.value + '.csv';
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
    ? '<div class="card">No pointscore contributions yet for this swimmer.</div>'
    : `<table class="data-table"><thead><tr><th>Date</th><th>Race</th><th>Points</th></tr></thead>
        <tbody>${data.contributions.map(c => `<tr><td>${formatDate(c.event_date)}</td><td>${c.race_type}</td><td>${c.points}</td></tr>`).join('')}</tbody></table>`;
  body.innerHTML = sel + `<h2>${data.member.name} — total ${data.total} points</h2>
    <p style="color:var(--text-secondary);font-size:13px">Per-event contribution detail.</p>` + table;
  const s2 = document.getElementById('ps-swimmer-select'); if (s2) s2.value = memberId;
}
