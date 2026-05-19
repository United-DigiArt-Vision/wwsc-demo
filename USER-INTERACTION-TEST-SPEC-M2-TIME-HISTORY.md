# USER INTERACTION TEST SPEC — M2 Time History — 100 Screenshot Cases

Version: v2.9.0
Branch under test: `main` after local M2 merge, or any Claude Code retest branch explicitly synced from that commit.
Date: 2026-05-19
Purpose: force full user-perspective verification of every M2 Time History behavior with screenshot proof, so Dino does not have to manually rebuild multiple events and member histories.

## Hard Rules For Claude Code

1. Use the WWSC SSOT codebase only:
   `~/Dropbox/Dino-Balerion-Claude-Code/Projekte/0004_swimming-app/code/`
2. Before testing, record:
   - `git branch --show-current`
   - `git rev-parse --short HEAD`
   - `cat package.json | jq -r .version`
   - `curl /api/version` against the running local app
3. Use a fresh isolated DB for this run. Do not use Bryan's live data.
4. Use real browser interaction via Playwright/Chrome. API checks may support the test, but screenshots must show the user-visible state.
5. Every testcase below must end with:
   - status: `PASS`, `FAIL`, `BLOCKED`, or `NOT APPLICABLE`
   - screenshot path
   - short evidence note naming visible text/values in the screenshot
6. A testcase is not `PASS` unless the screenshot itself shows the required visible state, or the case is explicitly non-visual and references a screenshot plus raw log.
7. If a screenshot is too tall, capture both full-page and focused cropped screenshots. The focused screenshot is the primary proof.
8. Screenshot filenames must be deterministic:
   `docs/screenshots/m2-user-interaction-100/TC-###-short-name.png`
9. Required protocol output:
   `docs/evidence/m2-user-interaction-100-test-protocol-2026-05-19.md`
10. Required raw output:
   `docs/evidence/m2-user-interaction-100-raw-2026-05-19.log`

## Required Test Data

Create at least:
- 24 members/swimmers.
- 4 completed individual events on different dates:
  - 2026-04-04
  - 2026-04-11
  - 2026-04-18
  - 2026-04-26
- At least 1 relay event to prove M2 did not corrupt relay behavior.
- At least 1 member with 4 dated history rows.
- At least 1 member with exactly 1 history row.
- At least 1 member with no history rows.
- At least 1 PB break row.
- At least 1 non-break row.
- At least 1 row where `previous_best` is null/missing.
- At least 1 whole-second previous best, e.g. `16.00`, to prove it never renders as `0.16`.
- At least 1 changed time after re-finalize, e.g. updated visible time `11.00`.

## Coverage Summary

- Member history entry points: TC-001 to TC-015
- Member history modal content: TC-016 to TC-030
- Multi-event sorting and date separation: TC-031 to TC-042
- Calendar/event Time History: TC-043 to TC-057
- Finalize, no-refresh, reload, restart persistence: TC-058 to TC-070
- Re-finalize and duplicate defense: TC-071 to TC-080
- Formatting and edge cases: TC-081 to TC-090
- Regression and no-M3 leakage: TC-091 to TC-100

## 100 User Interaction Test Cases

| ID | Area | User Action | Expected Visible Result | Screenshot Proof |
|---|---|---|---|---|
| TC-001 | Members entry | Open Members screen after seeding 24 members. | Members screen loads with swimmer rows visible. | Full Members screen. |
| TC-002 | Members entry | Inspect first visible active swimmer row. | A clear `History` action is visible in the row. | Row crop with swimmer name and History action. |
| TC-003 | Members entry | Count History actions on Members screen. | History actions exist for all 24 swimmer rows. | Full-page screenshot or stitched screenshot showing all rows/actions. |
| TC-004 | Members entry | Hover/focus the first History action if supported. | Action remains visibly interactive and does not shift layout. | Focused screenshot of action state. |
| TC-005 | Members entry | Click History for a swimmer with history. | A modal/panel opens without navigating away from Members. | Modal open with Members context behind/around it. |
| TC-006 | Members entry | Click History for a second swimmer with history. | Modal content updates to the second swimmer, not stale first swimmer data. | Modal heading/body showing second swimmer. |
| TC-007 | Members entry | Click History for a swimmer with no history. | Empty state opens cleanly. | Empty-state modal. |
| TC-008 | Members entry | Close populated History modal. | Modal closes and Members screen remains usable. | Members screen after close. |
| TC-009 | Members entry | Close empty-state History modal. | Modal closes without error and Members screen remains usable. | Members screen after empty close. |
| TC-010 | Members entry | Reopen History for the same swimmer after closing. | Same swimmer history appears again. | Reopened modal. |
| TC-011 | Members entry | Open History after scrolling down the Members list. | Modal opens for the clicked lower-list swimmer. | Lower-list row plus modal heading/body. |
| TC-012 | Members entry | Close modal after lower-list swimmer. | User returns to Members without broken layout. | Members screen after close. |
| TC-013 | Members entry | Open History from a row near the bottom of the list. | History action works independent of row position. | Bottom-row modal. |
| TC-014 | Members entry | Open History and press Escape if modal supports it. | Modal closes or remains stable without console error. | State after Escape plus raw log reference. |
| TC-015 | Members entry | Reopen Members after navigating away and back. | History actions are still visible. | Members screen after navigation return. |
| TC-016 | Member modal content | Open swimmer with at least 4 history rows. | Modal shows swimmer name and at least 4 rows. | Modal full content. |
| TC-017 | Member modal content | Inspect table/header in populated modal. | Columns/labels show Date, Stroke/Race, Time, Previous Best, Break. | Header crop. |
| TC-018 | Member modal content | Inspect first history row. | Row contains date, stroke/race, recorded time, previous best, break marker/empty marker. | First row crop. |
| TC-019 | Member modal content | Inspect row with PB break. | Break marker is visibly positive, e.g. chip/icon/text. | PB break row crop. |
| TC-020 | Member modal content | Inspect row without PB break. | Non-break row is visibly not marked as a break. | Non-break row crop. |
| TC-021 | Member modal content | Inspect row with null previous best. | Previous Best is dash/empty, not `0.00` or broken text. | Null previous-best row crop. |
| TC-022 | Member modal content | Inspect row with whole-second previous best. | Previous Best displays like `16.00`, never `0.16`. | Whole-second PB row crop. |
| TC-023 | Member modal content | Inspect row with centisecond time. | Time displays like `13.25` or equivalent correct centisecond format. | Centisecond time row crop. |
| TC-024 | Member modal content | Inspect modal at narrow/mobile viewport. | Content remains readable; no overlap/cut-off. | Mobile viewport modal. |
| TC-025 | Member modal content | Inspect modal at desktop viewport. | Table/panel alignment is clean. | Desktop viewport modal. |
| TC-026 | Member modal content | Scroll inside modal if content exceeds viewport. | Rows remain accessible and header/content do not break. | Scrolled modal bottom. |
| TC-027 | Member modal content | Open a one-history-row swimmer. | Exactly one visible row appears with correct columns. | One-row modal. |
| TC-028 | Member modal content | Open no-history swimmer. | Empty state says no history or equivalent clean message. | Empty-state modal. |
| TC-029 | Member modal content | Switch from empty-state swimmer to populated swimmer. | Populated rows appear; empty message is gone. | Populated modal after empty. |
| TC-030 | Member modal content | Switch from populated swimmer to empty-state swimmer. | Empty state appears; stale rows are gone. | Empty modal after populated. |
| TC-031 | Sorting/date | Open swimmer with rows on 2026-04-04, 04-11, 04-18, 04-26. | All four dates are visible. | Modal showing four dates. |
| TC-032 | Sorting/date | Inspect row order for that swimmer. | Newest date appears first: 2026-04-26 before 04-18 before 04-11 before 04-04. | Modal top-to-bottom date proof. |
| TC-033 | Sorting/date | Inspect oldest row position. | 2026-04-04 appears after newer dates. | Modal lower rows. |
| TC-034 | Sorting/date | Inspect same stroke across multiple dates. | Same stroke rows are distinguishable by date. | Rows with same stroke and different dates. |
| TC-035 | Sorting/date | Inspect two different strokes on same date. | Both rows appear with same date but different race/stroke labels. | Same-date multi-stroke crop. |
| TC-036 | Sorting/date | Open second swimmer with multiple dates. | Date order is newest-first for second swimmer too. | Second swimmer modal. |
| TC-037 | Sorting/date | Open swimmer with only old date. | Old date displays correctly and does not get hidden. | Old-date one-row modal. |
| TC-038 | Sorting/date | Open swimmer with latest date only. | Latest date displays correctly. | Latest-date modal. |
| TC-039 | Sorting/date | Compare member history date to Calendar event date. | Date text corresponds to the event date. | Member modal plus referenced event screenshot. |
| TC-040 | Sorting/date | Use browser reload while modal open or after closing. | Reopened modal preserves sorted date order. | Reopened modal after reload. |
| TC-041 | Sorting/date | Check human-readable date format. | Date is readable, not raw/broken/null. | Date cell crop. |
| TC-042 | Sorting/date | Check date labels at mobile viewport. | Dates remain readable and not clipped. | Mobile date rows. |
| TC-043 | Calendar history | Open Calendar screen. | Calendar/event list loads with completed events visible. | Calendar overview. |
| TC-044 | Calendar history | Open 2026-04-04 completed event. | Event detail opens. | Event detail top. |
| TC-045 | Calendar history | Inspect 2026-04-04 event detail. | `Time History` or `Time History (M2)` section is visible. | Event detail Time History heading. |
| TC-046 | Calendar history | Inspect first rows in 2026-04-04 Time History. | Rows show member, stroke/race, time, previous best, break marker/date context. | Event history rows. |
| TC-047 | Calendar history | Open 2026-04-11 completed event. | Event detail opens for 2026-04-11. | Event detail top with date. |
| TC-048 | Calendar history | Inspect 2026-04-11 Time History. | Rows are specific to 2026-04-11. | Event rows with date/context. |
| TC-049 | Calendar history | Open 2026-04-18 completed event. | Event detail opens for 2026-04-18. | Event detail top with date. |
| TC-050 | Calendar history | Inspect 2026-04-18 Time History. | Rows are specific to 2026-04-18. | Event rows with date/context. |
| TC-051 | Calendar history | Open 2026-04-26 completed event. | Event detail opens for 2026-04-26. | Event detail top with date. |
| TC-052 | Calendar history | Inspect 2026-04-26 Time History. | Rows are specific to 2026-04-26. | Event rows with date/context. |
| TC-053 | Calendar history | Compare screenshots of two different event details. | Different events do not show identical stale Time History data. | Side-by-side or two screenshot references in protocol. |
| TC-054 | Calendar history | Scroll event detail if Time History is below fold. | Time History remains accessible and readable. | Scrolled event detail. |
| TC-055 | Calendar history | Close event detail and reopen same event. | Time History reappears consistently. | Reopened event detail. |
| TC-056 | Calendar history | Open Calendar after Members History check. | Calendar still works after modal interactions. | Calendar overview after modal flow. |
| TC-057 | Calendar history | Open Members after Calendar event detail. | Members History actions still work after Calendar flow. | Members screen after Calendar flow. |
| TC-058 | Finalize flow | Create a new dated individual event in test DB. | Event appears in Calendar/Event setup as expected. | Created event visible. |
| TC-059 | Finalize flow | Add/select swimmers for the new event. | Swimmers/lanes are visible in event setup/heat flow. | Event setup/heat view. |
| TC-060 | Finalize flow | Enter finish times for multiple swimmers. | Results screen shows entered times. | Results entry screen. |
| TC-061 | Finalize flow | Finalize event. | Finalization completes with success state/no error. | Post-finalize screen/state. |
| TC-062 | Finalize flow | Immediately open Calendar event detail without browser refresh. | Time History section appears. | Event detail after finalize. |
| TC-063 | Finalize flow | Immediately open affected swimmer History without browser refresh. | New history row appears. | Member history after finalize. |
| TC-064 | Finalize flow | Confirm history row count for event in UI. | Event Time History shows expected multiple rows, not empty. | Event Time History rows. |
| TC-065 | Finalize flow | Confirm history row count for swimmer in UI. | Swimmer modal includes the new event date. | Member modal row. |
| TC-066 | Persistence | Browser reload app. | App reloads without losing data. | App after reload. |
| TC-067 | Persistence | After browser reload, reopen affected swimmer History. | Same history row remains visible. | Member history after reload. |
| TC-068 | Persistence | After browser reload, reopen Calendar event detail. | Same event Time History remains visible. | Event detail after reload. |
| TC-069 | Persistence | Stop server and restart with same DB path. | App starts and version remains v2.9.0. | Version/state screenshot or raw log plus app screenshot. |
| TC-070 | Persistence | After server restart, reopen affected swimmer History. | History rows remain visible after restart. | Member history after server restart. |
| TC-071 | Re-finalize | Reopen finalized event results. | Existing times are visible/editable through expected UI path. | Results screen before edit. |
| TC-072 | Re-finalize | Change one swimmer time to `11.00`. | Changed time is visible before re-finalize. | Edited result screen. |
| TC-073 | Re-finalize | Re-finalize same event. | Finalization completes without error. | Post-refinalize state. |
| TC-074 | Re-finalize | Open affected swimmer History. | Updated `11.00` row appears. | Member history after re-finalize. |
| TC-075 | Re-finalize | Inspect same swimmer/event/stroke in History. | Only one row exists for same swimmer/event/stroke, not duplicate rows. | Focused duplicate-defense crop. |
| TC-076 | Re-finalize | Open event Time History after re-finalize. | Event table shows updated time. | Event Time History after re-finalize. |
| TC-077 | Re-finalize | Count visible rows before/after re-finalize via UI/protocol. | Row count stays stable for same event, unless intentionally changed lanes. | Screenshot plus protocol row-count note. |
| TC-078 | Re-finalize | Browser reload after re-finalize. | Updated value persists. | Member history after reload/refinalize. |
| TC-079 | Re-finalize | Server restart after re-finalize. | Updated value persists. | Member history after restart/refinalize. |
| TC-080 | Re-finalize | Inspect Breaker Report after changed time. | Breaker report remains consistent with break marker behavior. | Breaker Report screenshot. |
| TC-081 | Formatting | Inspect time `13.25`. | Displays exactly as `13.25`, not `0.13`, `1325`, or malformed. | Time cell crop. |
| TC-082 | Formatting | Inspect time `11.00`. | Displays as `11.00`, preserving two decimals. | Time cell crop. |
| TC-083 | Formatting | Inspect previous best `16.00`. | Displays as `16.00`, not `0.16`. | Previous Best cell crop. |
| TC-084 | Formatting | Inspect previous best absent/null. | Displays dash/empty cleanly, not `null`, `undefined`, or `NaN`. | Previous Best absent crop. |
| TC-085 | Formatting | Inspect PB break marker. | Marker is clear and not confused with normal row. | Break marker crop. |
| TC-086 | Formatting | Inspect non-break marker. | Non-break row has no misleading trophy/break marker. | Non-break row crop. |
| TC-087 | Formatting | Inspect stroke/race labels. | Stroke/race names are readable and correct for rows. | Stroke/race crop. |
| TC-088 | Formatting | Inspect member names in event Time History. | Member names are visible and not replaced by IDs only. | Event row member-name crop. |
| TC-089 | Formatting | Inspect empty-state copy. | Empty state is human-readable and not technical JSON/error text. | Empty-state crop. |
| TC-090 | Formatting | Inspect browser console during M2 flows. | No app JavaScript errors; favicon noise may be separated if present. | Screenshot of final UI plus raw console log reference. |
| TC-091 | Regression | Open Dashboard. | Dashboard still loads after M2 changes. | Dashboard screenshot. |
| TC-092 | Regression | Open Members edit modal for an existing member. | Edit modal still opens and fields are readable. | Member edit modal. |
| TC-093 | Regression | Open Event Setup. | Event setup still loads. | Event setup screenshot. |
| TC-094 | Regression | Open Heat Builder for individual event. | Heat Builder still shows lanes/heats. | Heat Builder screenshot. |
| TC-095 | Regression | Open Results for individual event. | Results entry/readout still loads. | Results screenshot. |
| TC-096 | Regression | Open Relay event/results. | Relay members and variance remain visible. | Relay result/detail screenshot. |
| TC-097 | Regression | Archive an event. | Calendar/archive state changes visibly. | Calendar after archive. |
| TC-098 | Regression | Restore archived event. | Event returns visibly after restore. | Calendar after restore. |
| TC-099 | No M3 leakage | Scan navigation and M2 screens. | No Pointscore, accumulated season totals, reports/graphs, or constitution scoring appear as completed M2 features. | Navigation/full-page screenshots plus protocol banned-text scan. |
| TC-100 | Final evidence gate | Produce evidence index page/protocol linking all 99 prior screenshots. | Protocol shows 100/100 classified with screenshot paths and no unreviewed claims. | Protocol screenshot or generated evidence index screenshot. |

## Required Protocol Format

For every testcase, the protocol must include exactly this structure:

```text
TC-### — [title]
Status: PASS | FAIL | BLOCKED | NOT APPLICABLE
Requirement(s): R-M2-##
Screenshot(s): docs/screenshots/m2-user-interaction-100/TC-###-short-name.png
Visible evidence: [specific visible values/text]
Raw/log evidence: [if used]
Notes: [short]
```

## Pass Gate

M2 is not allowed to be described as user-interaction-proven under this spec unless:

- All 100 cases are classified.
- All non-`NOT APPLICABLE` visual cases have screenshots.
- Any `FAIL` or `BLOCKED` case has a concrete defect/harness explanation.
- Claude Code explicitly lists any cases that are API/log-supported but not screenshot-proven.
- Balerion visually reviews the resulting screenshot set before reporting the final verdict to Dino.

