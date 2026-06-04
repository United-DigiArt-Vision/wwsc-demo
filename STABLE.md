## Current Stable Live Version

- **Version:** v2.10.1
- **Tag:** v2.10.1
- **Branch:** main
- **Date:** 2026-06-04
- **Release status:** live verified on Render.
- **Deployed main tip:** 2154574 (`merge: v2.10.1 M3 delivery`)
- **Implementation branch:** dev/v2.10.0-m3-history-graphs
- **Implementation anchors:** `219bdd9` (M3 pointscore engine/API/UI), `a94c0fc` (Balerion QA hardening), `711c66d` + `735f0b3` (mobile screenshot overlay harness fix + refreshed evidence), `0096ecb` (Bryan-expectation N/A closure), `3630656` (Balerion independent proof verification).
- **Local verification:** Unit/API 13 PASS / 0 FAIL; pointscore isolation PASS; M2 regression 55 PASS / 0 FAIL; M2 expanded regression 98 PASS / 2 NOT APPLICABLE / 0 FAIL / 0 BLOCKED; M3 120-case proof 116 PASS / 2 NOT APPLICABLE / 2 CLIENT INPUT MISSING / 0 FAIL / 0 BLOCKED; R-M3-05 history graphs 19 PASS / 1 NOT APPLICABLE / 0 FAIL.
- **Live Render verification:** `/api/version` returned `2.10.1`, build `2026-06-04T07:38:56.179Z`.
- **Browser verification:** read-only live smoke passed 8 PASS / 0 FAIL: dashboard/sidebar `v2.10.1`, Members screen with History + Graphs actions, Pointscore screen/rule-source banner, Season Calendar, Breaker Report, no relevant console/page/http errors. Only ignored HTTP error was missing `/favicon.ico`.
- **Live smoke evidence:** `docs/evidence/live-smoke-v2.10.1-2026-06-04.json`, screenshots under `docs/screenshots/live-smoke-2026-06-04/`.

## What's in v2.10.1

Milestone 3 delivery for Bryan under the working assumptions Dino/Nedim sent to Bryan on 2026-06-02:

- Adds event-separated Pointscore generation during accepted-results finalization.
- Adds Pointscore views for per-event, monthly, season, and swimmer totals.
- Adds CSV exports for event, monthly, season, swimmer, time-history graph data, and members.
- Adds individual swimmer history graphs from existing time-history data.
- Uses existing Excel pointscore sheets as the working scoring source.
- Uses monthly/season winner totals by simple addition, as Bryan described.
- Keeps pointscore behavior isolated and adjustable if Bryan later provides a separate Constitution rule.
- Preserves accepted M1/M2 behavior through M2 55-case and expanded 100-case regression gates.
- Does not claim unprovided Constitution-specific rules, Improvement report rules, or Attendance report rules as complete; those are documented as client input missing.

## Previous Stable

### v2.9.0

Milestone 2 Time History delivery for Bryan:

- Records finalized individual race times into durable `time_history` rows.
- Adds dated per-swimmer Time History access from the Members screen.
- Adds dated event Time History in completed Calendar event details.
- Preserves event dates in history API responses and UI.
- Keeps re-finalize idempotent so the same event does not create duplicate history rows.
- Kept M2 scoped to time-history only; Pointscore, accumulated season totals, reports/graphs, and constitution scoring were M3.
- Preserves v2.8.12 M1 behavior through regression checks for members, event setup, heat builder, results, relays, breakers, calendar/archive/restore, and prior relay/report fixes.

### v2.8.12

- **Scope:** Bryan final M1 polish plus persistence hardening.
- **Live Render verification before v2.9.0 deploy:** `/api/version` returned `2.8.12`, build `2026-05-06T12:15:38.380Z`.

## Recovery

```bash
git fetch --all --prune
git checkout main
git reset --hard origin/main
PORT=3002 npm run dev
```
