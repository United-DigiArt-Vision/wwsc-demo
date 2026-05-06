# WWSC v2.8.12 Bryan Final Polish Browser-E2E Evidence

Date: 2026-05-06
Base URL: http://127.0.0.1:3002
Runner: Playwright with installed Google Chrome via /Users/macmini001/avanak-inventory/node_modules/playwright
DB Path: /tmp/wwsc-v2812-data/wwsc.db

## Summary

- Checks: 31
- PASS: 31
- FAIL: 0
- Screenshots/text/html: `docs/screenshots/v2.8.12-bryan/`

## Bryan feedback coverage

- Medley readout variance + participant names: V2812-B02/B04/B05/B06/B07
- History/Event Details relay team members: V2812-C02/C04/C05
- Full Event Report relay member/variance auditability: V2812-C06/C07/C08
- 25m break threshold >= 0.5s: V2812-D01/D02/D04/D05 + UI check
- Saved event persistence/no disappearing events: V2812-E03/E04/E05/E08/E09; restart proof logged separately
- No M3/Pointscore scope creep: V2812-F05

## Results

| ID | Status | Evidence |
|---|---|---|
| V2812-A01 | PASS | /api/version is {"version":"2.8.12","build":"2026-05-06T11:56:25.556Z"} |
| V2812-D01 | PASS | 25m exactly 0.50s improvement is BREAK |
| V2812-D02 | PASS | 25m 0.49s improvement is not BREAK |
| V2812-D06 | PASS | 50m 0.50s improvement remains non-break regression guard |
| V2812-B03 | PASS | Medley ranks by smallest absolute variance, not raw fastest time |
| V2812-D04 | PASS | Finalized event breakers include 0.50s 25m break |
| V2812-D05 | PASS | Finalized event breakers exclude 0.49s non-break |
| V2812-E03 | PASS | Event 1 appears in Season Calendar API after finalization |
| V2812-E05 | PASS | Event 1 and Event 2 both remain saved |
| V2812-E08 | PASS | Intentional archive moves event to deleted state |
| V2812-E09 | PASS | Restore returns archived event to active list |
| V2812-C07-API | PASS | Report API has 25m relay members |
| V2812-C08-API | PASS | Report API has Medley members and variance |
| V2812-A02 | PASS | Dashboard/sidebar shows v2.8.12 |
| V2812-A03 | PASS | Assets use v2.8.12 cache busting |
| V2812-A04 | PASS | Results screen loads without white screen |
| V2812-B02 | PASS | Medley Results screen visibly lists team members/strokes |
| V2812-B05 | PASS | Medley Results screen explains ranking with variance |
| V2812-B04 | PASS | Medley readout includes signed variance |
| V2812-B06 | PASS | Medley readout includes participant names |
| V2812-B07 | PASS | Medley copied readout has no broken values |
| V2812-C02 | PASS | Calendar details show 25m Relay member names |
| V2812-C04 | PASS | Calendar details show Medley member names/strokes |
| V2812-C05 | PASS | Calendar details no longer only show Team/time |
| V2812-C06 | PASS | Full Event Report opens from Calendar path |
| V2812-C07 | PASS | Event Report relay tables include members |
| V2812-C08 | PASS | Printable Event Report includes variance with no broken values |
| V2812-D01-UI | PASS | 25m screen visibly marks/mentions breaker for 0.50s improvement |
| V2812-E04 | PASS | Calendar shows two saved events before restart |
| V2812-F05 | PASS | Scope guard: no Pointscore/M3 UI introduced |
| V2812-F06 | PASS | No relevant browser console/page errors (1 raw) |

## Artifacts

- 01-dashboard-v2812.png
- 02-medley-results-screen-variance.png
- 03-medley-readout.txt
- 04-calendar-event-details-relay-members.png
- 05-event-report.html
- 05-event-report-relay-members-variance.png
- 06-25m-half-second-breaker.png
- 07-calendar-two-events-saved.png
