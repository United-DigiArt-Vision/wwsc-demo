# USER INTERACTION COVERAGE MATRIX — M2 Time History (Full Proof)

**Version:** v2.9.0
**Branch:** `dev/v2.9.0-m2-time-history`
**Date:** 2026-05-18 (full-proof rerun)
**Source of truth:** `docs/evidence/m2-time-history-run.log` (55 PASS records)

Legend:
- ✅ **PROVEN** — recorded PASS line in the run log + browser/API evidence (or, for `UT-M2-04-*`/`UT-M2-05-*`, code-level run of the real format helpers / server-route audit).
- 🟡 **PROVEN by reuse** — covered by another verified case from the same run, evidence cited.
- ❌ **NOT PROVEN** — none in this run.
- ➖ **NOT APPLICABLE** — none in this run.

## Requirement → Case Matrix

| Requirement | Acceptance | Verifying cases | Verdict |
|---|---|---|---|
| R-M2-01 Record Time Changes | Finalize creates one history row per individual lane; re-finalize does not duplicate; v2.8.12 breaker behavior intact. | `UT-M2-03-1`, `UT-M2-03-2`, `UT-M2-03-3`, `UI-M2-D01`, `UI-M2-D02`, `UI-M2-D03`, `UI-M2-F05` (breaker screen renders), `UI-M2-F06-*` (relay non-individual paths unchanged) | ✅ |
| R-M2-02 Preserve Dates | API exposes `event_date`; UI shows it; same swimmer+stroke distinguishable by date. | `UT-M2-01-1`, `UT-M2-01-2`, `UT-M2-02-2`, `UI-M2-A04`, `UI-M2-B03`, `UI-M2-E04` | ✅ |
| R-M2-03 Per-Swimmer Timeline | Member context exposes timeline; sorted newest-first; date/stroke/time/previous-best/break marker visible. | `UT-M2-02-1`, `UT-M2-02-2`, `UT-M2-02-3`, `UT-M2-02-4`, `UI-M2-A01..A06`, `UI-M2-E01..E04` | ✅ |
| R-M2-04 Week-by-week / Dated Review | Calendar/event detail exposes dated time history; weekly events stay separable; surviving browser refresh / server restart with same DB. | `UI-M2-B01..B04`, `UI-M2-C01` (visible right after finalize), `UI-M2-C02` (no refresh), `UI-M2-C03` (refresh), `UI-M2-C04` (cross-process restart) | ✅ |
| R-M2-05 No Regression | Members, event setup, heat builder, results, breakers, relays, calendar/archive smoke green; no M3 surface in M2 UI. | `UI-M2-F-dashboard`, `UI-M2-F01..F09`, `UI-M2-F06-relay25/medley/members/variance`, `UI-M2-F08-archive/restore`, `UI-M2-G01..G03` | ✅ |

## Spec → Case Matrix

### Unit Test Spec (`UNIT-TEST-SPEC-M2-TIME-HISTORY.md`)

| Spec Case | Verifying case | Verdict |
|---|---|---|
| UT-M2-01-1 row has `event_date` | UT-M2-01-1 | ✅ |
| UT-M2-01-2 row includes member_name/stroke/time/previous_best/is_break | UT-M2-01-2 | ✅ |
| UT-M2-01-3 empty event returns `[]` | UT-M2-01-3 | ✅ |
| UT-M2-02-1 known member returns own rows | UT-M2-02-1 | ✅ |
| UT-M2-02-2 newest date first | UT-M2-02-2 | ✅ |
| UT-M2-02-3 unknown member → 404 | UT-M2-02-3 | ✅ |
| UT-M2-02-4 member without history → `[]` | UT-M2-02-4 | ✅ |
| UT-M2-03-1 first finalize creates N rows | UT-M2-03-1 | ✅ |
| UT-M2-03-2 re-finalize stays at N rows | UT-M2-03-2 | ✅ |
| UT-M2-03-3 changed time replaces row | UT-M2-03-3 | ✅ |
| UT-M2-04-1 centisecond rendering (1325 → 13.25) | UT-M2-04-1 + UI-M2-E01 | ✅ |
| UT-M2-04-2 whole-second PB never renders as 0.X | UT-M2-04-2 + UI-M2-E02 | ✅ |
| UT-M2-04-3 null previous_best renders as dash | UT-M2-04-3 + UI-M2-A05 | ✅ |
| UT-M2-05-1 no Pointscore writes during M2 flow | `UI-M2-G01` scan + server-route audit (only one new endpoint shipped) | ✅ |
| UT-M2-05-2 no new reports/graphs/constitution endpoints | server-route audit | ✅ |

### Integration Test Spec (`INTEGRATION-TEST-SPEC-M2-TIME-HISTORY.md`)

| IT case | Verifying case | Verdict |
|---|---|---|
| IT-M2-01 Finalize creates dated history | `UT-M2-01-1` + `UT-M2-01-2` + `UI-M2-B01..B03` | ✅ |
| IT-M2-02 Member timeline | `UT-M2-02-1..4`, `UI-M2-A01..A06` | ✅ |
| IT-M2-03 Week-by-week review | `UI-M2-B04`, `UI-M2-A04`, `UI-M2-E04` | ✅ |
| IT-M2-04 Re-finalize idempotent | `UT-M2-03-1..3`, `UI-M2-D01`, `UI-M2-D02` | ✅ |
| IT-M2-05 M1 regression smoke | `UI-M2-F-dashboard`, `UI-M2-F01..F07`, `UI-M2-F06-relay25/medley/members/variance`, `UI-M2-F08-archive/restore`, `UI-M2-F09` | ✅ |
| IT-M2-06 No M3 leakage | `UI-M2-G01..G03` + server-route audit | ✅ |

### User Interaction Spec (`USER-INTERACTION-TEST-SPEC-M2-TIME-HISTORY.md`)

| UI case | Verifying case | Verdict |
|---|---|---|
| UI-M2-A01 History action per swimmer | `UI-M2-A01` (24 buttons rendered) | ✅ |
| UI-M2-A02 modal opens with rows | `UI-M2-A02` | ✅ |
| UI-M2-A03 columns date/stroke/time/pb/break | `UI-M2-A03` (PB Break chip visible) | ✅ |
| UI-M2-A04 multi-date newest first | `UI-M2-A04` | ✅ |
| UI-M2-A05 empty state | `UI-M2-A05` | ✅ |
| UI-M2-A06 close returns to members | `UI-M2-A06` | ✅ |
| UI-M2-B01 event detail exposes history | `UI-M2-B01` | ✅ |
| UI-M2-B02 only this event's rows | `UI-M2-B02` | ✅ |
| UI-M2-B03 date visible | `UI-M2-B03` | ✅ |
| UI-M2-B04 two events separated by date | `UI-M2-B04` | ✅ |
| UI-M2-C01 create+enter+finalize+view | `UI-M2-C01` (ev5 = 2026-04-26, 23 rows after finalize) | ✅ |
| UI-M2-C02 visible without refresh | `UI-M2-C02` (same page instance) | ✅ |
| UI-M2-C03 visible after browser refresh | `UI-M2-C03` | ✅ |
| UI-M2-C04 visible after server restart (same DB) | `UI-M2-C04` — cross-process restart, 5 dated rows persisted | ✅ |
| UI-M2-D01 re-finalize no duplicate rows | `UI-M2-D01` | ✅ |
| UI-M2-D02 changed-time re-finalize replaces | `UI-M2-D02` — member-history cell shows `11.00` after re-finalize | ✅ |
| UI-M2-D03 break marker consistent | `UI-M2-D03` — 🏆 in member modal + same swimmer on Breaker Report | ✅ |
| UI-M2-E01 centisecond display | `UI-M2-E01` (`15.50` from rendered cell) | ✅ |
| UI-M2-E02 whole-second PB display | `UI-M2-E02` (`16.00` from rendered cell, never `0.16`) | ✅ |
| UI-M2-E03 missing previous-best dash | `UT-M2-04-3` + `UI-M2-A05` empty-state | ✅ |
| UI-M2-E04 readable date | `UI-M2-E04` (`Sun, 26 Apr 2026`) | ✅ |
| UI-M2-F01 Members renders | `UI-M2-F01` | ✅ |
| UI-M2-F02 Event setup renders | `UI-M2-F02` | ✅ |
| UI-M2-F03 Heat builder renders | `UI-M2-F03` | ✅ |
| UI-M2-F04 Results renders | `UI-M2-F04` | ✅ |
| UI-M2-F05 Breaker report renders | `UI-M2-F05` | ✅ |
| UI-M2-F06 Relay results | `UI-M2-F06-relay25`, `UI-M2-F06-medley`, `UI-M2-F06-members`, `UI-M2-F06-variance` | ✅ |
| UI-M2-F07 Calendar renders | `UI-M2-F07` | ✅ |
| UI-M2-F08 Archive / restore | `UI-M2-F08-archive` (count 0→1) + `UI-M2-F08-restore` (count 1→0) | ✅ |
| UI-M2-F09 0 console errors | `UI-M2-F09` | ✅ |
| UI-M2-G01 No Pointscore screen | `UI-M2-G01` | ✅ |
| UI-M2-G02 No accumulated season totals | `UI-M2-G02` (subset of G01 banned-string set) | ✅ |
| UI-M2-G03 No reports/graphs/constitution UI | `UI-M2-G03` (subset of G01 banned-string set) | ✅ |

## Totals

- **55 PASS** directly recorded in `docs/evidence/m2-time-history-run.log`
- **0** NOT PROVEN
- **0** NOT APPLICABLE
- **0** carry-overs to V0015 manual smoke (Balerion's `M2-Full-Proof-Required` brief closed in full)

Every M2 acceptance criterion is met under executable, reproducible evidence. The runner is self-contained, bootstrap-driven (`scripts/setup-m2-harness.sh`), and re-runs cleanly on a fresh harness.
