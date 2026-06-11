## Current Stable Live Version

- **Version:** v2.12.1
- **Tag:** v2.12.1
- **Branch:** main
- **Date:** 2026-06-11
- **Release status:** live verified on Render; Bryan v2.12.1 retest fixes deployed; weekly Bryan demo seed re-applied after deploy and verified.
- **Release source commit:** 8683913 (`fix: v2.12.1 bryan retest scoring and placing`)
- **Current main tip after live evidence/docs:** resolve with `git rev-parse --short origin/main`.
- **Implementation branch:** dev/v2.12.1-bryan-retest-fixes
- **Local verification:** `node --check` touched JS/test files PASS; `node scripts/test-m3-pointscore-unit.cjs` 16 PASS / 0 FAIL; `node scripts/test-v2120-bryan-feedback.cjs` 25 PASS / 0 FAIL; `node scripts/e2e-v2120-bryan-feedback.cjs` 11 PASS / 0 FAIL with 0 console errors.
- **Live Render verification:** `/api/version` returned `{"version":"2.12.1","build":"2026-06-11T10:36:19.048Z"}`.
- **Live weekly seed verification:** deploy reset the demo SQLite data again; after reseed `BASE_URL=https://wwsc-demo.onrender.com APPLY_LIVE=1 node scripts/seed-bryan-weekly-events.cjs` created 7 completed weekly events and passed 9/9 self-checks. Independent live verification confirmed 7 completed events dated 2026-04-18 through 2026-05-30, pointscore months April/May, 10 race types, 23 positive member totals, Event History rows, and shifted breaker scoring evidence.
- **Evidence:** v2.12.1 proof `docs/evidence/v2120-bryan-feedback/V2.12.1-BRYAN-RETEST-FIXES-PROOF.md`; weekly seed evidence `docs/evidence/bryan-v2120-weekly-seed/weekly-seed-2026-06-11T10-38-59-279Z.json`.
- **Customer gate:** Dino/Nedim has a prepared v2.12.1 response for Bryan covering Event History, breaker scoring, direct Manual-cell placing, and local/hosted cost options. Waiting for Dino to send, then Bryan retest/feedback/acceptance.

## What's in v2.12.1

Bryan's 2026-06-11 retest fixes:

- Event History is exposed under Pointscore > More reports, with direct Event History buttons from the three main reports so Bryan can cross-check pointscore totals against completed event details.
- Breaker scoring now matches Bryan's rule: a breaker receives 2 entry points only and does not consume the 5/4/3 place points; non-breakers shift up into the available place points.
- All finished non-placing entrants receive 2 entry points, including brace and relay/team events.
- Manual placing no longer requires a separate Tap Placing start/done mode. The Manual column itself is the tap target: tap to assign the next place, tap an assigned place to clear it. Finish cells still handle time entry.
- Demo data was reloaded after deploy with seven completed weekly events for April/May 2026.

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
