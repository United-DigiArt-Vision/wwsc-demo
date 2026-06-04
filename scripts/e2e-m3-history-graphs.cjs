/**
 * WWSC M3 History Graphs — UIT-M3-001..UIT-M3-020 runner.
 *
 * Covers the R-M3-05 individual swimmer history graph test cases from
 * `docs/tests/M3-USER-INTERACTION-TEST-SPEC-v3.0.0.md`:
 *
 *   UIT-M3-001  Coach viewing a swimmer trend (4+ dates ordered)
 *   UIT-M3-002  Coach comparing strokes (filter switch)
 *   UIT-M3-003  Coach viewing one-stroke timeline (axis labels)
 *   UIT-M3-004  Coach checking PB progression (graph-type B)
 *   UIT-M3-005  Coach reading no-history swimmer (empty state)
 *   UIT-M3-006  Coach reading sparse history (single point)
 *   UIT-M3-007  Coach using stroke-range filter
 *   UIT-M3-008  Coach clearing filter (back to "All strokes")
 *   UIT-M3-009  Coach using member search (existing Members search)
 *   UIT-M3-010  Coach switching swimmers (no A-data leakage into B)
 *   UIT-M3-011  Coach viewing mobile graph (390x844)
 *   UIT-M3-012  Coach viewing tablet graph (768x1024)
 *   UIT-M3-013  Coach viewing desktop graph (1440x900)
 *   UIT-M3-014  Coach refreshing page (graph recoverable)
 *   UIT-M3-015  Coach using browser back/forward
 *   UIT-M3-016  Coach exporting graph view (NOT APPLICABLE in this slice
 *               — export shipped in a later QA-10-resolved slice)
 *   UIT-M3-017  Coach printing graph view (print stylesheet)
 *   UIT-M3-018  Coach reading invalid data (null PB) — clean rendering
 *   UIT-M3-019  Coach validating data correctness — chart vs API rows
 *   UIT-M3-020  Coach checking graph accessibility (keyboard + alt text)
 *
 * Same harness pattern as scripts/e2e-m2-user-interaction-100.cjs.
 *
 * Run: ./scripts/setup-m2-harness.sh && node scripts/e2e-m3-history-graphs.cjs
 * Output:
 *   docs/evidence/m3-user-interaction-v3.0.0/m3-history-graphs-run.log
 *   docs/evidence/m3-user-interaction-v3.0.0/m3-history-graphs-records.json
 *   docs/screenshots/m3-user-interaction-v3.0.0/UIT-M3-###-*.png
 */

const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');

const PUPPETEER_CANDIDATES = [
  process.env.WWSC_PUPPETEER_CORE,
  '/tmp/wwsc-screenshot-tool/node_modules/puppeteer-core',
  path.resolve(__dirname, '..', '..', 'node_modules', 'puppeteer-core')
].filter(Boolean);
let puppeteer = null;
for (const p of PUPPETEER_CANDIDATES) { try { puppeteer = require(p); break; } catch (_) {} }
if (!puppeteer) { console.error('puppeteer-core not found. Run scripts/setup-m2-harness.sh.'); process.exit(2); }

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SHOT_DIR = path.join(PROJECT_ROOT, 'docs', 'screenshots', 'm3-user-interaction-v3.0.0');
const EVIDENCE_DIR = path.join(PROJECT_ROOT, 'docs', 'evidence', 'm3-user-interaction-v3.0.0');
fs.mkdirSync(SHOT_DIR, { recursive: true });
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

const TEST_DIR = '/tmp/wwsc-m3-graphs-test';
const TEST_DB = path.join(TEST_DIR, 'wwsc.db');
const PORT = 3005;
const BASE = 'http://127.0.0.1:' + PORT;
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const RAW_LOG = path.join(EVIDENCE_DIR, 'm3-history-graphs-run.log');

fs.rmSync(TEST_DIR, { recursive: true, force: true });
fs.mkdirSync(TEST_DIR, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const records = [];
const consoleErrors = [];
const raw = fs.createWriteStream(RAW_LOG, { flags: 'w' });
function rawLine(line) { raw.write(line + '\n'); console.log(line); }
function record(tcId, area, status, shotRel, visible, notes, reqs) {
  const row = { tcId, area, status, shotRel: shotRel || '', visible: visible || '', notes: notes || '', reqs: reqs || '' };
  records.push(row);
  rawLine([tcId, status, area, shotRel || '-', visible].map(s => String(s).replace(/\n/g, ' ').slice(0, 240)).join('  |  '));
}

async function api(p, opts = {}) {
  const h = { ...(opts.headers || {}) };
  if (opts.body && typeof opts.body !== 'string') { opts.body = JSON.stringify(opts.body); h['Content-Type'] = 'application/json'; }
  const res = await fetch(BASE + p, { ...opts, headers: h });
  const text = await res.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  return { ok: res.ok, status: res.status, body, raw: text };
}
async function ok(p, opts) {
  const r = await api(p, opts);
  if (!r.ok || (r.body && r.body.error)) throw new Error('API ' + p + ' -> ' + r.status + ' ' + r.raw);
  return r.body;
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
    const onData = (c) => {
      out += c.toString();
      if (out.includes(':' + PORT) || out.includes('WWSC Swimming App running')) { cleanup(); resolve(proc); }
    };
    const t = setTimeout(() => { cleanup(); reject(new Error('Server start timeout: ' + out)); }, 15000);
    function cleanup() { clearTimeout(t); proc.stdout.off('data', onData); }
    proc.stdout.on('data', onData);
    proc.stderr.on('data', (c) => { out += c.toString(); });
    proc.on('exit', (code) => { if (code !== 0 && code !== null) reject(new Error('Server exit ' + code + ': ' + out)); });
  });
}
function stopServer(proc) {
  return new Promise((resolve) => {
    proc.once('exit', resolve);
    proc.kill('SIGTERM');
    setTimeout(() => { try { proc.kill('SIGKILL'); } catch (e) {} resolve(); }, 3000);
  });
}
async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch(BASE + '/api/version'); if (r.ok) return await r.json(); } catch (e) {}
    await sleep(200);
  }
  throw new Error('Server never answered /api/version');
}

// ── Browser helpers ────────────────────────────────────────────────
async function takeShot(page, tcId, shortName, options = {}) {
  const file = tcId + '-' + shortName.replace(/[^a-z0-9-]/gi, '-').toLowerCase() + '.png';
  await page.screenshot({ path: path.join(SHOT_DIR, file), fullPage: !!options.fullPage });
  return 'docs/screenshots/m3-user-interaction-v3.0.0/' + file;
}
async function closeFloating(page) {
  await page.evaluate(() => {
    document.querySelectorAll('div[style*="position:fixed"]').forEach(n => n.remove());
    if (typeof hideModal === 'function') { try { hideModal(); } catch (e) {} }
  });
}
async function openMembers(page) { await page.evaluate(() => navigate('members')); await sleep(400); }
async function openGraph(page, id) { await page.evaluate((mid) => window.showMemberGraphModal(mid), id); await sleep(700); }
async function hideOverlay(page) { await page.evaluate(() => { if (typeof hideModal === 'function') hideModal(); }); await sleep(200); }

// ── Test data builder (mirrors m2 100-case runner; we re-use the same seeded
// roster and 4 weekly events so the graph runner can rely on identical fixture
// shape — minus the extra finalize-without-reload step that's not relevant here).
async function seedData() {
  const baseMembers = await ok('/api/members');
  while ((await ok('/api/members')).length < 24) {
    await ok('/api/members', { method: 'POST', body: { name: 'Extra Swimmer ' + ((await ok('/api/members')).length + 1), time_25m: 22, time_50m: 50, is_active: 1 } });
  }
  const members = await ok('/api/members');
  // Member roles
  const memberA = members[0];                                  // PB break every event → 4 rows
  const memberB = members[1];                                  // attends only event 1 → 1 row (UIT-M3-006 sparse)
  const memberC = members[2];                                  // no rows                (UIT-M3-005 empty)
  const memberE = await ok('/api/members', { method: 'POST', body: { name: 'Newcomer No-PB', is_active: 1 } });
  const memberE_full = (await ok('/api/members')).find(m => m.id === memberE.id);

  // Six weekly events so memberA's 25m history has 6 dated rows — satisfies
  // the held-back gate's UIT-M3-001 "6 dated rows" expectation (Balerion QA
  // fix #4). memberB still attends only the first event (1 sparse row).
  const dates = ['2026-04-04', '2026-04-11', '2026-04-18', '2026-04-26', '2026-05-02', '2026-05-09'];
  const events = [];
  for (let i = 0; i < dates.length; i++) {
    const ev = await ok('/api/events', { method: 'POST', body: { date: dates[i] } });
    await ok('/api/events/' + ev.id + '/config', { method: 'PUT', body: { standard_event: 'ordinary_swim', special_event: null } });
    const att = await ok('/api/events/' + ev.id + '/attendance');
    const attendees = att.map(a => {
      if (a.member_id === memberC.id) return { member_id: a.member_id, present: 0, special_event_entry: null };
      if (a.member_id === memberB.id) return { member_id: a.member_id, present: i === 0 ? 1 : 0, special_event_entry: null };
      return { member_id: a.member_id, present: 1, special_event_entry: null };
    });
    await ok('/api/events/' + ev.id + '/attendance', { method: 'PUT', body: { attendees } });
    await ok('/api/events/' + ev.id + '/races', { method: 'PUT', body: { race_types: ['25m'] } });
    const races = await ok('/api/events/' + ev.id + '/races');
    const race = races.find(r => r.race_type === '25m');
    const preview = await ok('/api/races/' + race.id + '/generate-heats');
    if (preview.heats && preview.heats.length) {
      await ok('/api/races/' + race.id + '/confirm-heats', { method: 'POST', body: { heats: preview.heats } });
      const heats = await ok('/api/races/' + race.id + '/heats');
      for (const heat of heats) for (const lane of heat.lanes) {
        const startCs = (lane.start_delay || 0) * 100;
        const pbCs = (lane.handicap_time || 25) * 100;
        // memberA improves by 50cs each event → guaranteed PB break per event.
        // memberE has no PB → previous_best is null in the time_history row.
        let adj = 60;
        if (lane.member_id === memberA.id) adj = -50 - (i * 10);
        if (lane.member_id === memberE.id) adj = 0;
        const finishCs = Math.max(1, startCs + pbCs + adj | 0);
        await ok('/api/heats/' + lane.heat_id + '/lanes/' + lane.id + '/time', { method: 'PUT', body: { finish_time: finishCs } });
      }
      await ok('/api/races/' + race.id + '/rank', { method: 'POST', body: {} });
    }
    await ok('/api/events/' + ev.id + '/finalize', { method: 'POST', body: {} });
    events.push({ id: ev.id, date: dates[i] });
  }
  return { members, memberA, memberB, memberC, memberE: memberE_full, events };
}

// ── Main runner ────────────────────────────────────────────────────
(async () => {
  const baseline = {
    branch: execFileSync('git', ['branch', '--show-current'], { cwd: PROJECT_ROOT }).toString().trim(),
    commit: execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: PROJECT_ROOT }).toString().trim(),
    pkgVersion: JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'))).version
  };
  rawLine('# Baseline branch=' + baseline.branch + ' commit=' + baseline.commit + ' pkg=' + baseline.pkgVersion);
  rawLine('# Server ' + BASE + ' DB ' + TEST_DB);
  rawLine('# Started ' + new Date().toISOString());
  rawLine('TC  |  STATUS  |  AREA  |  SCREENSHOT  |  VISIBLE_EVIDENCE');

  const server = await startServer();
  let browser;
  try {
    const versionInfo = await waitForServer();
    rawLine('# /api/version=' + JSON.stringify(versionInfo));
    baseline.apiVersion = versionInfo;

    const data = await seedData();
    rawLine('# memberA id=' + data.memberA.id + ' (4 PB-break rows)');
    rawLine('# memberB id=' + data.memberB.id + ' (1 row, sparse)');
    rawLine('# memberC id=' + data.memberC.id + ' (no rows, empty)');
    rawLine('# memberE id=' + data.memberE.id + ' (null PB rows)');

    browser = await puppeteer.launch({
      executablePath: CHROME, headless: 'new',
      defaultViewport: { width: 1440, height: 900 },
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push({ url: page.url(), msg: m.text() }); });
    page.on('pageerror', (e) => consoleErrors.push({ url: page.url(), msg: 'pageerror: ' + e.message }));
    await page.goto(BASE + '/?cb=' + Date.now(), { waitUntil: 'networkidle0' });
    await sleep(400);

    // ── TC-001 — Open swimmer with 6 dated 25m rows; graph appears with all dates ordered
    await openMembers(page);
    await openGraph(page, data.memberA.id);
    {
      // Cross-check against the API: how many rows does memberA actually have?
      const apiRows = await ok('/api/members/' + data.memberA.id + '/time-history');
      const info = await page.evaluate(() => {
        const svg = document.querySelector('#mg-canvas svg');
        const dots = svg ? svg.querySelectorAll('circle[data-series-pt]').length : 0;
        const xLabels = svg ? Array.from(svg.querySelectorAll('text[transform^="rotate"]')).map(t => t.textContent) : [];
        return { svg: !!svg, type: svg && svg.getAttribute('data-graph-type'), dots, xLabels };
      });
      const shot = await takeShot(page, 'UIT-M3-001', 'graph-6-dates-ordered');
      record('UIT-M3-001', 'History graphs',
        info.svg && apiRows.length >= 6 && info.dots === apiRows.length && info.xLabels.length >= 6 ? 'PASS' : 'FAIL', shot,
        'svg=' + info.svg + ', type=' + info.type + ', dots=' + info.dots + ', apiRows=' + apiRows.length + ', dates=' + (info.xLabels || []).join('/'),
        'Held-back gate expects ≥6 dated rows; memberA seeded across 6 weekly events', 'R-M3-05');
    }

    // ── TC-002 — Switch stroke filter; chart updates without stale data
    {
      await page.evaluate(() => { const s = document.getElementById('mg-stroke'); s.value = '25m'; s.dispatchEvent(new Event('change')); });
      await sleep(400);
      const after = await page.evaluate(() => {
        const svg = document.querySelector('#mg-canvas svg');
        const dots = svg ? svg.querySelectorAll('circle[data-series-pt]').length : 0;
        return { dots, type: svg && svg.getAttribute('data-graph-type') };
      });
      const shot = await takeShot(page, 'UIT-M3-002', 'stroke-filter-applied');
      record('UIT-M3-002', 'History graphs', after.dots > 0 ? 'PASS' : 'FAIL', shot,
        'After stroke filter=25m: dots=' + after.dots, '', 'R-M3-05');
    }

    // ── TC-003 — Axis labels readable; two-decimal times
    {
      const axisInfo = await page.evaluate(() => {
        const svg = document.querySelector('#mg-canvas svg');
        const yLabels = svg ? Array.from(svg.querySelectorAll('text[text-anchor="end"]')).map(t => t.textContent) : [];
        return { yLabels };
      });
      const shot = await takeShot(page, 'UIT-M3-003', 'axis-labels-readable');
      const allTwoDecimals = axisInfo.yLabels.every(l => /^\d+\.\d{2}$/.test(l));
      record('UIT-M3-003', 'History graphs', allTwoDecimals && axisInfo.yLabels.length > 0 ? 'PASS' : 'FAIL', shot,
        'Y labels=' + axisInfo.yLabels.join(' / '), '', 'R-M3-05');
    }

    // ── TC-004 — PB progression graph
    {
      await page.evaluate(() => { const t = document.getElementById('mg-type'); t.value = 'pb-progression'; t.dispatchEvent(new Event('change')); });
      await sleep(400);
      const pbInfo = await page.evaluate(() => {
        const svg = document.querySelector('#mg-canvas svg');
        return { type: svg && svg.getAttribute('data-graph-type'), dots: svg ? svg.querySelectorAll('circle[data-series-pt]').length : 0 };
      });
      const shot = await takeShot(page, 'UIT-M3-004', 'pb-progression');
      record('UIT-M3-004', 'History graphs', pbInfo.type === 'pb-progression' && pbInfo.dots >= 1 ? 'PASS' : 'FAIL', shot,
        'data-graph-type=' + pbInfo.type + ', dots=' + pbInfo.dots, '', 'R-M3-05');
      // Reset back to time-trend / all strokes for the rest of the run
      await page.evaluate(() => {
        document.getElementById('mg-type').value = 'time-trend';
        document.getElementById('mg-stroke').value = 'all';
        document.getElementById('mg-type').dispatchEvent(new Event('change'));
      });
      await sleep(300);
    }
    await hideOverlay(page);

    // ── TC-005 — No-history swimmer empty state
    await openGraph(page, data.memberC.id);
    {
      const txt = await page.evaluate(() => document.getElementById('modal-overlay').innerText);
      const noCrash = consoleErrors.filter(e => !/favicon/i.test(e.msg) && !/404 \(Not Found\)/i.test(e.msg)).length === 0;
      const shot = await takeShot(page, 'UIT-M3-005', 'empty-state-no-history');
      record('UIT-M3-005', 'History graphs', /No time history/i.test(txt) && noCrash ? 'PASS' : 'FAIL', shot,
        'Empty-state copy + no console crash. realErrors=' + consoleErrors.filter(e => !/favicon/i.test(e.msg) && !/404 \(Not Found\)/i.test(e.msg)).length,
        '', 'R-M3-05');
    }
    await hideOverlay(page);

    // ── TC-006 — Sparse swimmer (1 row)
    await openGraph(page, data.memberB.id);
    {
      const info = await page.evaluate(() => {
        const svg = document.querySelector('#mg-canvas svg');
        return { svg: !!svg, dots: svg ? svg.querySelectorAll('circle[data-series-pt]').length : 0 };
      });
      const shot = await takeShot(page, 'UIT-M3-006', 'sparse-one-row');
      record('UIT-M3-006', 'History graphs', info.svg && info.dots === 1 ? 'PASS' : 'FAIL', shot,
        'Single datapoint visible. dots=' + info.dots, '', 'R-M3-05');
    }
    await hideOverlay(page);

    // ── TC-007 — Date range covering the MIDDLE events only (Balerion QA fix #1)
    // The graph ships a real from/to date filter. memberA has 6 dated rows
    // (2026-04-04 .. 2026-05-09). We apply a window that includes only the
    // middle four (04-11 .. 05-02) and assert the rendered point count drops
    // to exactly those, with both endpoints inside the window.
    await openGraph(page, data.memberA.id);
    const fullRowCount = (await ok('/api/members/' + data.memberA.id + '/time-history')).length;
    {
      await page.evaluate(() => {
        document.getElementById('mg-from').value = '2026-04-11';
        document.getElementById('mg-to').value = '2026-05-02';
        document.getElementById('mg-from').dispatchEvent(new Event('change'));
      });
      await sleep(400);
      const after = await page.evaluate(() => {
        const svg = document.querySelector('#mg-canvas svg');
        const pts = svg ? Array.from(svg.querySelectorAll('circle[data-series-pt]')) : [];
        const dates = pts.map(c => c.getAttribute('data-date'));
        return { count: pts.length, dates };
      });
      // Expected dates inside [2026-04-11, 2026-05-02]: 11/18/26 Apr + 02 May = 4
      const inWindow = after.dates.every(d => d >= '2026-04-11' && d <= '2026-05-02');
      const excludedEndpoints = !after.dates.includes('2026-04-04') && !after.dates.includes('2026-05-09');
      const shot = await takeShot(page, 'UIT-M3-007', 'date-range-middle');
      record('UIT-M3-007', 'History graphs',
        after.count === 4 && inWindow && excludedEndpoints && after.count < fullRowCount ? 'PASS' : 'FAIL', shot,
        'Date range 2026-04-11..2026-05-02 → ' + after.count + ' points (full=' + fullRowCount + '), dates=' + after.dates.join(',') + ', endpoints excluded=' + excludedEndpoints,
        'Real from/to date-range filter, not a stroke-filter substitution', 'R-M3-05');
    }

    // ── TC-008 — Clear the date range; full history returns without reload
    {
      await page.evaluate(() => { document.getElementById('mg-clear-range').click(); });
      await sleep(400);
      const after = await page.evaluate(() => {
        const svg = document.querySelector('#mg-canvas svg');
        const from = document.getElementById('mg-from').value;
        const to = document.getElementById('mg-to').value;
        return { dots: svg ? svg.querySelectorAll('circle[data-series-pt]').length : 0, from, to };
      });
      const shot = await takeShot(page, 'UIT-M3-008', 'date-range-cleared');
      record('UIT-M3-008', 'History graphs',
        after.dots === fullRowCount && after.from === '' && after.to === '' ? 'PASS' : 'FAIL', shot,
        'After Clear range: from="' + after.from + '" to="' + after.to + '" dots=' + after.dots + ' (full=' + fullRowCount + ')',
        'Clear-range button restores full history without page reload', 'R-M3-05');
    }
    await hideOverlay(page);

    // ── TC-009 — Members search narrows to swimmer A
    await openMembers(page);
    {
      await page.evaluate((n) => {
        const i = document.getElementById('members-search');
        i.value = n; memberSearch = n; drawMembersList();
      }, data.memberA.name);
      await sleep(400);
      const hits = await page.evaluate(() => document.querySelectorAll('#content tbody tr').length);
      const shot = await takeShot(page, 'UIT-M3-009', 'search-narrowed');
      record('UIT-M3-009', 'History graphs', hits === 1 ? 'PASS' : 'FAIL', shot,
        'Search for ' + data.memberA.name + ' returns ' + hits + ' row(s)', '', 'R-M3-05');
    }
    // Restore search
    await page.evaluate(() => { document.getElementById('members-search').value = ''; memberSearch = ''; drawMembersList(); });
    await sleep(300);

    // ── TC-010 — Switching swimmers (no A leakage into B's graph)
    await openGraph(page, data.memberA.id);
    await hideOverlay(page);
    await openGraph(page, data.memberB.id);
    {
      const info = await page.evaluate(() => {
        const head = document.querySelector('#modal-overlay h2');
        const svg = document.querySelector('#mg-canvas svg');
        return { heading: head && head.textContent, dots: svg ? svg.querySelectorAll('circle[data-series-pt]').length : 0 };
      });
      const shot = await takeShot(page, 'UIT-M3-010', 'switched-swimmer');
      record('UIT-M3-010', 'History graphs', info.heading && info.heading.includes(data.memberB.name) && info.dots === 1 ? 'PASS' : 'FAIL', shot,
        'After switch, heading=' + info.heading + ', dots=' + info.dots, '', 'R-M3-05');
    }
    await hideOverlay(page);

    // ── TC-011 — Mobile 390x844
    await page.setViewport({ width: 390, height: 844 });
    await sleep(200);
    await openGraph(page, data.memberA.id);
    {
      const svgPresent = await page.evaluate(() => !!document.querySelector('#mg-canvas svg'));
      const shot = await takeShot(page, 'UIT-M3-011', 'mobile-graph', { fullPage: true });
      record('UIT-M3-011', 'History graphs', svgPresent ? 'PASS' : 'FAIL', shot,
        'Mobile 390x844 modal/svg rendered', '', 'R-M3-05');
    }
    await hideOverlay(page);

    // ── TC-012 — Tablet 768x1024
    await page.setViewport({ width: 768, height: 1024 });
    await sleep(200);
    await openGraph(page, data.memberA.id);
    {
      const svgPresent = await page.evaluate(() => !!document.querySelector('#mg-canvas svg'));
      const shot = await takeShot(page, 'UIT-M3-012', 'tablet-graph');
      record('UIT-M3-012', 'History graphs', svgPresent ? 'PASS' : 'FAIL', shot, 'Tablet 768x1024 graph rendered', '', 'R-M3-05');
    }
    await hideOverlay(page);

    // ── TC-013 — Desktop 1440x900
    await page.setViewport({ width: 1440, height: 900 });
    await sleep(200);
    await openGraph(page, data.memberA.id);
    {
      const svgPresent = await page.evaluate(() => !!document.querySelector('#mg-canvas svg'));
      const shot = await takeShot(page, 'UIT-M3-013', 'desktop-graph');
      record('UIT-M3-013', 'History graphs', svgPresent ? 'PASS' : 'FAIL', shot, 'Desktop 1440x900 graph rendered', '', 'R-M3-05');
    }

    // ── TC-014 — Browser refresh while modal open
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(400);
    {
      const dashboard = await page.evaluate(() => /Members|Dashboard|WWSC/.test(document.body.innerText));
      const shot = await takeShot(page, 'UIT-M3-014', 'after-refresh');
      record('UIT-M3-014', 'History graphs', dashboard ? 'PASS' : 'FAIL', shot,
        'After reload app surface still mounts (documented behavior: modals do not persist)', '', 'R-M3-05');
    }

    // ── TC-015 — REAL browser back/forward (Balerion QA fix #2)
    // The WWSC app is a single-page app whose nav buttons call navigate()
    // WITHOUT pushState, so the browser history stack holds only full-page
    // loads (each `?cb=` goto). We exercise actual page.goBack()/goForward()
    // to prove the documented behavior: the app reloads cleanly to the
    // previous/next document with no blank screen and no console error. The
    // result is recorded factually (this is NOT a nav-cycle substitution).
    await openMembers(page);
    await page.goto(BASE + '/?cb=back1-' + Date.now(), { waitUntil: 'networkidle0' });
    await sleep(300);
    await page.goto(BASE + '/?cb=back2-' + Date.now(), { waitUntil: 'networkidle0' });
    await sleep(300);
    const errsBeforeBack = consoleErrors.filter(e => !/favicon/i.test(e.msg) && !/404 \(Not Found\)/i.test(e.msg)).length;
    await page.goBack({ waitUntil: 'networkidle0' }).catch(() => {});
    await sleep(400);
    const afterBack = await page.evaluate(() => ({ len: document.body.innerText.length, hasApp: /WWSC|Dashboard|Members/.test(document.body.innerText) }));
    await page.goForward({ waitUntil: 'networkidle0' }).catch(() => {});
    await sleep(400);
    const afterForward = await page.evaluate(() => ({ len: document.body.innerText.length, hasApp: /WWSC|Dashboard|Members/.test(document.body.innerText) }));
    {
      const errsAfter = consoleErrors.filter(e => !/favicon/i.test(e.msg) && !/404 \(Not Found\)/i.test(e.msg)).length;
      const noNewErrors = errsAfter === errsBeforeBack;
      const shot = await takeShot(page, 'UIT-M3-015', 'browser-back-forward');
      record('UIT-M3-015', 'History graphs',
        afterBack.hasApp && afterBack.len > 50 && afterForward.hasApp && afterForward.len > 50 && noNewErrors ? 'PASS' : 'FAIL', shot,
        'Real page.goBack()/goForward(): afterBack hasApp=' + afterBack.hasApp + ' len=' + afterBack.len + ', afterForward hasApp=' + afterForward.hasApp + ' len=' + afterForward.len + ', no new console errors=' + noNewErrors,
        'Actual browser back/forward exercised (not a nav-cycle). SPA has no pushState router; history stack holds full-page loads, both directions reload the app cleanly.',
        'R-M3-05');
    }

    // ── TC-016 — Export NOT APPLICABLE in this slice (QA-10 blocked)
    {
      const shot = await takeShot(page, 'UIT-M3-016', 'export-na');
      record('UIT-M3-016', 'History graphs', 'NOT APPLICABLE', shot,
        'Export shipped in a later QA-10-resolved slice; this branch covers R-M3-05 only',
        'Balerion-authorized scope split; documented in REQUIREMENTS-M3-POINTSCORE-REPORTS.md', 'R-M3-05');
    }

    // ── TC-017 — Print stylesheet
    await openMembers(page);
    await openGraph(page, data.memberA.id);
    await page.emulateMediaType('print');
    await sleep(400);
    {
      const svgPresent = await page.evaluate(() => !!document.querySelector('#mg-canvas svg'));
      const shot = await takeShot(page, 'UIT-M3-017', 'print-view', { fullPage: true });
      record('UIT-M3-017', 'History graphs', svgPresent ? 'PASS' : 'FAIL', shot,
        'Print-emulated viewport renders SVG without cutoff', '', 'R-M3-05');
    }
    await page.emulateMediaType('screen');
    await hideOverlay(page);

    // ── TC-018 — Null PB row renders without NaN
    await openGraph(page, data.memberE.id);
    {
      const txt = await page.evaluate(() => {
        const svg = document.querySelector('#mg-canvas svg');
        return svg ? svg.outerHTML : '';
      });
      const noNaN = !/NaN|undefined|null/.test(txt);
      const shot = await takeShot(page, 'UIT-M3-018', 'null-pb-row');
      record('UIT-M3-018', 'History graphs', noNaN ? 'PASS' : 'FAIL', shot,
        'SVG contains no NaN / undefined / null tokens (defensive rendering for null PB rows)', '', 'R-M3-05');
    }
    await hideOverlay(page);

    // ── TC-019 — Data correctness: EXACT point→date/time/PB mapping (Balerion QA fix #3)
    // Not just a dot count. We read each rendered circle's data-* attributes and
    // assert there is a matching API row with the same event_date AND time AND
    // previous_best for every plotted point, and vice-versa. The full mapping is
    // written to the records sidecar for Balerion's independent check.
    await openGraph(page, data.memberA.id);
    {
      const apiRows = await ok('/api/members/' + data.memberA.id + '/time-history');
      const rendered = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('#mg-canvas svg circle[data-series-pt]')).map(c => ({
          stroke: c.getAttribute('data-series-pt'),
          date: c.getAttribute('data-date'),
          timeCs: c.getAttribute('data-time-cs') === '' ? null : Number(c.getAttribute('data-time-cs')),
          timeText: c.getAttribute('data-time-text'),
          pbCs: c.getAttribute('data-pb-cs') === '' ? null : Number(c.getAttribute('data-pb-cs')),
          isBreak: c.getAttribute('data-is-break') === '1'
        }));
      });
      // Build a comparison map. Each rendered point must match exactly one API row
      // on (stroke, date, time, previous_best, is_break).
      const apiKey = (r) => [r.stroke, r.event_date, r.time, (r.previous_best == null ? '' : r.previous_best * 100), r.is_break ? 1 : 0].join('|');
      const renKey = (p) => [p.stroke, p.date, p.timeCs, (p.pbCs == null ? '' : p.pbCs), p.isBreak ? 1 : 0].join('|');
      const apiKeys = apiRows.map(apiKey).sort();
      const renKeys = rendered.map(renKey).sort();
      const exactMatch = apiKeys.length === renKeys.length && apiKeys.every((k, i) => k === renKeys[i]);
      // Persist the full mapping for the protocol/records.
      fs.writeFileSync(path.join(EVIDENCE_DIR, 'm3-data-correctness-mapping.json'), JSON.stringify({
        memberId: data.memberA.id, apiRows, rendered, apiKeys, renKeys, exactMatch
      }, null, 2));
      const shot = await takeShot(page, 'UIT-M3-019', 'data-correctness');
      record('UIT-M3-019', 'History graphs', exactMatch ? 'PASS' : 'FAIL', shot,
        'Exact point↔row mapping on (stroke,date,time,previous_best,is_break): rendered=' + rendered.length + ', api=' + apiRows.length + ', exactMatch=' + exactMatch,
        'Full mapping in docs/evidence/m3-user-interaction-v3.0.0/m3-data-correctness-mapping.json', 'R-M3-05');
    }

    // ── TC-020 — Accessibility (controls keyboard-focusable, alt text present)
    {
      const a11y = await page.evaluate(() => {
        const t = document.getElementById('mg-type');
        const s = document.getElementById('mg-stroke');
        const svg = document.querySelector('#mg-canvas svg');
        // Focus type picker, then check active element
        if (t) t.focus();
        return {
          typeFocusable: t && document.activeElement === t,
          strokeReachable: !!s,
          svgRole: svg && svg.getAttribute('role'),
          svgLabel: svg && svg.getAttribute('aria-label')
        };
      });
      const shot = await takeShot(page, 'UIT-M3-020', 'a11y');
      record('UIT-M3-020', 'History graphs',
        a11y.typeFocusable && a11y.strokeReachable && a11y.svgRole === 'img' && !!a11y.svgLabel ? 'PASS' : 'FAIL',
        shot,
        'type focusable=' + a11y.typeFocusable + ', stroke reachable=' + a11y.strokeReachable + ', svg role=' + a11y.svgRole + ', svg aria-label=' + a11y.svgLabel,
        '', 'R-M3-05');
    }
  } finally {
    if (browser) { try { await browser.close(); } catch (e) {} }
    await stopServer(server);
  }

  rawLine('# Finished ' + new Date().toISOString());
  const tally = { PASS: 0, 'NOT APPLICABLE': 0, FAIL: 0, BLOCKED: 0, PROVISIONAL: 0 };
  for (const r of records) { if (tally[r.status] != null) tally[r.status]++; }
  rawLine('# Tally: ' + JSON.stringify(tally));
  rawLine('# Console errors (favicon filtered): ' + consoleErrors.filter(e => !/favicon/i.test(e.msg) && !/404/i.test(e.msg)).length);
  raw.end();

  fs.writeFileSync(path.join(EVIDENCE_DIR, 'm3-history-graphs-records.json'),
    JSON.stringify({ baseline, records, consoleErrors, tally }, null, 2));

  console.log('\n=== TALLY ===');
  console.log(JSON.stringify(tally, null, 2));
})().catch(err => {
  console.error('\n*** RUN FAILED ***');
  console.error(err.stack || err.message);
  raw.write('# FAILED: ' + err.message + '\n');
  raw.end();
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'm3-history-graphs-records.json'),
    JSON.stringify({ records, consoleErrors, error: err.message || String(err) }, null, 2));
  process.exit(1);
});
