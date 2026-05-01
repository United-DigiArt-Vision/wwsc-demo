# USER INTERACTION TEST SPEC — v2.8.11 Bryan Polish Pass

**Version:** 2.8.11  
**Date:** 2026-05-01  
**Trigger:** Bryan v2.8.10 retest feedback received 2026-05-01  
**Scope:** Only the five Bryan polish/fix points. No Pointscore/M3 work.

## Bryan feedback mapped to test areas

- B2811-01: Relay selection display looks confusing before teams are generated.
- B2811-02: Printing headings should have consistent look/font.
- B2811-03: Printing headings should be more prominent.
- B2811-04: Remove `(decides ranking)` wording from 25m Team Relay results.
- B2811-05: Event Report participants table must show Special Entry `Y`/`N`; Andrew Barnes must not show `—` when Times Sheet effectively has `N`.

## Test environment assumptions

- App version shown by `/api/version` is `2.8.11`.
- Browser: Chromium via OpenClaw browser automation.
- User perspective: Bryan at the pool on a touchscreen, not a developer reading code.
- Test data should include at least 13 swimmers and a 25m Team Relay scenario matching Bryan's screenshots where possible.

## Acceptance rule

A test passes only if a normal user can understand the screen without developer explanation, and the behavior matches Bryan's feedback. Technical API success alone is not sufficient.

---

## Section A — Version / baseline integrity

| ID | User action | Expected result |
|---|---|---|
| V2811-A01 | Open `/api/version`. | Version is `2.8.11`. |
| V2811-A02 | Open the app dashboard. | App loads without white screen or blocking error. |
| V2811-A03 | Confirm no visible stale `v2.8.10` cache-busting remains in loaded index assets. | Main asset URLs use `v=2.8.11` where cache-busting is present. |
| V2811-A04 | Navigate Dashboard → Times Sheet → Heat Builder → Results. | Navigation works without console errors. |
| V2811-A05 | Hard refresh the app. | Same v2.8.11 UI appears; no stale v2.8.10 behavior. |

## Section B — Relay selection display before Generate Teams

| ID | User action | Expected result |
|---|---|---|
| V2811-B01 | On Times Sheet, select 25m Team Relay as a standard race and build heats. | Heat Builder shows 25m Team Relay as selected race. |
| V2811-B02 | Select 25m Team Relay before pressing Generate Teams. | Screen shows one clean instruction to tap Generate Teams. |
| V2811-B03 | Inspect pre-generation 25m Team Relay screen. | No `0/0 teams complete` ranking banner appears. |
| V2811-B04 | Inspect pre-generation 25m Team Relay screen. | No unassigned swimmer pool is shown before teams exist. |
| V2811-B05 | Inspect pre-generation 25m Team Relay screen. | No `Add Team` manual-management button is shown before teams exist. |
| V2811-B06 | Inspect pre-generation 25m Team Relay screen. | The Generate Teams button is prominent and clearly the next action. |
| V2811-B07 | Press Generate Teams. | Teams are generated normally. |
| V2811-B08 | After teams are generated, inspect management UI. | Rankability/unassigned/manual team controls appear only if relevant and no longer look like an empty initial state. |
| V2811-B09 | Switch from 25m Team Relay to another race and back before generation. | Initial 25m Team Relay state remains clean and does not accumulate duplicate helper blocks. |
| V2811-B10 | Repeat after hard refresh. | Same clean initial display. |

## Section C — Relay generation still works after display fix

| ID | User action | Expected result |
|---|---|---|
| V2811-C01 | Generate 25m Team Relay teams with 13 swimmers. | Teams are created without error. |
| V2811-C02 | Inspect generated team count. | Teams contain the expected swimmers and no blank visual state. |
| V2811-C03 | Inspect team names. | Team 1, Team 2, Team 3 etc. are visible. |
| V2811-C04 | Inspect team totals/target/start delay. | Total/Target/Start Delay remain visible. |
| V2811-C05 | If a swim-twice row appears for 25m Relay, open the dropdown. | Dropdown is scoped to members of that team only (v2.8.10 fix remains intact). |
| V2811-C06 | Confirm teams. | Confirm works. |
| V2811-C07 | Go to Results. | Results screen opens for the event. |
| V2811-C08 | Return to Heat Builder. | Generated/confirmed teams still display correctly. |

## Section D — Print heading consistency

| ID | User action | Expected result |
|---|---|---|
| V2811-D01 | Generate 25m Team Relay teams and open print preview or print-rendered page. | Team headings use the same font family. |
| V2811-D02 | Compare Team 1, Team 2, Team 3 print headings. | Same text weight, spacing, and alignment. |
| V2811-D03 | Compare blue/red/green team headers in print. | Color differs by team, but typography is consistent. |
| V2811-D04 | Inspect table headers under each team in print. | Table header font is consistent across all teams. |
| V2811-D05 | Inspect `Heat Builder` and race title in print. | Page-level headings are readable and consistent. |
| V2811-D06 | Print 75m Freestyle heats. | Individual heat headings remain consistent with relay print hierarchy. |
| V2811-D07 | Print with multiple teams. | No team heading appears tiny compared to others. |
| V2811-D08 | Print after confirming heats. | Heading consistency remains after confirmation state changes. |
| V2811-D09 | Print in landscape-sized viewport. | Headings remain aligned and readable. |
| V2811-D10 | Print in narrower viewport/tablet width. | Headings wrap gracefully without inconsistent fonts. |

## Section E — Print heading prominence

| ID | User action | Expected result |
|---|---|---|
| V2811-E01 | Print 25m Team Relay heat sheet. | `Team 1`, `Team 2`, etc. are bold enough to scan quickly. |
| V2811-E02 | Inspect page title. | `Heat Builder` is clear and not visually lost. |
| V2811-E03 | Inspect race title. | `25m Team Relay` is prominent enough to identify the sheet. |
| V2811-E04 | Inspect individual heat title such as `75m Freestyle`. | Race heading is bolder/larger than table cell text. |
| V2811-E05 | Compare team title vs swimmer rows. | Team title clearly dominates swimmer row text. |
| V2811-E06 | Compare heading vs metadata (`Total`, `Target`, `Start Delay`). | Heading remains the primary visual anchor. |
| V2811-E07 | Inspect first printed page at 100% zoom. | Headings are legible without zooming. |
| V2811-E08 | Inspect screenshot/PDF output. | Headings are prominent in exported/attached evidence. |

## Section F — Remove 25m Relay wording

| ID | User action | Expected result |
|---|---|---|
| V2811-F01 | Generate and confirm 25m Team Relay. | Results page opens normally. |
| V2811-F02 | Enter result time for Team 1 and calculate/save rankings. | Variance row appears. |
| V2811-F03 | Inspect variance row text. | It says `Variance from Target:` without `(decides ranking)`. |
| V2811-F04 | Inspect all 25m Team Relay teams. | No team card contains `(decides ranking)`. |
| V2811-F05 | Search visible Results screen text. | No literal `decides ranking` appears in 25m Relay section. |
| V2811-F06 | Confirm ranking still displays place. | 1st/2nd/3rd place still visible. |
| V2811-F07 | Save rankings. | Save still works. |
| V2811-F08 | Finalize event. | Finalization still works. |
| V2811-F09 | Reopen finalized event report/calendar result. | Removed wording does not reappear in report path. |
| V2811-F10 | Verify Medley/Pogo ranking explanation. | If those screens still intentionally explain ranking basis, they remain understandable and are not broken by the 25m Relay copy removal. |

## Section G — Event Report Special Entry Y/N

| ID | User action | Expected result |
|---|---|---|
| V2811-G01 | On Times Sheet, set Andrew Barnes present with Special Entry `N`. | Times Sheet shows Andrew as `N`. |
| V2811-G02 | Set at least one swimmer to `Y`. | Times Sheet shows `Y`. |
| V2811-G03 | Set at least one swimmer to `Back`, `Breast`, or `Free` if Medley is selected. | Times Sheet shows the exact stroke value. |
| V2811-G04 | Build heats and finalize/report event. | Event Report opens. |
| V2811-G05 | Inspect Participants table. | Andrew Barnes shows `N`, not `—`. |
| V2811-G06 | Inspect all present swimmers with `N`. | They show `N`, not `—`. |
| V2811-G07 | Inspect swimmers with `Y`. | They show `Y`. |
| V2811-G08 | Inspect swimmers with `Back`/`Breast`/`Free`. | They show the exact stroke text. |
| V2811-G09 | Inspect absent swimmers. | They are not listed as present participants. |
| V2811-G10 | Use a legacy event where `special_event_entry` is null for present swimmers. | Report displays `N` as the user-facing default, not `—`. |
| V2811-G11 | Reopen report from Season Calendar. | Same Special Entry values appear. |
| V2811-G12 | Print/report popup. | Special Entry values remain visible and aligned. |

## Section H — Regression smoke from Bryan v2.8.10 fixes

| ID | User action | Expected result |
|---|---|---|
| V2811-H01 | 25m Relay swim-twice dropdown after team generation. | Dropdown remains scoped to current team members. |
| V2811-H02 | Open View Event Report from Calendar. | No null-ref crash; report opens. |
| V2811-H03 | Click initial Generate Teams multiple times before confirm. | Each click can produce fresh balanced-randomised pairings. |
| V2811-H04 | Confirm v2.8.10 Fix B screenshot scenario. | Dropdown no longer shows all attendees. |
| V2811-H05 | Confirm v2.8.10 Fix D scenario. | Calendar report opens with selected event id. |
| V2811-H06 | Confirm v2.8.10 Fix E scenario. | Generate Teams is not visibly static on every first click. |

## Section I — Error/console/user confidence

| ID | User action | Expected result |
|---|---|---|
| V2811-I01 | Complete full Times Sheet → Heat Builder → Results flow. | No browser console errors. |
| V2811-I02 | Print Heat Builder. | No layout-breaking overflow in screenshot. |
| V2811-I03 | Print Results after rankings. | No layout-breaking overflow in screenshot. |
| V2811-I04 | Open Event Report. | No visible undefined/null/NaN text. |
| V2811-I05 | Search rendered app text for `undefined`. | No visible `undefined`. |
| V2811-I06 | Search rendered app text for `null`. | No visible `null`. |
| V2811-I07 | Search rendered app text for `NaN`. | No visible `NaN`. |
| V2811-I08 | User reads Bryan's five feedback points against the UI. | Each point has a visible fix or a clear no-regression result. |

**Total test cases:** 75
