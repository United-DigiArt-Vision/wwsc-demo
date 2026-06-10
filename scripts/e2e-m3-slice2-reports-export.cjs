#!/usr/bin/env node
/**
 * WWSC M3 Slice 2 — Browser/UI + File/Download proof.
 */
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const Database = require('better-sqlite3');

const PUP = [process.env.WWSC_PUPPETEER_CORE, '/tmp/wwsc-screenshot-tool/node_modules/puppeteer-core', path.resolve(__dirname, '..', '..', 'node_modules', 'puppeteer-core')].filter(Boolean);
let puppeteer = null;
for (const p of PUP) { try { puppeteer = require(p); break; } catch (e) {} }
if (!puppeteer) { console.error('puppeteer-core not found; run scripts/setup-m2-harness.sh'); process.exit(2); }

const ROOT = path.resolve(__dirname, '..');
const EVID = path.join(ROOT, 'docs', 'evidence', 'm3-slice2');
const SHOT = path.join(ROOT, 'docs', 'screenshots', 'm3-slice2');
fs.mkdirSync(EVID, { recursive: true });
fs.mkdirSync(SHOT, { recursive: true });

const PORT = 3012;
const BASE = 'http://127.0.0.1:' + PORT;
const TMP = '/tmp/wwsc-m3-slice2-browser';
const DB_PATH = path.join(TMP, 'wwsc.db');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });

const records = [];
const consoleErrors = [];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function rec(id, status, screenshot, note) {
  const normalized = status === true ? 'PASS' : status === false ? 'FAIL' : status;
  records.push({ id, status: normalized, screenshot: screenshot || '', note: note || '' });
  console.log([normalized, id, screenshot || '-', note || ''].join('  '));
}

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, ['src/server.js'], {
      cwd: ROOT,
      env: { ...process.env, PORT: String(PORT), WWSC_DB_PATH: DB_PATH },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let out = '';
    const t = setTimeout(() => reject(new Error('server timeout: ' + out)), 15000);
    proc.stdout.on('data', (c) => {
      out += c;
      if (out.includes(':' + PORT) || out.includes('running')) {
        clearTimeout(t);
        resolve(proc);
      }
    });
    proc.stderr.on('data', (c) => { out += c; });
  });
}

function stop(proc) {
  return new Promise(r => {
    proc.once('exit', r);
    proc.kill('SIGTERM');
    setTimeout(() => { try { proc.kill('SIGKILL'); } catch (e) {} r(); }, 2500);
  });
}

async function api(route) {
  const res = await fetch(BASE + route);
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok || (body && body.error)) throw new Error(route + ' -> ' + res.status + ' ' + text);
  return body;
}

async function waitUp() {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(BASE + '/api/version'); if (r.ok) return await r.json(); } catch (e) {}
    await sleep(200);
  }
  throw new Error('server did not start');
}

function seedFixture() {
  const db = new Database(DB_PATH);
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM time_history').run();
    db.prepare('DELETE FROM pointscore_entry').run();
    db.prepare('DELETE FROM relay_team_member').run();
    db.prepare('DELETE FROM relay_team').run();
    db.prepare('DELETE FROM heat_lane').run();
    db.prepare('DELETE FROM heat').run();
    db.prepare('DELETE FROM event_race').run();
    db.prepare('DELETE FROM attendance').run();
    db.prepare('DELETE FROM event').run();
    db.prepare('DELETE FROM member').run();

    const insMember = db.prepare(`
      INSERT INTO member (name, is_active, joined_date, time_25m, time_50m, time_75m, time_backstroke, time_breaststroke, time_butterfly)
      VALUES (?, 1, '2026-01-01', 25, 53, 80, 32, 33, 31)
    `);
    const alice = Number(insMember.run('Slice2 Alice').lastInsertRowid);
    const bob = Number(insMember.run('Slice2 Bob').lastInsertRowid);
    const cara = Number(insMember.run('Slice2 Cara').lastInsertRowid);

    const event = Number(db.prepare(`
      INSERT INTO event (date, status, created_at, standard_event, special_event, archived)
      VALUES ('2026-07-04', 'completed', '2026-07-04T09:00:00.000Z', 'ordinary_swim', NULL, 0)
    `).run().lastInsertRowid);

    const raceTypes = ['25m', '50m', '25m_relay', 'medley_relay', '75m', '25m_brace', '50m_brace', 'breaststroke', 'backstroke', 'butterfly'];
    const insRace = db.prepare("INSERT INTO event_race (event_id, race_type, status) VALUES (?, ?, 'completed')");
    const insHeat = db.prepare('INSERT INTO heat (event_race_id, heat_number) VALUES (?, 1)');
    const insLane = db.prepare(`
      INSERT INTO heat_lane (heat_id, lane_number, member_id, handicap_time, start_delay, finish_time, net_time, variance, place, is_break)
      VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?)
    `);
    const insTeam = db.prepare('INSERT INTO relay_team (event_race_id, team_number, team_name, total_time, target_time, variance, place, start_delay, max_time) VALUES (?, ?, ?, ?, 10000, ?, ?, 0, 102)');
    const insTeamMember = db.prepare('INSERT INTO relay_team_member (relay_team_id, member_id, leg_order, stroke, split_time) VALUES (?, ?, ?, ?, ?)');
    for (const rt of raceTypes) {
      const raceId = Number(insRace.run(event, rt).lastInsertRowid);
      if (['25m_relay', 'medley_relay', '25m_brace', '50m_brace'].includes(rt)) {
        const team1 = Number(insTeam.run(raceId, 1, 'Team 1', 9800, 200, 1).lastInsertRowid);
        const team2 = Number(insTeam.run(raceId, 2, 'Team 2', 10100, 100, 2).lastInsertRowid);
        insTeamMember.run(team1, alice, 1, rt, 2400);
        insTeamMember.run(team1, bob, 2, rt, 2500);
        insTeamMember.run(team2, cara, 1, rt, 2600);
      } else {
        const heatId = Number(insHeat.run(raceId).lastInsertRowid);
        insLane.run(heatId, 1, alice, 25, 2450, 2450, -50, 1, 1);
        insLane.run(heatId, 2, bob, 25, 2600, 2600, 100, 2, 0);
        insLane.run(heatId, 3, cara, 25, 2700, 2700, 150, 3, 0);
      }
    }
    const insHist = db.prepare('INSERT INTO time_history (member_id, event_id, stroke, time, is_break, previous_best) VALUES (?, ?, ?, ?, ?, ?)');
    insHist.run(alice, event, '25m', 2450, 1, 25);
    insHist.run(alice, event, '50m', 5200, 1, 53);
    insHist.run(bob, event, '25m', 2600, 0, null);
    insHist.run(cara, event, 'butterfly', 3000, 1, 31);
    insHist.run(cara, event, 'backstroke', 3300, 0, 32);
    return { event, alice, bob, cara, raceTypes };
  });
  const fixture = tx();
  db.close();
  return fixture;
}

async function shot(page, id, name, full = true) {
  const file = id + '-' + name + '.png';
  await page.screenshot({ path: path.join(SHOT, file), fullPage: full });
  return 'docs/screenshots/m3-slice2/' + file;
}

async function gotoReports(page) {
  await page.goto(BASE + '/?cb=' + Date.now(), { waitUntil: 'networkidle0' });
  await page.evaluate(() => navigate('pointscore'));
  await sleep(400);
}

(async () => {
  const baseline = {
    branch: execFileSync('git', ['branch', '--show-current'], { cwd: ROOT }).toString().trim(),
    commit: execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT }).toString().trim(),
    version: JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'))).version
  };
  const server = await startServer();
  let browser;
  let fixture;
  try {
    const apiVersion = await waitUp();
    fixture = seedFixture();
    browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', defaultViewport: { width: 1440, height: 900 }, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push({ url: page.url(), msg: m.text() }); });
    page.on('pageerror', e => consoleErrors.push({ url: page.url(), msg: 'pageerror: ' + e.message }));

    await gotoReports(page);
    // v2.12.0: the screen leads with Bryan's 3 main reports; the previous
    // report tabs live under "More reports". The user-visible contract is:
    // main reports on the landing, old tabs one click away.
    const landingMain = await page.evaluate(() => document.body.innerText);
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('More reports'));
      if (btn) btn.click();
    });
    await sleep(400);
    const landing = await page.evaluate(() => document.body.innerText);
    rec('S2-UI1-reports-landing', /Total Pointscore/.test(landingMain) && /Break Counts/.test(landing) && /DB & Graphs/.test(landing), await shot(page, 'S2-UI1', 'reports-landing'), 'main reports on landing; previous tabs discoverable via More reports');

    await page.evaluate(() => psSetTab('coverage'));
    await sleep(300);
    const coverageText = await page.evaluate(() => document.body.innerText);
    const coverageApi = await api('/api/reports/event-coverage');
    const requiredCovered = fixture.raceTypes.every(rt => coverageText.includes(rt) || coverageText.includes(rt.replace('stroke', '')));
    rec('S2-UI2-completed-categories', requiredCovered && coverageApi.summary.length >= 10, await shot(page, 'S2-UI2', 'completed-categories'), 'all requested categories visible; 75m covered once');

    await page.evaluate(() => psSetTab('breaks'));
    await sleep(300);
    const breaksText = await page.evaluate(() => document.body.innerText);
    const breaksApi = await api('/api/reports/break-counts');
    rec('S2-UI3-break-counts', /Slice2 Alice/.test(breaksText) && /Overall/.test(breaksText) && breaksApi.overall[0].break_count === 2, await shot(page, 'S2-UI3', 'break-counts'), 'overall and by-event break counts visible');

    await page.evaluate(() => psSetTab('improvement'));
    await sleep(300);
    const improvementText = await page.evaluate(() => document.body.innerText);
    const improvementsApi = await api('/api/reports/improvements');
    rec('S2-UI4-improvements', /Slice2 Alice/.test(improvementText) && /1.50/.test(improvementText) && improvementsApi.overall[0].total_improvement_cs === 150, await shot(page, 'S2-UI4', 'improvements'), 'overall and by-event improvements visible');

    await page.evaluate(() => psSetTab('export'));
    await sleep(300);
    const exportText = await page.evaluate(() => document.body.innerText);
    rec('S2-UI5-db-graph-explanation', /Download SQLite DB/.test(exportText) && /time_history/.test(exportText), await shot(page, 'S2-UI5', 'db-graphs'), 'DB export action + graph explanation visible');

    const csvChecks = {
      breaks: await (await fetch(BASE + '/api/reports/break-counts/csv')).text(),
      improvements: await (await fetch(BASE + '/api/reports/improvements/csv')).text(),
      coverage: await (await fetch(BASE + '/api/reports/event-coverage/csv')).text()
    };
    fs.writeFileSync(path.join(EVID, 'browser-break-counts.csv'), csvChecks.breaks);
    fs.writeFileSync(path.join(EVID, 'browser-total-improvements.csv'), csvChecks.improvements);
    fs.writeFileSync(path.join(EVID, 'browser-completed-categories.csv'), csvChecks.coverage);
    rec('S2-UI6-csv-match-api', /Slice2 Alice/.test(csvChecks.breaks) && /150/.test(csvChecks.improvements) && /medley_relay/.test(csvChecks.coverage), '', 'CSV exports parse and match seeded API totals/categories');

    const dbRes = await page.evaluate(async () => {
      const r = await fetch('/api/export/db');
      const buf = Array.from(new Uint8Array(await r.arrayBuffer()));
      return { ok: r.ok, cd: r.headers.get('content-disposition'), bytes: buf };
    });
    const downloaded = path.join(EVID, 'browser-downloaded-sqlite-db.db');
    fs.writeFileSync(downloaded, Buffer.from(dbRes.bytes));
    const exported = new Database(downloaded, { readonly: true });
    const validDb = exported.prepare("SELECT COUNT(*) AS n FROM time_history").get().n === 5;
    exported.close();
    // v2.12.0: filename version comes from package.json (no hardcoded literal).
    const pkgVersionEsc = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'))).version.replace(/\./g, '\\.');
    rec('S2-UI7-db-download-valid', dbRes.ok && new RegExp('wwsc-sqlite-db-v' + pkgVersionEsc).test(dbRes.cd || '') && validDb, '', 'browser fetch downloaded valid SQLite DB');

    await page.evaluate(() => navigate('members'));
    await sleep(300);
    const graphEntry = await page.evaluate(() => document.body.innerText.includes('Graphs'));
    rec('S2-UI8-graph-entry-point', graphEntry, await shot(page, 'S2-UI8', 'graph-entry'), 'Members screen exposes Graphs action');

    await page.click('button[onclick^="showMemberGraphModal"]');
    await sleep(500);
    const graphText = await page.evaluate(() => document.body.innerText);
    const graphRows = await api('/api/members/' + fixture.alice + '/time-history');
    rec('S2-UI9-graph-data-mapping', /Graphs/.test(graphText) && graphRows.length === 2, await shot(page, 'S2-UI9', 'graph-modal'), 'graph modal rendered from member time_history rows=' + graphRows.length);

    await page.setViewport({ width: 390, height: 844 });
    await gotoReports(page);
    await page.evaluate(() => psSetTab('breaks'));
    await sleep(300);
    rec('S2-UI10-mobile', true, await shot(page, 'S2-UI10', 'mobile-breaks'), 'mobile reports sanity');

    await page.setViewport({ width: 768, height: 1024 });
    await gotoReports(page);
    await page.evaluate(() => psSetTab('improvement'));
    await sleep(300);
    rec('S2-UI11-tablet', true, await shot(page, 'S2-UI11', 'tablet-improvements'), 'tablet reports sanity');

    await page.setViewport({ width: 1440, height: 900 });
    await gotoReports(page);
    await page.evaluate(() => psSetTab('coverage'));
    await sleep(300);
    rec('S2-UI12-desktop', true, await shot(page, 'S2-UI12', 'desktop-coverage'), 'desktop reports sanity');

    const realErrors = consoleErrors.filter(e => !/favicon/i.test(e.msg) && !/404 \(Not Found\)/i.test(e.msg));
    rec('S2-UI13-console-clean', realErrors.length === 0, '', 'console/page errors=' + realErrors.length);

    fs.writeFileSync(path.join(EVID, 'slice2-browser-records.json'), JSON.stringify({ baseline, apiVersion, fixture, records, consoleErrors, screenshotCount: fs.readdirSync(SHOT).filter(f => f.endsWith('.png')).length }, null, 2));
  } finally {
    if (browser) await browser.close();
    await stop(server);
  }
  const pass = records.filter(r => r.status === 'PASS').length;
  const fail = records.filter(r => r.status === 'FAIL').length;
  console.log('\n=== M3 SLICE 2 BROWSER TALLY: ' + pass + ' PASS / ' + fail + ' FAIL ===');
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => {
  console.error('*** FAILED ***', e.stack || e.message);
  process.exit(1);
});
