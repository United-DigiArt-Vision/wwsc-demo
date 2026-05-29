# REQUIREMENTS — M3 Pointscore / Reports / Constitution Accumulation

**Project:** WWSC Swimming App
**Milestone:** 3 (final of three contracted milestones)
**Baseline:** `main` @ `7b4dcc5` on top of delivered `v2.9.0` (origin/main=`3f22593`, tag `v2.9.0=8d167fd`)
**Author:** Claude Code
**Date drafted:** 2026-05-29
**Status of this document:** PRD draft for Balerion review; **not yet approved**, **no code yet**.

> Per Balerion's 2026-05-29 handoff: this is the first deliverable of M3 (PRD), not the implementation. M3 acceptance criteria are partially documented and partially ambiguous; ambiguous items are explicitly listed in `M3-QUESTIONS-AND-ASSUMPTIONS-2026-05-29.md` and are NOT to be coded until Bryan (via Dino) clarifies or Balerion explicitly authorizes a working assumption.
>
> **Mandatory test target:** `docs/tests/M3-USER-INTERACTION-TEST-SPEC-v3.0.0.md` (UIT-M3-001..UIT-M3-100). Owner: Balerion QA gate. M3 cannot be called signoff-ready unless every UIT-M3 case has a screenshot-proven `PASS`, `BLOCKED`, or resolved-PROVISIONAL classification per that spec. The Cross-Reference table below maps each R-M3 requirement to the UIT-M3 cases that prove it.

---

## 1. Source of Truth for M3 Scope

| Source | Wording |
|---|---|
| Upwork contract source-of-truth (`projects/0004_swimming-app/input/UPWORK-MILESTONES.md`, restated in `messages/2026-04-29-Balerion-milestone-boundary-note.md` Milestone 3) | 1) Create automated points core recording and accumulating. 2) Generate reports & graphs. 3) Accumulate results as defined in the constitution. |
| Bryan 2026-05-20 inbound (`messages/2026-05-20-Bryan-inbound-graphs-history-question.md`) | "In addition can we create graphs for individuals based on the history report. Or the data is in some format where we can build graphs, etc" |
| Bryan 2026-05-23 inbound (`messages/2026-05-23-Bryan-inbound-m2-met-production-questions.md`) | "Please confirm that the data can be exported as a .csv file as well [as] internal reports created by the app. Is there a limitation on the historical records that can be kept?" |
| Bryan 2026-05-23 milestone restatement (same file) | "Third — Create automated points core recording and accumulating · Generate reports · Accumulate results as defined in the constitution." |
| Dino 2026-05-23 outbound boundary (`messages/2026-05-23-outgoing-to-bryan-commercial-scope-boundary-sent-confirmed.md`) | "MS3: automated pointscore, reports and constitution-based accumulation … A dedicated CSV export screen, reporting screens and commercial deployment setup would belong to the next scoped phase - Milestone 3, not the current Milestone 2 delivery." |
| Dino 2026-05-21 outbound (`messages/2026-05-21-outgoing-to-bryan-m2-acceptance-request-sent-confirmed.md`) | "For the individual graphs/report views, the history data foundation is now there. Those screens would fit into the next reporting layer / Milestone 3." |

## 2. Baseline Foundations Already in v2.9.0

These M3 requirements build on existing v2.9.0 infrastructure — no duplicate work needed:

- `time_history(member_id, event_id, stroke, time, is_break, previous_best)` table — the dated per-swimmer time archive (M2).
- `pointscore_entry(event_race_id, member_id, points)` table — **stub already in `src/db.js:110-116`, no INSERT path yet**. M3 must implement the write path.
- `event`, `event_race`, `heat`, `heat_lane`, `relay_team`, `relay_team_member`, `attendance`, `member` tables — full M1/M2 schema.
- `GET /api/events/:eventId/time-history`, `GET /api/members/:memberId/time-history` — M2 read APIs over the history archive.
- `GET /api/events/:eventId/report` — existing event-level report endpoint.
- `GET /api/events/:eventId/breakers`, `GET /api/reports/breakers`, `GET /api/reports/exceeded` — M1 reports.

## 3. M3 Requirements (R-M3-01 to R-M3-12)

Each requirement is tagged:
- **KNOWN** — scope is defined by source docs; can be coded once the technical design lands.
- **PARTIAL** — direction is known but a specific rule/format is missing; needs one or more Bryan clarifications before coding.
- **AMBIGUOUS** — scope direction is unclear; needs Bryan decision before any code is written.

### R-M3-01 — Automated pointscore recording per event race  [PARTIAL]
**Statement:** When an event is finalized, the system must compute and persist pointscore rows for each finished individual race lane (and per relay team / member) into `pointscore_entry`.
**Source:** Upwork milestone wording "automated points core recording".
**Open before coding:** **What is the points-per-place formula?** (See QA-01 in questions doc.) Without the formula M3 cannot compute the value to insert.

### R-M3-02 — Pointscore accumulation per swimmer  [PARTIAL]
**Statement:** A per-swimmer running total of points across all finalized events in a configurable date range (default: current season) must be queryable via API and viewable in UI.
**Source:** Upwork milestone wording "and accumulating".
**Open before coding:** **What is the season window?** (QA-02). **Does accumulation reset per season or continue rolling?** (QA-03). **Does the same date-range slicer apply to individual graphs and reports?** (QA-04).

### R-M3-03 — Constitution-based accumulation rules  [AMBIGUOUS]
**Statement:** The accumulation logic shall reflect the rules defined in the WWSC club constitution.
**Source:** Upwork milestone wording "Accumulate results as defined in the constitution."
**Open before coding:** **Where is the constitution document?** (QA-05). **What specific accumulation rules apply?** (QA-06). Examples we need decided: bonus for breaking PB, attendance points, tie-breakers, eligibility filters by age/gender/category, double-points race types, etc.

### R-M3-04 — Season pointscore standings report (table)  [PARTIAL]
**Statement:** A "Season Pointscore" report screen showing the running standings — swimmer name + accumulated points + (event count, breaker count?) — sortable by points and name.
**Source:** Upwork milestone wording "Generate reports". Bryan 2026-05-23 restatement.
**Open before coding:** **Which additional columns does Bryan expect?** (QA-07). Default we'd propose if forced (and we will NOT proceed without confirmation): Rank, Swimmer, Points, Events Attended, PB Breaks.

### R-M3-05 — Individual swimmer graph: time history trend  [PARTIAL]
**Statement:** A graph view, opened from the Members screen (or per-swimmer report), showing the swimmer's time-trend per stroke/race over time, X-axis dated.
**Source:** Bryan 2026-05-20 inbound. Upwork milestone "Generate reports & graphs".
**Open before coding:** **Which graph types are wanted?** (QA-08). Candidate types we have identified from history-data foundation: (a) per-stroke time-line, (b) PB-progression line, (c) variance-vs-target scatter, (d) attendance heatmap.

### R-M3-06 — Internal reports created by the app  [AMBIGUOUS]
**Statement:** Multiple report screens (beyond breaker / exceeded / pointscore standings) accessible inside the app for review and printing.
**Source:** Bryan 2026-05-23 inbound: "internal reports created by the app".
**Open before coding:** **Which specific reports?** (QA-09). Candidate list inferred from existing data: Season Pointscore (R-M3-04), Per-Swimmer Card, Race-Type Leaderboard, Attendance Report, Time-History Export, Weekly Event Summary.

### R-M3-07 — CSV export of underlying data  [PARTIAL]
**Statement:** Users can export the underlying time-history (and optionally pointscore and member roster) to one or more CSV files for use outside the app.
**Source:** Bryan 2026-05-23 inbound + Dino 2026-05-23 boundary message (CSV is part of M3, not M2).
**Open before coding:** **Single bulk CSV or one CSV per dataset?** (QA-10). **Which columns / which date range?** (QA-11).

### R-M3-08 — Historical record retention policy  [PARTIAL]
**Statement:** Make the history retention behavior explicit — either there is no hard limit, or there is a documented cap with a stated reason.
**Source:** Bryan 2026-05-23 inbound: "Is there a limitation on the historical records that can be kept?"
**Open before coding:** **What policy does Bryan want documented?** (QA-12). Default position we'd propose if forced (and we will NOT proceed without confirmation): no hard cap; performance is paginated.

### R-M3-09 — Print / PDF-friendly report output  [AMBIGUOUS]
**Statement:** Reports should be presentable in a printable form (and possibly downloadable as PDF) so committees can use them off-screen.
**Source:** Implied by Bryan's "internal reports created by the app" wording + the existing print-hide CSS already used for event reports.
**Open before coding:** **Print-friendly only, or PDF download too?** (QA-13).

### R-M3-10 — Pointscore rules transparency in UI  [PARTIAL]
**Statement:** The UI should make it clear, on each ranked screen, which pointscore rule decided the result (similar to v2.8.6 "smallest variance wins" banner). For M3 this means a banner / tooltip on the Season Pointscore and per-swimmer screens explaining the formula in plain English.
**Source:** Internal precedent (v2.8.6 ranking transparency banner). Bryan-prior pattern: he wants the math visible.
**Open before coding:** **Final wording of the rule banner depends on QA-01 / QA-06 answers** (rule formula + constitution rules).

### R-M3-11 — No regression on M1 + M2 surfaces  [KNOWN]
**Statement:** All existing v2.9.0 surfaces (Members, Event Setup, Times Sheet, Heat Builder, Results, Breaker Report, Season Calendar, History modal, Calendar/Event Time History section, relay readout, archive/restore) must continue to work after M3 changes.
**Source:** Standard regression gate enforced by Balerion since v2.8.12.
**Acceptance test:** Re-run the existing E2E (`scripts/e2e-m2-time-history.cjs` 55-case + `scripts/e2e-m2-user-interaction-100.cjs` 100-case) on the M3 branch with 0 FAIL.

### R-M3-12 — Out-of-scope guard (commercial/SaaS)  [KNOWN]
**Statement:** M3 must NOT introduce commercial/SaaS scope: no multi-club hosting, no customer isolation, no role-based access, no separate backups infra, no commercial-deployment scripts, no multi-tenant DB schema.
**Source:** Dino 2026-05-23 outbound: "A commercial hosted version … would need separate planning …". Balerion 2026-05-29 handoff explicit exclusion list.
**Acceptance test:** No code under `src/` touches users/roles/tenants; no changes to `render.yaml` beyond M3-needed env vars; no new DB tables that imply multi-tenant data.

## 4. Out-of-M3 Scope (explicitly excluded)

- Commercial hosted version (multiple clubs sharing one instance).
- Multi-customer / SaaS productization.
- Customer data separation / per-tenant DB isolation.
- Backups, access control, maintenance, server operations beyond the current single-instance Render deploy.
- Separate club-instance deployment tooling.
- Any change to the M1/M2 acceptance criteria.

Source: Dino 2026-05-23 outbound + Balerion 2026-05-29 handoff "Safety Boundaries" section.

## 4a. Cross-Reference — R-M3 ↔ UIT-M3 Test Cases

Every R-M3 requirement is proven by one or more UIT-M3 cases from `docs/tests/M3-USER-INTERACTION-TEST-SPEC-v3.0.0.md`. Below maps the two so Balerion can audit coverage without rereading both documents.

| Requirement | UIT-M3 cases that prove it | Notes |
|---|---|---|
| R-M3-01 Automated pointscore recording | UIT-M3-021, 022, 024, 025, 026, 027, 028, 029, 030 | UIT-M3-021..029 PROVISIONAL — rules from QA-01/QA-05/QA-06 |
| R-M3-02 Pointscore accumulation | UIT-M3-041, 042, 045, 046, 047 | UIT-M3-041 PROVISIONAL — totals depend on QA-01 |
| R-M3-03 Constitution-based accumulation | UIT-M3-071..080 (all PROVISIONAL) | Whole block depends on QA-05/QA-06 |
| R-M3-04 Season standings report | UIT-M3-041, 042, 043, 044, 045, 046, 049, 050 | UIT-M3-044 PROVISIONAL (tie rule from QA-06) |
| R-M3-05 Individual swimmer graph | UIT-M3-001..020 | UIT-M3-001..010 fully proceedable on M2 data; 011..020 viewport / edge cases |
| R-M3-06 Internal reports | UIT-M3-031..040, 061..070 | UIT-M3-035 PROVISIONAL (relay rule from QA-06) |
| R-M3-07 CSV / export | UIT-M3-051..060 | UIT-M3-051, 052 PROVISIONAL (shape from QA-10/QA-11) |
| R-M3-08 History retention policy | (no UIT-M3 case dedicated; policy answer is non-visual) | Documented via QA-12 answer |
| R-M3-09 Print / PDF | UIT-M3-017, 053, 054 | PDF only if QA-13 picks it |
| R-M3-10 Rule transparency banner | UIT-M3-021, 071 | Wording depends on QA-01 + QA-06 |
| R-M3-11 No regression | UIT-M3-091..099 | M1 regression UIT-M3-091..097, M2 regression UIT-M3-098..099 |
| R-M3-12 Out-of-scope guard | (no UIT-M3 case; diff-review gate) | Enforced by Balerion code review |
| (Navigation/Responsiveness/Accessibility cross-cuts) | UIT-M3-081..090, 100 | Required for every M3 screen |

UIT-M3-100 is the final-proof-gate case that audits all 99 prior classifications + the evidence index — it is Balerion's primary acceptance hook.

## 5. Process Compliance

This PRD is the first artifact of V0006 for M3. Subsequent artifacts that will follow (in this exact order) **after Bryan/Dino answers the open questions**:

1. `DEV-CHECKLIST-M3-POINTSCORE-REPORTS.md` (already drafted alongside this PRD; gates per requirement)
2. `M3-QUESTIONS-AND-ASSUMPTIONS-2026-05-29.md` (drafted alongside this PRD)
3. `DESIGN-SPEC-M3-POINTSCORE-REPORTS.md`
4. `UNIT-TEST-SPEC-M3-POINTSCORE-REPORTS.md`
5. `INTEGRATION-TEST-SPEC-M3-POINTSCORE-REPORTS.md`
6. `USER-INTERACTION-TEST-SPEC-M3-POINTSCORE-REPORTS.md`
7. Implementation under a `dev/v2.10.0-m3-*` feature branch after V0014 version bump.
8. Evidence package (runners, screenshots, raw logs).
9. SSOT closure (CHANGELOG / CURRENT_STATE / PROGRESS / STABLE).
10. Claude → Balerion delivery handoff.

## 6. Required Decisions Before Coding Starts

The following questions block coding of the corresponding requirements. They are itemized in `M3-QUESTIONS-AND-ASSUMPTIONS-2026-05-29.md`:

- QA-01 Pointscore formula (blocks R-M3-01, R-M3-10)
- QA-02 Season window definition (blocks R-M3-02, R-M3-04)
- QA-03 Season reset vs rolling (blocks R-M3-02)
- QA-04 Date-range slicer scope (blocks R-M3-04, R-M3-05, R-M3-07)
- QA-05 Constitution document location (blocks R-M3-03)
- QA-06 Constitution accumulation rules (blocks R-M3-03)
- QA-07 Season standings columns (blocks R-M3-04)
- QA-08 Graph types catalogue (blocks R-M3-05)
- QA-09 Required reports list (blocks R-M3-06)
- QA-10 CSV export shape (blocks R-M3-07)
- QA-11 CSV columns/date-range (blocks R-M3-07)
- QA-12 History retention policy (blocks R-M3-08, can be answered without coding)
- QA-13 Print vs PDF (blocks R-M3-09)

KNOWN requirements that CAN start work as soon as the design spec is drafted (no Bryan-blocking):

- R-M3-11 (regression gate — already a re-run of existing M2 suites)
- R-M3-12 (out-of-scope guard — code-review-level)
- R-M3-08 (history retention policy — documentation-only answer)

> Until at least QA-01 / QA-05 / QA-06 are answered, the central M3 pointscore + constitution code path cannot be implemented. We will not guess these rules; we will return them as open questions per Balerion's instruction "If you encounter ambiguity in pointscore rules, constitution accumulation, reports, graph definitions, export behavior, or production/commercial boundaries, stop that part and report the question instead of guessing."
