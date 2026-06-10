# REQUIREMENTS v2.12.0 — Bryan Feedback 2026-06-10

Source (verbatim archive): `../messages/2026-06-10-Bryan-inbound-v2110-feedback-defaults-relay-pointscore-simplification.md`
Basis: v2.11.0 live (`641aa0e` deployed), branch `dev/v2.12.0-bryan-feedback`.

## Requirements ↔ Implementation ↔ Test (Traceability)

| ID | Bryan's wording (condensed) | Implementation | Proof |
|----|------------------------------|----------------|-------|
| R-V12-01 | "We need many weeks of events to test sufficiently … I have added another event." | `scripts/seed-bryan-weekly-events.cjs`: 7 completed Saturday events Apr–May 2026, rotating configs (ordinary/25m brace/50m brace × 75m/back/breast/fly/medley), varying attendance, weekly breaks, manual PB updates after each event. Never deletes; skips existing dates; refuses while an unfinished event exists; APPLY_LIVE=1 guard. Bryan's own event (2026-06-10) is untouched. | Seeder self-verification 9 PASS / 0 FAIL (fresh DB); 2nd run: 0 created / 7 skipped. Evidence `docs/evidence/bryan-v2120-weekly-seed/` |
| R-V12-02 | "When selecting all swimmers — it defaults to N. Change the default to Y." | `event-setup.js`: `applyDefaultEntryY()` — Select All sets entry `Y` for present swimmers without an explicit choice; same default on load and when a special event is picked later. Explicit N/Back/Breast/Free preserved. | UI-V12-01 (browser, 23/23 selects = Y) |
| R-V12-03 | "Work out a better way for the manual placings … current method cumbersome." | Quick Tap Placing (results.js): per-heat mode — tap swimmers in finish order → 1st/2nd/3rd/4th; tap again removes; Clear resets heat; dropdowns remain as fallback. | UI-V12-02, UI-V12-03 (browser) |
| R-V12-04 | "Fit the relay details on a single page … 3 teams next to each other." | `.relay-teams-grid` (style.css) + grid wrappers in results.js/relays.js: responsive side-by-side cards, print = 3 columns with compact typography. | UI-V12-04 (grid 3 columns, 3 cards) |
| R-V12-05 | POINTSCORE report 1: "Select individual events (25m, 50m, relay, etc) list all members with point scored each week and total points." | `GET /api/pointscore/by-race-type/:rt[?year]` + CSV; Pointscore screen tab "1️⃣ Event Points (weekly)" — all members × weeks matrix + totals. | UT-V12-01..05, UI-V12-05 |
| R-V12-06 | Report 2: "Total pointscore … single page … all members … totals for each event and the total of all events." | `GET /api/pointscore/total[?year]` + CSV; tab "2️⃣ Total Pointscore" — members × race types + grand total, single page. | UT-V12-06..09, UI-V12-06 |
| R-V12-07 | Report 3: "Breaker counts and breaker amounts … on a single report. Count … number of times it has come down over the season. Amount … difference between season start value and current value. These use the manually changed times." | New `pb_change_log` table; `PUT /api/members/:id` logs every manual stroke-time change; `GET /api/reports/breakers-summary[?year]` + CSV: count = manual reductions, amount = season-start PB (member.season_start_*, else first logged old value) − current PB; raises logged but never counted. Tab "3️⃣ Breakers". | UT-V12-14..18, UI-V12-07 |
| R-V12-08 | "You have the 25m brace event but it does not list in any results." | Root cause: relay-category races award points only to 1st–3rd teams, so most swimmers had no brace row anywhere. Swimmer card endpoint now lists EVERY participation (individual lanes with finish, relay teams with time) with 0 points where none were awarded; Reports 1+2 list all members incl. zeros. | UT-V12-10..13, UI-V12-08; live root-cause reproduction (event 1: 9 brace teams, places 1–9, only 6 swimmers scored) |
| R-V12-09 | "When completing the event … report … all the details are not there — start time and breaker info." | Event report (results.js `showSeasonReport`): heat tables now Lane/Swimmer/PB/Start/Finish/Net/Variance/Break/Place with green BREAK rows; relay team headers show Start + Target; manual place now wins over auto place (bug fix: was `place || manual_place`). | UT-V12-19..20, UI-V12-09 |
| R-V12-10 | Pointscore "over engineered … there are 3 main reports." | Pointscore screen leads with the 3 main reports; all previous views (Per-Event, Monthly, Season, Swimmer Card, Break Counts, Improvements, Completed Categories, DB & Graphs) collapsed under "More reports" — nothing accepted was removed. | UI-V12-05..07; M3-120 regression gate |

## Out of scope (unchanged accepted behavior)

- Scoring rules themselves (individual 5/4/3/2, relay/team 5/4/3 per place — Bryan 2026-06-05) are NOT changed.
- Heat generation, variance, is_break, ranking, time_history (M1/M2 accepted flows) are NOT changed (isolation proof re-run green).
- Live deployment + live seeding remain Dino-authorized, executed by Balerion.

## Open decisions for Bryan (communicated in the reply draft)

1. Breaker report counts MANUAL PB reductions (his literal spec). Automatic break detection per event remains available under More reports → Break Counts.
2. Report 2 row order = highest season total first (ranking view). Roster-alphabetical also possible if preferred.
3. Quick Tap Placing is our proposal for the cumbersome manual placings — feedback welcome ("open to suggestions" answered with a concrete, shipped suggestion).
