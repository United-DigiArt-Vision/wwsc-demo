# WWSC v2.11.0 Live Demo Reseed Verification — 2026-06-09

## Context

Bryan reported that the hosted demo could not be tested because the Season Calendar and report test data were empty. A read-only live check before correction confirmed:

- `/api/version` returned `2.11.0`
- `/api/events?archived=1` returned `[]`
- `/api/pointscore/months` returned `[]`
- `/api/reports/break-counts` returned empty `overall` and `by_event` arrays

## Correction

With Dino's explicit authorization on 2026-06-09, the guarded live retest seeder was run:

```bash
BASE_URL=https://wwsc-demo.onrender.com APPLY_LIVE=1 node scripts/seed-bryan-m3-slice2-live-retest.cjs
```

The seeder does not delete or reset data. It creates a deterministic completed demo event through the public app API and verifies the Bryan-relevant test surface.

## Result

Seed evidence file:

- `docs/evidence/bryan-v2110-live-retest-seed/seed-2026-06-09T15-50-20-984Z.json`

Seeder checks:

- PASS `live-version-2.11.0`
- PASS `completed-event-visible`
- PASS `no-current-event-after-complete`
- PASS `all-requested-categories-covered`
- PASS `break-count-report-populated`
- PASS `improvement-report-populated`
- PASS `time-history-populated-for-graphs`
- PASS `season-pointscore-populated`
- PASS `db-export-downloadable`

Independent read-only API verification after the seed:

- Version: `2.11.0`
- Completed event: event `1`, date `2026-06-06`, status `completed`
- Season Calendar data: 18 present swimmers, 10 races
- Pointscore months: `2026-06`
- Season standings: 18 swimmers
- Completed category coverage: 25m, 50m, 75m, backstroke, breaststroke, butterfly, 25m relay, medley relay, 25m brace, 50m brace
- Break report: 6 overall rows and 6 by-event rows
- Improvement report: 16 overall rows and 48 by-event rows
- Current event: `null` after completion
- DB export: `200`, `application/octet-stream`, filename `wwsc-sqlite-db-v2.11.0-2026-06-09T15-52-00.db`, content-length `94208`

Browser visibility check:

- Season Calendar showed `COMPLETED EVENTS (1)`, `Sat, 6 June 2026`, 18 swimmers, 10 races, `v2.11.0`
- Event Details modal showed 18 participants and 10 races with saved times
- Pointscore per-event table showed event `Sat, 6 June 2026` and 18 ranked swimmers
- Break Counts tab showed populated overall and by-event tables
- Improvements tab showed populated overall and by-event tables
- Completed Categories tab showed all requested categories as `Covered`
- DB & Graphs tab showed the SQLite DB download button and graph-source explanation from `time_history`

Browser console note:

- One harmless `favicon.ico` 404 was visible. No app/data error was observed in the checked views.

## Communication Boundary

Do not claim the old missing demo events were recovered. The accurate customer-facing wording is that the demo test dataset was restored/re-created and verified.
