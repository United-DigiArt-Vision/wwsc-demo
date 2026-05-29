# M3 User Interaction Test Spec — WWSC Reporting / Graphs / Pointscore

Version target: v3.0.0
Date: 2026-05-29
Owner: Balerion QA gate
Executor: Claude Code
Status: mandatory pre-signoff test target before M3 can be called complete

## Purpose

This spec defines the user-perspective proof package Claude Code must satisfy for WWSC Milestone 3. It does not authorize implementation by Balerion and it does not settle ambiguous scoring rules. It gives Claude Code a hard target: implement against the recovered M3 truth, update this spec if the PRD changes scope, then prove the app works from a user perspective with screenshots, logs, raw data checks, and exact commit/version evidence.

## Source Truth And Scope

M3 recovered from project truth:

- Bryan 2026-04-29 / milestone boundary: M3 = automated pointscore recording and accumulating, reports/graphs, constitution-based accumulation.
- Bryan 2026-05-20: individual graphs from history report/data should be possible from the M2 history-data foundation.
- Bryan 2026-05-23: Third milestone = "Create automated points core recording and accumulating", "Generate reports", "Accumulate results as defined in the constitution".
- 2026-05-11 recovery plan: pointscore engine, idempotent weekly persistence, season cumulative standings, weekly and season reports, total leaderboard, improvement summary from time history, print/export-friendly reports, simple graphs/charts.
- M2 v2.9.0 truth: individual time history with dated rows exists and must feed graph/report behavior without corrupting M1/M2 flows.

Out of M3 unless separately authorized: commercial hosting/SaaS, multiple clubs/customer isolation, production backups, access control, maintenance, live-data mutation, deployment, push/tag, or client contact.

## Provisional Scope Rules

Some M3 details are still ambiguous. Cases marked `PROVISIONAL` are mandatory discovery/acceptance targets, but Claude Code must not guess the underlying rule. Before coding those cases as final product behavior, Claude must produce or update the M3 PRD/acceptance checklist with the exact rule source and any open questions.

Known ambiguous areas:

- Constitution point allocation per placing.
- Tie handling.
- Break bonus, participation bonus, special-entry handling, and relay/team scoring.
- Whether all race types count equally toward pointscore.
- How re-finalized/corrected events replace prior pointscore entries.
- CSV/export columns and file naming.
- Exact graph definitions beyond the recovered examples.

## Mandatory Evidence Protocol

1. Use only `/Users/macmini001/Dropbox/Dino-Balerion-Claude-Code/Projekte/0004_swimming-app/code/`.
2. Before testing, record exact branch, HEAD, remote, merge base, tag status, `package.json` version, app `/api/version`, OS/browser, viewport, and DB path.
3. Use an isolated test DB. Do not mutate live production data.
4. Use real browser interaction for every visual case. API checks can support evidence but cannot replace screenshots for visible behavior.
5. Required viewport set for visual coverage: mobile 390x844, tablet 768x1024, desktop 1440x900, print/PDF where print/export is involved.
6. Every visual case needs a screenshot under `docs/screenshots/m3-user-interaction-v3.0.0/UIT-M3-###-short-name.png`.
7. Every data-correctness case needs raw API/DB/log evidence under `docs/evidence/m3-user-interaction-v3.0.0/`.
8. Capture browser console and page errors for the full run; favicon noise may be separated but not hidden.
9. No overclaiming: if a screenshot does not visibly prove the expected state, status is not `PASS`.
10. Final proof package must include a protocol, raw log, screenshot manifest, API/DB snapshots used for correctness checks, list of provisional cases resolved/unresolved, and exact changed files.

## Test Data Requirements

Create an isolated WWSC test dataset with at least:

- 30 swimmers, including active, inactive, no-history, sparse-history, and special-entry edge cases.
- 6 completed weekly events across at least two months.
- Individual races covering 25m, 50m, freestyle, formstroke labels, PB breaks, non-breaks, ties, absent swimmers, and no previous-best rows.
- Standard relay, Brace relay, Medley relay, and Pogo/event-special flows already supported by M1.
- At least 8 swimmers with 4+ dated M2 time-history rows.
- At least 2 swimmers with exactly one historical row.
- At least 2 swimmers with no history rows.
- At least one event re-finalized after changing results.
- Pointscore seed data with known manual expected totals, once PRD/constitution rules are resolved.

## Pass / Fail Classification

- `PASS`: user-visible screenshot and supporting log/API data prove the expected result on the correct branch/version.
- `FAIL`: product behavior does not match expected result, evidence is missing for a required visible state, or data totals are wrong.
- `BLOCKED`: test cannot be executed because required acceptance criteria, test data, or runtime setup is missing. Must include blocker owner and next action.
- `PROVISIONAL`: acceptance target exists but final expected values depend on PRD/constitution clarification. Claude may not convert it to PASS until the rule is documented.
- `NOT APPLICABLE`: allowed only if Balerion approves a PRD scope change and the spec is updated with the reason.

M3 is not signoff-ready if any case is `FAIL` or `BLOCKED`, or if any `PROVISIONAL` case affects shipped behavior without a resolved PRD rule.

## Traceability Matrix

| Source / Client Context | M3 Meaning | Test Sections |
|---|---|---|
| 2026-04-29 milestone boundary note | Automated pointscore, reports/graphs, constitution accumulation are M3 | UIT-M3-021 to 050, 071 to 090 |
| 2026-05-11 recovery timeline | Pointscore engine, idempotence, weekly persistence, leaderboard, print/export, graphs, QA regression | UIT-M3-021 to 100 |
| 2026-05-20 Bryan graph/history question | Individual swimmer graphs from M2 history data | UIT-M3-001 to 020, 061 to 070 |
| 2026-05-23 Bryan milestone restatement | Reports and constitution accumulation after M2 | UIT-M3-031 to 060, 071 to 090 |
| M2 v2.9.0 evidence and history endpoints | Historical rows with dates are the graph/report foundation | UIT-M3-001 to 020, 091 to 100 |
| V0006 / V0015 | Evidence-driven dev loop and skeptical Claude proof review | Evidence protocol, pass/fail rules, final proof package |

## Required Cases

| ID | Area | Role / user perspective | Preconditions / test data | Steps | Expected result | Evidence required | Risk guarded |
|---|---|---|---|---|---|---|---|
| UIT-M3-001 | History graphs | Coach viewing a swimmer trend | Swimmer A has 6 dated 50m freestyle rows | Open Members, open Swimmer A, choose graph/history view | A readable individual graph appears with all 6 dates in chronological order | Desktop screenshot, API history JSON | Graph omits or misorders M2 rows |
| UIT-M3-002 | History graphs | Coach comparing strokes | Swimmer A has freestyle and backstroke rows | Switch graph stroke filter from freestyle to backstroke | Graph updates labels/data without stale freestyle points | Screenshots before/after, console log | Stale chart state |
| UIT-M3-003 | History graphs | Coach viewing one-stroke timeline | Swimmer B has one stroke across 4 events | Open swimmer graph and inspect axis/legend | Axis labels are readable, time values show two decimals | Screenshot, data snapshot | Unreadable/malformed chart values |
| UIT-M3-004 | History graphs | Coach checking PB progression | Swimmer A has PB break and non-break rows | Enable PB/progression overlay if implemented | PB/progression markers match history rows | Screenshot, expected row table | Wrong PB interpretation |
| UIT-M3-005 | History graphs | Coach reading no-history swimmer | Swimmer C has no M2 history | Open graph for Swimmer C | Clean empty state, no crash or fake zeros | Screenshot, console log | Empty data crash |
| UIT-M3-006 | History graphs | Coach reading sparse history | Swimmer D has exactly 1 history row | Open graph for Swimmer D | Single datapoint is visible or clear one-row state appears | Screenshot, API JSON | Sparse data hidden |
| UIT-M3-007 | History graphs | Coach using date range | Swimmer A has rows before/after filter dates | Apply date range covering middle 3 events | Graph/table shows only included dates | Screenshot, API/filter log | Date filter wrong |
| UIT-M3-008 | History graphs | Coach clearing date range | Date range active from prior case | Clear/reset filters | Full history returns without reload | Screenshot before/after | Reset leaves hidden data |
| UIT-M3-009 | History graphs | Coach using member search | 30 swimmers exist | Search/select Swimmer A in graph/report control | Correct swimmer loads and name is obvious | Screenshot, network log | Wrong member selected |
| UIT-M3-010 | History graphs | Coach switching swimmers | Swimmer A and B have distinct histories | Switch from A to B | Chart/table changes to B only, no A leakage | Screenshots, API URLs | Cross-swimmer leakage |
| UIT-M3-011 | History graphs | Coach viewing mobile graph | Same populated swimmer | Open graph on 390x844 viewport | Chart/table readable, no overlap or clipped buttons | Mobile screenshot | Mobile unusable |
| UIT-M3-012 | History graphs | Coach viewing tablet graph | Same populated swimmer | Open graph on 768x1024 viewport | Controls and chart remain readable | Tablet screenshot | Tablet layout break |
| UIT-M3-013 | History graphs | Coach viewing desktop graph | Same populated swimmer | Open graph on 1440x900 viewport | Layout uses available space without truncation | Desktop screenshot | Desktop visual regression |
| UIT-M3-014 | History graphs | Coach refreshing page | Graph open with filters active | Browser refresh | App recovers; documented persistence behavior is honored | Before/after screenshots | Refresh loses required state |
| UIT-M3-015 | History graphs | Coach using browser back | Navigate Dashboard -> Graph view -> detail | Use browser back/forward | Navigation stays coherent and no blank screen | Screenshots, console log | Router/back regression |
| UIT-M3-016 | History graphs | Coach exporting graph view | Export/download in graph view if scoped | Click export/download | File/download or print view contains same swimmer/data | Screenshot, downloaded artifact hash | Export mismatch |
| UIT-M3-017 | History graphs | Coach printing graph view | Populated graph | Use print flow/PDF preview | Print output is readable and not clipped | Print/PDF screenshot | Print layout broken |
| UIT-M3-018 | History graphs | Coach reading invalid data | Test row has null previous best and valid time | Open graph/table | UI shows clean missing-value handling, no NaN/null | Screenshot, raw row | Invalid data leaks |
| UIT-M3-019 | History graphs | Coach validating data correctness | Known M2 history seed values | Compare chart points to API rows | Every displayed point maps to the stored row/date/time | Screenshot plus machine-readable comparison | Graph lies about stored history |
| UIT-M3-020 | History graphs | Coach checking graph accessibility | Populated graph | Keyboard focus graph controls and inspect text alternatives where possible | Controls are keyboard reachable; screenshots readable | Screenshot, accessibility log | Inaccessible chart controls |
| UIT-M3-021 | Pointscore setup PROVISIONAL | Admin confirming scoring rules | M3 PRD/rule table exists or is pending | Open pointscore/rule context | App/spec clearly identifies applied rule source or blocks until clarified | Screenshot, PRD link | Hidden guessed scoring |
| UIT-M3-022 | Pointscore engine PROVISIONAL | Coach finalizing event | Event with known placements | Finalize event | Pointscore entries are created according to documented rules | UI screenshot, DB/API rows, manual expected sheet | No automatic recording |
| UIT-M3-023 | Pointscore engine PROVISIONAL | Coach viewing weekly points | One completed scored event | Open weekly pointscore report | Every eligible swimmer has expected weekly points | Screenshot, calculation log | Wrong weekly totals |
| UIT-M3-024 | Pointscore engine PROVISIONAL | Coach checking placing points | Known race placements | Inspect per-race score detail | Points per place match rule table | Screenshot, expected table | Place-score error |
| UIT-M3-025 | Pointscore engine PROVISIONAL | Coach checking PB bonus | Race includes PB break | Inspect point detail | Bonus included/excluded exactly per rule table | Screenshot, API rows | PB bonus ambiguity |
| UIT-M3-026 | Pointscore engine PROVISIONAL | Coach checking non-break | Race has no PB break | Inspect point detail | No PB bonus shown where none applies | Screenshot, calculation log | False bonus |
| UIT-M3-027 | Pointscore engine PROVISIONAL | Coach checking tie handling | Two swimmers tie | Finalize and view score detail | Tie points match documented rule | Screenshot, DB/API rows | Tie rule wrong |
| UIT-M3-028 | Pointscore engine PROVISIONAL | Coach checking absence handling | Event includes absent swimmer | Finalize and view report | Absent swimmer gets exactly documented result/points | Screenshot, DB/API rows | Absent swimmer scored incorrectly |
| UIT-M3-029 | Pointscore engine PROVISIONAL | Coach checking special entry | Special-entry swimmer exists | Finalize and view report | Special-entry scoring/visibility matches rule | Screenshot, API rows | Special entry wrong |
| UIT-M3-030 | Pointscore engine PROVISIONAL | Coach checking manual correction | Finalized event is edited then re-finalized | Change a time and re-finalize | Prior point entries are replaced/idempotent; no duplicates | Screenshots, before/after DB count | Duplicate points after correction |
| UIT-M3-031 | Weekly reports | Coach opening reports area | Multiple scored events exist | Open Reports/Pointscore screen | Reports entry point is visible and named clearly | Screenshot | User cannot find M3 reports |
| UIT-M3-032 | Weekly reports | Coach selecting week/event | 6 completed events exist | Select a single week/event | Report displays only that week/event | Screenshot, API filter URL | Wrong week scope |
| UIT-M3-033 | Weekly reports | Coach reading race detail | Event has individual and relay races | Open weekly report details | Race sections are grouped and readable | Screenshot | Report unreadable |
| UIT-M3-034 | Weekly reports | Coach verifying member names | Seed has 30 swimmers | Inspect point rows | Rows show names, not only IDs | Screenshot | ID-only report |
| UIT-M3-035 | Weekly reports PROVISIONAL | Coach verifying relay scoring | Relay event is scored | Open weekly report relay section | Relay points/team handling matches documented rule | Screenshot, expected table | Relay scoring error |
| UIT-M3-036 | Weekly reports | Coach opening event report | Completed event with M1 report data | Open Event Report | Existing event report still opens and includes M3 additions only if scoped | Screenshot, console log | M1 report regression |
| UIT-M3-037 | Weekly reports | Coach reading breaker context | Event has breakers | Open report including breakers | Breakers remain visible and not confused with points | Screenshot | Breaker/points confusion |
| UIT-M3-038 | Weekly reports | Coach checking empty week | Week has no completed events | Select empty week/date range | Clean empty report state, no fake totals | Screenshot | Empty report crash |
| UIT-M3-039 | Weekly reports | Coach using date range | Scored events span two months | Filter report to one month | Only included events contribute | Screenshot, API totals | Date-range totals wrong |
| UIT-M3-040 | Weekly reports | Coach clearing report filters | Filter active | Reset filters | Full report returns | Screenshot | Reset broken |
| UIT-M3-041 | Season standings PROVISIONAL | Coach viewing season leaderboard | 6 scored events with known expected totals | Open season standings | Ranking and totals match manual expected data | Screenshot, expected CSV/JSON | Season total wrong |
| UIT-M3-042 | Season standings | Coach sorting leaderboard | Season standings visible | Sort by total points | Sort order changes correctly and remains readable | Screenshots before/after | Sort wrong |
| UIT-M3-043 | Season standings | Coach filtering members | Active/inactive members exist | Toggle active/all if implemented | Filtered members match label and no totals are lost incorrectly | Screenshot, API count | Wrong member inclusion |
| UIT-M3-044 | Season standings PROVISIONAL | Coach checking tie rank | Two equal season totals | Open leaderboard | Tie display/ranking matches documented rule | Screenshot, expected table | Tie ranking wrong |
| UIT-M3-045 | Season standings | Coach drilling into swimmer | Season leaderboard visible | Click swimmer row | Detail shows contributing events/races | Screenshot, API rows | No auditability |
| UIT-M3-046 | Season standings | Coach returning from detail | Swimmer detail open | Use back/close | Leaderboard returns with prior filters | Screenshot | Lost context |
| UIT-M3-047 | Season standings | Coach checking correction propagation | Event points changed by re-finalize | Reopen season standings | Season totals update exactly once | Screenshot, before/after totals | Stale season totals |
| UIT-M3-048 | Season standings | Coach checking archive behavior PROVISIONAL | Archived completed event exists | Archive/restore event then view standings | Inclusion/exclusion follows documented acceptance rule | Screenshot, DB/API rows | Archived event counted wrong |
| UIT-M3-049 | Season standings | Coach checking no-score state | No pointscore entries in DB | Open standings | Empty state explains no scored events yet | Screenshot | Blank/technical error |
| UIT-M3-050 | Season standings | Coach checking performance | 30 swimmers, 6 events | Open leaderboard | Report loads without visible hang; raw timing recorded | Screenshot, timing log | Sluggish report |
| UIT-M3-051 | Reports export PROVISIONAL | Coach exporting weekly report | Weekly report visible | Click CSV/export/download | File contains scoped rows/columns per PRD | Screenshot, downloaded file, hash | Export missing/wrong |
| UIT-M3-052 | Reports export PROVISIONAL | Coach exporting season standings | Season standings visible | Click CSV/export/download | File totals match UI totals | Screenshot, CSV artifact | UI/export mismatch |
| UIT-M3-053 | Reports export | Coach using print on weekly report | Weekly report visible | Trigger print/PDF | Printed report readable with headings and no clipped rows | Print/PDF screenshot | Print report unusable |
| UIT-M3-054 | Reports export | Coach using print on leaderboard | Season standings visible | Trigger print/PDF | Leaderboard print shows all required columns | Print/PDF screenshot | Print leaderboard clipped |
| UIT-M3-055 | Reports export | Coach downloading graph data | Graph/report with filter active | Export filtered graph/history data if scoped | Export respects active filters | Screenshot, artifact | Export ignores filters |
| UIT-M3-056 | Reports export | Coach checking filenames | Export actions available | Download weekly and season files | File names identify report/date/version clearly | Download log | Ambiguous files |
| UIT-M3-057 | Reports export | Coach checking empty export | Empty report state | Attempt export if available | Export disabled or empty file is clearly labeled | Screenshot, artifact if any | Misleading empty export |
| UIT-M3-058 | Reports export | Coach checking browser behavior | Export complete | Open/download file in test harness | No app crash or console errors | Screenshot, console log | Export crashes app |
| UIT-M3-059 | Reports export | Coach checking mobile export controls | Mobile viewport | Open reports and find export/print controls | Controls are reachable and text/icons fit | Mobile screenshot | Mobile controls hidden |
| UIT-M3-060 | Reports export | Coach checking tablet export controls | Tablet viewport | Open reports and use controls | Layout remains usable | Tablet screenshot | Tablet layout regression |
| UIT-M3-061 | Graph reports | Coach viewing top improvers | Swimmers with known improvements | Open top improvers graph/report | Ordering and improvement values match history data | Screenshot, expected table | Wrong improvement ranking |
| UIT-M3-062 | Graph reports | Coach filtering top improvers by stroke | Multi-stroke history exists | Apply stroke filter | Improver list recalculates for selected stroke | Screenshot, API data | Filtered graph wrong |
| UIT-M3-063 | Graph reports | Coach viewing leaderboard trend PROVISIONAL | Weekly point totals exist | Open season leaderboard trend | Trend values match weekly cumulative totals | Screenshot, expected data | Trend math wrong |
| UIT-M3-064 | Graph reports | Coach viewing weekly points graph PROVISIONAL | Weekly point totals exist | Open weekly points chart | Bars/points map to exact weekly totals | Screenshot, JSON comparison | Chart total mismatch |
| UIT-M3-065 | Graph reports | Coach selecting event points | Multiple events exist | Select event in graph control | Graph changes to selected event only | Screenshot | Event filter ignored |
| UIT-M3-066 | Graph reports | Coach handling long names | Member with long name exists | Open graph/report | Name wraps/truncates cleanly without overlap | Screenshot | Text overlap |
| UIT-M3-067 | Graph reports | Coach comparing graph/table | Graph with companion table exists | Compare visible graph values to table values | Values match exactly | Screenshot, data log | Graph/table divergence |
| UIT-M3-068 | Graph reports | Coach seeing chart legend | Multi-series graph exists | Inspect legend | Legend is readable and maps colors/series clearly | Screenshot | Ambiguous graph |
| UIT-M3-069 | Graph reports | Coach seeing empty chart filters | Filter produces no rows | Apply no-result filter | Clean empty state, controls remain usable | Screenshot | Empty chart crash |
| UIT-M3-070 | Graph reports | Coach checking accessibility | Graph controls exist | Keyboard tab through filters/chart actions | Focus is visible and order is logical | Screenshot, accessibility notes | Keyboard inaccessible |
| UIT-M3-071 | Constitution accumulation PROVISIONAL | Admin confirming constitution source | PRD has constitution rule table | Open/admin/report scoring source if implemented | Applied constitution version/source is documented in UI/docs | Screenshot, PRD link | Untraceable constitution logic |
| UIT-M3-072 | Constitution accumulation PROVISIONAL | Coach checking accumulation by event | Event with known constitution result | Finalize and inspect accumulation | Results accumulate per documented constitution rule | Screenshot, DB/API rows | Constitution math wrong |
| UIT-M3-073 | Constitution accumulation PROVISIONAL | Coach checking accumulation by swimmer | Swimmer has results across events | Open swimmer contribution detail | Accumulation matches expected event list | Screenshot, expected table | Missing contribution rows |
| UIT-M3-074 | Constitution accumulation PROVISIONAL | Coach checking relay/team constitution logic | Relay scored event exists | Inspect constitution accumulation | Team/member allocation matches rule | Screenshot, expected table | Relay constitution error |
| UIT-M3-075 | Constitution accumulation PROVISIONAL | Coach checking correction | Re-finalize a scored event | Inspect constitution totals | Prior accumulation is replaced, not duplicated | Screenshots, DB count | Duplicate accumulation |
| UIT-M3-076 | Constitution accumulation PROVISIONAL | Coach checking archived event | Archived event exists | Archive/restore and inspect totals | Inclusion follows documented rule | Screenshot, API rows | Archive inclusion wrong |
| UIT-M3-077 | Constitution accumulation PROVISIONAL | Coach checking ties | Tie result exists | Inspect constitution totals | Tie behavior matches rule table | Screenshot, expected table | Tie constitution error |
| UIT-M3-078 | Constitution accumulation PROVISIONAL | Coach checking excluded race | Race type excluded/included by rule | Finalize and inspect totals | Inclusion/exclusion follows rule | Screenshot, DB/API rows | Wrong race inclusion |
| UIT-M3-079 | Constitution accumulation PROVISIONAL | Coach checking audit trail | Scored event exists | Open score detail/audit path | User can trace total back to event/race/source | Screenshot | Totals not auditable |
| UIT-M3-080 | Constitution accumulation PROVISIONAL | Coach checking final report | Full season data exists | Open constitution/season report | Report totals match all resolved rules | Screenshot, expected workbook/CSV | Final report wrong |
| UIT-M3-081 | Navigation | Coach finding M3 features | App loaded at Dashboard | Inspect sidebar/navigation | M3 reports/graphs/pointscore entry points are discoverable, not duplicated | Screenshot | Feature hidden or duplicated |
| UIT-M3-082 | Navigation | Coach returning to Dashboard | Reports screen open | Click Dashboard | Dashboard loads and no state corruption | Screenshot, console log | Navigation regression |
| UIT-M3-083 | Navigation | Coach using direct URL/reload | M3 route URL available if app supports routes | Load/reload M3 screen directly | App handles route or documented fallback cleanly | Screenshot | Blank route |
| UIT-M3-084 | Navigation | Coach using refresh persistence | Filters active | Refresh browser | Expected filters persist or reset per PRD, not unpredictably | Before/after screenshots | Unstable state |
| UIT-M3-085 | Navigation | Coach using back/forward | Move through reports, graph, detail | Browser back/forward | Correct prior views appear, no JS errors | Screenshots, console log | Browser history broken |
| UIT-M3-086 | Responsiveness | Coach on mobile reports | Mobile viewport | Open weekly report and season standings | Tables/cards readable; no horizontal overlap beyond intentional scroll | Mobile screenshots | Mobile reports unusable |
| UIT-M3-087 | Responsiveness | Coach on tablet reports | Tablet viewport | Open weekly report and graphs | Layout readable, controls fit | Tablet screenshots | Tablet reports unusable |
| UIT-M3-088 | Responsiveness | Coach on desktop reports | Desktop viewport | Open all M3 report screens | Layout polished, no excessive empty/overlap | Desktop screenshots | Desktop visual regression |
| UIT-M3-089 | Accessibility | Keyboard user | M3 screens loaded | Tab through navigation, filters, buttons | Focus visible; no keyboard trap | Screenshot, accessibility notes | Keyboard trap |
| UIT-M3-090 | Accessibility | Low-vision/readability check | M3 screens loaded | Inspect headings, contrast, print/readability | Text is readable in screenshots and print/PDF | Screenshots | Unreadable evidence/UI |
| UIT-M3-091 | M1 regression | Admin managing members | Existing member data | Add/edit/deactivate/reactivate member | M1 member flow still works | Screenshots, API log | M3 breaks members |
| UIT-M3-092 | M1 regression | Coach building heats | Standard individual event | Generate heats | Heat builder shows lanes/heats correctly | Screenshot | M3 breaks heat builder |
| UIT-M3-093 | M1 regression | Coach entering times | Standard event | Enter times and save | Results entry works with no console errors | Screenshot, console log | M3 breaks result entry |
| UIT-M3-094 | M1 regression | Coach using standard races | Event with freestyle/formstroke | Complete standard race flow | Reports/results remain correct | Screenshots | Standard race regression |
| UIT-M3-095 | M1 regression | Coach using special races | Brace/Pogo/Medley as available | Complete special race smoke | Existing special race outputs remain visible | Screenshots | Special race regression |
| UIT-M3-096 | M1 regression | Coach using relays | 25m relay and Medley relay | Generate teams, enter results, view report | Team members and variance remain visible | Screenshots | Relay report regression |
| UIT-M3-097 | M1 regression | Coach archiving events | Completed event exists | Archive and restore event | Event state changes visibly and reports remain coherent | Screenshots, API rows | Archive/restore regression |
| UIT-M3-098 | M2 regression | Coach viewing member history | Historical rows exist | Open member History modal | Dated rows still display correctly | Screenshot, API JSON | M3 breaks M2 history |
| UIT-M3-099 | M2 regression | Coach viewing event time history | Completed event exists | Open Calendar event detail | Time History section still displays and matches data | Screenshot, API JSON | M3 breaks event history |
| UIT-M3-100 | Final proof gate | Balerion QA consuming evidence | All prior cases executed | Produce final protocol/index | Protocol classifies 100/100, links screenshots/logs/artifacts, lists unresolved provisional items | Protocol file, screenshot manifest, raw log | Incomplete/overclaimed proof |

## Required Final Protocol Format

For every case, the final protocol must include this structure:

```text
UIT-M3-### — [title]
Status: PASS | FAIL | BLOCKED | PROVISIONAL | NOT APPLICABLE
Area:
Role/user perspective:
Preconditions/test data:
Steps executed:
Expected result:
Actual result:
Evidence:
  Screenshots:
  Logs/API/DB/artifacts:
Risk guarded:
Notes / open rule if provisional:
```

## Final Proof Package Required From Claude Code

Claude Code's final M3 handoff must include:

- Exact start and final branch/commit/tag/version/worktree status.
- M3 PRD and acceptance checklist path, with every provisional test resolved or explicitly left blocked.
- Updated test spec path if PRD scope changes.
- Raw command log for setup, migration, test seed, server start, browser run, API/DB comparisons, and export checks.
- Browser console/page error log.
- Screenshot directory and manifest.
- Downloaded CSV/PDF/export artifacts with hashes where applicable.
- Manual expected-results table for pointscore/constitution examples.
- List of `PASS`, `FAIL`, `BLOCKED`, `PROVISIONAL`, and `NOT APPLICABLE` counts.
- Statement of live-data boundary: no live mutation unless explicitly authorized.
- Clear "ready for Balerion QA" or "not ready" classification.

