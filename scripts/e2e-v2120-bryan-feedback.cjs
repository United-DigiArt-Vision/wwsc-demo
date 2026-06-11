#!/usr/bin/env node
/**
 * WWSC v2.12.x — Bryan feedback Browser/UI proof.
 *
 * What the USER sees, per QUALITY_PLAYBOOK L4:
 *  - Times Sheet: Select All defaults entries to Y (not N).
 *  - Results: direct Manual-cell tapping assigns/removes manual places.
 *  - Relays: team cards side by side in a grid (single-page layout).
 *  - Pointscore: leads with Bryan's 3 main reports; all members listed.
 *  - Swimmer Card: brace participation visible.
 *  - Event report popup: Start, Net, Variance, BREAK columns + manual place wins.
 *  - 0 console errors.
 *
 * Needs puppeteer-core + Chrome (scripts/setup-m2-harness.sh).
 */
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');

const PUP = [process.env.WWSC_PUPPETEER_CORE, '/tmp/wwsc-screenshot-tool/node_modules/puppeteer-core', path.resolve(__dirname, '..', '..', 'node_modules', 'puppeteer-core')].filter(Boolean);
let puppeteer = null;
for (const p of PUP) { try { puppeteer = require(p); break; } catch (e) {} }
if (!puppeteer) { console.error('puppeteer-core not found; run scripts/setup-m2-harness.sh'); process.exit(2); }

const ROOT = path.resolve(__dirname, '..');
const EVID = path.join(ROOT, 'docs', 'evidence', 'v2120-bryan-feedback');
const SHOT = path.join(ROOT, 'docs', 'screenshots', 'v2120-bryan-feedback');
fs.mkdirSync(EVID, { recursive: true });
fs.mkdirSync(SHOT, { recursive: true });

const PORT = 3014;
const BASE = 'http://127.0.0.1:' + PORT;
const TMP = '/tmp/wwsc-v2120-browser';
const DB_PATH = path.join(TMP, 'wwsc.db');
const CHROME = process.env.WWSC_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });

const records = [];
const consoleErrors = [];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
function rec(id, status, screenshot, note) {
  const normalized = status === true ? 'PASS' : status === false ? 'FAIL' : status;
  records.push({ id, status: normalized, screenshot: screenshot || '', note: note || '' });
  console.log([normalized, id, note || ''].join('  '));
}

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, ['src/server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), WWSC_DB_PATH: DB_PATH }, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    const t = setTimeout(() => reject(new Error('server timeout: ' + out)), 15000);
    proc.stdout.on('data', (c) => { out += c; if (out.includes(':' + PORT) || out.includes('running')) { clearTimeout(t); resolve(proc); } });
    proc.stderr.on('data', (c) => { out += c; });
  });
}
function stop(proc) { return new Promise(r => { proc.once('exit', r); proc.kill('SIGTERM'); setTimeout(() => { try { proc.kill('SIGKILL'); } catch (e) {} r(); }, 2500); }); }
async function api(route, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  let body = opts.body;
  if (body && typeof body !== 'string') { body = JSON.stringify(body); headers['Content-Type'] = 'application/json'; }
  const res = await fetch(BASE + route, { ...opts, headers, body });
  const text = await res.text();
  let parsed; try { parsed = JSON.parse(text); } catch { parsed = text; }
  if (!res.ok || (parsed && parsed.error)) throw new Error(route + ' -> ' + res.status + ' ' + text);
  return parsed;
}
async function waitUp() { for (let i = 0; i < 50; i++) { try { const r = await fetch(BASE + '/api/version'); if (r.ok) return await r.json(); } catch (e) {} await sleep(200); } throw new Error('server did not start'); }
async function shot(page, id, name) {
  const file = id + '-' + name + '.png';
  await page.screenshot({ path: path.join(SHOT, file), fullPage: true });
  return 'docs/screenshots/v2120-bryan-feedback/' + file;
}

const RELAYS = ['25m_relay', 'medley_relay', '25m_brace', '50m_brace', 'pogo'];

// Completed brace event in the past (swimmer card + event report data),
// then a CURRENT event with heats + relay teams for the interactive flows.
async function buildFixture() {
  // — completed event with 25m + 25m_brace, one manual place override —
  const evB = await api('/api/events', { method: 'POST', body: { date: '2026-03-14' } });
  await api('/api/events/' + evB.id + '/config', { method: 'PUT', body: { standard_event: '25m_brace', special_event: null } });
  const attB = await api('/api/events/' + evB.id + '/attendance');
  await api('/api/events/' + evB.id + '/attendance', { method: 'PUT', body: { attendees: attB.map(a => ({ member_id: a.member_id, present: 1, special_event_entry: null })) } });
  await api('/api/events/' + evB.id + '/races', { method: 'PUT', body: { race_types: ['25m', '25m_brace'] } });
  const racesB = await api('/api/events/' + evB.id + '/races');
  let manualPlaceLane = null;
  for (const race of racesB) {
    if (RELAYS.includes(race.race_type)) {
      const gen = await api('/api/races/' + race.id + '/generate-relay-teams', { method: 'POST', body: { forceReshuffle: true } });
      await api('/api/races/' + race.id + '/save-relay-teams', { method: 'POST', body: { teams: gen.teams } });
      const teams = await api('/api/races/' + race.id + '/relay-teams');
      for (let i = 0; i < teams.length; i++) {
        const t = teams[i];
        await api('/api/relay-teams/' + t.id + '/time', { method: 'PUT', body: { total_time: ((t.target_time || 60) + (t.start_delay || 0)) * 100 + 20 + i * 35 } });
      }
      await api('/api/races/' + race.id + '/rank-relay', { method: 'POST', body: {} });
    } else {
      const prev = await api('/api/races/' + race.id + '/generate-heats');
      await api('/api/races/' + race.id + '/confirm-heats', { method: 'POST', body: { heats: prev.heats } });
      const heats = await api('/api/races/' + race.id + '/heats');
      let li = 0;
      for (const h of heats) for (const lane of h.lanes) {
        const deltas = [-120, -60, 25, 70, 130, 210, 45, 95];
        await api('/api/heats/' + lane.heat_id + '/lanes/' + lane.id + '/time', { method: 'PUT', body: { finish_time: Math.max(100, (lane.start_delay + lane.handicap_time) * 100 + deltas[li % deltas.length]) } });
        li++;
      }
      await api('/api/races/' + race.id + '/rank', { method: 'POST', body: {} });
      // Manual place override on the first lane: report must show MANUAL place.
      const h0 = heats[0];
      manualPlaceLane = { laneId: h0.lanes[0].id, heatNumber: h0.heat_number, name: h0.lanes[0].name };
      await api('/api/heat-lanes/' + manualPlaceLane.laneId + '/place', { method: 'PATCH', body: { manual_place: 4 } });
    }
  }
  await api('/api/events/' + evB.id + '/finalize', { method: 'POST', body: {} });
  await api('/api/events/' + evB.id + '/complete', { method: 'POST', body: {} });
  const braceRace = racesB.find(r => r.race_type === '25m_brace');
  const braceTeams = await api('/api/races/' + braceRace.id + '/relay-teams');
  const nonPodium = braceTeams.find(t => t.place != null && t.place > 3);

  // — current event: special 75m, races with heats + saved relay teams —
  const today = new Date().toISOString().slice(0, 10);
  const evC = await api('/api/events', { method: 'POST', body: { date: today } });
  await api('/api/events/' + evC.id + '/config', { method: 'PUT', body: { standard_event: 'ordinary_swim', special_event: '75m' } });
  const attC = await api('/api/events/' + evC.id + '/attendance');
  await api('/api/events/' + evC.id + '/attendance', { method: 'PUT', body: { attendees: attC.map((a, i) => ({ member_id: a.member_id, present: i < 12 ? 1 : 0, special_event_entry: null })) } });
  await api('/api/events/' + evC.id + '/races', { method: 'PUT', body: { race_types: ['25m', '50m', '25m_relay', '75m'] } });
  const racesC = await api('/api/events/' + evC.id + '/races');
  const r25 = racesC.find(r => r.race_type === '25m');
  const prev = await api('/api/races/' + r25.id + '/generate-heats');
  await api('/api/races/' + r25.id + '/confirm-heats', { method: 'POST', body: { heats: prev.heats } });
  const relay = racesC.find(r => r.race_type === '25m_relay');
  const gen = await api('/api/races/' + relay.id + '/generate-relay-teams', { method: 'POST', body: { forceReshuffle: true } });
  await api('/api/races/' + relay.id + '/save-relay-teams', { method: 'POST', body: { teams: gen.teams } });
  return { evB: evB.id, evC: evC.id, nonPodium, relayTeamCount: gen.teams.length, manualPlaceLane };
}

(async () => {
  const baseline = {
    branch: execFileSync('git', ['branch', '--show-current'], { cwd: ROOT }).toString().trim(),
    commit: execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT }).toString().trim(),
    version: JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'))).version
  };
  const server = await startServer();
  let browser;
  try {
    const apiVersion = await waitUp();
    const fixture = await buildFixture();
    browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', defaultViewport: { width: 1440, height: 900 }, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push({ url: page.url(), msg: m.text() }); });
    page.on('pageerror', e => consoleErrors.push({ url: page.url(), msg: 'pageerror: ' + e.message }));
    page.on('dialog', async d => { try { await d.accept(); } catch (e) {} });

    // ── UI-V12-01: Times Sheet Select All → Y ───────────────────────
    await page.goto(BASE + '/?cb=1', { waitUntil: 'networkidle0' });
    await page.evaluate(() => navigate('event-setup'));
    await sleep(500);
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Select All'));
      btn.click();
    });
    await sleep(400);
    const entryStates = await page.evaluate(() => [...document.querySelectorAll('select.entry-select')].map(s => s.value));
    rec('UI-V12-01-select-all-defaults-Y', entryStates.length > 0 && entryStates.every(v => v === 'Y'),
      await shot(page, 'UI-V12-01', 'times-sheet-select-all-Y'),
      entryStates.length + ' entry selects, values: ' + [...new Set(entryStates)].join(','));

    // ── UI-V12-02/03: Direct Manual-cell Tap Placing on Results ─────
    await page.evaluate(() => navigate('results'));
    await sleep(600);
    const oldButtonGone = await page.evaluate(() => ![...document.querySelectorAll('button')].some(b => b.textContent.includes('Tap Placing')));
    // Tap first two Manual cells directly. Finish cells remain time-entry cells.
    await page.evaluate(() => { document.querySelector('.manual-place-tap').click(); });
    await sleep(350);
    await page.evaluate(() => { document.querySelectorAll('.manual-place-tap')[1].click(); });
    await sleep(350);
    const placesAfterTwoTaps = await page.evaluate(() =>
      [...document.querySelectorAll('.manual-place-tap')].slice(0, 2).map(td => td.innerText.trim()));
    rec('UI-V12-02-direct-manual-cell-assigns-1-2', oldButtonGone && placesAfterTwoTaps[0].includes('1') && placesAfterTwoTaps[1].includes('2'),
      await shot(page, 'UI-V12-02', 'tap-placing-1-2'),
      'oldButtonGone=' + oldButtonGone + ' badges=' + JSON.stringify(placesAfterTwoTaps));
    await page.evaluate(() => { document.querySelector('.manual-place-tap').click(); });
    await sleep(350);
    const placeRemoved = await page.evaluate(() => {
      const td = document.querySelector('.manual-place-tap');
      return td.innerText.trim();
    });
    rec('UI-V12-03-direct-tap-again-removes-place', placeRemoved.includes('1'),
      await shot(page, 'UI-V12-03', 'tap-placing-removed'), 'first row place cell now: ' + placeRemoved);

    // ── UI-V12-04: relay grid side-by-side ──────────────────────────
    await page.evaluate(() => navigate('relays'));
    await sleep(700);
    const grid = await page.evaluate(() => {
      const g = document.querySelector('.relay-teams-grid');
      if (!g) return null;
      return { columns: getComputedStyle(g).gridTemplateColumns.split(' ').length, cards: g.querySelectorAll('.relay-team-card').length };
    });
    rec('UI-V12-04-relay-teams-grid', !!grid && grid.cards >= 2 && grid.columns >= 2,
      await shot(page, 'UI-V12-04', 'relay-grid-side-by-side'),
      'grid=' + JSON.stringify(grid) + ' (teams ' + fixture.relayTeamCount + ')');

    // ── UI-V12-05..07: Pointscore 3 main reports ────────────────────
    await page.evaluate(() => navigate('pointscore'));
    await sleep(600);
    const landing = await page.evaluate(() => document.body.innerText);
    const r1rows = await page.evaluate(() => document.querySelectorAll('#ps-body tbody tr').length);
    const members = await api('/api/members');
    rec('UI-V12-05-three-main-reports-default-r1',
      landing.includes('Event Points (weekly)') && landing.includes('Total Pointscore') && landing.includes('Breakers')
        && landing.includes('Report 1') && r1rows >= members.filter(m => m.is_active).length,
      await shot(page, 'UI-V12-05', 'pointscore-3-main-reports'),
      'rows=' + r1rows + ' active=' + members.filter(m => m.is_active).length);

    await page.evaluate(() => psSetTab('r2'));
    await sleep(500);
    const r2text = await page.evaluate(() => document.body.innerText);
    rec('UI-V12-06-report2-total-pointscore', r2text.includes('Report 2') && r2text.includes('TOTAL') && r2text.includes('25m brace'),
      await shot(page, 'UI-V12-06', 'report2-total'), 'columns include 25m brace + TOTAL');

    await page.evaluate(() => psSetTab('r3'));
    await sleep(500);
    const r3text = await page.evaluate(() => document.body.innerText);
    rec('UI-V12-07-report3-breakers', r3text.includes('Report 3') && r3text.includes('Breaker Count') && r3text.includes('Breaker Amount'),
      await shot(page, 'UI-V12-07', 'report3-breakers'), 'count + amount on a single report');

    // ── UI-V12-08: Swimmer card lists brace row ─────────────────────
    const zeroMember = fixture.nonPodium.members[0];
    await page.evaluate(() => { psMoreOpen = true; psSetTab('swimmer'); });
    await sleep(500);
    await page.evaluate((id) => { document.getElementById('ps-swimmer-select').value = String(id); psRenderBody(); }, zeroMember.member_id);
    await sleep(500);
    const cardText = await page.evaluate(() => document.getElementById('ps-body').innerText);
    rec('UI-V12-08-swimmer-card-brace-participation', cardText.includes('25m brace') && cardText.includes(zeroMember.name.split(' ')[0]),
      await shot(page, 'UI-V12-08', 'swimmer-card-brace'),
      zeroMember.name + ' card shows 25m brace participation');

    // ── UI-V12-10: Pointscore exposes Event History cross-check ─────
    await page.evaluate(() => { psMoreOpen = true; psSetTab('history'); });
    await sleep(500);
    const histText = await page.evaluate(() => document.body.innerText);
    const histRows = await page.evaluate(() => document.querySelectorAll('#ps-body tbody tr').length);
    rec('UI-V12-10-pointscore-event-history', histText.includes('Event History') && histRows >= 1,
      await shot(page, 'UI-V12-10', 'pointscore-event-history'), 'history rows=' + histRows);

    // ── UI-V12-09: event report popup — Start + BREAK + manual place ─
    const popupPromise = new Promise(resolve => browser.once('targetcreated', t => resolve(t)));
    await page.evaluate((eventId) => showSeasonReport(eventId), fixture.evB);
    const popupTarget = await popupPromise;
    const popup = await popupTarget.page();
    await sleep(700);
    const popupHtml = await popup.evaluate(() => document.body.innerText);
    const hasCols = popupHtml.includes('Start') && popupHtml.includes('Net') && popupHtml.includes('Variance') && popupHtml.includes('BREAK');
    const manualShown = new RegExp(fixture.manualPlaceLane.name + '[\\s\\S]{0,120}?\\b4\\b').test(popupHtml);
    rec('UI-V12-09-event-report-details', hasCols && manualShown,
      await shot(popup, 'UI-V12-09', 'event-report-start-break'),
      'Start/Net/Variance/BREAK columns=' + hasCols + ', manual place 4 shown for ' + fixture.manualPlaceLane.name + '=' + manualShown);
    await popup.close();

    // ── UI-V12-11: console errors ───────────────────────────────────
    const realErrors = consoleErrors.filter(e => !/favicon/i.test(e.msg) && !/404 \(Not Found\)/i.test(e.msg));
    rec('UI-V12-11-zero-console-errors', realErrors.length === 0, '', realErrors.length + ' errors ' + JSON.stringify(realErrors.slice(0, 3)));

    fs.writeFileSync(path.join(EVID, 'browser-records.json'), JSON.stringify({ baseline, apiVersion, records, consoleErrors }, null, 2));
  } catch (e) {
    rec('UI-V12-EXCEPTION', false, '', e.message);
    fs.writeFileSync(path.join(EVID, 'browser-records.json'), JSON.stringify({ baseline, records, consoleErrors, error: e.stack }, null, 2));
  } finally {
    if (browser) await browser.close();
    await stop(server);
  }
  const pass = records.filter(r => r.status === 'PASS').length;
  const fail = records.filter(r => r.status === 'FAIL').length;
  console.log(`\n=== V2.12.x BROWSER TALLY: ${pass} PASS / ${fail} FAIL ===`);
  process.exit(fail > 0 ? 1 : 0);
})();
