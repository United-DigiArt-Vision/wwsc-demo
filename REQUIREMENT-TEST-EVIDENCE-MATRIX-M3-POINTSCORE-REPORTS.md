# REQUIREMENT → TEST → EVIDENCE MATRIX — M3 Pointscore / Reports

**Version:** v2.10.0 (M3 pointscore slice)
**Branch:** `dev/v2.10.0-m3-history-graphs`
**Date:** 2026-06-03
**Working assumptions:** Bryan 2026-06-02 — event-separated points; monthly/season overall winners by simple addition; Excel pointscore sheets as the working scoring source; separate Constitution adjustable later (not confirmed).

Evidence paths are relative to `code/`. Evidence directory: `docs/evidence/m3-user-interaction-v3.0.1/` (browser run + CSVs), `docs/evidence/m3-pointscore/` (Excel extraction), `docs/screenshots/m3-user-interaction-v3.0.1/` (62 screenshots).

## A. Directive implementation scope → evidence

| # | Directive scope item | Implementation | Test(s) | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Excel-derived scoring source extraction | `scripts/extract-pointscore.py` → source-labeled rule artifact | UIT-M3-011..020 | `docs/evidence/m3-pointscore/POINTSCORE-RULE-SOURCE-2026-06-03.md`, `pointscore-extract-raw.json`, `pointscore-distribution-summary.json` | DONE |
| 2 | Isolated scoring engine | `src/pointscore.js` (reads accepted data, writes only `pointscore_entry`) | UT1, UT2; isolation proof; UIT-M3-045..049 | `pointscore-unit-results.json`, `pointscore-isolation-proof.json` | DONE |
| 3 | Pointscore persistence (idempotent) | `writeEventPointscore` DELETE+aggregate+INSERT in finalize txn; existing `pointscore_entry` table, no schema change | UT3, UT4; UIT-M3-041..044 | `pointscore-unit-results.json`, `m3-pointscore-120-records.json` | DONE |
| 4 | Event-separated pointscore UI/API | `GET /api/events/:id/pointscore` + Per-Event tab | UT2; UIT-M3-023, 037..040 | screenshots `UIT-M3-023/037/038/039/040` | DONE |
| 5 | Monthly + season totals (simple addition) | `GET /api/pointscore/month/:ym`, `/season/:year` + Monthly/Season tabs | UT5, UT6; UIT-M3-050..070 | `monthly-2026-05.csv`, `season-2026.csv`, screenshots `UIT-M3-050..070` | DONE |
| 6 | Reports / exports (CSV, print) | Four-tab Pointscore screen + `/csv` routes + print CSS | UIT-M3-071..090 | `event-pointscore.csv`, `monthly-2026-05.csv`, `season-2026.csv`, `time-history.csv`, screenshots | DONE |
| 7 | Rule transparency | Rule banner + `GET /api/pointscore/rules` | UT1-rule-source-labeled; UIT-M3-021, 022 | screenshots `UIT-M3-021/022` | DONE |
| 8 | No regression (M1/M2 + R-M3-05) | additive finalize hook only; `#content`-scoped leakage scan | UIT-M3-101..112, 091..100; M2 55+100; history-graphs 20 | M2 runner logs, history-graphs log, screenshots `UIT-M3-091..110` | DONE |

## B. R-M3-01 .. R-M3-12 → test → evidence

| Req | Title | This-slice status | Test(s) | Evidence |
|---|---|---|---|---|
| R-M3-01 | Automated pointscore recording per event race | DONE (working assumption) | UT1, UT2, UT3, UT4; UIT-M3-023..044 | `pointscore-unit-results.json`, screenshots, `event-pointscore.csv` |
| R-M3-02 | Pointscore accumulation per swimmer | DONE | UT7; UIT-M3-055, 067, 075 | `pointscore-unit-results.json`, swimmer-card screenshots |
| R-M3-03 | Constitution-based accumulation rules | DEFERRED (blocked on Bryan Constitution; engine adjustable) | — | `DESIGN-SPEC-M3-POINTSCORE-REPORTS.md §7`, rule banner discloses "not confirmed Constitution" |
| R-M3-04 | Season/monthly standings report | DONE | UT5, UT6, UT8; UIT-M3-050..070 | `monthly-2026-05.csv`, `season-2026.csv`, screenshots |
| R-M3-05 | Individual swimmer graph | DONE (accepted PASS, protected) | UIT-M3-091..100; `e2e-m3-history-graphs.cjs` (20) | history-graphs log, screenshots `UIT-M3-091..098` |
| R-M3-06 | Internal reports | DONE (pointscore reports); improvement/attendance deferred as documented N/A | UIT-M3-071..080 | report screenshots |
| R-M3-07 | CSV export | DONE (event/month/season/time-history) | UIT-M3-081..090 | 4 CSV artifacts + hashes in handoff |
| R-M3-08 | History retention policy | DOCUMENTED (no code change) | — | `docs/M3-HISTORY-RETENTION-POLICY.md` |
| R-M3-09 | Print-friendly report output | DONE (print CSS); PDF not chosen | UIT-M3-059, 070, 099 | print screenshots |
| R-M3-10 | Pointscore rules transparency banner | DONE | UT1-rule-source-labeled; UIT-M3-021, 022 | banner screenshots |
| R-M3-11 | No regression on M1 + M2 | DONE | UIT-M3-101..112; M2 55 + 100; isolation proof | M2 logs, `pointscore-isolation-proof.json` |
| R-M3-12 | Out-of-scope guard (commercial/SaaS) | DONE | UIT-M3-118; diff review | `out-of-scope-diff.txt` |

## C. Mandatory automated/evidence checks (directive §"Mandatory Automated / Evidence Checks") → status

| Check | Target | Evidence |
|---|---|---|
| Unit/API: formula extraction, allocation, idempotency, monthly, season, unknown-race_type | 12 PASS / 0 FAIL | `pointscore-unit-results.json` |
| Browser E2E for all visible report/pointscore flows | 114 PASS / 6 NA / 0 FAIL / 0 BLOCKED | `m3-pointscore-120-raw.log`, `m3-pointscore-120-records.json`, 64 screenshots |
| `e2e-m2-time-history.cjs` (M3 expected version) | 55 PASS / 0 FAIL | M2 55 log |
| `e2e-m2-user-interaction-100.cjs` (M3 expected version) | 98 PASS / 2 NA / 0 FAIL / 0 BLOCKED | M2 100 log |
| `e2e-m3-history-graphs.cjs` | 19 PASS / 1 NA / 0 FAIL | history-graphs log |
| Pointscore isolation proof (disabled vs enabled) | byte-identical accepted flow; pointscore only when enabled | `pointscore-isolation-proof.json` |
| Console/page-error capture (full browser run) | 0 console errors | `m3-pointscore-120-raw.log` (UIT-M3-120) |
| Screenshot manifest | 62 PNGs | `docs/screenshots/m3-user-interaction-v3.0.1/` + handoff manifest |
| Requirement→test→evidence matrix | this document | this file |

## Determinism note

Per-swimmer point *values* shown in screenshots/JSON reflect the run that produced them; the accepted v2.8.9 randomized heat builder varies which swimmer lands in which lane, so attribution is not byte-stable across runs while the points multiset and every structural invariant are. All assertions are invariants, so an independent re-run reproduces the same PASS/FAIL verdict. See `UNIT-TEST-SPEC-M3-POINTSCORE-REPORTS.md` → "Determinism boundary".
