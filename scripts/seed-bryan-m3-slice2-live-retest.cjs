#!/usr/bin/env node
/**
 * WWSC Bryan v2.11.0 M3 Slice 2 live retest seeder.
 *
 * Creates a deterministic completed demo event through the public app API so
 * Bryan can inspect all requested event/stroke categories, break counts,
 * total improvements, graphs, CSV exports, and raw DB export without manually
 * building a full event from scratch.
 *
 * Safety defaults:
 * - Refuses Render/live unless APPLY_LIVE=1 is set.
 * - Refuses non-empty event lists unless ALLOW_NON_EMPTY=1 is set.
 * - Never deletes or resets data.
 */
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const IS_LIVE = /onrender\.com/i.test(BASE);
const APPLY_LIVE = process.env.APPLY_LIVE === '1';
const ALLOW_NON_EMPTY = process.env.ALLOW_NON_EMPTY === '1';
const EVIDENCE_DIR = path.join(PROJECT_ROOT, 'docs', 'evidence', 'bryan-v2110-live-retest-seed');
const EVIDENCE_FILE = path.join(EVIDENCE_DIR, `seed-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

const RACE_TYPES = [
  '25m',
  '50m',
  '75m',
  'backstroke',
  'breaststroke',
  'butterfly',
  '25m_relay',
  'medley_relay',
  '25m_brace',
  '50m_brace',
];
const RETEST_DATE = '2026-06-06';

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

function assertSafeToRun(existingEvents) {
  if (IS_LIVE && !APPLY_LIVE) {
    throw new Error('Refusing live Render seed. Set APPLY_LIVE=1 after Dino approval.');
  }
  if (existingEvents.length > 0 && !ALLOW_NON_EMPTY) {
    throw new Error(`Refusing non-empty DB seed: found ${existingEvents.length} event(s). Set ALLOW_NON_EMPTY=1 only after review.`);
  }
}

async function configureAttendance(eventId) {
  const attendance = await api(`/api/events/${eventId}/attendance`);
  const strokes = ['Backstroke', 'Breaststroke', 'Free'];
  const selected = attendance.slice(0, Math.min(18, attendance.length));
  const selectedIds = new Set(selected.map(a => a.member_id));
  const attendees = attendance.map((row, index) => ({
    member_id: row.member_id,
    present: selectedIds.has(row.member_id) ? 1 : 0,
    special_event_entry: selectedIds.has(row.member_id) ? strokes[index % strokes.length] : null,
  }));
  await api(`/api/events/${eventId}/attendance`, { method: 'PUT', body: { attendees } });
  return selected.map(row => ({ member_id: row.member_id, name: row.name }));
}

function finishForVariance(lane, varianceCs) {
  return ((lane.start_delay || 0) * 100) + ((lane.handicap_time || 20) * 100) + varianceCs;
}

async function runIndividualRace(race) {
  const preview = await api(`/api/races/${race.id}/generate-heats`);
  if (!preview.heats || preview.heats.length === 0) throw new Error(`No heats generated for ${race.race_type}`);
  await api(`/api/races/${race.id}/confirm-heats`, { method: 'POST', body: { heats: preview.heats } });
  const heats = await api(`/api/races/${race.id}/heats`);
  let laneIndex = 0;
  for (const heat of heats) {
    for (const lane of heat.lanes) {
      const deltas = [-80, -55, -30, 45, 80, 120, 160, 210];
      const variance = deltas[laneIndex % deltas.length];
      await api(`/api/heats/${lane.heat_id}/lanes/${lane.id}/time`, {
        method: 'PUT',
        body: { finish_time: finishForVariance(lane, variance) },
      });
      laneIndex++;
    }
  }
  await api(`/api/races/${race.id}/rank`, { method: 'POST', body: {} });
}

async function runRelayRace(race) {
  const generated = await api(`/api/races/${race.id}/generate-relay-teams`, {
    method: 'POST',
    body: { forceReshuffle: true },
  });
  if (!generated.teams || generated.teams.length < 2) throw new Error(`Need at least two relay teams for ${race.race_type}`);
  await api(`/api/races/${race.id}/save-relay-teams`, { method: 'POST', body: { teams: generated.teams } });
  const teams = await api(`/api/races/${race.id}/relay-teams`);
  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    const targetCs = (team.target_time || 80) * 100;
    const startCs = (team.start_delay || 0) * 100;
    const deltas = race.race_type === 'medley_relay' ? [-35, 20, 70, 115] : [-45, -10, 55, 105];
    await api(`/api/relay-teams/${team.id}/time`, {
      method: 'PUT',
      body: { total_time: targetCs + startCs + (deltas[i] ?? (i * 35)) },
    });
  }
  await api(`/api/races/${race.id}/rank-relay`, { method: 'POST', body: {} });
}

async function createRetestEvent() {
  const event = await api('/api/events', { method: 'POST', body: { date: RETEST_DATE } });
  await api(`/api/events/${event.id}/config`, {
    method: 'PUT',
    body: { standard_event: 'ordinary_swim', special_event: 'medley_relay' },
  });
  const selectedMembers = await configureAttendance(event.id);
  await api(`/api/events/${event.id}/races`, { method: 'PUT', body: { race_types: RACE_TYPES } });
  const races = await api(`/api/events/${event.id}/races`);
  for (const race of races) {
    if (['25m_relay', 'medley_relay', '25m_brace', '50m_brace'].includes(race.race_type)) {
      await runRelayRace(race);
    } else {
      await runIndividualRace(race);
    }
  }
  await api(`/api/events/${event.id}/finalize`, { method: 'POST', body: {} });
  await api(`/api/events/${event.id}/complete`, { method: 'POST', body: {} });
  return { event, races, selectedMembers };
}

function raceTypesWithResults(coverage) {
  return new Set((coverage.summary || []).filter(row => row.result_count > 0).map(row => row.race_type));
}

async function verify(eventId) {
  const coverage = await api('/api/reports/event-coverage');
  const breaks = await api('/api/reports/break-counts');
  const improvements = await api('/api/reports/improvements');
  const events = await api('/api/events?archived=1');
  const current = await api('/api/events/current');
  const timeHistory = await api(`/api/events/${eventId}/time-history`);
  const pointscoreSeason = await api('/api/pointscore/season/2026');
  const dbHead = await fetch(BASE + '/api/export/db', { method: 'HEAD' });

  const covered = raceTypesWithResults(coverage);
  const checks = [
    { id: 'live-version-2.11.0', pass: (await api('/api/version')).version === '2.11.0' },
    { id: 'completed-event-visible', pass: events.some(e => e.id === eventId && e.status === 'completed') },
    { id: 'no-current-event-after-complete', pass: current == null },
    { id: 'all-requested-categories-covered', pass: RACE_TYPES.every(rt => covered.has(rt)) },
    { id: 'break-count-report-populated', pass: breaks.overall.length > 0 && breaks.by_event.length > 0 },
    { id: 'improvement-report-populated', pass: improvements.overall.length > 0 && improvements.by_event.length > 0 },
    { id: 'time-history-populated-for-graphs', pass: timeHistory.length > 0 },
    { id: 'season-pointscore-populated', pass: pointscoreSeason.standings.length > 0 },
    { id: 'db-export-downloadable', pass: dbHead.ok && /application\/octet-stream/i.test(dbHead.headers.get('content-type') || '') },
  ];
  return { coverage, breaks, improvements, events, current, timeHistoryRows: timeHistory.length, pointscoreSeason, dbExport: Object.fromEntries(dbHead.headers.entries()), checks };
}

async function main() {
  const version = await api('/api/version');
  const existingEvents = await api('/api/events?archived=1');
  assertSafeToRun(existingEvents);

  const created = await createRetestEvent();
  const verification = await verify(created.event.id);
  const failed = verification.checks.filter(check => !check.pass);
  const evidence = {
    base: BASE,
    live: IS_LIVE,
    version,
    raceTypes: RACE_TYPES,
    created: {
      event_id: created.event.id,
      date: created.event.date || RETEST_DATE,
      races: created.races.map(r => ({ id: r.id, race_type: r.race_type })),
      selectedMembers: created.selectedMembers,
    },
    verification,
  };
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  fs.writeFileSync(EVIDENCE_FILE, JSON.stringify(evidence, null, 2));
  for (const check of verification.checks) {
    console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.id}`);
  }
  console.log(`Evidence: ${EVIDENCE_FILE}`);
  if (failed.length) {
    throw new Error(`Seed verification failed: ${failed.map(c => c.id).join(', ')}`);
  }
}

main().catch(err => {
  console.error(err.stack || err.message);
  process.exit(1);
});
