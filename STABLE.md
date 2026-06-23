## Current Stable Live Version

- **Version:** v2.12.5
- **Tag:** v2.12.5
- **Branch:** main
- **Date:** 2026-06-23
- **Release status:** live verified on Render. Quick wins from Bryan's 2026-06-21 feedback round: collapsible side menu (pt 4), exceeding report ≥1 s (pt 5), consistent Breakers/Exceeding reports (pt 7), slow-swimmers heat_number fix.
- **Release source commit:** `509d804` (`build: exclude playwright devDep from Render production build`); sidebar feature `ec26366`; quick wins `321302c`; version bump `cd30327`.
- **Current main tip:** `509d804` (pushed to `main`). Live `/api/version` build `2026-06-23T04:08:56.798Z`.
- **Implementation branch:** dev/v2.12.5-quickwins
- **Local verification (Claude, 2026-06-22):** DB suite `node scripts/test-m3-pointscore-unit.cjs` = **18 PASS / 0 FAIL**; reports/export `test-m3-slice2-reports-export.cjs` = **7 PASS / 0 FAIL**; `node --check` PASS. Sidebar UI via Playwright at 1300px + 720px + print emulation (toggle both ways, reload persistence, no heading overlap, no print artifact).
- **Live Render verification (2026-06-23):** `/api/version` = `{"version":"2.12.5","build":"2026-06-23T04:08:56.798Z"}`; `/api/members` = 23; live assets carry the sidebar feature; live screenshot toggle confirmed (`~/wwsc-dev/shots/LIVE-dashboard-*.png`).
- **Build note:** `render.yaml` buildCommand is now `npm install --omit=dev` — `NODE_ENV=production` alone no longer skips devDeps in npm 10, so this keeps the Playwright devDependency out of the Render build.
- **Demo data:** re-seeded after deploy (mandatory post-deploy step) — `/api/events?archived=1` = 7, `/api/pointscore/months` = `["2026-05","2026-04"]`, 9/9 seed self-checks.
- **Evidence:** `docs/evidence/bryan-v2120-weekly-seed/weekly-seed-2026-06-23T04-10-30-847Z.json`.
- **Customer gate:** v2.12.5 quick wins live. STILL OPEN: data-loss root cause (pt 8, hosting/disk — Dino), manual corrections complexity analysis (pt 1), new members without a time (pt 3), local/multi-club (pt 10). Bryan info message: drafted, awaiting Dino to send.

## What's in v2.12.5

Bryan's 2026-06-21 feedback round — quick wins:

- **Collapsible side menu (pt 4):** a `«` button in the sidebar title hides the navigation (more room for heat data while filling in); a floating `☰` button restores it. State persists in `localStorage`. Hidden in print; reachable on the narrow 60px rail.
- **Exceeding report ≥1 s (pt 5):** threshold lowered from 2 s to 1 s over the allocated time (`variance >= 100` cs).
- **Report consistency (pt 7):** Breakers and Exceeding reports now share header bar, centred coloured headings, alignment, and the "RaceType - Heat N" event/heat label. Colours stay green/orange.
- **Bonus:** `/api/events/:id/slow-swimmers` now returns `heat_number` (was missing, so heats could not be labelled).

## What's in v2.12.4

Bryan's 2026-06-20 odd-man-out rule:

- In a brace/relay race with an odd number of swimmers, the leftover swimmer is paired into a second team and "swims twice". The pointscore now counts only their **best result** (highest points / best place), not the sum of both teams.
- Single-team swimmers are unaffected. The results list still shows both teams (the swimmer really raced twice); only the scoring counts once.

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
