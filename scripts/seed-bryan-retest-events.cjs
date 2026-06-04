#!/usr/bin/env node
/**
 * WWSC Bryan retest data seeder.
 *
 * Creates four deterministic completed events through the public app API so
 * Bryan can retest M3 reports without manually entering full events again.
 *
 * Safety defaults:
 * - Refuses to run against onrender.com unless APPLY_LIVE=1 is set.
 * - Refuses to seed a non-empty event list unless ALLOW_NON_EMPTY=1 is set.
 * - Does not delete or reset existing data.
 */
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const IS_LIVE = /onrender\.com/i.test(BASE);
const ALLOW_NON_EMPTY = process.env.ALLOW_NON_EMPTY === '1';
const APPLY_LIVE = process.env.APPLY_LIVE === '1';
const EVIDENCE_DIR = path.join(PROJECT_ROOT, 'docs', 'evidence', 'bryan-retest-seed');
const EVIDENCE_FILE = path.join(EVIDENCE_DIR, `seed-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

const EVENT_PLANS = [
  { date: '2026-04-04', raceTypes: ['25m'] },
  { date: '2026-04-11', raceTypes: ['25m', '50m'] },
  { date: '2026-04-18', raceTypes: ['25m'] },
  { date: '2026-04-25', raceTypes: ['25m', '50m'] },
];

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

async function configureAttendance(eventId, raceTypes) {
  const attendance = await api(`/api/events/${eventId}/attendance`);
  const needsOptionalEntry = raceTypes.some(rt => ['75m', 'backstroke', 'breaststroke', 'butterfly'].includes(rt));
  const attendees = attendance.map((row, index) => ({
    member_id: row.member_id,
    present: index < 16 ? 1 : 0,
    special_event_entry: needsOptionalEntry && index < 16 ? 'Y' : null,
  }));
  await api(`/api/events/${eventId}/attendance`, { method: 'PUT', body: { attendees } });
}

async function runIndividualRace(race, eventIndex) {
  const preview = await api(`/api/races/${race.id}/generate-heats`);
  if (!preview.heats || preview.heats.length === 0) {
    throw new Error(`No heats generated for race ${race.id} (${race.race_type})`);
  }
  await api(`/api/races/${race.id}/confirm-heats`, { method: 'POST', body: { heats: preview.heats } });
  const heats = await api(`/api/races/${race.id}/heats`);
  let laneOrdinal = 0;
  for (const heat of heats) {
    for (const lane of heat.lanes) {
      const startCs = (lane.start_delay || 0) * 100;
      const pbCs = (lane.handicap_time || 25) * 100;
      const eventDelta = eventIndex * 10;
      const laneDelta = laneOrdinal < 3 ? -70 + laneOrdinal * 25 : 80 + laneOrdinal * 5;
      const finishTime = Math.max(1, startCs + pbCs + eventDelta + laneDelta);
      await api(`/api/heats/${lane.heat_id}/lanes/${lane.id}/time`, {
        method: 'PUT',
        body: { finish_time: finishTime },
      });
      laneOrdinal++;
    }
  }
  await api(`/api/races/${race.id}/rank`, { method: 'POST', body: {} });
}

async function createCompletedEvent(plan, index) {
  const ev = await api('/api/events', { method: 'POST', body: { date: plan.date } });
  await api(`/api/events/${ev.id}/config`, {
    method: 'PUT',
    body: { standard_event: 'ordinary_swim', special_event: null },
  });
  await configureAttendance(ev.id, plan.raceTypes);
  await api(`/api/events/${ev.id}/races`, { method: 'PUT', body: { race_types: plan.raceTypes } });
  const races = await api(`/api/events/${ev.id}/races`);
  for (const race of races) {
    await runIndividualRace(race, index);
  }
  await api(`/api/events/${ev.id}/finalize`, { method: 'POST', body: {} });
  await api(`/api/events/${ev.id}/complete`, { method: 'POST', body: {} });
  return { id: ev.id, date: plan.date, raceTypes: plan.raceTypes };
}

async function main() {
  const version = await api('/api/version');
  const existingEvents = await api('/api/events?archived=1');
  assertSafeToRun(existingEvents);

  const created = [];
  for (let i = 0; i < EVENT_PLANS.length; i++) {
    created.push(await createCompletedEvent(EVENT_PLANS[i], i));
  }

  const eventsAfter = await api('/api/events?archived=1');
  const months = await api('/api/pointscore/months');
  const april = await api('/api/pointscore/month/2026-04');
  const season = await api('/api/pointscore/season/2026');
  const firstHistory = await api(`/api/events/${created[0].id}/time-history`);
  const current = await api('/api/events/current');

  const checks = [
    { id: 'seed-created-four-events', pass: created.length === 4 },
    { id: 'events-visible-after-seed', pass: eventsAfter.length >= 4 },
    { id: 'current-event-null-after-complete', pass: current == null },
    { id: 'pointscore-month-visible', pass: months.includes('2026-04') && april.events.length >= 4 && april.standings.length > 0 },
    { id: 'pointscore-season-visible', pass: season.events.length >= 4 && season.standings.length > 0 },
    { id: 'time-history-written', pass: firstHistory.length > 0 },
  ];
  const failed = checks.filter(c => !c.pass);
  const evidence = {
    base: BASE,
    live: IS_LIVE,
    version,
    created,
    checks,
    eventsAfter: eventsAfter.map(e => ({ id: e.id, date: e.date, status: e.status, archived: e.archived, present_count: e.present_count, race_count: e.race_count })),
    months,
    aprilEventCount: april.events.length,
    aprilStandingsCount: april.standings.length,
    seasonEventCount: season.events.length,
    seasonStandingsCount: season.standings.length,
    firstEventTimeHistoryRows: firstHistory.length,
  };
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  fs.writeFileSync(EVIDENCE_FILE, JSON.stringify(evidence, null, 2));

  for (const check of checks) {
    console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.id}`);
  }
  console.log(`Evidence: ${EVIDENCE_FILE}`);
  if (failed.length) {
    throw new Error(`Seed verification failed: ${failed.map(c => c.id).join(', ')}`);
  }
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
