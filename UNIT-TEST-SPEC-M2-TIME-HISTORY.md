# UNIT TEST SPEC — M2 Time History

Version: v2.9.0
Branch: `dev/v2.9.0-m2-time-history`
Date: 2026-05-18

## UT-M2-01 — Event History API Shape

- UT-M2-01-1: event history row includes `event_date`.
- UT-M2-01-2: row includes `member_name`, `stroke`, `time`, `previous_best`, `is_break`.
- UT-M2-01-3: empty event returns `[]`, not error.

## UT-M2-02 — Member History API Shape

- UT-M2-02-1: known member returns only that member's history rows.
- UT-M2-02-2: rows are sorted newest event date first.
- UT-M2-02-3: unknown member returns 404.
- UT-M2-02-4: member with no history returns `[]`.

## UT-M2-03 — Re-Finalize Duplicate Prevention

- UT-M2-03-1: first finalize creates N rows for N finished individual lanes.
- UT-M2-03-2: second finalize of same event still has N rows, not 2N.
- UT-M2-03-3: changed finish time after re-finalize replaces the event rows with updated values.

## UT-M2-04 — Formatting Helpers / Units

- UT-M2-04-1: `time=1325` renders as `13.25`.
- UT-M2-04-2: `previous_best=14` renders as `14` or `14.00` only where explicitly converted; no `0.14` regression.
- UT-M2-04-3: null previous best renders as dash/empty state, not `0`.

## UT-M2-05 — No M3 Leakage

- UT-M2-05-1: no new pointscore writes occur during M2 time-history flows.
- UT-M2-05-2: no reports/graphs/constitution scoring endpoints are added as part of M2.

