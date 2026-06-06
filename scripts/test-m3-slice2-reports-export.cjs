#!/usr/bin/env node
/**
 * WWSC M3 Slice 2 — Reports/export Unit/API proof.
 *
 * Local-only fresh SQLite DB. Seeds completed results for Bryan's requested
 * categories and verifies break counts, total improvements, CSV exports, raw
 * SQLite download validity, and graph source rows from time_history.
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const Database = require('better-sqlite3');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const EVIDENCE_DIR = path.join(PROJECT_ROOT, 'docs', 'evidence', 'm3-slice2');
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

const PORT = 3011;
const BASE = 'http://127.0.0.1:' + PORT;
const TMP = '/tmp/wwsc-m3-slice2-unit';
const DB_PATH = path.join(TMP, 'wwsc.db');
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });

const results = [];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function check(id, ok, note, extra = {}) {
  results.push({ id, status: ok ? 'PASS' : 'FAIL', note, ...extra });
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + id + '  ' + note);
}

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, ['src/server.js'], {
      cwd: PROJECT_ROOT,
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
    try { const r = await fetch(BASE + '/api/version'); if (r.ok) return; } catch (e) {}
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

    return { event, members: { alice, bob, cara }, raceTypes };
  });
  const fixture = tx();
  db.close();
  return fixture;
}

function parseCsv(text) {
  return text.trim().split(/\r?\n/).map(line => line.split(','));
}

(async () => {
  const server = await startServer();
  let fixture;
  try {
    await waitUp();
    fixture = seedFixture();

    const version = await api('/api/version');
    check('S2-UT1-version', version.version === '2.11.0', 'version=' + version.version);

    const coverage = await api('/api/reports/event-coverage');
    const coveredTypes = new Set(coverage.summary.filter(s => s.result_count > 0).map(s => s.race_type));
    const allCovered = fixture.raceTypes.every(rt => coveredTypes.has(rt));
    check('S2-UT2-completed-categories-api', allCovered, 'covered=' + Array.from(coveredTypes).sort().join(','));

    const breaks = await api('/api/reports/break-counts');
    const aliceBreaks = breaks.overall.find(r => r.member_name === 'Slice2 Alice');
    const caraBreaks = breaks.overall.find(r => r.member_name === 'Slice2 Cara');
    check('S2-UT3-break-counts-api', aliceBreaks && aliceBreaks.break_count === 2 && caraBreaks && caraBreaks.break_count === 1 && breaks.by_event.length === 3,
      'overall Alice=2 Cara=1; by_event=' + breaks.by_event.length);

    const improvements = await api('/api/reports/improvements');
    const aliceImp = improvements.overall.find(r => r.member_name === 'Slice2 Alice');
    const caraImp = improvements.overall.find(r => r.member_name === 'Slice2 Cara');
    check('S2-UT4-improvements-api', aliceImp && aliceImp.total_improvement_cs === 150 && caraImp && caraImp.total_improvement_cs === 100 && improvements.by_event.length === 3,
      'Alice=150cs Cara=100cs; by_event=' + improvements.by_event.length);

    const breakCsv = await (await fetch(BASE + '/api/reports/break-counts/csv')).text();
    const impCsv = await (await fetch(BASE + '/api/reports/improvements/csv')).text();
    const covCsv = await (await fetch(BASE + '/api/reports/event-coverage/csv')).text();
    fs.writeFileSync(path.join(EVIDENCE_DIR, 'break-counts.csv'), breakCsv);
    fs.writeFileSync(path.join(EVIDENCE_DIR, 'total-improvements.csv'), impCsv);
    fs.writeFileSync(path.join(EVIDENCE_DIR, 'completed-result-categories.csv'), covCsv);
    check('S2-UT5-csv-exports-parse', parseCsv(breakCsv)[0][0] === 'scope' && /total_improvement_centiseconds/.test(impCsv) && /medley_relay/.test(covCsv),
      'CSV exports parse and include expected headers/categories');

    const history = await api('/api/members/' + fixture.members.alice + '/time-history');
    check('S2-UT6-graph-source-time-history', history.length === 2 && history.every(r => r.member_name === 'Slice2 Alice') && history.some(r => r.previous_best === 25),
      'member graph source rows=' + history.length);

    const dbRes = await fetch(BASE + '/api/export/db');
    const dbBuf = Buffer.from(await dbRes.arrayBuffer());
    const exportedPath = path.join(EVIDENCE_DIR, 'downloaded-sqlite-db.db');
    fs.writeFileSync(exportedPath, dbBuf);
    let validDb = false;
    let memberCount = 0;
    try {
      const exported = new Database(exportedPath, { readonly: true });
      memberCount = exported.prepare('SELECT COUNT(*) AS n FROM member').get().n;
      validDb = exported.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='time_history'").get().name === 'time_history';
      exported.close();
    } catch (e) {
      validDb = false;
    }
    check('S2-UT7-db-export-valid-sqlite', dbRes.ok && dbBuf.length > 4096 && validDb && memberCount === 3,
      'download bytes=' + dbBuf.length + ', memberCount=' + memberCount, { file: 'docs/evidence/m3-slice2/downloaded-sqlite-db.db' });

  } finally {
    await stop(server);
  }

  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'slice2-unit-api-results.json'), JSON.stringify({ fixture, results, tally: { pass, fail } }, null, 2));
  console.log('\n=== M3 SLICE 2 UNIT/API TALLY: ' + pass + ' PASS / ' + fail + ' FAIL ===');
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => {
  console.error('*** FAILED ***', e.stack || e.message);
  process.exit(1);
});
