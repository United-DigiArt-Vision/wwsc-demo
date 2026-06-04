# Bryan Retest Seed Evidence

Date: 2026-06-04
Version under test: v2.10.1
Purpose: provide a reusable completed-event dataset so Bryan does not need to manually recreate completed events for every M3 retest.

## Current Live Data Finding

Read-only live API checks against `https://wwsc-demo.onrender.com` currently show no active or archived events:

- `GET /api/events` -> `[]`
- `GET /api/events?archived=1` -> `[]`
- `GET /api/pointscore/months` -> `[]`
- `GET /api/events/current` -> `null`

This proves the four previously created events are not visible through the live app API right now. It does not prove whether Render disk/backups contain a recoverable copy. Direct Render persistent-disk inspection is not available from the current local tool context because no Render CLI/API key or working logged-in browser session is available.

## Correction Prepared

Added:

- `scripts/seed-bryan-retest-events.cjs`

The script creates four completed events through the app API:

- 2026-04-04: 25m
- 2026-04-11: 25m + 50m
- 2026-04-18: 25m
- 2026-04-25: 25m + 50m

It finalizes and completes each event, then verifies:

- four events were created;
- events are visible via `/api/events?archived=1`;
- `/api/events/current` is `null` after completion;
- April 2026 pointscore month is visible;
- 2026 season pointscore is visible;
- time history rows were written.

## Safety Guard

The script refuses to run against `onrender.com` unless `APPLY_LIVE=1` is set.

It also refuses to run if events already exist unless `ALLOW_NON_EMPTY=1` is set.

No delete/reset behavior is included.

## Local Verification

Command:

```bash
rm -rf /tmp/wwsc-bryan-retest-seed && mkdir -p /tmp/wwsc-bryan-retest-seed
PORT=3031 WWSC_DB_PATH=/tmp/wwsc-bryan-retest-seed/wwsc.db node src/server.js
BASE_URL=http://127.0.0.1:3031 node scripts/seed-bryan-retest-events.cjs
```

Result:

- PASS `seed-created-four-events`
- PASS `events-visible-after-seed`
- PASS `current-event-null-after-complete`
- PASS `pointscore-month-visible`
- PASS `pointscore-season-visible`
- PASS `time-history-written`

Evidence JSON:

- `seed-2026-06-04T10-37-23-577Z.json`

SQLite spot-check:

- events: 4 completed, archived=0
- time_history rows: 96
- pointscore rows: 96

## Live Application Path After Dino Approval

If Dino approves mutating the hosted demo data, run:

```bash
BASE_URL=https://wwsc-demo.onrender.com APPLY_LIVE=1 node scripts/seed-bryan-retest-events.cjs
```

If the live DB unexpectedly contains events, stop and inspect them first. Only use `ALLOW_NON_EMPTY=1` after a deliberate review.
