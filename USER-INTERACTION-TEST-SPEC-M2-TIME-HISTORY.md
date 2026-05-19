# USER INTERACTION TEST SPEC — M2 Time History

Version: v2.9.0
Branch: `dev/v2.9.0-m2-time-history`
Date: 2026-05-18
Coverage target: Strong coverage before Dino acceptance.

## Test Dimensions

- Date coverage: one event, multiple weekly events, same swimmer across multiple dates.
- Data coverage: normal time, PB break, no break, missing previous best.
- Workflow state: finalized event, re-finalized event, browser refresh/server restart with same DB.
- UI projection: Members history, Calendar/Event history, API-backed visible values.
- Regression: v2.8.12 members/heats/results/relay/calendar/archive smoke.

## UI Test Cases

### A — Member Timeline

- UI-M2-A01: Open Members screen; each active swimmer row exposes a clear History action.
- UI-M2-A02: Click History for a swimmer with one history row; modal/panel opens.
- UI-M2-A03: History row shows date, stroke, time, previous best, and break marker.
- UI-M2-A04: Swimmer with multiple dated rows shows newest first.
- UI-M2-A05: Swimmer with no history shows a clear empty state.
- UI-M2-A06: Closing the history modal/panel returns to Members without losing scroll/context.

### B — Event / Week Review

- UI-M2-B01: Open Calendar/Event detail for a finalized event; Time History is visible or accessible.
- UI-M2-B02: Event time history shows rows for that event only.
- UI-M2-B03: Date is visible in the event context.
- UI-M2-B04: Open two different weekly events; rows remain separated by date/event.

### C — Finalize Flow

- UI-M2-C01: Create event, enter times, finalize, then view event time history.
- UI-M2-C02: Finalize creates visible history without requiring browser refresh.
- UI-M2-C03: Refresh browser; history remains visible.
- UI-M2-C04: Restart server with same DB path; history remains visible.

### D — Re-Finalize / Duplicate Defense

- UI-M2-D01: Re-finalize same event; no duplicate visible rows.
- UI-M2-D02: Change a time and re-finalize; visible history reflects latest event value.
- UI-M2-D03: Break marker remains consistent with Results/Breaker Report.

### E — Formatting / Edge Cases

- UI-M2-E01: Centisecond value like 13.25 displays correctly.
- UI-M2-E02: Whole-second previous best like 14 never displays as 0.14.
- UI-M2-E03: Missing previous best displays a clear dash/empty state.
- UI-M2-E04: Date formatting is readable and consistent across member/event views.

### F — M1 Regression Smoke

- UI-M2-F01: Members screen loads and edit modal still works.
- UI-M2-F02: Event setup still creates standard/special event correctly.
- UI-M2-F03: Heat builder still generates individual heats.
- UI-M2-F04: Results entry still accepts finish times.
- UI-M2-F05: Breaker report still uses v2.8.12 thresholds.
- UI-M2-F06: Relay results still show team members and variance.
- UI-M2-F07: Calendar completed-event detail still opens.
- UI-M2-F08: Archive and restore still work.
- UI-M2-F09: Browser console has zero errors across critical flows.

### G — No M3 Leakage

- UI-M2-G01: No Pointscore screen/workflow appears as part of this milestone.
- UI-M2-G02: No accumulated season totals are shown as a completed M2 feature.
- UI-M2-G03: No reports/graphs/constitution scoring UI is introduced.

## Required Deliverables

- `USER-INTERACTION-TEST-PROTOCOL-M2-TIME-HISTORY.md`
- `USER-INTERACTION-COVERAGE-MATRIX-M2-TIME-HISTORY.md`
- Raw Playwright log
- Screenshots for member timeline, event history, duplicate-defense, and regression smoke.

