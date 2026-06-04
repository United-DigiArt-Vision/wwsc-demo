/**
 * WWSC M3 — Pointscore Isolation Proof (R5 / UIT-M3-045..049).
 *
 * Finalizes the SAME fixture event twice against two fresh DBs:
 *   run A: WWSC_POINTSCORE_DISABLED=1  (pointscore write OFF)
 *   run B: WWSC_POINTSCORE_DISABLED=0  (pointscore write ON)
 *
 * Asserts that every accepted-flow output is byte-identical between A and B:
 *   - time_history rows (member/stroke/time/is_break/previous_best)
 *   - heat_lane variance / is_break / net_time / place
 *   - breaker report
 *   - ranking/place
 * and that pointscore_entry rows exist ONLY in run B.
 *
 * This mechanically proves the pointscore layer is additive and isolated.
 *
 * Run: node scripts/e2e-m3-pointscore-isolation.cjs
 * Output: docs/evidence/m3-user-interaction-v3.0.1/pointscore-isolation-proof.json
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const EVIDENCE_DIR = path.join(PROJECT_ROOT, 'docs', 'evidence', 'm3-user-interaction-v3.0.1');
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function startServer(port, dbPath, pointscoreDisabled) {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, ['src/server.js'], {
      cwd: PROJECT_ROOT,
      env: { ...process.env, PORT: String(port), WWSC_DB_PATH: dbPath, WWSC_POINTSCORE_DISABLED: pointscoreDisabled ? '1' : '0' },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let out = '';
    const onData = (c) => { out += c.toString(); if (out.includes(':' + port) || out.includes('WWSC Swimming App running')) { cleanup(); resolve(proc); } };
    const t = setTimeout(() => { cleanup(); reject(new Error('start timeout: ' + out)); }, 15000);
    function cleanup() { clearTimeout(t); proc.stdout.off('data', onData); }
    proc.stdout.on('data', onData);
    proc.stderr.on('data', (c) => { out += c.toString(); });
    proc.on('exit', (code) => { if (code !== 0 && code !== null) reject(new Error('exit ' + code + ': ' + out)); });
  });
}
function stopServer(proc) {
  return new Promise((resolve) => { proc.once('exit', resolve); proc.kill('SIGTERM'); setTimeout(() => { try { proc.kill('SIGKILL'); } catch (e) {} resolve(); }, 3000); });
}

async function api(base, p, opts = {}) {
  const h = { ...(opts.headers || {}) };
  if (opts.body && typeof opts.body !== 'string') { opts.body = JSON.stringify(opts.body); h['Content-Type'] = 'application/json'; }
  const res = await fetch(base + p, { ...opts, headers: h });
  const text = await res.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok || (body && body.error)) throw new Error('API ' + p + ' -> ' + res.status + ' ' + text);
  return body;
}
async function waitForServer(base) {
  for (let i = 0; i < 40; i++) { try { const r = await fetch(base + '/api/version'); if (r.ok) return await r.json(); } catch (e) {} await sleep(200); }
  throw new Error('server never answered');
}

// Build the fixture up to (but not including) finalize. Heats + times are
// written and ranked. Returns the event id. Used once on a base DB which is
// then COPIED so both isolation runs finalize byte-identical heats/times —
// removing the heat-generation randomness that would otherwise diverge.
async function buildFixtureNoFinalize(base) {
  const ev = await api(base, '/api/events', { method: 'POST', body: { date: '2026-04-04' } });
  await api(base, '/api/events/' + ev.id + '/config', { method: 'PUT', body: { standard_event: 'ordinary_swim', special_event: null } });
  const att = await api(base, '/api/events/' + ev.id + '/attendance');
  await api(base, '/api/events/' + ev.id + '/attendance', { method: 'PUT', body: { attendees: att.map(a => ({ member_id: a.member_id, present: 1, special_event_entry: null })) } });
  await api(base, '/api/events/' + ev.id + '/races', { method: 'PUT', body: { race_types: ['25m', '50m'] } });
  const races = await api(base, '/api/events/' + ev.id + '/races');
  for (const rt of ['25m', '50m']) {
    const r = races.find(x => x.race_type === rt);
    const prev = await api(base, '/api/races/' + r.id + '/generate-heats');
    if (!prev.heats || !prev.heats.length) continue;
    await api(base, '/api/races/' + r.id + '/confirm-heats', { method: 'POST', body: { heats: prev.heats } });
    const heats = await api(base, '/api/races/' + r.id + '/heats');
    for (const h of heats) for (let i = 0; i < h.lanes.length; i++) {
      const lane = h.lanes[i];
      const startCs = (lane.start_delay || 0) * 100; const pbCs = (lane.handicap_time || 25) * 100;
      const adj = -50 + i * 30;
      await api(base, '/api/heats/' + lane.heat_id + '/lanes/' + lane.id + '/time', { method: 'PUT', body: { finish_time: Math.max(1, startCs + pbCs + adj) } });
    }
    await api(base, '/api/races/' + r.id + '/rank', { method: 'POST', body: {} });
  }
  return ev.id;
}

// Finalize an already-built event and snapshot the accepted flow.
async function finalizeAndSnapshot(base, eventId) {
  await api(base, '/api/events/' + eventId + '/finalize', { method: 'POST', body: {} });
  const ev = { id: eventId };
  const timeHistory = await api(base, '/api/events/' + ev.id + '/time-history');
  const breakers = await api(base, '/api/events/' + ev.id + '/breakers');
  const racesAfter = await api(base, '/api/events/' + ev.id + '/races');
  const heatSnapshots = {};
  for (const r of racesAfter) {
    try {
      const heats = await api(base, '/api/races/' + r.id + '/heats');
      heatSnapshots[r.race_type] = heats.map(h => h.lanes.map(l => ({
        member_id: l.member_id, finish_time: l.finish_time, net_time: l.net_time,
        variance: l.variance, place: l.place, manual_place: l.manual_place, is_break: l.is_break
      })));
    } catch (e) {}
  }
  // Pointscore presence (should be empty in disabled run, present in enabled run).
  let pointscore = { totals: [], rows: [] };
  try { pointscore = await api(base, '/api/events/' + ev.id + '/pointscore'); } catch (e) {}
  return { eventId: ev.id, timeHistory, breakers, heatSnapshots, pointscoreRowCount: (pointscore.rows || []).length };
}

// Canonicalize for comparison: drop volatile keys, sort deterministically.
function canon(snap) {
  return JSON.stringify({
    timeHistory: snap.timeHistory.map(r => ({ m: r.member_id, s: r.stroke, t: r.time, b: r.is_break, p: r.previous_best }))
      .sort((a, b) => a.m - b.m || String(a.s).localeCompare(b.s)),
    breakers: snap.breakers.map(b => ({ m: b.member_name, s: b.stroke, nt: b.new_time, op: b.old_pb }))
      .sort((a, b) => String(a.m).localeCompare(b.m) || String(a.s).localeCompare(b.s)),
    heats: Object.fromEntries(Object.entries(snap.heatSnapshots).map(([rt, heats]) => [rt,
      heats.flat().map(l => ({ m: l.member_id, v: l.variance, pl: l.place, mp: l.manual_place, b: l.is_break, nt: l.net_time }))
        .sort((a, b) => a.m - b.m)]))
  });
}

// Copy a SQLite DB + WAL/SHM sidecars so the destination is a faithful clone.
function copyDb(srcDir, dstDir) {
  fs.rmSync(dstDir, { recursive: true, force: true });
  fs.mkdirSync(dstDir, { recursive: true });
  for (const f of fs.readdirSync(srcDir)) {
    const src = path.join(srcDir, f);
    // Only copy the SQLite files (wwsc.db + -wal/-shm), skip the backups dir.
    if (fs.statSync(src).isFile() && /wwsc\.db/.test(f)) {
      fs.copyFileSync(src, path.join(dstDir, f));
    }
  }
}

(async () => {
  const results = { runA_disabled: null, runB_enabled: null, identical: null, pointscoreOnlyInB: null };

  // 1) Build the fixture ONCE (heats + times) on a base DB, then stop the
  //    server so WAL is checkpointed into the main DB file.
  fs.rmSync('/tmp/wwsc-iso-base', { recursive: true, force: true }); fs.mkdirSync('/tmp/wwsc-iso-base', { recursive: true });
  let sBase = await startServer(3008, '/tmp/wwsc-iso-base/wwsc.db', false);
  let eventId;
  try { await waitForServer('http://127.0.0.1:3008'); eventId = await buildFixtureNoFinalize('http://127.0.0.1:3008'); } finally { await stopServer(sBase); }

  // 2) Clone the base DB into two identical copies.
  copyDb('/tmp/wwsc-iso-base', '/tmp/wwsc-iso-a');
  copyDb('/tmp/wwsc-iso-base', '/tmp/wwsc-iso-b');

  // RUN A: pointscore DISABLED — finalize the cloned event.
  let sA = await startServer(3008, '/tmp/wwsc-iso-a/wwsc.db', true);
  let snapA;
  try { await waitForServer('http://127.0.0.1:3008'); snapA = await finalizeAndSnapshot('http://127.0.0.1:3008', eventId); } finally { await stopServer(sA); }
  results.runA_disabled = { pointscoreRowCount: snapA.pointscoreRowCount, timeHistoryRows: snapA.timeHistory.length, breakers: snapA.breakers.length };

  // RUN B: pointscore ENABLED — finalize the identical cloned event.
  let sB = await startServer(3009, '/tmp/wwsc-iso-b/wwsc.db', false);
  let snapB;
  try { await waitForServer('http://127.0.0.1:3009'); snapB = await finalizeAndSnapshot('http://127.0.0.1:3009', eventId); } finally { await stopServer(sB); }
  results.runB_enabled = { pointscoreRowCount: snapB.pointscoreRowCount, timeHistoryRows: snapB.timeHistory.length, breakers: snapB.breakers.length };

  const canonA = canon(snapA), canonB = canon(snapB);
  results.identical = canonA === canonB;
  results.pointscoreOnlyInB = snapA.pointscoreRowCount === 0 && snapB.pointscoreRowCount > 0;
  results.verdict = (results.identical && results.pointscoreOnlyInB) ? 'PASS' : 'FAIL';

  fs.writeFileSync(path.join(EVIDENCE_DIR, 'pointscore-isolation-proof.json'), JSON.stringify({ results, canonADigestLen: canonA.length, canonBDigestLen: canonB.length }, null, 2));

  console.log('=== POINTSCORE ISOLATION PROOF ===');
  console.log('Run A (disabled): pointscore rows =', snapA.pointscoreRowCount, ', time_history =', snapA.timeHistory.length, ', breakers =', snapA.breakers.length);
  console.log('Run B (enabled):  pointscore rows =', snapB.pointscoreRowCount, ', time_history =', snapB.timeHistory.length, ', breakers =', snapB.breakers.length);
  console.log('Accepted-flow outputs identical (time_history/variance/place/is_break/breakers):', results.identical);
  console.log('Pointscore rows only in enabled run:', results.pointscoreOnlyInB);
  console.log('VERDICT:', results.verdict);
  process.exit(results.verdict === 'PASS' ? 0 : 1);
})().catch(err => { console.error('*** FAILED ***', err.stack || err.message); process.exit(1); });
