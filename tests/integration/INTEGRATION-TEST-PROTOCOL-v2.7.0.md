# INTEGRATION TEST PROTOCOL — WWSC v2.7.0
Date: 2026-04-04
Tester: Vermithrax

## Summary
- Total: 9
- PASS: 8
- FAIL: 1

## Results
| ID | Test | Expected | Actual | Result |
|----|------|----------|--------|--------|
| BF0404-02/03 | Members PBs are whole seconds | API `/api/members` returns integer seconds | Returns integer seconds (e.g., `time_25m: 13`) | PASS |
| BF0404-08 | 25m Relay PB shows actual values | `time_25m` is populated in relay response | Relay response includes `time_25m` | PASS |
| BF0404-13 | "N" swimmers NOT allocated to medley | "N" attendance excluded from medley relay | Excluded from generated medley team | PASS |
| BF0404-21/22/23 | Medley relay fixed start delay & equal placement | `start_delay=2`, identical variances yield same place | All teams have `start_delay: 2`, equal variance yields place 1 for both | PASS |
| BF0404-25 | Season Calendar after Complete | Complete API updates event status | API `/api/events` returns `"status": "completed"` | PASS |
| BF0404-26 | Event Report includes breakers | API `/api/events/1/report` returns breakers | `500 Internal Server Error` due to `"no such table: record_breaker"`. The `report` endpoint was not updated to use the new `time_history` SSOT. | FAIL |
| BF0404-14 | Stroke Counter | Frontend code contains counter UI | Found `Medley Assigned: Back: ${medleyCounts.Back}...` in `event-setup.js` | PASS |
| BF0404-06/11/17/18/19 | Visual fixes (Start time, Medals, Exceeding) | Frontend code contains fixes | Found `Start:` prefix, `#FFD700` rowBg, and `Exceeding Report` formats | PASS |
