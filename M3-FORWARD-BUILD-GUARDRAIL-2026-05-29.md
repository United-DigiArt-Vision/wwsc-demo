# M3 Forward-Build Guardrail — Required Lists Before Further Implementation

**Date:** 2026-05-29
**Author:** Claude Code
**Trigger:** Balerion `2026-05-29-2147-Balerion-To-Claude-WWSC-M3-Accepted-Logic-Guardrail-And-Next-Scope.md`. R-M3-05 accepted as PASS; before any further M3 implementation, Balerion requires four explicit lists. This document is the answer. **No code is changed by this document.**

Baseline protected: M1 + M2 + v2.9.0 accepted behavior. M3 builds forward only.

---

## List 1 — Protected existing flows that MUST NOT change

These are accepted by Bryan across M1, M2 and v2.9.0. They are a frozen baseline. M3 code must not edit, rewrite, reinterpret, or regress any of them. File references are the authoritative locations.

| # | Protected flow | Authoritative location | Why protected |
|---|----------------|------------------------|---------------|
| P1 | Member DB CRUD + CSV import | `src/server.js` `/api/members*`; `src/public/js/screens/members.js` | M1 accepted |
| P2 | Event setup / config / attendance (incl. "≥3 swimmers" gate) | `src/server.js` `/api/events*`, `/api/events/:id/config`, `/api/events/:id/attendance` | M1 accepted |
| P3 | Heat generation + handicap distribution | `src/server.js` `generate-heats`, `distributeRoundRobin`, `BASE_OFFSET` | M1 accepted |
| P4 | Race-time entry math: `variance = net_time − pbCs` | `src/server.js:660` | M1 accepted — **do not touch** |
| P5 | Breaker threshold: 25m break ≥ 0.50s, others ≥ 1.00s | `src/server.js` `isBreakForRaceType` / `getBreakThresholdCsForRaceType` (v2.8.12) | M1 polish accepted — **do not touch** |
| P6 | Ranking: place / manual_place; smallest-absolute-variance wins for Brace/Medley/Pogo; fastest total_time for 25m Team Relay | `src/server.js` rank + `rank-relay`; `results.js` | M1/M2 accepted — **do not touch** |
| P7 | Relay team generation + per-team variance readout | `src/server.js` relay endpoints; `heat-builder.js`, `results.js`, `relays.js` | M1/M2 accepted |
| P8 | `time_history` write path at finalize (DELETE-then-INSERT, idempotent, individual lanes only) | `src/server.js:718` `/api/events/:eventId/finalize` | M2 accepted — **the pointscore write path must NOT alter this** |
| P9 | M2 time-history read APIs + `event_date` enrichment | `src/server.js` `/api/events/:eventId/time-history`, `/api/members/:memberId/time-history` | M2 accepted |
| P10 | M2 UI: Members History modal + Calendar event Time History section | `members.js` `showMemberHistoryModal`, `calendar.js` | M2 accepted |
| P11 | M3 R-M3-05 history graphs (just accepted) | `src/public/js/screens/member-graph.js` | Accepted 2026-05-29 — protected from here on |
| P12 | Archive / restore | `src/server.js` `/api/events/:id/archive`, `/restore`; `calendar.js` | M1 accepted |
| P13 | Persistence (`WWSC_DB_PATH`), backup helper, Render config | `src/db.js`, `render.yaml` | v2.8.12 accepted — **commercial/SaaS still out of scope** |

**Hard rule:** the pointscore write path (if built) is appended to the finalize transaction in a way that is *purely additive* — it reads the already-computed `heat_lane` rows and writes only to `pointscore_entry`. It must not modify P4, P5, P6, or P8.

## List 2 — Proposed new M3 changes I intend to make (only where source + scope are clear)

Sequenced; each item is gated by the open questions in List 3. Nothing here starts until the gating answer lands.

| # | Proposed change | New surface (isolated) | Gating question |
|---|-----------------|------------------------|-----------------|
| N1 | Pointscore **write path**: at finalize, compute per-place points per finished individual lane (and relay team) and INSERT into the existing-but-empty `pointscore_entry` table. Implemented as an *additive* step after the existing time_history write, in its own helper, never touching P4/P6/P8. | `src/server.js` new `writePointscore(eventId)` helper + call appended inside the finalize transaction | QA-01 (formula) |
| N2 | Per-member pointscore accumulation read API | `GET /api/members/:memberId/pointscore` (new endpoint, read-only) | QA-01 + QA-02 (season window) |
| N3 | Season pointscore standings report | new "Reports" / "Pointscore" screen, read-only | QA-01 + QA-02 + QA-07 (columns) |
| N4 | Accumulation views (per-stroke pointscore breakdown, mirroring the Excel's per-race "X Point score" sheets) | read-only report screens | QA-01 + QA-06 |
| N5 | CSV export of time-history / pointscore / members | new export controls (download endpoints) | QA-10 + QA-11 |
| N6 | Reports nav entry + date/season filter shared across reports | nav + filter component | QA-04 + QA-09 |
| N7 | Pointscore rule-transparency banner (plain-English formula on each ranked screen) | banner on N3/N4 | QA-01 + QA-06 |

**Isolation guarantee for N1:** the write path will be proven by a regression test (List 4, R5) that finalizes an event *with* and *without* the pointscore step and asserts byte-identical `time_history`, `heat_lane.variance`, `heat_lane.is_break`, and ranking output. If the assertion fails, the write path is rejected.

## List 3 — Unresolved Bryan questions (must be answered before the gated items)

Carried from `M3-QUESTIONS-AND-ASSUMPTIONS-2026-05-29.md`, now sharpened with the Excel finding.

**New evidence found (candidate, source-labeled — NOT confirmed):** `bryan-excel-original.xlsm` contains dedicated pointscore sheets:
`Event Times & Pointscores`, `25m Point score`, `50m Point score`, `75m Point score`, `Relay Point score`, `Backstroke Pointscore`, `Breaststroke Pointscore`, `Butterfly Pointscore`, `25m Brace Pointscore`, `50m Brace Pointscore`, `Medley Relay Pointscore`, `Total Pointscore`, plus `Total Improvement` and `Attendance`.

This is a strong candidate basis for the pointscore layer, but per Balerion's guardrail I will NOT treat the Excel as authoritative until Bryan confirms it. The questions below are framed so Dino can put them to Bryan precisely.

| QA | Sharpened question for Bryan | Gates |
|----|------------------------------|-------|
| QA-01 | Your spreadsheet has per-race "Point score" sheets. **Are the points-per-place values in those sheets the official pointscore formula we should implement?** If yes, confirm the points for 1st/2nd/3rd/participation per race type. If the formula differs from the sheet, give the correct one. | N1, N2, N3, N4, N7 |
| QA-01b | Is there a **PB-break bonus** and/or an **attendance point** in the pointscore? The Excel has `Total Improvement` and `Attendance` sheets — do these feed the Total Pointscore? | N1, N4 |
| QA-02 | What is a **season** for accumulation — calendar year, club season, or a custom date range? | N2, N3 |
| QA-03 | Do season totals **reset** each season or roll over? | N2 |
| QA-05 | **Is the WWSC Constitution = the rules encoded in this spreadsheet?** Or is there a separate Constitution document we must follow? | N4 (constitution accumulation), still BLOCKED |
| QA-06 | If the Constitution is separate: please provide it. Which accumulation rules (tie-breakers, eligibility, weighting, carry-over) apply? | N4, still BLOCKED |
| QA-07 | Which columns do you want in the **Season Pointscore standings** screen? | N3 |
| QA-09 | Beyond season standings, which **specific reports** do you need? (The Excel implies per-race pointscore + total + improvement + attendance.) | N4, N6 |
| QA-10 / QA-11 | **CSV export:** which datasets, which columns, one file or several? | N5 |
| QA-13 | Reports: print-friendly only, or PDF download too? | (R-M3-09) |

**Critical blockers:** QA-01 and QA-05/QA-06. Until QA-01 is answered, N1 (the pointscore write path) cannot be implemented correctly; until QA-05/06, constitution accumulation (N4 constitution part) stays blocked.

## List 4 — Regression tests that will prove accepted behavior did not break

Every M3 implementation branch must pass ALL of these before any "ready for QA" claim.

| # | Regression proof | Command | Expected (baseline) |
|---|------------------|---------|---------------------|
| R1 | M2 time-history E2E (55 cases) | `WWSC_E2E_EXPECTED_VERSION=<ver> node scripts/e2e-m2-time-history.cjs` | 55 PASS / 0 FAIL |
| R2 | M2 100-case user-interaction | `WWSC_E2E_EXPECTED_VERSION=<ver> node scripts/e2e-m2-user-interaction-100.cjs` | 98 PASS / 2 NA / 0 FAIL |
| R3 | M3 R-M3-05 history graphs (20 cases) | `WWSC_E2E_EXPECTED_VERSION=<ver> node scripts/e2e-m3-history-graphs.cjs` | 19 PASS / 1 NA / 0 FAIL |
| R4 | Out-of-scope guard | `git diff main..HEAD` review | no SaaS/tenant/access-control; server/db only where N1 needs it, isolated |
| R5 | **Pointscore isolation proof (new, for N1):** finalize a fixture event twice — once on a build with the pointscore write path, once with it disabled via a flag — and assert byte-identical `time_history` rows, `heat_lane.variance`, `heat_lane.is_break`, breaker output, and ranking/place output. | new `scripts/e2e-m3-pointscore-isolation.cjs` | identical accepted-flow output in both runs; pointscore rows present only in the enabled run |
| R6 | Breaker-threshold guard | assert 25m 0.50s break / 0.49s no-break still holds after M3 changes | unchanged from v2.8.12 |

R5 is the central guarantee Balerion asked for: it mechanically proves the new pointscore layer is isolated from accepted race logic (P4/P5/P6/P8).

---

## What happens next

1. Balerion reviews these four lists.
2. Dino relays QA-01 (+ QA-01b) and QA-05/06 to Bryan — ideally asking directly whether the spreadsheet's "Point score" sheets are the official formula and whether the spreadsheet is the Constitution.
3. On QA-01 answer → I implement N1 (pointscore write path) behind R5's isolation proof, then N2/N3.
4. Constitution-dependent work (N4 constitution part) stays blocked until QA-05/06.
5. No push / deploy / tag / Bryan contact / live-data mutation at any point without explicit authorization.

Until the answers land, I implement nothing new in the pointscore/constitution scope. The only safe forward work without Bryan input is non-pointscore reporting polish, which I will not start unilaterally either — I will wait for Balerion's go per item.
