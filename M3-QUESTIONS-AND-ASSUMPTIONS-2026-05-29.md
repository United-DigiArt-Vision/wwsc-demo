# M3 — Open Questions and Working Assumptions

**Date:** 2026-05-29
**Author:** Claude Code
**Audience:** Balerion (for orchestration) and via Balerion, Dino / Bryan (for the answers).
**Purpose:** Surface every ambiguous M3 acceptance criterion **before** any code is written. Per Balerion's 2026-05-29 handoff: "If you encounter ambiguity in pointscore rules, constitution accumulation, reports, graph definitions, export behavior, or production/commercial boundaries, stop that part and report the question instead of guessing."

## 2026-06-03 Operational Override

Dino/Nedim has now sent Bryan a transparent working-assumptions message. The implementation gate changed:

- Do not ask Bryan another clarification round before pointscore implementation.
- Proceed using event-separated pointscore.
- Compute monthly and season overall winners by simple addition of relevant event totals.
- Use the existing Excel pointscore sheets as the working scoring source.
- Keep Formula / Season / Constitution behavior isolated and adjustable if Bryan later sends a separate Constitution rule.

Older lines in this document that say "no coding without confirmation" or "blocked until Bryan answers" should now be read as: do not claim final Constitution truth without confirmation; implementation may proceed under the sent working assumptions and must label them as such.

> Note: Balerion's `docs/tests/M3-USER-INTERACTION-TEST-SPEC-v3.0.0.md` already pre-marks the UIT-M3 cases that depend on these answers as `PROVISIONAL` (UIT-M3-021..029, UIT-M3-035, UIT-M3-041, UIT-M3-044, UIT-M3-048, UIT-M3-051, UIT-M3-052, UIT-M3-063, UIT-M3-064, UIT-M3-071..080). Each QA below cites which UIT-M3 cases unblock once the answer lands.

Each item below has:

- **Question** — the exact thing we need answered.
- **Why it blocks coding** — which requirement(s) in `REQUIREMENTS-M3-POINTSCORE-REPORTS.md` cannot start until this answer lands.
- **Minimum working assumption** — what we would propose if Balerion forces a temporary default for sequencing. **This is not a unilateral decision** and we will not implement it without explicit Balerion authorization.

---

## QA-01 — Pointscore formula  [BLOCKS R-M3-01, R-M3-10]

**Also unblocks (UIT-M3):** 021, 022, 024, 025, 026, 071.

**Question:** What is the points-per-place formula for each race type?

Concretely we need, for each of these race types, an answer to: how many points are awarded to 1st / 2nd / 3rd / participation / DNF?
- Ordinary swim (25m / 50m / 75m)
- Special-stroke (Backstroke / Breaststroke / Butterfly)
- 25m Brace Relay (pair race)
- 50m Brace Relay (pair race)
- 25m Team Relay
- Medley Relay
- Pogo

And:
- Are there bonus points for setting a PB (`is_break === 1`)?
- Are there attendance points for being present but not finishing 1st/2nd/3rd?
- Are points the same across race types or weighted (e.g., relays count double)?

**Minimum working assumption (NOT to be coded without sign-off):** points are `4 / 3 / 2 / 1` for `1st / 2nd / 3rd / finished`, no PB-bonus, no attendance points, no race-type weighting. **Likely wrong**; we explicitly do not code on this default.

**2026-06-02 Bryan partial answer:** Bryan wrote: "Just keep the pundits for each event separately" and "We do combine some of them for over all winners but the would be a simple addition at the end of each month and season." Context strongly indicates `pundits` means points/pointscore. This clarifies the aggregation shape: pointscore remains event-separated first, then monthly and season overall winners are computed by simple addition. The actual points-per-place formula is still not answered, so R-M3-01 and R-M3-10 remain blocked for final pointscore code.

## QA-02 — Season window definition  [BLOCKS R-M3-02, R-M3-04]

**Question:** What constitutes a "season" for pointscore accumulation?
- Calendar year (Jan 1 → Dec 31)?
- Swim-club season (e.g., Sep → Aug)?
- Custom date range with explicit start/end Bryan controls?
- Open-ended (cumulative since first event)?

**Minimum working assumption:** the season is the calendar year of the current date. **No coding without confirmation.**

**2026-06-02 Bryan partial answer:** Bryan confirmed there are month-end and season-end combined totals. The exact season boundary is still not defined, so QA-02 remains blocked.

## QA-03 — Season reset vs rolling  [BLOCKS R-M3-02]

**Question:** When a new season starts, do swimmer pointscore totals reset to 0, or do they continue rolling? If reset: is the previous season's total still viewable (read-only) or archived?

**Minimum working assumption:** reset at season boundary; previous seasons remain queryable read-only via a season-selector in the UI.

**2026-06-02 Bryan partial answer:** Month-end and season-end totals should be separate outputs. Reset vs carry-over across seasons is still not explicitly answered.

## QA-04 — Date-range slicer scope  [BLOCKS R-M3-04, R-M3-05, R-M3-07]

**Question:** Should Reports / Graphs / CSV exports all share the same season/date-range filter, or does each surface have its own picker?

**Minimum working assumption:** a single global "Season" selector in the Reports nav drives all three surfaces.

**2026-06-02 Bryan partial answer:** Month and season reporting periods should be supported for pointscore totals. Whether this should be one shared global filter across Reports / Graphs / CSV remains open.

## QA-05 — Constitution document location  [BLOCKS R-M3-03, R-M3-06, R-M3-10]

**Question:** Where is the WWSC club constitution document, and which version applies?

Currently I cannot find a constitution file anywhere in `~/Dropbox/Dino-Balerion-Claude-Code/Projekte/0004_swimming-app/`. Searched paths:
- `messages/` — no constitution file.
- `handover/` — only handbook docs, no constitution.
- `code/docs/` — only PRD / design specs, no constitution.
- `bryan-excel-original.xlsm` — Bryan's original spreadsheet may contain points rules in a sheet but I have not parsed it for this PRD; if Balerion confirms this is the source, we can extract from there.

**Minimum working assumption:** the rules are inferred from `bryan-excel-original.xlsm` Pointscore-related sheets if any, otherwise we cannot implement R-M3-03 at all.

## QA-06 — Constitution accumulation rules  [BLOCKS R-M3-03]

**Question:** Once the constitution document is identified, which specific rules apply to M3?

Examples we need decided (not exhaustive — Bryan should add anything missing):
- Bonus for PB break (already known to be `is_break === 1` in v2.9.0 `time_history`)?
- Attendance bonus (just turning up)?
- Eligibility filter (junior / senior / member-status)?
- Tie-breakers in season standings (count of 1st places? earliest 1st place? alphabetic?)?
- Race-type weighting?
- Cumulative-prior-year carry-over (if not reset per QA-03)?
- Eligible-events-only filter (e.g., must be a "WWSC official" event, not a guest event)?

**Minimum working assumption:** rules are exactly what `bryan-excel-original.xlsm` encodes if Balerion confirms it is the source; otherwise blocked.

**2026-06-02 Bryan partial answer:** Simple addition is confirmed for combining event points into monthly and season overall winners. Other Constitution rules remain unanswered.

## QA-07 — Season standings columns  [BLOCKS R-M3-04]

**Question:** Which columns does the Season Pointscore standings table show?

Candidate columns we can supply from v2.9.0 data without new data collection:
- Rank, Swimmer, Points, Events Attended, PB Breaks, Best Time per Stroke (configurable?), Last Event Date

**Minimum working assumption:** Rank, Swimmer, Points, Events Attended, PB Breaks. **No coding until confirmed.**

**2026-06-02 Bryan partial answer:** Monthly overall winners and season overall winners are expected pointscore outputs. Exact columns remain unconfirmed.

## QA-08 — Individual swimmer graph types  [BLOCKS R-M3-05]

**Question:** Which graph types does Bryan want for individual swimmers?

Candidate graph types we can supply from v2.9.0 `time_history` data:

- (A) Per-stroke time-trend line: X=event date, Y=time, one line per stroke (25m / 50m / 75m / Backstroke / Breaststroke / Butterfly).
- (B) PB progression: X=event date, Y=PB at that point, one line per stroke, drops on PB break events.
- (C) Variance-vs-target scatter (special races only): X=event date, Y=signed variance, color by race type.
- (D) Attendance heatmap: calendar grid colored by attended vs missed.
- (E) Place histogram per race type: bars showing how often the swimmer placed 1st / 2nd / 3rd / etc.

**Minimum working assumption:** A + B only. **No coding until confirmed.**

## QA-09 — Required internal reports list  [BLOCKS R-M3-06]

**Question:** Beyond the Season Pointscore standings (R-M3-04) and the existing Breaker / Exceeded reports, which additional internal reports are required for M3?

Candidate reports inferable from existing data:
- Season Pointscore (R-M3-04 — required)
- Per-Swimmer Card (member profile + history + accumulated points + graph thumbnails)
- Race-Type Leaderboard (top times per stroke)
- Attendance Report (per-swimmer attendance count over date range)
- Weekly Event Summary (existing event report, but as a list across the season)
- Time-History Export (table view of all rows, filterable)

**Minimum working assumption:** Season Pointscore + Per-Swimmer Card + Attendance Report. **No coding until confirmed.**

## QA-10 — CSV export shape  [BLOCKS R-M3-07]

**Question:** Should CSV export be:

(A) One bulk CSV (every table, denormalized into one flat file)?
(B) One CSV per dataset (members.csv, time_history.csv, pointscore.csv, events.csv) packaged as a ZIP?
(C) A user-selectable picker that lets the user choose which dataset to download?

**Minimum working assumption:** (C) with three datasets: time-history, pointscore, members.

## QA-11 — CSV columns and date-range  [BLOCKS R-M3-07]

**Question:** For each CSV in QA-10's chosen shape, what columns and what date range?

Candidate column sets:
- Time-History CSV: `event_date, swimmer_name, race_type, stroke, time_centiseconds, previous_best_seconds, is_break`
- Pointscore CSV: `event_date, swimmer_name, race_type, place, points`
- Members CSV: `name, joined_date, is_active, time_25m, time_50m, time_75m, time_backstroke, time_breaststroke, time_butterfly`

Date range: tied to the global season selector (QA-04).

## QA-12 — Historical record retention policy  [BLOCKS R-M3-08]

**Question:** What is the policy for historical record retention?

Bryan asked on 2026-05-23: "Is there a limitation on the historical records that can be kept?"

Candidate answers:
- (A) No hard limit; UI paginates older rows; SQLite scales to many million rows on the current hardware.
- (B) Hard limit of N years (e.g., 5) with auto-archive of older rows.
- (C) Soft policy: data is kept indefinitely but a "Cleanup older than N years" button is offered.

**Minimum working assumption:** (A) — no hard limit, with pagination already implicit because the UI uses modal/table chunks. This is a documentation-only answer unless Bryan picks (B) or (C).

## QA-13 — Print vs PDF for reports  [BLOCKS R-M3-09]

**Question:** Should reports be print-friendly only (browser `Cmd-P` style), or also exportable as PDF download?

**Minimum working assumption:** print-friendly only, leveraging the existing v2.8.1 / v2.8.2 print CSS pattern. PDF download deferred unless Bryan explicitly requests it.

---

## How These Questions Should Flow Back

Per Balerion's 2026-05-29 handoff Safety Boundaries, I am not contacting Bryan. Recommended flow:

1. Balerion reviews this question set.
2. Balerion bundles the questions for Dino in a single decision pass.
3. Dino either answers internally (where the answer is policy / boundary) or asks Bryan via Upwork for the externally-owned items (notably QA-01, QA-05, QA-06, QA-08, QA-09).
4. Bryan's answers are archived in `messages/` as `2026-XX-XX-Bryan-inbound-m3-rules.md`.
5. I refresh this document with the answers and remove the corresponding [BLOCKED] tags in the PRD + Dev Checklist.
6. Only then does M3 implementation start (V0014 version bump first commit on `dev/v2.10.0-m3-*`).

## QA → UIT-M3 PROVISIONAL Unblock Map

The table tells Balerion exactly which UIT-M3 PROVISIONAL cases convert to a regular PASS/FAIL test once each QA answer lands.

| QA | UIT-M3 cases unblocked once answered |
|---|---|
| QA-01 Pointscore formula | UIT-M3-021, 022, 024, 025, 026 |
| QA-02 Season window | UIT-M3-041, 047, 063, 064 |
| QA-03 Season reset vs rolling | UIT-M3-041, 047 |
| QA-04 Date-range slicer scope | UIT-M3-007, 008, 032, 039, 040, 055, 062, 065 |
| QA-05 Constitution document location | UIT-M3-071, 072, 073, 074, 075, 076, 077, 078, 079, 080 |
| QA-06 Constitution rules | UIT-M3-027, 028, 029, 035, 044, 048, 071, 072, 073, 074, 075, 076, 077, 078, 079, 080 |
| QA-07 Season standings columns | UIT-M3-041, 042, 043, 045 |
| QA-08 Graph types | UIT-M3-001, 002, 003, 004, 005, 006, 010, 018, 019, 061, 062, 063, 064, 065, 067, 068 |
| QA-09 Required reports list | UIT-M3-031, 033, 034, 036, 037, 038 |
| QA-10 CSV shape | UIT-M3-051, 052, 056, 057 |
| QA-11 CSV columns / date range | UIT-M3-051, 052, 055 |
| QA-12 History retention policy | (none in UIT-M3; documentation answer only) |
| QA-13 Print vs PDF | UIT-M3-017, 053, 054 |

UIT-M3-100 (Final proof gate) cannot reach PASS until every other UIT-M3 case has a non-PROVISIONAL terminal status.

## Items We Can Proceed With Without Bryan-Blockers

These three M3 requirements are NOT blocked by Bryan; they can move forward as soon as Balerion authorizes:

- **R-M3-11** No-regression gate — re-run existing `e2e-m2-time-history.cjs` (55 cases) + `e2e-m2-user-interaction-100.cjs` (100 cases) on the M3 branch. Effort: low, no design work.
- **R-M3-12** Out-of-scope guard — code-review-only; verify nothing in the M3 PR introduces SaaS scope. Effort: review-level.
- **R-M3-08** History retention policy — documentation-only answer per QA-12. Can be drafted now and confirmed by Bryan as a single-line yes/no.

All other M3 work is blocked behind one or more of QA-01 .. QA-13.
