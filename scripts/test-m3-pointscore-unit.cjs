/**
 * WWSC M3 — Pointscore unit/API tests (no browser).
 *
 * Covers: formula extraction values, point allocation per place, re-finalize
 * idempotency, monthly addition, season addition, member contribution.
 *
 * Spins an isolated server on PORT=3010 with a fresh DB and asserts via API.
 * Output: docs/evidence/m3-user-interaction-v3.0.1/pointscore-unit-results.json
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const EVIDENCE_DIR = path.join(PROJECT_ROOT, 'docs', 'evidence', 'm3-user-interaction-v3.0.1');
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
const PORT = 3010, BASE = 'http://127.0.0.1:' + PORT, DB = '/tmp/wwsc-m3-unit/wwsc.db';
fs.rmSync('/tmp/wwsc-m3-unit', { recursive: true, force: true }); fs.mkdirSync('/tmp/wwsc-m3-unit', { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const results = [];
function check(id, ok, note) { results.push({ id, status: ok ? 'PASS' : 'FAIL', note }); console.log((ok ? 'PASS' : 'FAIL') + ' ' + id + '  ' + note); }

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, ['src/server.js'], { cwd: PROJECT_ROOT, env: { ...process.env, PORT: String(PORT), WWSC_DB_PATH: DB }, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = ''; const onData = (c) => { out += c; if (out.includes(':' + PORT) || out.includes('running')) { clearTimeout(t); resolve(proc); } };
    const t = setTimeout(() => reject(new Error('timeout ' + out)), 15000);
    proc.stdout.on('data', onData); proc.stderr.on('data', () => {});
  });
}
function stop(p) { return new Promise(r => { p.once('exit', r); p.kill('SIGTERM'); setTimeout(() => { try { p.kill('SIGKILL'); } catch (e) {} r(); }, 3000); }); }
async function api(p, opts = {}) {
  const h = { ...(opts.headers || {}) }; if (opts.body && typeof opts.body !== 'string') { opts.body = JSON.stringify(opts.body); h['Content-Type'] = 'application/json'; }
  const res = await fetch(BASE + p, { ...opts, headers: h }); const text = await res.text(); let b; try { b = JSON.parse(text); } catch { b = text; }
  if (!res.ok || (b && b.error)) throw new Error(p + ' -> ' + res.status + ' ' + text); return b;
}
async function waitUp() { for (let i = 0; i < 40; i++) { try { const r = await fetch(BASE + '/api/version'); if (r.ok) return; } catch (e) {} await sleep(200); } throw new Error('no server'); }

// Build + finalize a 25m event on the given date with all present.
async function finalize25m(date) {
  const ev = await api('/api/events', { method: 'POST', body: { date } });
  await api('/api/events/' + ev.id + '/config', { method: 'PUT', body: { standard_event: 'ordinary_swim', special_event: null } });
  const att = await api('/api/events/' + ev.id + '/attendance');
  await api('/api/events/' + ev.id + '/attendance', { method: 'PUT', body: { attendees: att.map(a => ({ member_id: a.member_id, present: 1, special_event_entry: null })) } });
  await api('/api/events/' + ev.id + '/races', { method: 'PUT', body: { race_types: ['25m'] } });
  const races = await api('/api/events/' + ev.id + '/races');
  const r = races.find(x => x.race_type === '25m');
  const prev = await api('/api/races/' + r.id + '/generate-heats');
  await api('/api/races/' + r.id + '/confirm-heats', { method: 'POST', body: { heats: prev.heats } });
  const heats = await api('/api/races/' + r.id + '/heats');
  for (const h of heats) for (let i = 0; i < h.lanes.length; i++) {
    const lane = h.lanes[i]; const startCs = (lane.start_delay || 0) * 100; const pbCs = (lane.handicap_time || 25) * 100;
    await api('/api/heats/' + lane.heat_id + '/lanes/' + lane.id + '/time', { method: 'PUT', body: { finish_time: Math.max(1, startCs + pbCs - 50 + i * 30) } });
  }
  await api('/api/races/' + r.id + '/rank', { method: 'POST', body: {} });
  await api('/api/events/' + ev.id + '/finalize', { method: 'POST', body: {} });
  return ev.id;
}

// Build + finalize a relay/team-only event. Returns the event id plus final
// event pointscore totals so aggregation can be compared exactly.
async function finalizeRelay(date, raceType = '25m_relay') {
  const ev = await api('/api/events', { method: 'POST', body: { date } });
  await api('/api/events/' + ev.id + '/config', { method: 'PUT', body: { standard_event: 'ordinary_swim', special_event: raceType === 'medley_relay' ? 'medley_relay' : null } });
  const att = await api('/api/events/' + ev.id + '/attendance');
  await api('/api/events/' + ev.id + '/attendance', { method: 'PUT', body: { attendees: att.map(a => ({ member_id: a.member_id, present: 1, special_event_entry: null })) } });
  await api('/api/events/' + ev.id + '/races', { method: 'PUT', body: { race_types: [raceType] } });
  const races = await api('/api/events/' + ev.id + '/races');
  const r = races.find(x => x.race_type === raceType);
  const gen = await api('/api/races/' + r.id + '/generate-relay-teams', { method: 'POST', body: { forceReshuffle: true } });
  await api('/api/races/' + r.id + '/save-relay-teams', { method: 'POST', body: { teams: gen.teams } });
  const teams = await api('/api/races/' + r.id + '/relay-teams');
  for (let i = 0; i < teams.length; i++) {
    await api('/api/relay-teams/' + teams[i].id + '/time', { method: 'PUT', body: { total_time: 5000 + i * 1000 } });
  }
  await api('/api/races/' + r.id + '/rank-relay', { method: 'POST', body: {} });
  await api('/api/events/' + ev.id + '/finalize', { method: 'POST', body: {} });
  const pointscore = await api('/api/events/' + ev.id + '/pointscore');
  return { eventId: ev.id, teams: await api('/api/races/' + r.id + '/relay-teams'), pointscore };
}

(async () => {
  const server = await startServer();
  try {
    await waitUp();

    // UT1 — rule config exposes the working-assumption formula
    const rules = await api('/api/pointscore/rules');
    check('UT1-rule-individual', rules.categories.individual.pointsByPlace['1'] === 5 && rules.categories.individual.pointsByPlace['2'] === 4 && rules.categories.individual.pointsByPlace['3'] === 3 && rules.categories.individual.finisherPoints === 2, 'individual 5/4/3/2');
    check('UT1-rule-relay', rules.categories.relay.pointsByPlace['1'] === 5 && rules.categories.relay.pointsByPlace['2'] === 4 && rules.categories.relay.pointsByPlace['3'] === 3 && rules.categories.relay.finisherPoints === 2, 'relay 5/4/3 + entry 2');
    check('UT1-rule-source-labeled', /working assumption/i.test(rules.source) && /simple addition/i.test(rules.aggregation), 'source + aggregation labeled');

    // UT2 — finalize creates point rows; place 1 → 5, place 3 → 3, finisher → 2
    const ev1 = await finalize25m('2026-04-04');
    const ps1 = await api('/api/events/' + ev1 + '/pointscore');
    const hadFive = ps1.rows.some(r => r.points === 5);
    const hadThree = ps1.rows.some(r => r.points === 3);
    const hadTwo = ps1.rows.some(r => r.points === 2);
    const noZero = ps1.rows.every(r => r.points > 0);
    check('UT2-points-allocated', hadFive && hadThree && hadTwo && noZero, 'place 1->5, 3->3, finisher->2, no zero rows; rows=' + ps1.rows.length);

    // UT3 — re-finalize idempotent
    const before = (await api('/api/events/' + ev1 + '/pointscore')).rows.length;
    await api('/api/events/' + ev1 + '/finalize', { method: 'POST', body: {} });
    const after = (await api('/api/events/' + ev1 + '/pointscore')).rows.length;
    check('UT3-idempotent', before === after && before > 0, 'rows before=' + before + ' after=' + after);

    // UT4 — change a time + re-finalize: still no duplicates
    const races = await api('/api/events/' + ev1 + '/races');
    const heats = await api('/api/races/' + races[0].id + '/heats');
    const lane = heats[0].lanes[0];
    await api('/api/heats/' + lane.heat_id + '/lanes/' + lane.id + '/time', { method: 'PUT', body: { finish_time: (lane.start_delay || 0) * 100 + 800 } });
    await api('/api/races/' + races[0].id + '/rank', { method: 'POST', body: {} });
    await api('/api/events/' + ev1 + '/finalize', { method: 'POST', body: {} });
    const afterChange = (await api('/api/events/' + ev1 + '/pointscore')).rows.length;
    check('UT4-no-dup-after-change', afterChange === after, 'rows after change+refinalize=' + afterChange + ' (was ' + after + ')');

    // UT5 — second event same month → monthly addition
    const ev2 = await finalize25m('2026-04-18');
    const month = await api('/api/pointscore/month/2026-04');
    // pick a swimmer present in both events, assert monthly total == sum of the two event totals
    const ev1ps = await api('/api/events/' + ev1 + '/pointscore');
    const ev2ps = await api('/api/events/' + ev2 + '/pointscore');
    const tot1 = Object.fromEntries(ev1ps.totals.map(t => [t.member_id, t.total]));
    const tot2 = Object.fromEntries(ev2ps.totals.map(t => [t.member_id, t.total]));
    let monthlyMatch = month.standings.length > 0;
    for (const s of month.standings) {
      const expected = (tot1[s.member_id] || 0) + (tot2[s.member_id] || 0);
      if (s.total !== expected) { monthlyMatch = false; break; }
    }
    check('UT5-monthly-addition', monthlyMatch && month.events.length === 2, 'monthly total == event1+event2 for all swimmers; events=' + month.events.length);

    // UT6 — season addition (calendar year) equals all events' sum
    const ev3 = await finalize25m('2026-05-02'); // different month, same year
    const season = await api('/api/pointscore/season/2026');
    const ev3ps = await api('/api/events/' + ev3 + '/pointscore');
    const tot3 = Object.fromEntries(ev3ps.totals.map(t => [t.member_id, t.total]));
    let seasonMatch = season.standings.length > 0;
    for (const s of season.standings) {
      const expected = (tot1[s.member_id] || 0) + (tot2[s.member_id] || 0) + (tot3[s.member_id] || 0);
      if (s.total !== expected) { seasonMatch = false; break; }
    }
    check('UT6-season-addition', seasonMatch && season.events.length === 3, 'season total == sum of 3 events; events=' + season.events.length);

    // UT7 — member contribution detail
    const someMember = ev1ps.totals[0].member_id;
    const mc = await api('/api/members/' + someMember + '/pointscore');
    const mcSum = mc.contributions.reduce((s, c) => s + c.points, 0);
    check('UT7-member-contribution', mc.total === mcSum && mc.contributions.length > 0, 'member total == sum of contributions=' + mc.total);

    // UT8 — months list + 404 for unknown member
    const months = await api('/api/pointscore/months');
    check('UT8-months-list', months.includes('2026-04') && months.includes('2026-05'), 'months=' + months.join(','));
    let got404 = false;
    try { await api('/api/members/999999/pointscore'); } catch (e) { got404 = /404/.test(e.message); }
    check('UT8-unknown-member-404', got404, 'unknown member → 404');

    // UT9 — unknown race_type defaults to INDIVIDUAL scoring (5/4/3/2), not relay.
    // Direct engine test on an in-memory DB (no server). Guards the regression
    // Balerion found: branching on raceTypes.includes() routed unknown types to
    // the relay path even though categoryForRaceType() resolves them to individual.
    {
      const Database = require('better-sqlite3');
      const ps = require('../src/pointscore.js');
      const mem = new Database(':memory:');
      mem.exec(`
        CREATE TABLE event_race (id INTEGER PRIMARY KEY, event_id INTEGER, race_type TEXT);
        CREATE TABLE heat (id INTEGER PRIMARY KEY, event_race_id INTEGER, heat_number INTEGER);
        CREATE TABLE heat_lane (id INTEGER PRIMARY KEY, heat_id INTEGER, lane_number INTEGER, member_id INTEGER, finish_time INTEGER, place INTEGER, manual_place INTEGER, is_break INTEGER);
        CREATE TABLE relay_team (id INTEGER PRIMARY KEY, event_race_id INTEGER, place INTEGER, total_time INTEGER);
        CREATE TABLE relay_team_member (id INTEGER PRIMARY KEY, relay_team_id INTEGER, member_id INTEGER);
      `);
      mem.prepare("INSERT INTO event_race (id, event_id, race_type) VALUES (1, 1, 'mystery_stroke')").run();
      mem.prepare('INSERT INTO heat (id, event_race_id, heat_number) VALUES (1, 1, 1)').run();
      mem.prepare('INSERT INTO heat_lane (id, heat_id, lane_number, member_id, finish_time, place, manual_place, is_break) VALUES (1, 1, 1, 7, 1234, 1, NULL, 0)').run();
      const rows = ps.computeEventPointscoreRows(mem, 1);
      const r = rows.find(x => x.member_id === 7);
      mem.close();
      check('UT9-unknown-racetype-individual',
        ps.categoryForRaceType('mystery_stroke') === 'individual' && rows.length === 1 && !!r && r.points === 5 && r.basis === 'individual-place',
        'unknown type → individual place1=5 (rows=' + rows.length + ', basis=' + (r && r.basis) + ')');
    }

    // UT10 — race_type categorization. Relay/team types (incl. brace + pogo) map
    // to the relay category (5/4/3); individual strokes map to individual (5/4/3/2).
    // Proves brace (UIT-M3-029) and pogo (UIT-M3-031) get the correct relay rule
    // at the engine level — the relay rule itself is exercised end-to-end by the
    // medley_relay event (UIT-M3-030 PASS).
    {
      const ps2 = require('../src/pointscore.js');
      const relayTypes = ['25m_relay', 'medley_relay', '25m_brace', '50m_brace', 'pogo'];
      const indivTypes = ['25m', '50m', '75m', 'backstroke', 'breaststroke', 'butterfly'];
      const relayOk = relayTypes.every(t => ps2.categoryForRaceType(t) === 'relay');
      const indivOk = indivTypes.every(t => ps2.categoryForRaceType(t) === 'individual');
      check('UT10-racetype-categorization', relayOk && indivOk,
        'relay incl brace/pogo → relay 5/4/3; strokes → individual 5/4/3/2');
    }

    // UT11 — exact relay/team scoring for places 1, 2 and 3, plus entry
    // points for every other finished team (Bryan 2026-06-11).
    {
      const Database = require('better-sqlite3');
      const ps3 = require('../src/pointscore.js');
      const mem = new Database(':memory:');
      mem.exec(`
        CREATE TABLE event_race (id INTEGER PRIMARY KEY, event_id INTEGER, race_type TEXT);
        CREATE TABLE heat (id INTEGER PRIMARY KEY, event_race_id INTEGER, heat_number INTEGER);
        CREATE TABLE heat_lane (id INTEGER PRIMARY KEY, heat_id INTEGER, member_id INTEGER, finish_time INTEGER, place INTEGER, manual_place INTEGER);
        CREATE TABLE relay_team (id INTEGER PRIMARY KEY, event_race_id INTEGER, place INTEGER, total_time INTEGER);
        CREATE TABLE relay_team_member (id INTEGER PRIMARY KEY, relay_team_id INTEGER, member_id INTEGER);
      `);
      mem.prepare("INSERT INTO event_race (id, event_id, race_type) VALUES (1, 1, '25m_relay')").run();
      mem.prepare('INSERT INTO relay_team (id, event_race_id, place, total_time) VALUES (11, 1, 1, 5000), (12, 1, 2, 6000), (13, 1, 3, 7000), (14, 1, 4, 8000)').run();
      mem.prepare('INSERT INTO relay_team_member (relay_team_id, member_id) VALUES (11, 101), (12, 102), (13, 103), (14, 104)').run();
      const rows = ps3.computeEventPointscoreRows(mem, 1);
      const byMember = Object.fromEntries(rows.map(r => [r.member_id, r.points]));
      mem.close();
      check('UT11-relay-team-543',
        byMember[101] === 5 && byMember[102] === 4 && byMember[103] === 3 && byMember[104] === 2 && rows.every(r => r.basis === 'relay-team-place'),
        'relay/team place 1=5, 2=4, 3=3, finished non-podium=2');
    }

    // UT12 — completed relay event rolls into monthly and season aggregation.
    {
      const relayRun = await finalizeRelay('2027-01-10', '25m_relay');
      const relayEventTotals = Object.fromEntries(relayRun.pointscore.totals.map(t => [t.member_id, t.total]));
      const monthRelay = await api('/api/pointscore/month/2027-01');
      const seasonRelay = await api('/api/pointscore/season/2027');
      const monthOk = monthRelay.events.length === 1 && monthRelay.standings.every(s => s.total === (relayEventTotals[s.member_id] || 0));
      const seasonOk = seasonRelay.events.length === 1 && seasonRelay.standings.every(s => s.total === (relayEventTotals[s.member_id] || 0));
      const hasRelay543 = relayRun.pointscore.rows.some(r => r.race_type === '25m_relay' && r.points === 5) &&
        relayRun.pointscore.rows.some(r => r.race_type === '25m_relay' && r.points === 4) &&
        (relayRun.teams.length < 3 || relayRun.pointscore.rows.some(r => r.race_type === '25m_relay' && r.points === 3));
      check('UT12-relay-aggregation-api', monthOk && seasonOk && hasRelay543,
        'relay event totals feed month+season; teams=' + relayRun.teams.length + ', rows=' + relayRun.pointscore.rows.length);
    }

    // UT13 — breaker scoring shift. If 1st breaks, 1st gets entry 2 points,
    // 2nd receives 1st-place points (5), 3rd receives 2nd-place points (4),
    // 4th receives 3rd-place points (3).
    {
      const ps4 = require('../src/pointscore.js');
      const rows = ps4.scoreIndividualHeat([
        { member_id: 201, finish_time: 1000, place: 1, manual_place: null, is_break: 1 },
        { member_id: 202, finish_time: 1100, place: 2, manual_place: null, is_break: 0 },
        { member_id: 203, finish_time: 1200, place: 3, manual_place: null, is_break: 0 },
        { member_id: 204, finish_time: 1300, place: 4, manual_place: null, is_break: 0 },
        { member_id: 205, finish_time: 1400, place: 5, manual_place: null, is_break: 0 }
      ], '25m', 99);
      const byMember = Object.fromEntries(rows.map(r => [r.member_id, r.points]));
      check('UT13-breaker-shifts-place-points',
        byMember[201] === 2 && byMember[202] === 5 && byMember[203] === 4 && byMember[204] === 3 && byMember[205] === 2,
        JSON.stringify(byMember));
    }

  } finally {
    await stop(server);
  }
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'pointscore-unit-results.json'), JSON.stringify(results, null, 2));
  const pass = results.filter(r => r.status === 'PASS').length, fail = results.filter(r => r.status === 'FAIL').length;
  console.log('\n=== UNIT TALLY: ' + pass + ' PASS / ' + fail + ' FAIL ===');
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('*** FAILED ***', e.stack || e.message); process.exit(1); });
