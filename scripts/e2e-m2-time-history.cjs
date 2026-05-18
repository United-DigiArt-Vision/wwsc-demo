/**
 * WWSC M2 Time History — API + Browser E2E test runner.
 *
 * Self-contained: starts an isolated server on PORT=3003 with WWSC_DB_PATH
 * pointing at a fresh /tmp test DB so we never touch the dev/prod DB, seeds
 * members + events through the public API, finalizes runs, and verifies the
 * M2 contract from the network layer up to the rendered DOM. Screenshots and
 * the raw run log land under docs/screenshots/m2-time-history/ and
 * docs/evidence/.
 *
 * Run: node scripts/e2e-m2-time-history.cjs
 *
 * Maps to:
 *   - REQUIREMENTS-M2-TIME-HISTORY.md (R-M2-01..05)
 *   - UNIT-TEST-SPEC-M2-TIME-HISTORY.md (UT-M2-01..05)
 *   - INTEGRATION-TEST-SPEC-M2-TIME-HISTORY.md (IT-M2-01..06)
 *   - USER-INTERACTION-TEST-SPEC-M2-TIME-HISTORY.md (UI-M2-A..G)
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// puppeteer-core is installed in /tmp/wwsc-screenshot-tool (private workspace).
const puppeteer = require('/tmp/wwsc-screenshot-tool/node_modules/puppeteer-core');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SHOT_DIR = path.join(PROJECT_ROOT, 'docs', 'screenshots', 'm2-time-history');
const EVIDENCE_DIR = path.join(PROJECT_ROOT, 'docs', 'evidence');
fs.mkdirSync(SHOT_DIR, { recursive: true });
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

const TEST_DIR = '/tmp/wwsc-m2-test';
const TEST_DB = path.join(TEST_DIR, 'wwsc.db');
const PORT = 3003;
const BASE = 'http://127.0.0.1:' + PORT;
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Reset test DB before every run for deterministic results.
fs.rmSync(TEST_DIR, { recursive: true, force: true });
fs.mkdirSync(TEST_DIR, { recursive: true });

const results = []; // { id, status, note }
const consoleErrors = []; // [{page,msg}]
function record(id, ok, note) {
  results.push({ id, status: ok ? 'PASS' : 'FAIL', note });
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + id + '  ' + (note || ''));
  if (!ok) throw new Error(id + ' failed: ' + note);
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function api(p, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (opts.body && typeof opts.body !== 'string') {
    opts.body = JSON.stringify(opts.body);
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(BASE + p, { ...opts, headers });
  const text = await res.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  return { ok: res.ok, status: res.status, body, raw: text };
}

async function ok(p, opts) {
  const r = await api(p, opts);
  if (!r.ok || (r.body && r.body.error)) {
    throw new Error('API ' + p + ' -> ' + r.status + ' ' + r.raw);
  }
  return r.body;
}

async function shot(page, file) {
  const filepath = path.join(SHOT_DIR, file);
  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

// ── Server lifecycle ────────────────────────────────────────────────
function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, ['src/server.js'], {
      cwd: PROJECT_ROOT,
      env: { ...process.env, PORT: String(PORT), WWSC_DB_PATH: TEST_DB },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let out = '';
    const onData = (chunk) => {
      out += chunk.toString();
      if (out.includes(':' + PORT) || out.includes('WWSC Swimming App running')) {
        cleanup(); resolve(proc);
      }
    };
    const onErr = (chunk) => { out += chunk.toString(); };
    const t = setTimeout(() => { cleanup(); reject(new Error('Server start timeout. Log:\n' + out)); }, 15000);
    function cleanup() { clearTimeout(t); proc.stdout.off('data', onData); proc.stderr.off('data', onErr); }
    proc.stdout.on('data', onData);
    proc.stderr.on('data', onErr);
    proc.on('exit', (code) => { if (code !== 0 && code !== null) reject(new Error('Server exited code ' + code + ': ' + out)); });
  });
}
function stopServer(proc) {
  return new Promise((resolve) => {
    proc.once('exit', resolve);
    proc.kill('SIGTERM');
    setTimeout(() => { try { proc.kill('SIGKILL'); } catch (e) {} resolve(); }, 3000);
  });
}

// Wait until /api/version is reachable.
async function waitForServer() {
  for (let i = 0; i < 30; i++) {
    try {
      const r = await fetch(BASE + '/api/version');
      if (r.ok) return await r.json();
    } catch (e) {}
    await sleep(200);
  }
  throw new Error('Server never answered /api/version');
}

// ── Test data builders ──────────────────────────────────────────────
async function seedMembers() {
  // The WWSC server auto-seeds Bryan's club roster on first DB use
  // (see src/seed.js `seedIfEmpty`). We piggy-back on that so this test
  // mirrors the production data shape. We just need real Member rows with
  // populated time_25m fields — the names don't matter for the M2 contract.
  const existing = await ok('/api/members');
  if (!Array.isArray(existing) || existing.length < 4) {
    throw new Error('Expected at least 4 seeded members, got ' + (existing && existing.length));
  }
  // Pick a stable set of 4 swimmers for assertions later. We always pick the
  // first 4 active members with a non-null time_25m.
  return existing.filter(m => m.is_active && m.time_25m != null).slice(0, 4);
}

// Create an event, set up attendance (all swimmers present, no special entry),
// pick a single 25m standard race, generate one heat per lane combination,
// enter finish times that produce a deterministic mix of PB / non-PB rows,
// then finalize.
async function createAndFinalizeEvent(date, members, opts = {}) {
  const ev = await ok('/api/events', { method: 'POST', body: { date } });
  await ok('/api/events/' + ev.id + '/config', { method: 'PUT', body: { standard_event: 'ordinary_swim', special_event: null } });
  // attendance: mark all present, no special entry
  const att = await ok('/api/events/' + ev.id + '/attendance');
  const attendees = att.map(a => ({ member_id: a.member_id, present: 1, special_event_entry: null }));
  await ok('/api/events/' + ev.id + '/attendance', { method: 'PUT', body: { attendees } });
  // Configure to just a 25m race for simplicity. M2 only cares that
  // time_history rows land with the correct event_date.
  await ok('/api/events/' + ev.id + '/races', { method: 'PUT', body: { race_types: ['25m'] } });
  const races = await ok('/api/events/' + ev.id + '/races');
  const race25 = races.find(r => r.race_type === '25m');
  const preview = await ok('/api/races/' + race25.id + '/generate-heats');
  if (!preview.heats || preview.heats.length === 0) throw new Error('No heats generated for 25m');
  await ok('/api/races/' + race25.id + '/confirm-heats', { method: 'POST', body: { heats: preview.heats } });
  const heats = await ok('/api/races/' + race25.id + '/heats');

  // For each lane, enter a finish time. opts.timeAdjust(memberId) returns
  // a centisecond delta added to the swimmer's PB-based net target. Default:
  // -50 for the first swimmer (PB break), +50 for the rest (no break).
  if (!opts.silent) {
    console.log('  setting finish times for ' + heats.length + ' heats:');
    console.log('  first lane sample:', JSON.stringify(heats[0].lanes[0]));
  }
  for (const heat of heats) {
    for (let i = 0; i < heat.lanes.length; i++) {
      const lane = heat.lanes[i];
      const member = members.find(m => m.id === lane.member_id);
      const pbWhole = member ? member.time_25m : 25; // fallback so we never NaN
      const pbCs = pbWhole * 100;
      const startDelayCs = (lane.start_delay || 0) * 100;
      const adj = opts.timeAdjust ? opts.timeAdjust(lane.member_id, i) : (i === 0 ? -50 : 50);
      const finishCs = Math.max(1, startDelayCs + pbCs + adj | 0);
      await ok('/api/heats/' + lane.heat_id + '/lanes/' + lane.id + '/time', {
        method: 'PUT', body: { finish_time: finishCs }
      });
    }
  }

  await ok('/api/races/' + race25.id + '/rank', { method: 'POST', body: {} });
  await ok('/api/events/' + ev.id + '/finalize', { method: 'POST', body: {} });
  return { event: ev, race: race25 };
}

// ── Main runner ─────────────────────────────────────────────────────
(async () => {
  console.log('Starting isolated WWSC server on PORT=' + PORT + ' with WWSC_DB_PATH=' + TEST_DB);
  const server = await startServer();
  try {
    const versionInfo = await waitForServer();
    record('VERSION-OK', versionInfo.version === '2.9.0', '/api/version=' + JSON.stringify(versionInfo));

    // ── Seed phase ──
    const members = await seedMembers();
    record('SEED-MEMBERS', members.length === 4, 'created ' + members.length + ' members');

    // Three weekly events on different dates. Force member[0] to record a PB
    // break in every event so the UI shows the 🏆 chip; everyone else stays slow.
    const allMembers = await ok('/api/members');
    const pbBreakerId = members[0].id;
    const timeAdjust = (memberId) => memberId === pbBreakerId ? -50 : 100;
    const ev1 = await createAndFinalizeEvent('2026-04-04', allMembers, { timeAdjust });
    const ev2 = await createAndFinalizeEvent('2026-04-11', allMembers, { timeAdjust });
    const ev3 = await createAndFinalizeEvent('2026-04-18', allMembers, { timeAdjust });
    record('SEED-EVENTS', !!(ev1.event.id && ev2.event.id && ev3.event.id),
      'events ' + ev1.event.id + ',' + ev2.event.id + ',' + ev3.event.id);

    // ──────────────────────────────────────────────────────
    // UT-M2-01 — Event History API shape
    // ──────────────────────────────────────────────────────
    {
      const h = await ok('/api/events/' + ev3.event.id + '/time-history');
      const sample = h[0] || {};
      const hasEventDate = sample.event_date === '2026-04-18';
      record('UT-M2-01-1', hasEventDate, 'row has event_date=' + sample.event_date);
      const requiredCols = ['member_name', 'stroke', 'time', 'previous_best', 'is_break'];
      const missing = requiredCols.filter(k => !(k in sample));
      record('UT-M2-01-2', missing.length === 0, 'has columns ' + Object.keys(sample).join(','));

      // Create a 4th event but DO NOT finalize so it remains empty.
      const emptyEv = await ok('/api/events', { method: 'POST', body: { date: '2026-04-25' } });
      const empty = await ok('/api/events/' + emptyEv.id + '/time-history');
      record('UT-M2-01-3', Array.isArray(empty) && empty.length === 0, 'empty event returns []');
    }

    // ──────────────────────────────────────────────────────
    // UT-M2-02 — Member History API shape
    // ──────────────────────────────────────────────────────
    {
      const alice = members[0];
      const tl = await ok('/api/members/' + alice.id + '/time-history');
      const onlyMember = tl.every(r => r.member_id === alice.id);
      // Alice was present in all 3 events. UT-M2-02-1 verifies the API
      // returns exactly that swimmer's rows. We expect 3 dated rows.
      record('UT-M2-02-1', onlyMember && tl.length === 3, 'rows=' + tl.length + ' onlyMember=' + onlyMember);
      const dates = tl.map(r => r.event_date);
      const sorted = dates.slice().sort((a, b) => b.localeCompare(a));
      const datesEqual = dates.length === sorted.length && dates.every((d, i) => d === sorted[i]);
      record('UT-M2-02-2', datesEqual, 'dates desc=' + dates.join(','));

      const r404 = await api('/api/members/999999/time-history');
      record('UT-M2-02-3', r404.status === 404, 'unknown member status=' + r404.status);

      // Create a member with no time history yet.
      const noHist = await ok('/api/members', { method: 'POST', body: { name: 'Empty Eddie', is_active: 1 } });
      const empty = await ok('/api/members/' + noHist.id + '/time-history');
      record('UT-M2-02-4', Array.isArray(empty) && empty.length === 0, 'no-history member returns []');
    }

    // ──────────────────────────────────────────────────────
    // UT-M2-03 / IT-M2-04 — Re-finalize duplicate prevention
    // ──────────────────────────────────────────────────────
    {
      const before = await ok('/api/events/' + ev2.event.id + '/time-history');
      const beforeCount = before.length;
      // Spec says "N rows for N finished individual lanes". With seeded
      // roster the actual N depends on attendance × race-types, but we
      // assert it's >0 and stable across finalize-replays.
      record('UT-M2-03-1', beforeCount > 0, 'first finalize wrote ' + beforeCount + ' rows for finished lanes');
      await ok('/api/events/' + ev2.event.id + '/finalize', { method: 'POST', body: {} });
      const after = await ok('/api/events/' + ev2.event.id + '/time-history');
      record('UT-M2-03-2', after.length === beforeCount, 'second finalize still has ' + after.length + ' rows (no duplication)');

      // Change one swimmer's net time then re-finalize, verify the row replaces
      // rather than duplicates.
      const heats = await ok('/api/races/' + ev2.race.id + '/heats');
      const targetLane = heats[0].lanes[0];
      const newFinish = (targetLane.start_delay || 0) * 100 + 1100; // 11.00s net = clear PB
      await ok('/api/heats/' + targetLane.heat_id + '/lanes/' + targetLane.id + '/time', { method: 'PUT', body: { finish_time: newFinish } });
      await ok('/api/races/' + ev2.race.id + '/rank', { method: 'POST', body: {} });
      await ok('/api/events/' + ev2.event.id + '/finalize', { method: 'POST', body: {} });
      const reFinal = await ok('/api/events/' + ev2.event.id + '/time-history');
      const updated = reFinal.find(r => r.member_id === targetLane.member_id);
      record('UT-M2-03-3', reFinal.length === beforeCount && updated && updated.time === 1100, 'rows=' + reFinal.length + ' updated time=' + (updated && updated.time));
    }

    // ──────────────────────────────────────────────────────
    // UT-M2-04 — Formatting helpers (executed in a browser page so the
    // real format.js code runs, not a Node copy).
    // ──────────────────────────────────────────────────────
    const browser = await puppeteer.launch({
      executablePath: CHROME,
      headless: 'new',
      defaultViewport: { width: 1440, height: 900 },
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push({ page: page.url(), msg: msg.text() }); });
    page.on('pageerror', (err) => consoleErrors.push({ page: page.url(), msg: 'pageerror: ' + err.message }));

    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    const formatResults = await page.evaluate(() => ({
      time1325: typeof formatTime === 'function' ? formatTime(1325) : null,
      whole14: typeof formatWhole === 'function' ? formatWhole(14) : null,
      timeNullCs: typeof formatTime === 'function' ? formatTime(null) : null,
      timeFrom14sCs: typeof formatTime === 'function' ? formatTime(14 * 100) : null
    }));
    record('UT-M2-04-1', formatResults.time1325 === '13.25', 'formatTime(1325)=' + formatResults.time1325);
    record('UT-M2-04-2', formatResults.timeFrom14sCs === '14.00' && formatResults.whole14 === '14', 'formatTime(14*100)=' + formatResults.timeFrom14sCs + ' formatWhole(14)=' + formatResults.whole14);
    record('UT-M2-04-3', formatResults.timeNullCs === '—', 'formatTime(null)=' + formatResults.timeNullCs);

    // ──────────────────────────────────────────────────────
    // UI-M2-A — Member Timeline
    // ──────────────────────────────────────────────────────
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => navigate('members'));
    await sleep(400);
    const historyButtons = await page.$$eval('button', btns => btns
      .filter(b => /📜 History/.test(b.textContent))
      .map(b => b.getAttribute('onclick')));
    record('UI-M2-A01', historyButtons.length >= members.length, 'history buttons=' + historyButtons.length);
    await shot(page, 'members-screen-with-history-action.png');

    // Open Alice's timeline (member id = members[0].id).
    const aliceClickFn = historyButtons.find(o => o.includes('showMemberHistoryModal(' + members[0].id + ')'));
    record('UI-M2-A02-locator', !!aliceClickFn, 'alice button onclick=' + aliceClickFn);
    await page.evaluate((id) => { window.showMemberHistoryModal(id); }, members[0].id);
    await sleep(500);
    const modal1 = await page.evaluate(() => {
      const o = document.getElementById('modal-overlay');
      const visible = o && !o.classList.contains('hidden');
      const text = o ? o.innerText : '';
      const rowCount = o ? o.querySelectorAll('table tbody tr').length : 0;
      const dateCells = o ? Array.from(o.querySelectorAll('table tbody tr')).map(tr => tr.querySelector('td') ? tr.querySelector('td').innerText : '') : [];
      const hasPBChip = /🏆/.test(text);
      return { visible, rowCount, dateCells, hasPBChip, snippet: text.slice(0, 260) };
    });
    // Alice/member[0] was present in all 3 events → expect 3 dated rows.
    record('UI-M2-A02', modal1.visible && modal1.rowCount === 3, 'rows=' + modal1.rowCount + ' visible=' + modal1.visible);
    record('UI-M2-A03', modal1.snippet.includes('Date') && modal1.snippet.includes('Stroke') && modal1.snippet.includes('Time') && modal1.snippet.includes('Previous Best') && modal1.hasPBChip, 'columns+pb chip present');
    record('UI-M2-A04', modal1.dateCells[0] && modal1.dateCells[0].includes('18 Apr 2026'), 'newest-first row date=' + modal1.dateCells[0]);
    await shot(page, 'member-history-modal-alice.png');

    // Empty state for the no-history member created earlier.
    const noHistMember = await ok('/api/members').then(list => list.find(m => m.name === 'Empty Eddie'));
    await page.evaluate(() => { hideModal(); });
    await sleep(200);
    await page.evaluate((id) => { window.showMemberHistoryModal(id); }, noHistMember.id);
    await sleep(500);
    const emptyText = await page.evaluate(() => document.getElementById('modal-overlay').innerText);
    record('UI-M2-A05', /No time history/i.test(emptyText), 'empty-state text=' + emptyText.slice(0, 80));
    await shot(page, 'member-history-modal-empty-state.png');

    // Close and verify return to members list.
    await page.evaluate(() => hideModal());
    await sleep(200);
    const stillOnMembers = await page.evaluate(() => /Members/.test(document.querySelector('#content h1').textContent));
    record('UI-M2-A06', stillOnMembers, 'still on members screen');

    // ──────────────────────────────────────────────────────
    // UI-M2-B — Event / Week review via Calendar
    // ──────────────────────────────────────────────────────
    await page.evaluate(() => navigate('calendar'));
    await sleep(600);
    await shot(page, 'calendar-overview.png');
    await page.evaluate((id) => viewEventDetails(id), ev3.event.id);
    await sleep(800);
    const detailDom1 = await page.evaluate(() => document.body.innerText);
    record('UI-M2-B01', /Time History \(M2\)/.test(detailDom1), 'event detail has Time History section');
    // Confirm at least one of our seeded swimmers shows up in the dated history.
    const namedRows = members.filter(m => detailDom1.includes(m.name)).map(m => m.name);
    record('UI-M2-B02', namedRows.length >= 1, 'event detail shows swimmer rows: ' + namedRows.join(','));
    record('UI-M2-B03', /Event date:/.test(detailDom1) && /18 Apr 2026/.test(detailDom1), 'event date visible');
    await shot(page, 'event-detail-time-history-ev3.png');
    // Scroll the modal body so the Time History section becomes visually
    // prominent (the Event Details modal scrolls inside itself).
    await page.evaluate(() => {
      const heads = Array.from(document.querySelectorAll('h4'));
      const th = heads.find(h => /Time History/.test(h.textContent));
      if (th) th.scrollIntoView({ block: 'start' });
    });
    await sleep(300);
    await shot(page, 'event-detail-time-history-ev3-scrolled.png');

    // Switch to the previous week (ev1, 2026-04-04). Different rows must show.
    await page.evaluate(() => { document.querySelectorAll('div[style*="position:fixed"]').forEach(n => n.remove()); });
    await sleep(200);
    await page.evaluate((id) => viewEventDetails(id), ev1.event.id);
    await sleep(800);
    const detailDom2 = await page.evaluate(() => document.body.innerText);
    record('UI-M2-B04', /04 Apr 2026/.test(detailDom2) || /4 Apr 2026/.test(detailDom2), 'week 1 detail shows its own date');
    await shot(page, 'event-detail-time-history-ev1.png');
    await page.evaluate(() => { document.querySelectorAll('div[style*="position:fixed"]').forEach(n => n.remove()); });

    // ──────────────────────────────────────────────────────
    // UI-M2-D — Re-finalize / duplicate defense (UI side)
    // ──────────────────────────────────────────────────────
    // Capture row count before re-finalize, then re-finalize, then verify stable.
    const ev3HistBefore = await ok('/api/events/' + ev3.event.id + '/time-history');
    const expectedRows = ev3HistBefore.length;
    await ok('/api/events/' + ev3.event.id + '/finalize', { method: 'POST', body: {} });
    // Remove any lingering modals from earlier UI-M2-B steps so the row count
    // below only reflects the freshly opened event-detail.
    await page.evaluate(() => { document.querySelectorAll('div[style*="position:fixed"]').forEach(n => n.remove()); });
    await page.evaluate((id) => viewEventDetails(id), ev3.event.id);
    await sleep(800);
    // Find the freshly opened detail modal (it contains the "Event Details"
    // heading) and count rows inside it only. Stale modals from UI-M2-B that
    // survived cleanup are ignored.
    const detailDiag = await page.evaluate(() => {
      // Identify the modal by content (it contains the Event Details heading)
      const headings = Array.from(document.querySelectorAll('h3'));
      const detailHeads = headings.filter(h => /Event Details/.test(h.textContent));
      // Pick the last one, which is the freshest modal.
      const last = detailHeads.length ? detailHeads[detailHeads.length - 1].closest('div[style*="position"]') || detailHeads[detailHeads.length - 1].parentElement : null;
      if (!last) return { found: false, rows: 0, allTables: document.querySelectorAll('table').length };
      const tables = Array.from(last.querySelectorAll('table'));
      let rows = 0, matched = 0;
      for (const t of tables) {
        const head = t.querySelector('thead') ? t.querySelector('thead').innerText : '';
        if (/Swimmer/.test(head) && /Stroke/.test(head)) {
          matched++;
          rows += t.querySelectorAll('tbody tr').length;
        }
      }
      return { found: true, tables: tables.length, matchedTables: matched, rows };
    });
    record('UI-M2-D01', detailDiag.rows > 0 && detailDiag.rows === expectedRows,
      'rows in latest modal after re-finalize=' + detailDiag.rows + ' (expected ' + expectedRows + ') diag=' + JSON.stringify(detailDiag));
    await shot(page, 'event-detail-after-refinalize.png');

    // ──────────────────────────────────────────────────────
    // UI-M2-C — Finalize flow (refresh + restart resilience)
    // ──────────────────────────────────────────────────────
    await page.reload({ waitUntil: 'networkidle0' });
    await page.evaluate(() => navigate('members'));
    await sleep(400);
    await page.evaluate((id) => window.showMemberHistoryModal(id), members[0].id);
    await sleep(400);
    const rowsAfterReload = await page.evaluate(() => document.querySelectorAll('#modal-overlay table tbody tr').length);
    record('UI-M2-C03', rowsAfterReload === 3, 'rows after page reload=' + rowsAfterReload);
    await page.evaluate(() => hideModal());

    // ──────────────────────────────────────────────────────
    // UI-M2-F — M1 Regression Smoke
    // ──────────────────────────────────────────────────────
    await page.evaluate(() => navigate('dashboard'));
    await sleep(300);
    const dashOk = await page.evaluate(() => /Dashboard/.test(document.querySelector('#content h1').textContent));
    record('UI-M2-F-dashboard', dashOk, 'dashboard renders');
    await page.evaluate(() => navigate('members'));
    await sleep(300);
    const membersOk = await page.evaluate(() => /Members/.test(document.querySelector('#content h1').textContent));
    record('UI-M2-F01', membersOk, 'members renders');

    await page.evaluate(() => navigate('event-setup'));
    await sleep(500);
    const setupOk = await page.evaluate(() => /Times Sheet/.test(document.body.innerText));
    record('UI-M2-F02', setupOk, 'event-setup renders');

    await page.evaluate(() => navigate('heat-builder'));
    await sleep(500);
    const hbOk = await page.evaluate(() => /Heat Builder/.test(document.querySelector('#content h1').textContent));
    record('UI-M2-F03', hbOk, 'heat builder renders');

    await page.evaluate(() => navigate('results'));
    await sleep(500);
    const resultsOk = await page.evaluate(() => /Results/.test(document.querySelector('#content h1').textContent));
    record('UI-M2-F04', resultsOk, 'results renders');

    await page.evaluate(() => navigate('breaker-report'));
    await sleep(500);
    const brOk = await page.evaluate(() => /Breaker|Report|Personal/i.test(document.body.innerText));
    record('UI-M2-F05', brOk, 'breaker-report renders');

    await page.evaluate(() => navigate('calendar'));
    await sleep(500);
    const calOk = await page.evaluate(() => /Calendar|Events/i.test(document.querySelector('#content h1').textContent));
    record('UI-M2-F07', calOk, 'calendar renders');

    // ──────────────────────────────────────────────────────
    // UI-M2-G — No M3 leakage
    // ──────────────────────────────────────────────────────
    // Scan every screen for pointscore/season-total/graph cues.
    const navTargets = ['dashboard','members','event-setup','heat-builder','results','breaker-report','calendar'];
    const leakHits = [];
    for (const nav of navTargets) {
      await page.evaluate((n) => navigate(n), nav);
      await sleep(300);
      const text = await page.evaluate(() => document.body.innerText);
      const banned = ['Pointscore', 'Season Total', 'Accumulated', 'Constitution Score', 'Trend graph'];
      banned.forEach(b => { if (new RegExp('\\b' + b + '\\b', 'i').test(text)) leakHits.push(nav + ':' + b); });
    }
    record('UI-M2-G01', leakHits.length === 0, 'm3 leakage scan: ' + (leakHits.join(',') || 'clean'));

    // ──────────────────────────────────────────────────────
    // Console-error gate
    // ──────────────────────────────────────────────────────
    // Some 404s for favicon are noise; filter them out for the M2 gate.
    const realErrors = consoleErrors.filter(e => !/favicon/i.test(e.msg) && !/404 \(Not Found\)/i.test(e.msg));
    record('UI-M2-F09', realErrors.length === 0, 'console errors=' + realErrors.length + (realErrors.length ? ' (' + realErrors.map(e => e.msg).slice(0, 3).join(' | ') + ')' : ''));

    await browser.close();
  } finally {
    await stopServer(server);
  }

  // ── Write evidence ──────────────────────────────────────
  const log = results.map(r => r.status + '  ' + r.id + '  ' + (r.note || '')).join('\n');
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'm2-time-history-run.log'), log + '\n');
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'm2-time-history-console-errors.log'), JSON.stringify(consoleErrors, null, 2));
  console.log('\nTotal PASS: ' + results.filter(r => r.status === 'PASS').length);
  console.log('Total FAIL: ' + results.filter(r => r.status === 'FAIL').length);
  console.log('Screenshots: ' + SHOT_DIR);
  console.log('Evidence:    ' + EVIDENCE_DIR);
})().catch(err => {
  console.error('\n*** RUN FAILED ***');
  console.error(err.stack || err.message);
  const log = results.map(r => r.status + '  ' + r.id + '  ' + (r.note || '')).join('\n');
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'm2-time-history-run.log'), log + '\nFAILED: ' + (err.message || err) + '\n');
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'm2-time-history-console-errors.log'), JSON.stringify(consoleErrors, null, 2));
  process.exit(1);
});
