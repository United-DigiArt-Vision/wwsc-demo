## Current Stable Live Version

- **Version:** v2.12.3
- **Tag:** v2.12.3
- **Branch:** main
- **Date:** 2026-06-18
- **Release status:** live verified on Render. Corrects v2.12.2: brace/special-variance ties now use **absolute** variance again (Bryan's requirement + SYSTEM-SPEC §11).
- **Release source commit:** dd50f62 (`fix: brace relay ties by absolute variance`); version bump `21487c9`.
- **Current main tip:** `dd50f62` (pushed to `main`). Live `/api/version` build `2026-06-18T20:30:41.604Z`.
- **Implementation branch:** dev/v2.12.3-brace-abs-variance
- **Local verification (Claude, 2026-06-18):** DB-backed suite `node scripts/test-m3-pointscore-unit.cjs` = **17 PASS / 0 FAIL** incl. `UT14-brace-variance-absolute-tie` (`[0,−100,+100,+100,+150]` → `1,2,2,2,5`), run in x64 clone `~/wwsc-dev/wwsc`; `node --check` PASS.
- **Live Render verification:** `/api/version` = `{"version":"2.12.3","build":"2026-06-18T20:30:41.604Z"}`; `/api/members` = 23; `/api/pointscore/rules` OK.
- **⚠️ Demo data:** Render reset the hosted demo data on this deploy — `/api/events?archived=1` = 0, `/api/pointscore/months` = 0. Re-seed of the 7 weekly events PENDING Dino approval (`APPLY_LIVE=1 node scripts/seed-bryan-weekly-events.cjs`). Members auto-seed = 23.
- **Evidence:** `docs/evidence/v2123-brace-abs-variance/BRACE-ABS-VARIANCE-CORRECTION-2026-06-18.md`.
- **Customer gate:** Brace abs-variance fix live. STILL OPEN (next round, Bryan details ~2026-06-19): person/team place mismatch, new-members solution, error/issue handling. Bryan message: draft prepared; send only after demo reseed.

## What's in v2.12.3

Bryan's 2026-06-18 brace placement correction:

- Brace/special-variance relay placement (`25m_brace`, `50m_brace`, `pogo`, `medley_relay`) ties again on **absolute** variance: a team at +0.50 and one at −0.50 share a place (equal distance from target). Reverts the v2.12.2 signed-variance interpretation that Bryan rejected.
- Scenario `[0,−100,+100,+100,+150]` → `1,2,2,2,5` (was `1,2,3,3,5` in v2.12.2). Ordering unchanged (nearest-to-target).
- Not yet included (awaiting Bryan's details): person/team place mismatch, new-members solution, error/issue handling.

## What's in v2.12.2

Bryan's 2026-06-17 brace relay placement fix:

- Brace and special-variance relay placement (`25m_brace`, `50m_brace`, `pogo`, `medley_relay`) now ties only when teams have identical recorded variance. Ordering is unchanged (nearest-to-target by `|variance|`).
- Fixes Bryan's report that three teams shared 2nd place: opposite-sign equal-magnitude variances (e.g. −100 / +100) no longer tie. Scenario `[0,−100,+100,+100,+150]` now places `1,2,3,3,5` (was `1,2,2,2,5`).
- No other behavior changed from v2.12.1.

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
