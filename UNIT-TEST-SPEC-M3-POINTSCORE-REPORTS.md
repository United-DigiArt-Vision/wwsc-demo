# UNIT TEST SPEC — M3 Pointscore / Reports

**Version:** v2.10.0 (M3 pointscore slice)
**Branch:** `dev/v2.10.0-m3-history-graphs`
**Date:** 2026-06-03
**Status:** Implemented and passing. Working assumptions per Bryan 2026-06-02 (event-separated; monthly/season by simple addition; Excel pointscore sheets as working source; adjustable later — not a confirmed Constitution).
**Runner:** `scripts/test-m3-pointscore-unit.cjs` (spins an isolated server on PORT=3010 with a fresh DB, asserts via the public API, writes `docs/evidence/m3-user-interaction-v3.0.1/pointscore-unit-results.json`).

## Scope

Unit / API-level proof of the isolated scoring engine `src/pointscore.js` and the read APIs in `src/server.js`. No browser. Covers: rule configuration, point allocation per place, re-finalize idempotency, monthly addition, season addition, per-swimmer contribution detail, month listing, and the unknown-member error path.

## Determinism boundary (read first)

Every assertion below is a **structural invariant** (an equality between a total and the sum of its parts, an idempotency count, or a relational property), so each test is fully reproducible as PASS/FAIL. The **specific point value attributed to a specific swimmer is not byte-stable across runs**: fixtures set finish times deterministically per lane, but heat lane assignment uses the accepted v2.8.9 randomized heat builder (`src/server.js` `Math.random()` in `generate-heats`), so *which* swimmer lands in the fastest lane — and therefore who takes place 1 / 5 points — varies run to run. The multiset of points awarded per race (one 5, one 4, one 3, the rest 2s) is stable; the per-member attribution is not. This is by design and must not be "fixed" by changing accepted M1 randomness. Tests therefore assert invariants, never hard-coded per-member numbers.

## Test cases

| Test ID | Target | Method | Expected | Maps to |
|---|---|---|---|---|
| UT1-rule-individual | `GET /api/pointscore/rules` → `categories.individual` | Assert `pointsByPlace` = `{1:5, 2:4, 3:3}` and `finisherPoints = 2` | Individual 5/4/3/2 working rule | R-M3-01, R-M3-10 |
| UT1-rule-relay | `GET /api/pointscore/rules` → `categories.relay` | Assert `pointsByPlace` = `{1:5, 2:4, 3:3}` | Relay/team 5/4/3 (Bryan-confirmed 2026-06-05) | R-M3-01, R-M3-10 |
| UT1-rule-source-labeled | `GET /api/pointscore/rules` → `source`, `aggregation` | Assert `source` matches /working assumption/i and `aggregation` matches /simple addition/i | Source-labeled, not confirmed Constitution | R-M3-10 |
| UT2-points-allocated | Finalize a 25m event → `GET /api/events/:id/pointscore` | Rows contain a 5, a 3, and a 2; every row `points > 0` (no zero rows) | Place 1→5, 3→3, finisher→2 | R-M3-01 |
| UT3-idempotent | Re-finalize the unchanged event | Row count after == row count before, and `> 0` | Re-finalize creates no duplicates | R-M3-01 |
| UT4-no-dup-after-change | Change a finish time, re-rank, re-finalize | Row count unchanged (replace, not append) | Idempotent under data change | R-M3-01 |
| UT5-monthly-addition | Finalize a 2nd event same month → `GET /api/pointscore/month/:ym` | For every standing, `monthly.total == event1.total + event2.total`; `events.length == 2` | Monthly winners = simple addition | R-M3-04 |
| UT6-season-addition | Finalize a 3rd event (later month, same year) → `GET /api/pointscore/season/:year` | For every standing, `season.total == sum of the 3 event totals`; `events.length == 3` | Season winners = simple addition | R-M3-04 |
| UT7-member-contribution | `GET /api/members/:id/pointscore` | `total == sum(contributions[].points)` and `contributions.length > 0` | Per-swimmer contribution detail is internally consistent | R-M3-02 |
| UT8-months-list | `GET /api/pointscore/months` | Includes `2026-04` and `2026-05` (the seeded months) | Month picker source | R-M3-04 |
| UT8-unknown-member-404 | `GET /api/members/999999/pointscore` | Throws → response status 404 | Unknown-member error path | R-M3-02 |
| UT9-unknown-racetype-individual | `computeEventPointscoreRows` on an in-memory DB with race_type `mystery_stroke` | Unknown type resolves to `individual`; one finished lane at place 1 → `points = 5`, `basis = individual-place` (NOT relay) | Unknown race_type defaults to individual (defensive) | R-M3-01 |
| UT10-racetype-categorization | `categoryForRaceType` for all relay + individual race_types | Relay types (incl. `25m_brace`/`50m_brace`/`pogo`) resolve to `relay`; strokes resolve to `individual` | Relay incl brace/pogo → relay 5/4/3; strokes → individual 5/4/3/2 | R-M3-01 |
| UT11-relay-team-543 | In-memory relay event, 3 teams placed 1/2/3 → `computeEventPointscoreRows` | Team place 1→5, 2→4, 3→3; every row `basis = relay-team-place` | Relay/team exact 5/4/3 (Bryan-confirmed 2026-06-05) | R-M3-01 |
| UT12-relay-aggregation-api | Finalize a relay-only event → event / month / season pointscore | Relay event totals feed monthly + season standings; rows include a 5 and a 4 (and a 3 when ≥3 teams) | Relay events roll into month/season aggregation | R-M3-04 |

## Isolation unit assertions (engine purity)

Realized by `scripts/e2e-m3-pointscore-isolation.cjs` (documented in full in the Integration spec, summarized here because the proof is engine-level):

- With `WWSC_POINTSCORE_DISABLED=1`, `writeEventPointscore` is a no-op (0 `pointscore_entry` rows).
- With the flag off, `pointscore_entry` rows are written and **every accepted-flow output is byte-identical** to the disabled run: `time_history` rows, `heat_lane` variance / `is_break` / `net_time` / `place`, breaker report, ranking. Pointscore rows exist **only** in the enabled run.

## Expected result

`15 PASS / 0 FAIL` (unit, incl. UT9 unknown-race_type, UT10 categorization, UT11 relay 5/4/3, UT12 relay aggregation) plus isolation `VERDICT: PASS`. First-hand reproduced on 2026-06-05 (v2.10.2 relay/team 5/4/3 correction).

> UT9 guards the regression Balerion's QA found: `computeEventPointscoreRows` branched on `raceTypes.includes(race_type)`, which routed an unknown type into the relay path even though `categoryForRaceType()` resolves it to `individual`. The fix branches on the resolved `categoryKey`.

## What is intentionally not unit-tested here

- Constitution-specific accumulation, PB-break bonus, attendance points — out of the working-assumption scope; the engine is structured so these become config/strategy additions (see `DESIGN-SPEC-M3-POINTSCORE-REPORTS.md` §7).
- Visual rendering, responsiveness, print, CSV download UX — covered by the browser layer (see `INTEGRATION-TEST-SPEC-M3-POINTSCORE-REPORTS.md` and `USER-INTERACTION-TEST-SPEC-M3-POINTSCORE-REPORTS-v3.0.1.md`).
