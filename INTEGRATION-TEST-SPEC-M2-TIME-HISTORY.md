# INTEGRATION TEST SPEC — M2 Time History

Version: v2.9.0
Branch: `dev/v2.9.0-m2-time-history`
Date: 2026-05-18

## Traceability Matrix

| Requirement | Test IDs |
|---|---|
| R-M2-01 Record Time Changes | IT-M2-01, IT-M2-04 |
| R-M2-02 Preserve Dates | IT-M2-01, IT-M2-02, IT-M2-03 |
| R-M2-03 Per-Swimmer Timeline | IT-M2-02 |
| R-M2-04 Week-by-week / dated review | IT-M2-03 |
| R-M2-05 No regression | IT-M2-05, IT-M2-06 |

## IT-M2-01 — Finalize Event Creates Dated History

Create a dated event, generate individual race heats, enter finish times, finalize event, then call `GET /api/events/:eventId/time-history`.

Expected:
- Rows exist for finished individual lanes.
- Each row includes the event date.
- Rows contain member name, stroke, time, previous best, and break marker.

## IT-M2-02 — Member Timeline

Seed two dated events for the same swimmer, finalize both, then call `GET /api/members/:memberId/time-history`.

Expected:
- Only that swimmer's rows are returned.
- Newest event appears first.
- Date is visible for each entry.

## IT-M2-03 — Week-by-Week Event Review

Seed/finalize at least three weekly events and inspect each completed event's time history.

Expected:
- Each week/date remains separately reviewable.
- Data does not collapse into one undated latest value.

## IT-M2-04 — Re-Finalize Is Idempotent

Finalize an event, count rows, re-finalize the same event, count rows again.

Expected:
- Row count for the event remains stable.
- Updated values replace old event rows.

## IT-M2-05 — M1 Regression Smoke

Run core v2.8.12 flows: members list/edit, event setup, heat builder, results entry, breaker report, relay readout, calendar/archive/restore.

Expected:
- No console errors.
- v2.8.12 behavior remains intact.

## IT-M2-06 — No M3 Leakage

Inspect UI and code diff/endpoints.

Expected:
- No Pointscore UI/workflow is introduced.
- No reports/graphs/constitution accumulation work is introduced.

