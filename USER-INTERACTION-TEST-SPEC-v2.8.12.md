# USER INTERACTION TEST SPEC — v2.8.12 Bryan Final Polish + Persistence

**Version:** 2.8.12  
**Date:** 2026-05-06  
**Trigger:** Bryan v2.8.11 response received 2026-05-06  
**Scope:** Final M1 polish and persistence hardening for Bryan's latest notes. No Pointscore/M3 implementation.

## Source requirements

- BRY-2812-01: Medley Relay Results Readout/printout is not meaningful without variance and participants.
- BRY-2812-02: History/Event Details should include relay team members for 25m Relay and Medley Relay so WWSC can later audit points/results.
- BRY-2812-03: 25m record breaks should count when improvement is equal to or greater than 0.5 seconds.
- BRY-2812-04: Saved events must not disappear after multiple events are run/saved; hosted data persistence must be hardened.
- BRY-2812-05: Next phases are not started in this delivery; this delivery closes current section/M1 feedback only.

## User perspective

Tester persona: Bryan at the pool on a touchscreen, checking whether saved meet results can be trusted later.

Pass rule: A test passes only if the visible UI/report/readout makes sense without developer explanation and the underlying saved data survives the tested flow. API success alone is not sufficient.

## Environment assumptions

- App shows version `v2.8.12` in sidebar via `/api/version`.
- Tests run on a local test server first with a backed-up/restored SQLite DB.
- Browser-E2E uses installed Chrome/Playwright or equivalent real browser control.
- Screenshots and raw logs are saved under `docs/screenshots/v2.8.12-bryan/` and `docs/evidence/`.

---

## Section A — Version / baseline integrity

| ID | User action | Expected result | Source |
|---|---|---|---|
| V2812-A01 | Open `/api/version`. | Version is `2.8.12`. | V0014 |
| V2812-A02 | Open the app dashboard. | App loads without white screen and sidebar shows `v2.8.12`. | V0014 |
| V2812-A03 | Hard refresh the app. | JS/CSS cache-busting uses `?v=2.8.12`; no stale v2.8.11 behavior. | V0014 |
| V2812-A04 | Navigate Dashboard → Times Sheet → Heat Builder → Results → Season Calendar. | All core screens load without visible errors. | PRE-DELIVERY |

## Section B — Medley Relay readout variance + participants

| ID | User action | Expected result | Source |
|---|---|---|---|
| V2812-B01 | Create/select an event with Medley Relay and enough swimmers. | Medley Relay can be generated normally. | BRY-2812-01 |
| V2812-B02 | Generate Medley Relay teams. | Teams show member names/strokes on Results screen. | BRY-2812-01 |
| V2812-B03 | Enter total times for multiple Medley teams and calculate/save rankings. | Places are based on smallest absolute variance, not raw fastest time. | Existing R20 |
| V2812-B04 | Tap `Readout` on Medley Relay Results. | Readout includes each ranked team, total time, and variance. | BRY-2812-01 |
| V2812-B05 | Inspect Medley readout for Team 1-like case where raw time is fastest but variance is not best. | Readout makes ranking understandable because variance is visible. | BRY-2812-01 |
| V2812-B06 | Inspect Medley readout text. | Readout includes participant/member names for each team or clearly lists team composition below each team. | BRY-2812-01 |
| V2812-B07 | Copy Readout text. | Copied text contains team members and variance, not only `Team N — time`. | BRY-2812-01 |

## Section C — Relay history/event details member auditability

| ID | User action | Expected result | Source |
|---|---|---|---|
| V2812-C01 | Complete/finalize an event containing 25m Relay. | Event appears in Season Calendar as completed/finalized. | BRY-2812-02 |
| V2812-C02 | Open Season Calendar event details for that event. | 25m Relay section shows each ranked team with team member names. | BRY-2812-02 |
| V2812-C03 | Complete/finalize an event containing Medley Relay. | Event appears in Season Calendar as completed/finalized. | BRY-2812-02 |
| V2812-C04 | Open Season Calendar event details for Medley event. | Medley Relay section shows each ranked team with member names and strokes where available. | BRY-2812-02 |
| V2812-C05 | Inspect Event Details summary where Bryan's screenshot used to show only `Team 3 (108.00)`. | It now includes member composition, not only team label/time. | BRY-2812-02 |
| V2812-C06 | Click `View Event Report` from Calendar. | Full Event Report opens without crash. | Regression v2.8.10 |
| V2812-C07 | Inspect Full Event Report relay tables. | Relay team members and variance are visible for 25m and Medley relay teams. | BRY-2812-02 |
| V2812-C08 | Print or inspect printable Event Report HTML. | Printable report includes relay member names and variance; no `undefined`, `null`, or `NaN`. | BRY-2812-02 |

## Section D — 25m break threshold >= 0.5 seconds

| ID | User action | Expected result | Source |
|---|---|---|---|
| V2812-D01 | In a 25m event, enter a result exactly 0.50 sec faster than PB/net target. | Row is marked `BREAK`. | BRY-2812-03 |
| V2812-D02 | In a 25m event, enter a result 0.49 sec faster than PB/net target. | Row is not marked `BREAK`. | BRY-2812-03 |
| V2812-D03 | In a 25m event, enter a result 1.00 sec faster than PB/net target. | Row is still marked `BREAK`. | BRY-2812-03 |
| V2812-D04 | Finalize event with a 0.50 sec 25m improvement. | Breaker appears in event breakers/report after finalization. | BRY-2812-03 |
| V2812-D05 | Finalize event with a 0.49 sec 25m improvement. | Non-breaker does not appear in breakers report. | BRY-2812-03 |
| V2812-D06 | Run a 50m event with a 0.50 sec improvement. | 50m threshold behavior remains unchanged unless explicitly intended; no unintended broad threshold change. | Scope guard |

## Section E — Saved event persistence / no disappearing history

| ID | User action | Expected result | Source |
|---|---|---|---|
| V2812-E01 | Inspect server persistence config/startup path. | App supports external/persistent DB path for hosted Render storage. | BRY-2812-04 |
| V2812-E02 | Start app with a custom persistent DB env path. | DB is created/used at configured path, not hardcoded only to `src/data/wwsc.db`. | BRY-2812-04 |
| V2812-E03 | Run and finalize Event 1. | Event 1 appears in Season Calendar. | BRY-2812-04 |
| V2812-E04 | Start a new event after Event 1. | Event 1 remains in Season Calendar; new current event is created. | BRY-2812-04 |
| V2812-E05 | Run and finalize Event 2. | Both Event 1 and Event 2 appear in Season Calendar. | BRY-2812-04 |
| V2812-E06 | Restart the local server using the same persistent DB path. | Event 1 and Event 2 are still present. | BRY-2812-04 |
| V2812-E07 | Open `/api/events?archived=1` after restart. | Events are not silently archived/deleted; active and archive states are understandable. | BRY-2812-04 |
| V2812-E08 | Archive one completed event intentionally. | Event moves to Deleted Events and can be restored. | Existing archive UX |
| V2812-E09 | Restore archived event. | Event returns to active calendar list. | Existing archive UX |

## Section F — Regression and scope boundaries

| ID | User action | Expected result | Source |
|---|---|---|---|
| V2812-F01 | Select 25m Team Relay before Generate Teams. | Clean pre-generation state from v2.8.11 remains fixed. | Regression v2.8.11 |
| V2812-F02 | Print relay heat sheet. | Heading consistency/prominence from v2.8.11 remains fixed. | Regression v2.8.11 |
| V2812-F03 | Inspect 25m Team Relay variance row. | `(decides ranking)` wording does not return. | Regression v2.8.11 |
| V2812-F04 | Open Event Report participant table with missing/null Special Entry. | Present swimmers still show `N`, not `—`. | Regression v2.8.11 |
| V2812-F05 | Inspect app for Pointscore/M3 UI changes. | No Pointscore/M3 implementation appears in v2.8.12. | Scope guard |
| V2812-F06 | Browser console during full happy path. | No relevant console/page errors. | PRE-DELIVERY |

## Minimum required evidence

- Raw syntax/test logs.
- Browser-E2E raw log with PASS/FAIL table.
- Screenshots for:
  - Medley Readout with variance + participants.
  - Calendar Event Details showing 25m Relay members.
  - Calendar Event Details showing Medley Relay members.
  - Event Report printable relay table with variance.
  - 25m 0.50 sec breaker visible.
  - Calendar with two saved events after restart.
- Known limitations, especially if live Render persistent disk requires manual dashboard confirmation.

**Total user-perspective test cases:** 40
