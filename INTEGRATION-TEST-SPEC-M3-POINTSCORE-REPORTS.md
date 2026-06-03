# INTEGRATION TEST SPEC — M3 Pointscore / Reports

**Version:** v2.10.0 (M3 pointscore slice)
**Branch:** `dev/v2.10.0-m3-history-graphs`
**Date:** 2026-06-03
**Status:** Implemented and passing. Working assumptions per Bryan 2026-06-02 (event-separated; monthly/season by simple addition; Excel pointscore sheets as working source; adjustable later — not a confirmed Constitution).

## Scope

End-to-end proof across the real stack (HTTP server + SQLite + scoring engine + read APIs + browser UI). Three layers:

1. **Scripted server+DB integration** — `scripts/test-m3-pointscore-unit.cjs` and `scripts/e2e-m3-pointscore-isolation.cjs` (multi-component flows, no browser).
2. **Browser user-interaction suite** — `scripts/e2e-m3-pointscore-120.cjs` implements the mandatory 120-case spec `USER-INTERACTION-TEST-SPEC-M3-POINTSCORE-REPORTS-v3.0.1.md` via real Chrome (puppeteer-core), isolated server PORT=3011, fresh DB.
3. **Regression suites** — `scripts/e2e-m2-time-history.cjs` (55), `scripts/e2e-m2-user-interaction-100.cjs` (100), `scripts/e2e-m3-history-graphs.cjs` (20), all re-run on the M3 branch with `WWSC_E2E_EXPECTED_VERSION=2.10.0`.

All runners spin their own isolated server on a dedicated port with a `/tmp` DB and never touch the working DB, origin, deploy targets, or client data.

## IT-1 — Finalize → pointscore persistence pipeline

- **Flow:** create event → config → attendance → races → generate/confirm heats → enter times → rank → `POST /finalize`.
- **Assert:** the finalize transaction writes `pointscore_entry` rows for eligible finishers *after* the accepted `time_history` write, inside the same transaction. Reading `GET /api/events/:id/pointscore` returns per-race + per-swimmer detail and event totals.
- **Realized by:** unit UT2; browser UIT-M3-023, 037, 038, 040.
- **Evidence:** `pointscore-unit-results.json`; screenshots `UIT-M3-023/037/038/040`; `event-pointscore.csv`.

## IT-2 — Re-finalize idempotency

- **Flow:** finalize, then re-finalize unchanged; then change a time and re-finalize; then change a placement and re-finalize; then restart server.
- **Assert:** `pointscore_entry` row count is stable (DELETE-by-event-race + per-(race,member) aggregation + `UNIQUE(event_race_id, member_id)`); old rows are replaced, not duplicated; pointscore survives restart.
- **Realized by:** unit UT3, UT4; browser UIT-M3-041..044.
- **Evidence:** before/after counts in `pointscore-unit-results.json` and `m3-pointscore-120-records.json`.

## IT-3 — Isolation regression (engine purity)

- **Flow:** finalize the **same** fixture event twice against two fresh DBs — run A `WWSC_POINTSCORE_DISABLED=1`, run B disabled flag off.
- **Assert:** `time_history` rows, `heat_lane` variance / `is_break` / `net_time` / `place`, breaker report, and ranking are **byte-identical** between A and B; `pointscore_entry` rows exist only in run B.
- **Realized by:** `scripts/e2e-m3-pointscore-isolation.cjs`; browser UIT-M3-045..049.
- **Evidence:** `pointscore-isolation-proof.json` (`identical: true`, `pointscoreOnlyInB: true`, `verdict: PASS`; deterministic 46/46/6).

## IT-4 — Monthly aggregation by simple addition

- **Flow:** finalize two events in the same `YYYY-MM`, open `GET /api/pointscore/month/:ym`.
- **Assert:** each swimmer's monthly total equals the sum of their per-event totals; archived events excluded; empty month → clean empty state; month switch → no stale rows; drill-in shows contributing events.
- **Realized by:** unit UT5; browser UIT-M3-050..060.
- **Evidence:** `monthly-2026-05.csv`; screenshots `UIT-M3-050..060`.

## IT-5 — Season aggregation by simple addition

- **Flow:** finalize events across months in a calendar year, open `GET /api/pointscore/season/:year`.
- **Assert:** each swimmer's season total equals the sum of all relevant event totals; calendar-year working default applied and disclosed; tie display documented; archive/restore follows the documented rule.
- **Realized by:** unit UT6; browser UIT-M3-061..070.
- **Evidence:** `season-2026.csv`; screenshots `UIT-M3-061..070`.

## IT-6 — Reports surface

- **Flow:** open the Pointscore screen's Per-Event / Monthly / Season / Swimmer tabs and the rule-transparency banner.
- **Assert:** each report is discoverable and renders the correct aggregation; the banner discloses Excel-as-working-source, event-separated storage, monthly/season simple addition, and the calendar-year season default; filters include/exclude correctly.
- **Realized by:** browser UIT-M3-021, 022, 071..080.
- **Evidence:** screenshots `UIT-M3-021/022/071..080`.

## IT-7 — CSV export round-trips

- **Flow:** trigger event / monthly / season / time-history CSV exports (`/csv` path-segment routes).
- **Assert:** CSV headers + rows match the visible UI/API; filename carries report/date/version context; empty export = header only; CSV parses with no malformed rows; export respects active period filter.
- **Realized by:** browser UIT-M3-081..090; `GET /api/.../csv` endpoints.
- **Evidence:** `event-pointscore.csv`, `monthly-2026-05.csv`, `season-2026.csv`, `time-history.csv` (+ hashes in handoff).

## IT-8 — R-M3-05 graph still works (forward-compat)

- **Assert:** the accepted individual swimmer history graph keeps working alongside the new pointscore screen (switch swimmer / stroke filter / date filter / empty + sparse states / graph==API values / mobile / print).
- **Realized by:** browser UIT-M3-091..100; cross-check `scripts/e2e-m3-history-graphs.cjs` (20).
- **Evidence:** screenshots `UIT-M3-091..098`; history-graphs runner log.

## IT-9 — M1 / M2 regression (no accepted-logic change)

- **Assert:** members, event setup, heat builder, results, breaker, special races, relay, archive/restore (M1) and member/event Time History (M2) are unchanged; the M2 runners return their baseline counts on the M3 branch.
- **Realized by:** browser UIT-M3-101..112; `scripts/e2e-m2-time-history.cjs` (55 PASS / 0 FAIL), `scripts/e2e-m2-user-interaction-100.cjs` (98 PASS / 2 NA / 0 FAIL / 0 BLOCKED).
- **Note:** the M2 runners' "no M3 leakage" scan was narrowed from `document.body` to `#content` so the legitimate new "Pointscore" sidebar link is not a false positive; the banned-word list and all other M2 assertions are unchanged.
- **Evidence:** M2 runner logs (`/tmp/m3p-m2-55.log`, `/tmp/m3p-m2-100.log`, copied into the evidence dir on the clean-HEAD run); screenshots `UIT-M3-101..110`.

## IT-10 — Out-of-scope guard

- **Assert:** the diff adds no tenant/customer/role/access-control tables, columns, routes, or UI; `render.yaml` unchanged; no commercial-deployment scripts.
- **Realized by:** browser UIT-M3-118; `git diff` review.
- **Evidence:** `out-of-scope-diff.txt`.

## Expected result

`scripts/e2e-m3-pointscore-120.cjs`: **114 PASS / 6 NOT APPLICABLE / 0 FAIL / 0 BLOCKED** (120/120 classified). Unit `12 PASS / 0 FAIL`. Isolation `PASS`. M2 regression `55 PASS / 0 FAIL` and `98 PASS / 2 NA / 0 FAIL / 0 BLOCKED`. History-graphs `19 PASS / 1 NA / 0 FAIL`.

The 6 NOT APPLICABLE 120-cases are documented, not skipped: brace (UIT-M3-029) and pogo (UIT-M3-031) team races not seeded — the relay/team 3/2/1 rule is proven via medley_relay (UIT-M3-030) and documented in the Excel artifact; members CSV not in this slice (UIT-M3-085); graph data export not in this slice (UIT-M3-100); plus two further documented N/A. 75m/breaststroke/butterfly are now seeded end-to-end (UIT-M3-025/027/028 PASS), and UT9 proves any individual race_type — including unseen ones — is scored 5/4/3/2.
