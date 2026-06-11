## Current Stable Live Version

- **Version:** v2.12.0
- **Tag:** v2.12.0
- **Branch:** main
- **Date:** 2026-06-11
- **Release status:** live verified on Render; weekly Bryan demo seed applied and verified; v2.12.0 feedback response sent to Bryan by Dino/Nedim on 2026-06-11 09:44 CEST.
- **Release source commit before stable-doc commit:** 32edc06 (`docs: SSOT close — Balerion ReQA findings round green @ 8d2fc08`)
- **Current main tip after live evidence/docs:** resolve with `git rev-parse --short origin/main`.
- **Implementation branch:** dev/v2.12.0-bryan-feedback
- **Implementation anchors:** `40ea1d7` (Select All default Y, Quick Tap Placing, relay grid), `0a1a76e` (3 main reports, pb_change_log, Swimmer Card participation rows, Event Report details, member-delete FK fix), `73a7b27` (v2.12.0 test suites + weekly seeder), `c69ec0a` (manual-place precedence fix), `8d2fc08` (Balerion ReQA findings: harness validation, gate robustness, real assertions, dependency audit).
- **Local verification:** v2.12 Unit/API 24 PASS / 0 FAIL; pointscore Unit 15 PASS / 0 FAIL; Slice2 Unit/API 7 PASS / 0 FAIL; pointscore isolation PASS; v2.12 Browser 10 PASS / 0 FAIL; M2-55 55 PASS / 0 FAIL; M2-100 98 PASS / 2 NOT APPLICABLE / 0 FAIL / 0 BLOCKED; M3-120 118 PASS / 2 NOT APPLICABLE / 0 FAIL / 0 BLOCKED / 0 CLIENT INPUT MISSING. Balerion final ReQA: `../messages/2026-06-11-0915-Balerion-Final-ReQA-v2120-after-Claude-fixes.md`.
- **Live Render verification:** `/api/version` returned `{"version":"2.12.0","build":"2026-06-11T07:28:01.137Z"}`.
- **Browser/API verification:** read-only live smoke passed 11/11 HTTP checks: root app, version, members, current events, completed events, total pointscore, breakers summary, race-type pointscore, event coverage, break counts and improvements.
- **Live weekly seed verification:** `BASE_URL=https://wwsc-demo.onrender.com APPLY_LIVE=1 node scripts/seed-bryan-weekly-events.cjs` created 7 completed weekly events and passed 9/9 self-checks. Completed dates visible live: 2026-04-18, 2026-04-25, 2026-05-02, 2026-05-09, 2026-05-16, 2026-05-23, 2026-05-30.
- **Live smoke evidence:** `docs/evidence/live-smoke-v2.12.0-2026-06-11.json`; weekly seed evidence: `docs/evidence/bryan-v2120-weekly-seed/weekly-seed-2026-06-11T07-29-10-656Z.json`.
- **Customer sent-confirmed record:** `../messages/2026-06-11-outgoing-to-bryan-v2120-feedback-response-sent-confirmed.md`; screenshots: `../messages/attachments/2026-06-11-v2120-sent-to-bryan-confirmation/`.
- **Current customer gate:** waiting for Bryan retest/feedback/acceptance.

## What's in v2.12.0

Bryan's 2026-06-10 feedback release:

- Adds seven-week Bryan demo seeder for realistic multi-week testing without deleting existing events.
- Select All now defaults swimmer entries to `Y`.
- Adds Quick Tap Placing for manual placing entry on Results.
- Displays relay teams side-by-side with compact print layout.
- Simplifies Pointscore around Bryan's 3 main reports: Event Points weekly matrix, Total Pointscore, and Breakers count/amount from manual PB changes.
- Adds `pb_change_log` to track manual PB reductions for Breakers.
- Shows every swimmer participation in Swimmer Card, including 0-point relay/brace participations.
- Expands Event Report with PB, start, finish, net, variance, BREAK marker, place, and relay start/target details.
- Fixes manual-place precedence in reports and Season Calendar.
- Adds complete current documentation set: system spec, data dictionary, API reference, UI screen spec, rebuild guide, and current docs index.

## Previous Stable

### v2.10.1

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
