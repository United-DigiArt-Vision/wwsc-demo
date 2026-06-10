#!/usr/bin/env node
/**
 * WWSC v2.12.0 — Bryan 2026-06-10 feedback Unit/API proof (no browser).
 *
 * Covers:
 *  - Report 1 /api/pointscore/by-race-type/:rt — all members, weekly points,
 *    totals, CSV.
 *  - Report 2 /api/pointscore/total — members × race types, grand totals
 *    consistent with season standings, CSV.
 *  - Report 3 /api/reports/breakers-summary — pb_change_log counting
 *    (reductions only), season-start vs current amounts, CSV.
 *  - pb_change_log writing in PUT /api/members/:id (lower / raise / no-op).
 *  - Swimmer card lists 0-point participations (25m brace fix).
 *  - Member delete with pointscore rows no longer FK-crashes.
 *
 * Isolated server on PORT=3013 with a fresh DB. Output evidence:
 * docs/evidence/v2120-bryan-feedback/unit-results.json
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const EVIDENCE_DIR = path.join(PROJECT_ROOT, 'docs', 'evidence', 'v2120-bryan-feedback');
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
const PORT = 3013, BASE = 'http://127.0.0.1:' + PORT, TMP = '/tmp/wwsc-v2120-unit';
fs.rmSync(TMP, { recursive: true, force: true }); fs.mkdirSync(TMP, { recursive: true });
const DB = path.join(TMP, 'wwsc.db');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const results = [];
function check(id, ok, note) { results.push({ id, status: ok ? 'PASS' : 'FAIL', note }); console.log((ok ? 'PASS' : 'FAIL') + ' ' + id + '  ' + (note || '')); }

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, ['src/server.js'], { cwd: PROJECT_ROOT, env: { ...process.env, PORT: String(PORT), WWSC_DB_PATH: DB }, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = ''; const onData = (c) => { out += c; if (out.includes(':' + PORT) || out.includes('running')) { clearTimeout(t); resolve(proc); } };
    const t = setTimeout(() => reject(new Error('timeout ' + out)), 15000);
    proc.stdout.on('data', onData); proc.stderr.on('data', (c) => { out += c; });
  });
}
function stop(p) { return new Promise(r => { p.once('exit', r); p.kill('SIGTERM'); setTimeout(() => { try { p.kill('SIGKILL'); } catch (e) {} r(); }, 3000); }); }
async function api(p, opts = {}) {
  const h = { ...(opts.headers || {}) }; if (opts.body && typeof opts.body !== 'string') { opts.body = JSON.stringify(opts.body); h['Content-Type'] = 'application/json'; }
  const res = await fetch(BASE + p, { ...opts, headers: h }); const text = await res.text(); let b; try { b = JSON.parse(text); } catch { b = text; }
  if (!res.ok || (b && b.error)) throw new Error(p + ' -> ' + res.status + ' ' + text); return b;
}
async function rawGet(p) { const res = await fetch(BASE + p); return { status: res.status, text: await res.text(), headers: res.headers }; }

const RELAYS = ['25m_relay', 'medley_relay', '25m_brace', '50m_brace', 'pogo'];

async function buildCompletedEvent(date, raceTypes, opts = {}) {
  const ev = await api('/api/events', { method: 'POST', body: { date } });
  await api('/api/events/' + ev.id + '/config', { method: 'PUT', body: { standard_event: opts.standard || 'ordinary_swim', special_event: opts.special || null } });
  const att = await api('/api/events/' + ev.id + '/attendance');
  await api('/api/events/' + ev.id + '/attendance', {
    method: 'PUT',
    body: { attendees: att.map(a => ({ member_id: a.member_id, present: 1, special_event_entry: opts.special ? 'Y' : null })) }
  });
  await api('/api/events/' + ev.id + '/races', { method: 'PUT', body: { race_types: raceTypes } });
  const races = await api('/api/events/' + ev.id + '/races');
  for (const race of races) {
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
        await api('/api/heats/' + lane.heat_id + '/lanes/' + lane.id + '/time', {
          method: 'PUT', body: { finish_time: Math.max(100, (lane.start_delay + lane.handicap_time) * 100 + deltas[li % deltas.length]) }
        });
        li++;
      }
      await api('/api/races/' + race.id + '/rank', { method: 'POST', body: {} });
    }
  }
  await api('/api/events/' + ev.id + '/finalize', { method: 'POST', body: {} });
  await api('/api/events/' + ev.id + '/complete', { method: 'POST', body: {} });
  return ev.id;
}

(async () => {
  const server = await startServer();
  try {
    for (let i = 0; i < 40; i++) { try { const r = await fetch(BASE + '/api/version'); if (r.ok) break; } catch (e) {} await sleep(200); }

    const version = await api('/api/version');
    check('UT-V12-00-version', version.version === '2.12.0', 'live version ' + version.version);

    // ── Two completed weekly events (same year) ─────────────────────
    const evA = await buildCompletedEvent('2026-03-07', ['25m', '25m_relay']);
    const evB = await buildCompletedEvent('2026-03-14', ['25m', '25m_brace']);

    const members = await api('/api/members');
    const active = members.filter(m => m.is_active);

    // ── Report 1: by-race-type weekly matrix ────────────────────────
    const r1 = await api('/api/pointscore/by-race-type/25m?year=2026');
    check('UT-V12-01-r1-weeks', r1.weeks.length === 2 && r1.weeks[0].event_id === evA && r1.weeks[1].event_id === evB,
      'weeks=' + JSON.stringify(r1.weeks.map(w => w.date)));
    check('UT-V12-02-r1-all-members-listed', r1.members.length >= active.length,
      r1.members.length + ' rows vs ' + active.length + ' active members');

    const psA = await api('/api/events/' + evA + '/pointscore');
    const psB = await api('/api/events/' + evB + '/pointscore');
    const expect25m = new Map();
    for (const row of psA.rows.filter(r => r.race_type === '25m')) expect25m.set(row.member_id + ':' + evA, row.points);
    for (const row of psB.rows.filter(r => r.race_type === '25m')) expect25m.set(row.member_id + ':' + evB, row.points);
    let cellsOk = true; let checked = 0;
    for (const m of r1.members) {
      for (const w of r1.weeks) {
        const expected = expect25m.get(m.member_id + ':' + w.event_id) ?? 0;
        const got = m.points[w.event_id] ?? 0;
        if (expected !== got) { cellsOk = false; console.log('  cell mismatch', m.member_name, w.date, 'expected', expected, 'got', got); }
        checked++;
      }
      if (m.total !== r1.weeks.reduce((s, w) => s + (m.points[w.event_id] ?? 0), 0)) cellsOk = false;
    }
    check('UT-V12-03-r1-cells-match-event-pointscore', cellsOk, checked + ' cells compared, totals = row sums');

    const r1csv = await rawGet('/api/pointscore/by-race-type/25m/csv?year=2026');
    const r1lines = r1csv.text.trim().split('\n');
    check('UT-V12-04-r1-csv', r1csv.status === 200 && r1lines[0] === 'swimmer,2026-03-07,2026-03-14,total' && r1lines.length === r1.members.length + 1,
      'header=' + r1lines[0] + ' rows=' + (r1lines.length - 1));

    // Race type with no completed races → empty weeks, members still listed.
    const r1none = await api('/api/pointscore/by-race-type/butterfly?year=2026');
    check('UT-V12-05-r1-empty-racetype', r1none.weeks.length === 0 && r1none.members.every(m => m.total === 0),
      'butterfly weeks=' + r1none.weeks.length);

    // ── Report 2: total pointscore matrix ───────────────────────────
    const r2 = await api('/api/pointscore/total?year=2026');
    check('UT-V12-06-r2-race-types', JSON.stringify(r2.raceTypes) === JSON.stringify(['25m', '25m_relay', '25m_brace']),
      'raceTypes=' + r2.raceTypes.join(','));
    const season = await api('/api/pointscore/season/2026');
    let totalsOk = true;
    for (const s of season.standings) {
      const row = r2.members.find(m => m.member_id === s.member_id);
      const rowTotal = row ? row.total : 0;
      const rowSum = row ? r2.raceTypes.reduce((acc, rt) => acc + (row.byType[rt] ?? 0), 0) : 0;
      if (!row || rowTotal !== s.total || rowSum !== s.total) { totalsOk = false; console.log('  total mismatch', s.member_name, s.total, rowTotal, rowSum); }
    }
    check('UT-V12-07-r2-totals-match-season-standings', totalsOk, season.standings.length + ' scoring members cross-checked');
    check('UT-V12-08-r2-all-members', r2.members.length >= active.length, r2.members.length + ' rows');
    const r2csv = await rawGet('/api/pointscore/total/csv?year=2026');
    check('UT-V12-09-r2-csv', r2csv.status === 200 && r2csv.text.startsWith('swimmer,25m,relay,25m brace,total'),
      'header=' + r2csv.text.split('\n')[0]);

    // ── Swimmer card: 0-point participations (25m brace fix) ────────
    const braceRace = (await api('/api/events/' + evB + '/races')).find(r => r.race_type === '25m_brace');
    const braceTeams = await api('/api/races/' + braceRace.id + '/relay-teams');
    const podiumTeam = braceTeams.find(t => t.place === 1);
    const nonPodiumTeam = braceTeams.find(t => t.place != null && t.place > 3);
    check('UT-V12-10-brace-has-non-podium-team', !!podiumTeam && !!nonPodiumTeam,
      braceTeams.length + ' teams, places ' + braceTeams.map(t => t.place).join(','));
    const zeroMember = nonPodiumTeam.members[0];
    const cardZero = await api('/api/members/' + zeroMember.member_id + '/pointscore');
    const zeroRow = cardZero.contributions.find(c => c.race_type === '25m_brace' && c.event_id === evB);
    check('UT-V12-11-swimmer-card-lists-0-point-brace', !!zeroRow && zeroRow.points === 0,
      zeroMember.name + ' brace row: ' + JSON.stringify(zeroRow));
    const podiumMember = podiumTeam.members[0];
    const cardPodium = await api('/api/members/' + podiumMember.member_id + '/pointscore');
    const podiumRow = cardPodium.contributions.find(c => c.race_type === '25m_brace' && c.event_id === evB);
    check('UT-V12-12-swimmer-card-podium-brace-points', !!podiumRow && podiumRow.points === 5,
      podiumMember.name + ' brace row: ' + JSON.stringify(podiumRow));
    const cardSum = cardZero.contributions.reduce((s, c) => s + c.points, 0);
    check('UT-V12-13-swimmer-card-total-consistent', cardZero.total === cardSum, 'total=' + cardZero.total + ' sum=' + cardSum);

    // ── Report 3: pb_change_log counting + amounts ──────────────────
    const subject = active.find(m => m.time_25m != null && m.time_50m != null);
    const startPb25 = subject.time_25m;
    // Two manual reductions (Bryan's workflow after breaks):
    await api('/api/members/' + subject.id, { method: 'PUT', body: { ...subject, time_25m: startPb25 - 1 } });
    await api('/api/members/' + subject.id, { method: 'PUT', body: { ...subject, time_25m: startPb25 - 2 } });
    // One raise on 50m (exceeding adjustment — must NOT count):
    const startPb50 = subject.time_50m;
    await api('/api/members/' + subject.id, { method: 'PUT', body: { ...subject, time_25m: startPb25 - 2, time_50m: startPb50 + 1 } });
    // No-op update — must not add log rows:
    await api('/api/members/' + subject.id, { method: 'PUT', body: { ...subject, time_25m: startPb25 - 2, time_50m: startPb50 + 1 } });

    const r3 = await api('/api/reports/breakers-summary?year=' + new Date().toISOString().slice(0, 4));
    const row25 = r3.rows.find(r => r.member_id === subject.id && r.stroke === '25m');
    const row50 = r3.rows.find(r => r.member_id === subject.id && r.stroke === '50m');
    check('UT-V12-14-r3-count-two-reductions', row25 && row25.times_lowered === 2, JSON.stringify(row25));
    // subject swam event A+B → season_start_25m = PB before first finalize = startPb25
    check('UT-V12-15-r3-amount-season-start-minus-current', row25 && row25.season_start === startPb25 && row25.current_pb === startPb25 - 2 && row25.amount_lowered === 2,
      JSON.stringify(row25));
    check('UT-V12-16-r3-raise-not-counted', row50 && row50.times_lowered === 0 && row50.amount_lowered === -1,
      JSON.stringify(row50));
    const totalRow = r3.totals.find(t => t.member_id === subject.id);
    check('UT-V12-17-r3-member-totals', totalRow && totalRow.times_lowered === 2 && totalRow.amount_lowered === 1,
      JSON.stringify(totalRow));
    const r3csv = await rawGet('/api/reports/breakers-summary/csv');
    check('UT-V12-18-r3-csv', r3csv.status === 200 && r3csv.text.startsWith('swimmer,stroke,season_start_s,current_pb_s,times_lowered,amount_lowered_s'),
      'header=' + r3csv.text.split('\n')[0]);

    // ── Event report API: start/net/variance/break per lane ─────────
    const report = await api('/api/events/' + evA + '/report');
    const lane = report.races.find(r => r.heats)?.heats[0]?.lanes[0];
    check('UT-V12-19-report-lane-fields', lane && lane.start_delay != null && lane.net_time != null && lane.variance != null && lane.is_break != null,
      'lane fields: ' + JSON.stringify(Object.keys(lane || {})));
    check('UT-V12-20-report-team-start-delay', report.races.find(r => r.teams)?.teams.every(t => t.start_delay != null) === true, 'relay teams expose start_delay');

    // ── Member delete with pointscore rows (FK fix) ─────────────────
    const newM = await api('/api/members', { method: 'POST', body: { name: 'ZZ Delete Test', time_25m: 20 } });
    const evC = await buildCompletedEvent('2026-03-21', ['25m']);
    const del = await api('/api/members/' + newM.id, { method: 'DELETE' });
    check('UT-V12-21-member-delete-with-points', del.ok === true, 'deleted member who scored in event ' + evC);

    // ── Existing surfaces still alive (regression smoke) ────────────
    const ps = await api('/api/events/' + evA + '/pointscore');
    check('UT-V12-22-per-event-pointscore-shape', Array.isArray(ps.rows) && Array.isArray(ps.totals), 'rows=' + ps.rows.length);
    const months = await api('/api/pointscore/months');
    check('UT-V12-23-months-listed', months.includes('2026-03'), months.join(','));
  } catch (e) {
    check('UT-V12-EXCEPTION', false, e.message);
  } finally {
    await stop(server);
  }
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'unit-results.json'), JSON.stringify({ when: new Date().toISOString(), pass, fail, results }, null, 2));
  console.log(`\n${pass} PASS / ${fail} FAIL → docs/evidence/v2120-bryan-feedback/unit-results.json`);
  process.exit(fail > 0 ? 1 : 0);
})();
