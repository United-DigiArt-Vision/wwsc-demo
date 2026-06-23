/**
 * WWSC v2.12.6 — new members with no time for an event (Bryan pt.3).
 *
 * Verifies the full chain for swimmers who have no PB for the event being swum:
 *  - generate-heats puts PB swimmers in handicap heats and no-PB swimmers in a
 *    separate no-handicap heat (no_pb=true, handicap_time 0, start_delay 0);
 *  - entering a time for a no-PB lane records no variance / no break;
 *  - finalize auto-establishes their PB from the time swum (+ pb_change_log);
 *  - the pointscore excludes no-PB swimmers (no points), PB swimmers score.
 *
 * Spins an isolated server on PORT=3011 with a fresh DB.
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PORT = 3011, BASE = 'http://127.0.0.1:' + PORT, DB = '/tmp/wwsc-v2126/wwsc.db';
fs.rmSync('/tmp/wwsc-v2126', { recursive: true, force: true }); fs.mkdirSync('/tmp/wwsc-v2126', { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const results = [];
function check(id, ok, note) { results.push({ id, ok }); console.log((ok ? 'PASS' : 'FAIL') + ' ' + id + '  ' + (note || '')); }

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

(async () => {
  const proc = await startServer();
  try {
    await waitUp();

    // 23 members auto-seed with all PB times. Pick 3 with a 25m PB to be the
    // handicap swimmers, then add 2 brand-new members with NO times at all.
    const members = await api('/api/members');
    const withPb = members.filter(m => m.time_25m != null).slice(0, 3);
    const newA = await api('/api/members', { method: 'POST', body: { name: 'Newbie NoTime A' } });
    const newB = await api('/api/members', { method: 'POST', body: { name: 'Newbie NoTime B' } });
    check('setup-new-members-have-no-25m', newA.time_25m == null && newB.time_25m == null, `A.t25=${newA.time_25m} B.t25=${newB.time_25m}`);

    // Build a 25m (standard) event with exactly these 5 present.
    const ev = await api('/api/events', { method: 'POST', body: { date: '2026-07-03' } });
    await api(`/api/events/${ev.id}/config`, { method: 'PUT', body: { standard_event: 'ordinary_swim', special_event: null } });
    const present = new Set([...withPb.map(m => m.id), newA.id, newB.id]);
    const att = await api(`/api/events/${ev.id}/attendance`);
    await api(`/api/events/${ev.id}/attendance`, { method: 'PUT', body: { attendees: att.map(a => ({ member_id: a.member_id, present: present.has(a.member_id) ? 1 : 0, special_event_entry: null })) } });
    await api(`/api/events/${ev.id}/races`, { method: 'PUT', body: { race_types: ['25m'] } });
    const race = (await api(`/api/events/${ev.id}/races`)).find(r => r.race_type === '25m');

    // generate-heats: expect a handicap heat (PB swimmers) + a no-PB heat.
    const prev = await api(`/api/races/${race.id}/generate-heats`);
    const heats = prev.heats || [];
    const pbHeats = heats.filter(h => !h.no_pb);
    const noPbHeats = heats.filter(h => h.no_pb);
    check('gen-includes-nopb-swimmers', heats.reduce((n, h) => n + h.lanes.length, 0) === 5, `total lanes=${heats.reduce((n,h)=>n+h.lanes.length,0)} (expect 5)`);
    check('gen-separate-nopb-heat', noPbHeats.length === 1 && noPbHeats[0].lanes.length === 2, `noPbHeats=${noPbHeats.length} lanes=${noPbHeats[0] ? noPbHeats[0].lanes.length : '-'}`);
    check('gen-nopb-no-handicap', noPbHeats[0] && noPbHeats[0].lanes.every(l => l.handicap_time === 0 && l.start_delay === 0), 'no-PB lanes have handicap_time 0 + start_delay 0');
    check('gen-pb-heat-has-handicap', pbHeats.length >= 1 && pbHeats.every(h => h.lanes.every(l => l.handicap_time > 0)), `pbHeats=${pbHeats.length}, all handicap_time>0`);
    const newIds = new Set([newA.id, newB.id]);
    check('gen-nopb-heat-holds-newbies', noPbHeats[0] && noPbHeats[0].lanes.every(l => newIds.has(l.member_id)), 'no-PB heat contains exactly the new members');

    await api(`/api/races/${race.id}/confirm-heats`, { method: 'POST', body: { heats } });
    const saved = await api(`/api/races/${race.id}/heats`);
    check('saved-nopb-flag-derived', saved.some(h => h.no_pb) && saved.filter(h => h.no_pb).every(h => h.lanes.every(l => l.handicap_time === 0)), 'saved heats expose no_pb flag');

    // Enter a time for a no-PB lane → no variance, no break.
    const noPbHeatSaved = saved.find(h => h.no_pb);
    const laneA = noPbHeatSaved.lanes.find(l => l.member_id === newA.id);
    const tA = await api(`/api/heats/${noPbHeatSaved.id}/lanes/${laneA.id}/time`, { method: 'PUT', body: { finish_time: 1500 } });
    check('nopb-time-no-variance', tA.variance == null && tA.is_break === 0, `variance=${tA.variance} is_break=${tA.is_break}`);
    // time for the other newbie
    const laneB = noPbHeatSaved.lanes.find(l => l.member_id === newB.id);
    await api(`/api/heats/${noPbHeatSaved.id}/lanes/${laneB.id}/time`, { method: 'PUT', body: { finish_time: 1800 } });

    // Enter times for the PB (handicap) lanes so the heat is scorable.
    for (const h of saved.filter(x => !x.no_pb)) {
      for (const l of h.lanes) {
        await api(`/api/heats/${h.id}/lanes/${l.id}/time`, { method: 'PUT', body: { finish_time: (l.start_delay + l.handicap_time) * 100 } });
      }
    }

    await api(`/api/races/${race.id}/rank`, { method: 'POST', body: {} });
    await api(`/api/events/${ev.id}/finalize`, { method: 'POST', body: {} });

    // Auto-PB: the newbies now have a 25m PB equal to round(time/100).
    const afterA = (await api('/api/members')).find(m => m.id === newA.id);
    const afterB = (await api('/api/members')).find(m => m.id === newB.id);
    check('autopb-A-established', afterA.time_25m === 15, `A.time_25m=${afterA.time_25m} (expect 15 from 1500cs)`);
    check('autopb-B-established', afterB.time_25m === 18, `B.time_25m=${afterB.time_25m} (expect 18 from 1800cs)`);

    // Pointscore: no-PB swimmers earn nothing; PB swimmers do.
    const ps = await api(`/api/events/${ev.id}/pointscore`);
    const psRows = Array.isArray(ps) ? ps : (ps.rows || ps.entries || []);
    const memberIdsScored = new Set(psRows.map(r => r.member_id));
    check('pointscore-excludes-nopb', !memberIdsScored.has(newA.id) && !memberIdsScored.has(newB.id), `newbies in pointscore? A=${memberIdsScored.has(newA.id)} B=${memberIdsScored.has(newB.id)}`);
    check('pointscore-includes-pb', withPb.some(m => memberIdsScored.has(m.id)), `at least one handicap swimmer scored (rows=${psRows.length})`);

    const passed = results.filter(r => r.ok).length;
    console.log(`\n=== v2.12.6 NEW-MEMBERS TALLY: ${passed} PASS / ${results.length - passed} FAIL ===`);
    if (passed !== results.length) process.exitCode = 1;
  } catch (e) {
    console.error('ERR', e.message); process.exitCode = 1;
  } finally {
    await stop(proc);
  }
})();
