#!/usr/bin/env node
/**
 * WWSC v2.12.0 — Bryan "many weeks of events" seeder (2026-06-10 request).
 *
 * Creates SEVEN completed weekly Saturday events (April + May 2026) through
 * the public app API, with rotating standard/special configurations, varying
 * attendance, PB breaks every week, and — like Bryan's real workflow — manual
 * PB updates in Members after each event (which feeds pb_change_log and the
 * new Breakers report). Gives Report 1 weekly columns, Report 2 season
 * totals across many event types, and Report 3 counts/amounts.
 *
 * Safety:
 * - Refuses Render/live unless APPLY_LIVE=1 (Dino authorization required).
 * - NEVER deletes or modifies existing events; weeks whose date already
 *   exists are SKIPPED (Bryan's own events are untouched).
 * - Refuses to run while an unfinished (non-completed) event exists.
 */
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const IS_LIVE = /onrender\.com/i.test(BASE);
const APPLY_LIVE = process.env.APPLY_LIVE === '1';
const EVIDENCE_DIR = path.join(PROJECT_ROOT, 'docs', 'evidence', 'bryan-v2120-weekly-seed');
const EVIDENCE_FILE = path.join(EVIDENCE_DIR, `weekly-seed-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

// Rotating weekly configurations (standard_event drives brace/pogo weeks,
// special_event adds the weekly special race — mirrors the Times Sheet UI).
const WEEKS = [
  { date: '2026-04-18', standard: 'ordinary_swim', special: '75m' },
  { date: '2026-04-25', standard: '25m_brace',     special: 'backstroke' },
  { date: '2026-05-02', standard: 'ordinary_swim', special: 'medley_relay' },
  { date: '2026-05-09', standard: '50m_brace',     special: 'breaststroke' },
  { date: '2026-05-16', standard: 'ordinary_swim', special: 'butterfly' },
  { date: '2026-05-23', standard: '25m_brace',     special: '75m' },
  { date: '2026-05-30', standard: 'ordinary_swim', special: 'medley_relay' },
];

const RELAY_TYPES = ['25m_relay', 'medley_relay', '25m_brace', '50m_brace', 'pogo'];
const MEDLEY_STROKES = ['Back', 'Breast', 'Free'];

async function api(route, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  let body = opts.body;
  if (body && typeof body !== 'string') {
    body = JSON.stringify(body);
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(BASE + route, { ...opts, headers, body });
  const text = await res.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = text; }
  if (!res.ok || (parsed && parsed.error)) {
    throw new Error(`${opts.method || 'GET'} ${route} -> ${res.status} ${text}`);
  }
  return parsed;
}

function raceTypesFor(week) {
  // Mirrors buildRaceTypes() in event-setup.js.
  const types = [];
  if (week.standard === '25m_brace') types.push('25m_brace', '50m', '25m_relay');
  else if (week.standard === '50m_brace') types.push('25m', '50m_brace', '25m_relay');
  else if (week.standard === 'pogo') types.push('25m', '50m', 'pogo');
  else types.push('25m', '50m', '25m_relay');
  if (week.special) types.push(week.special);
  return [...new Set(types)];
}

// Deterministic attendance variation: week i skips a sliding window of the
// roster so different swimmers miss different weeks (like a real club).
function pickAttendance(attendance, weekIndex, week) {
  const sorted = attendance.slice().sort((a, b) => a.member_id - b.member_id);
  const skipCount = 2 + (weekIndex % 3); // 2..4 absentees per week
  const skipStart = (weekIndex * 5) % Math.max(1, sorted.length);
  const skipped = new Set();
  for (let k = 0; k < skipCount; k++) skipped.add(sorted[(skipStart + k) % sorted.length].member_id);
  const isMedley = week.special === 'medley_relay';
  return attendance.map((row, idx) => {
    const present = !skipped.has(row.member_id);
    let entry = null;
    if (present && week.special) {
      // Default Y (Bryan 2026-06-10); medley weeks mix explicit strokes + Y.
      entry = isMedley ? (idx % 4 === 3 ? 'Y' : MEDLEY_STROKES[idx % 3]) : (idx % 6 === 5 ? 'N' : 'Y');
    }
    return { member_id: row.member_id, present: present ? 1 : 0, special_event_entry: entry };
  });
}

function finishForVariance(lane, varianceCs) {
  return ((lane.start_delay || 0) * 100) + ((lane.handicap_time || 20) * 100) + varianceCs;
}

// Per-week variance patterns: every week 2-3 breaks (variance beyond the
// -50cs/-100cs thresholds), some near-misses, some exceeding (>2s slower).
function variancePattern(weekIndex) {
  const base = [
    [-120, -60, -20, 30, 90, 150, 240, 60],
    [-150, -55, 40, 70, -110, 130, 210, 20],
    [-130, 45, -70, 25, 95, -140, 230, 80],
    [-160, -52, 15, 60, 110, 170, 260, -105],
    [-125, 35, -115, 50, 85, 140, 220, -58],
    [-140, -65, 30, 75, -120, 160, 250, 45],
    [-135, 55, -125, 40, 100, -150, 215, 65],
  ];
  return base[weekIndex % base.length];
}

async function runIndividualRace(race, weekIndex) {
  const preview = await api(`/api/races/${race.id}/generate-heats`);
  if (!preview.heats || preview.heats.length === 0) return { race_type: race.race_type, skipped: 'no heats (not enough swimmers with PB)' };
  await api(`/api/races/${race.id}/confirm-heats`, { method: 'POST', body: { heats: preview.heats } });
  const heats = await api(`/api/races/${race.id}/heats`);
  const deltas = variancePattern(weekIndex);
  let laneIndex = 0;
  for (const heat of heats) {
    for (const lane of heat.lanes) {
      const variance = deltas[laneIndex % deltas.length];
      await api(`/api/heats/${lane.heat_id}/lanes/${lane.id}/time`, {
        method: 'PUT',
        body: { finish_time: Math.max(100, finishForVariance(lane, variance)) },
      });
      laneIndex++;
    }
  }
  await api(`/api/races/${race.id}/rank`, { method: 'POST', body: {} });
  return { race_type: race.race_type, heats: heats.length };
}

async function runRelayRace(race, weekIndex) {
  const generated = await api(`/api/races/${race.id}/generate-relay-teams`, {
    method: 'POST',
    body: { forceReshuffle: true },
  });
  if (!generated.teams || generated.teams.length < 2) return { race_type: race.race_type, skipped: 'fewer than 2 teams' };
  await api(`/api/races/${race.id}/save-relay-teams`, { method: 'POST', body: { teams: generated.teams } });
  const teams = await api(`/api/races/${race.id}/relay-teams`);
  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    const targetCs = (team.target_time || 80) * 100;
    const startCs = (team.start_delay || 0) * 100;
    const delta = [-40, -15, 35, 80, 120, 170, 220, 280, 330][(i + weekIndex) % 9];
    await api(`/api/relay-teams/${team.id}/time`, {
      method: 'PUT',
      body: { total_time: Math.max(100, targetCs + startCs + delta) },
    });
  }
  await api(`/api/races/${race.id}/rank-relay`, { method: 'POST', body: {} });
  return { race_type: race.race_type, teams: teams.length };
}

// Bryan's real post-event workflow: breakers get their PB manually lowered in
// Members (this is what pb_change_log + the Breakers report track). Every
// third week one "exceeding" swimmer gets their PB manually RAISED — raises
// must NOT count as breaker reductions.
async function applyManualPbUpdates(eventId, weekIndex, log) {
  const STROKE_COL = { '25m': 'time_25m', '50m': 'time_50m', '75m': 'time_75m', backstroke: 'time_backstroke', breaststroke: 'time_breaststroke', butterfly: 'time_butterfly' };
  const breakers = await api(`/api/events/${eventId}/breakers`);
  const byMember = new Map();
  for (const b of breakers) {
    if (!byMember.has(b.member_name)) byMember.set(b.member_name, []);
    byMember.get(b.member_name).push(b);
  }
  const members = await api('/api/members');
  for (const [name, breaks] of byMember.entries()) {
    const member = members.find(m => m.name === name);
    if (!member) continue;
    const payload = { ...member };
    let changed = false;
    for (const b of breaks) {
      const col = STROKE_COL[b.stroke];
      if (!col) continue;
      const newWhole = Math.max(5, Math.round(b.new_time / 100));
      if (payload[col] != null && newWhole < payload[col]) {
        payload[col] = newWhole;
        changed = true;
        log.push({ event_id: eventId, member: name, stroke: b.stroke, lowered_to: newWhole });
      }
    }
    if (changed) await api(`/api/members/${member.id}`, { method: 'PUT', body: payload });
  }
  if (weekIndex % 3 === 2) {
    const slow = await api(`/api/events/${eventId}/slow-swimmers`);
    if (slow.length > 0) {
      const s = slow[0];
      const member = members.find(m => m.id === s.member_id);
      const col = STROKE_COL[s.race_type];
      if (member && col && member[col] != null) {
        const payload = { ...member, [col]: member[col] + 1 };
        await api(`/api/members/${member.id}`, { method: 'PUT', body: payload });
        log.push({ event_id: eventId, member: member.name, stroke: s.race_type, raised_to: member[col] + 1, note: 'exceeding adjustment (must NOT count as breaker)' });
      }
    }
  }
}

async function createWeek(week, weekIndex, pbLog) {
  const event = await api('/api/events', { method: 'POST', body: { date: week.date } });
  await api(`/api/events/${event.id}/config`, {
    method: 'PUT',
    body: { standard_event: week.standard, special_event: week.special || null },
  });
  const attendance = await api(`/api/events/${event.id}/attendance`);
  const attendees = pickAttendance(attendance, weekIndex, week);
  await api(`/api/events/${event.id}/attendance`, { method: 'PUT', body: { attendees } });
  await api(`/api/events/${event.id}/races`, { method: 'PUT', body: { race_types: raceTypesFor(week) } });
  const races = await api(`/api/events/${event.id}/races`);
  const raceResults = [];
  for (const race of races) {
    raceResults.push(RELAY_TYPES.includes(race.race_type)
      ? await runRelayRace(race, weekIndex)
      : await runIndividualRace(race, weekIndex));
  }
  await api(`/api/events/${event.id}/finalize`, { method: 'POST', body: {} });
  await api(`/api/events/${event.id}/complete`, { method: 'POST', body: {} });
  await applyManualPbUpdates(event.id, weekIndex, pbLog);
  return { event_id: event.id, date: week.date, standard: week.standard, special: week.special, present: attendees.filter(a => a.present).length, races: raceResults };
}

async function verify(createdWeeks) {
  const events = await api('/api/events?archived=1');
  const current = await api('/api/events/current');
  const year = (WEEKS[0].date || '2026').slice(0, 4);
  const r1 = await api('/api/pointscore/by-race-type/25m?year=' + year);
  const r2 = await api('/api/pointscore/total?year=' + year);
  const r3 = await api('/api/reports/breakers-summary?year=' + year);
  const months = await api('/api/pointscore/months');
  const checks = [
    { id: 'all-created-weeks-completed', pass: createdWeeks.every(w => events.some(e => e.id === w.event_id && e.status === 'completed')) },
    { id: 'no-current-event-left-behind', pass: current == null },
    { id: 'report1-weekly-columns>=4', pass: r1.weeks.length >= 4, note: r1.weeks.length + ' weeks' },
    { id: 'report1-lists-all-members', pass: r1.members.length >= 18, note: r1.members.length + ' members' },
    { id: 'report2-multiple-race-types', pass: r2.raceTypes.length >= 6, note: r2.raceTypes.join(',') },
    { id: 'report2-grand-totals-positive', pass: r2.members.some(m => m.total > 0) },
    { id: 'report3-manual-reductions-counted', pass: r3.totals.some(t => t.times_lowered > 0) },
    { id: 'report3-amounts-positive', pass: r3.totals.some(t => t.amount_lowered > 0) },
    { id: 'multiple-months-for-monthly-report', pass: new Set(months.map(m => m)).size >= 2, note: months.join(',') },
  ];
  return { events: events.length, current, r1Weeks: r1.weeks.length, r2Types: r2.raceTypes, r3Totals: r3.totals.filter(t => t.times_lowered > 0).length, months, checks };
}

async function main() {
  const version = await api('/api/version');
  if (IS_LIVE && !APPLY_LIVE) {
    throw new Error('Refusing live Render seed. Set APPLY_LIVE=1 only after Dino approval.');
  }
  const current = await api('/api/events/current');
  if (current != null) {
    throw new Error(`Refusing to seed: unfinished event id=${current.id} date=${current.date} status=${current.status} exists. Complete it first.`);
  }
  const existing = await api('/api/events?archived=1');
  const existingDates = new Set(existing.map(e => e.date));

  const pbLog = [];
  const created = [];
  const skipped = [];
  for (let i = 0; i < WEEKS.length; i++) {
    const week = WEEKS[i];
    if (existingDates.has(week.date)) {
      skipped.push({ date: week.date, reason: 'date already exists — never touched' });
      console.log(`SKIP ${week.date} (already exists)`);
      continue;
    }
    console.log(`Seeding week ${i + 1}/${WEEKS.length}: ${week.date} (${week.standard} + ${week.special || '—'})`);
    created.push(await createWeek(week, i, pbLog));
  }

  const verification = await verify(created);
  const evidence = { base: BASE, live: IS_LIVE, version, weeks: WEEKS, created, skipped, manualPbUpdates: pbLog, verification };
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  fs.writeFileSync(EVIDENCE_FILE, JSON.stringify(evidence, null, 2));
  for (const check of verification.checks) {
    console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.id}${check.note ? '  (' + check.note + ')' : ''}`);
  }
  console.log(`Created ${created.length} week(s), skipped ${skipped.length}. Evidence: ${EVIDENCE_FILE}`);
  const failed = verification.checks.filter(c => !c.pass);
  if (failed.length) throw new Error('Weekly seed verification failed: ' + failed.map(c => c.id).join(', '));
}

main().catch(err => {
  console.error(err.stack || err.message);
  process.exit(1);
});
