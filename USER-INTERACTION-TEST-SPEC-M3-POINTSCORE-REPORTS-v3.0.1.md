# M3 User Interaction Test Spec v3.0.1 — Pointscore / Reports / Graphs

Project: WWSC Swimming App  
Client: Bryan Hesketh  
Owner: Balerion QA gate  
Executor: Claude Code  
Date: 2026-06-03  
Status: mandatory Claude Code implementation and QA target

## Current Client Truth

Dino/Nedim already sent Bryan the working-assumptions message on 2026-06-02. M3 pointscore work is no longer blocked on another clarification round.

Claude Code must implement and test under these sent assumptions:

- Each event keeps its own pointscore separately.
- Monthly overall winners are calculated by adding the relevant event totals at the end of each month.
- Season overall winners are calculated by adding the relevant event totals at the end of the season.
- The existing Excel pointscore sheets are the working source for the scoring formula.
- If Bryan later sends a separate Constitution rule that differs from the spreadsheet, the implementation must be adjustable without damaging accepted M1/M2/v2.9.0 behavior.

Do not claim that a separate Constitution document has been confirmed. The correct internal wording is: working assumptions sent to Bryan.

## Required Evidence Rules

- Use an isolated local test DB only. Do not mutate live/customer data.
- Every visible user-flow case needs a screenshot under `docs/screenshots/m3-user-interaction-v3.0.1/`.
- Every calculation/export/persistence case needs raw evidence under `docs/evidence/m3-user-interaction-v3.0.1/`.
- Browser evidence must be real Playwright/Chrome interaction, not API-only substitution.
- API/DB/log checks are required for calculations, idempotency, exports, persistence, and isolation.
- Console/page errors must be captured for the full run.
- No `same logic as`, no `covered elsewhere`, no API substitute where UI evidence is required.
- Final protocol must classify every case as `PASS`, `FAIL`, `BLOCKED`, or `NOT APPLICABLE`.
- M3 is not ready if any case is `FAIL` or `BLOCKED`.

## Test Data Minimum

- 30 swimmers: active, inactive, no-history, sparse-history, long-name, special-entry edge cases.
- 8 completed events across at least 3 calendar months.
- At least 2 events in one month and at least 2 in a later month.
- Race types covering 25m, 50m, 75m, Backstroke, Breaststroke, Butterfly, 25m Brace, 50m Brace, Team Relay, Medley Relay, and Pogo where supported.
- Known fixture results with manual expected points extracted from the Excel pointscore sheets.
- At least one event re-finalized after result correction.
- At least one archived/restored event.
- At least 8 swimmers with 4+ dated time-history rows, 2 with one row, 2 with no rows.

## The 120 Required User Interaction Cases

| ID | Area | User Flow | Expected Result | Required Evidence |
|---|---|---|---|---|
| UIT-M3-001 | Baseline | Start app on M3 branch | App loads correct version, no blank screen | Screenshot, version API, console log |
| UIT-M3-002 | Baseline | Open Dashboard | Existing dashboard still readable | Screenshot |
| UIT-M3-003 | Navigation | Locate M3 report/pointscore entry | Entry is visible and not duplicated | Screenshot |
| UIT-M3-004 | Navigation | Move Dashboard -> Pointscore -> Members -> Reports | Navigation works without console errors | Screenshots, console log |
| UIT-M3-005 | Navigation | Use browser back/forward through M3 screens | Prior views restore coherently | Screenshots |
| UIT-M3-006 | Navigation | Refresh on Pointscore screen | Screen recovers or documented fallback appears | Screenshot, console log |
| UIT-M3-007 | Mobile | Open M3 navigation on 390x844 | Controls fit and remain usable | Mobile screenshot |
| UIT-M3-008 | Tablet | Open M3 navigation on 768x1024 | Layout remains readable | Tablet screenshot |
| UIT-M3-009 | Desktop | Open M3 navigation on 1440x900 | Layout uses space cleanly | Desktop screenshot |
| UIT-M3-010 | Accessibility | Keyboard tab through M3 navigation | Focus visible, no trap | Screenshot, notes |
| UIT-M3-011 | Excel Formula | Parse/list Excel pointscore sheets | Formula source sheets are identified | Raw extraction log |
| UIT-M3-012 | Excel Formula | Extract 25m pointscore source | Rule table documented from Excel | Rule artifact |
| UIT-M3-013 | Excel Formula | Extract 50m pointscore source | Rule table documented from Excel | Rule artifact |
| UIT-M3-014 | Excel Formula | Extract 75m pointscore source | Rule table documented from Excel | Rule artifact |
| UIT-M3-015 | Excel Formula | Extract Backstroke pointscore source | Rule table documented from Excel | Rule artifact |
| UIT-M3-016 | Excel Formula | Extract Breaststroke pointscore source | Rule table documented from Excel | Rule artifact |
| UIT-M3-017 | Excel Formula | Extract Butterfly pointscore source | Rule table documented from Excel | Rule artifact |
| UIT-M3-018 | Excel Formula | Extract 25m Brace source | Rule table documented from Excel | Rule artifact |
| UIT-M3-019 | Excel Formula | Extract 50m Brace source | Rule table documented from Excel | Rule artifact |
| UIT-M3-020 | Excel Formula | Extract relay/medley source | Rule table documented from Excel | Rule artifact |
| UIT-M3-021 | Rule Transparency | Open scoring rules UI/docs | UI states Excel is working source, not final separate Constitution | Screenshot |
| UIT-M3-022 | Rule Transparency | Open Pointscore banner | Banner explains event-separated plus monthly/season addition | Screenshot |
| UIT-M3-023 | Event Points | Finalize 25m event | Pointscore rows created for eligible finishers | UI screenshot, DB/API rows |
| UIT-M3-024 | Event Points | Finalize 50m event | Points match Excel-derived expected values | Screenshot, manual expected CSV |
| UIT-M3-025 | Event Points | Finalize 75m event | Points match Excel-derived expected values | Screenshot, DB/API rows |
| UIT-M3-026 | Event Points | Finalize Backstroke event | Points match Excel-derived expected values | Screenshot, calculation log |
| UIT-M3-027 | Event Points | Finalize Breaststroke event | Points match Excel-derived expected values | Screenshot, calculation log |
| UIT-M3-028 | Event Points | Finalize Butterfly event | Points match Excel-derived expected values | Screenshot, calculation log |
| UIT-M3-029 | Event Points | Finalize Brace event | Pair/member allocation matches documented working rule | Screenshot, DB/API rows |
| UIT-M3-030 | Event Points | Finalize relay/medley event | Team/member allocation matches documented working rule | Screenshot, DB/API rows |
| UIT-M3-031 | Event Points | Finalize Pogo/special event if supported | Scoring is explicit or clearly N/A | Screenshot, rule note |
| UIT-M3-032 | Event Points | Finalize event with absent swimmer | Absent swimmer is not incorrectly scored | Screenshot, DB rows |
| UIT-M3-033 | Event Points | Finalize event with special-entry swimmer | Handling is explicit and matches working rule | Screenshot, DB/API rows |
| UIT-M3-034 | Event Points | Finalize event with tie | Tie handling is documented and consistently applied | Screenshot, expected table |
| UIT-M3-035 | Event Points | Finalize event with PB break | Break/improvement handling follows Excel-derived rule or explicit no-bonus rule | Screenshot, expected table |
| UIT-M3-036 | Event Points | Finalize event without PB break | No false bonus appears | Screenshot, calculation log |
| UIT-M3-037 | Event Points | Open event pointscore detail | Per-race/per-swimmer values are auditable | Screenshot |
| UIT-M3-038 | Event Points | Open weekly/event pointscore report | Event keeps separate pointscore | Screenshot, API rows |
| UIT-M3-039 | Event Points | View two events same month separately | Event totals remain separate before monthly aggregation | Screenshots, API rows |
| UIT-M3-040 | Event Points | View same event after refresh | Pointscore persists | Screenshot, DB/API rows |
| UIT-M3-041 | Idempotency | Re-finalize unchanged event | No duplicate pointscore rows | Before/after DB count |
| UIT-M3-042 | Idempotency | Change time and re-finalize | Old point rows are replaced, not duplicated | Screenshots, DB rows |
| UIT-M3-043 | Idempotency | Change placement and re-finalize | Points recalculate exactly once | Expected table, DB rows |
| UIT-M3-044 | Idempotency | Server restart after scoring | Pointscore remains present | Screenshot, DB rows |
| UIT-M3-045 | Isolation | Compare finalize with pointscore disabled/enabled | time_history, variance, ranking, breaker outputs unchanged | Raw comparison log |
| UIT-M3-046 | Isolation | Verify M2 time_history after pointscore finalize | M2 history rows still correct | Screenshot, API rows |
| UIT-M3-047 | Isolation | Verify breaker thresholds after pointscore finalize | 25m 0.50s / 0.49s and other thresholds unchanged | Raw assertion log |
| UIT-M3-048 | Isolation | Verify existing ranking after pointscore finalize | Accepted ranking logic unchanged | Screenshot, DB/API rows |
| UIT-M3-049 | Isolation | Verify relay variance after pointscore finalize | Relay accepted readout unchanged | Screenshot |
| UIT-M3-050 | Monthly Totals | Open monthly pointscore view | Monthly winners shown by simple addition of event totals | Screenshot, expected CSV |
| UIT-M3-051 | Monthly Totals | Month with two events | Total equals event A + event B | Calculation log |
| UIT-M3-052 | Monthly Totals | Month with no events | Clean empty state, no fake totals | Screenshot |
| UIT-M3-053 | Monthly Totals | Switch from Month 1 to Month 2 | Totals update, no stale rows | Screenshots |
| UIT-M3-054 | Monthly Totals | Sort monthly table by points | Sort correct and stable | Screenshots |
| UIT-M3-055 | Monthly Totals | Drill into monthly swimmer row | Contributing events are visible | Screenshot, API rows |
| UIT-M3-056 | Monthly Totals | Correct event in month and re-open | Monthly total updates once | Before/after evidence |
| UIT-M3-057 | Monthly Totals | Archive event and view month | Inclusion/exclusion follows documented working rule | Screenshot, DB/API rows |
| UIT-M3-058 | Monthly Totals | Restore event and view month | Totals return correctly | Screenshot, DB/API rows |
| UIT-M3-059 | Monthly Totals | Print monthly report | Print output readable | Print/PDF screenshot |
| UIT-M3-060 | Monthly Totals | Export monthly report CSV | CSV matches visible totals | CSV artifact, hash |
| UIT-M3-061 | Season Totals | Open season pointscore view | Season winners shown by simple addition of event totals | Screenshot, expected CSV |
| UIT-M3-062 | Season Totals | Season spans multiple months | Total equals all relevant monthly/event totals | Calculation log |
| UIT-M3-063 | Season Totals | Filter to current season | Only included season events counted | Screenshot, API rows |
| UIT-M3-064 | Season Totals | Season with no scores | Clean empty state | Screenshot |
| UIT-M3-065 | Season Totals | Sort season leaderboard | Points desc/name fallback visible | Screenshots |
| UIT-M3-066 | Season Totals | Tie season totals | Tie display is documented and consistent | Screenshot, expected table |
| UIT-M3-067 | Season Totals | Drill into season swimmer row | Per-event contributions visible | Screenshot |
| UIT-M3-068 | Season Totals | Re-finalize event | Season total updates once | Before/after DB/API |
| UIT-M3-069 | Season Totals | Archive/restore event | Season totals follow documented rule | Screenshots, DB/API |
| UIT-M3-070 | Season Totals | Print season leaderboard | Print readable, no clipped columns | Print/PDF screenshot |
| UIT-M3-071 | Reports | Open Reports landing | M3 reports discoverable | Screenshot |
| UIT-M3-072 | Reports | Open event pointscore report | Separate event pointscore visible | Screenshot |
| UIT-M3-073 | Reports | Open monthly winners report | Monthly aggregation visible | Screenshot |
| UIT-M3-074 | Reports | Open season winners report | Season aggregation visible | Screenshot |
| UIT-M3-075 | Reports | Open swimmer pointscore card | Swimmer total plus event breakdown visible | Screenshot |
| UIT-M3-076 | Reports | Open improvement report if implemented | Values trace to time_history | Screenshot, API rows |
| UIT-M3-077 | Reports | Open attendance report if implemented | Values trace to attendance data | Screenshot, API rows |
| UIT-M3-078 | Reports | Open empty report filter | Clean empty state | Screenshot |
| UIT-M3-079 | Reports | Use report date/month filter | Included rows match filter | Screenshot, API URL |
| UIT-M3-080 | Reports | Clear report filters | Full data returns | Screenshot |
| UIT-M3-081 | CSV Export | Export event pointscore CSV | Headers and rows match UI | CSV artifact, screenshot |
| UIT-M3-082 | CSV Export | Export monthly pointscore CSV | Totals match UI and expected sheet | CSV artifact, hash |
| UIT-M3-083 | CSV Export | Export season pointscore CSV | Totals match UI | CSV artifact, hash |
| UIT-M3-084 | CSV Export | Export time-history CSV | Dated history rows match M2 API | CSV artifact, API rows |
| UIT-M3-085 | CSV Export | Export members CSV if provided | Columns are documented and readable | CSV artifact |
| UIT-M3-086 | CSV Export | Export with active filter | CSV respects filter | Screenshot, CSV artifact |
| UIT-M3-087 | CSV Export | Export empty state | Disabled or clear empty CSV behavior | Screenshot, artifact |
| UIT-M3-088 | CSV Export | Check filename pattern | Filename includes report/date/version context | Download log |
| UIT-M3-089 | CSV Export | Open exported CSV parser-side | CSV parses without malformed rows | Parser log |
| UIT-M3-090 | CSV Export | Mobile export controls | Controls reachable and text fits | Mobile screenshot |
| UIT-M3-091 | Graphs | Open existing individual graph | R-M3-05 graph still works | Screenshot |
| UIT-M3-092 | Graphs | Switch graph swimmer | No stale prior swimmer data | Screenshots, API rows |
| UIT-M3-093 | Graphs | Use graph stroke filter | Data and labels update correctly | Screenshot |
| UIT-M3-094 | Graphs | Use graph date/month filter | Graph rows match filter | Screenshot, API rows |
| UIT-M3-095 | Graphs | No-history swimmer graph | Clean empty state | Screenshot |
| UIT-M3-096 | Graphs | Sparse-history swimmer graph | One-point state readable | Screenshot |
| UIT-M3-097 | Graphs | Graph/table comparison | Visible graph values equal table/API | Screenshot, comparison log |
| UIT-M3-098 | Graphs | Mobile graph | No overlap/clipping | Mobile screenshot |
| UIT-M3-099 | Graphs | Print graph/report | Printable output readable | Print/PDF screenshot |
| UIT-M3-100 | Graphs | Export graph/history data if scoped | Export matches visible filter | Artifact, screenshot |
| UIT-M3-101 | Regression M1 | Member add/edit/deactivate/reactivate | Existing member flow unchanged | Screenshots, API log |
| UIT-M3-102 | Regression M1 | Create event and configure attendance | Existing event setup unchanged | Screenshot |
| UIT-M3-103 | Regression M1 | Generate heats | Existing heat builder unchanged | Screenshot |
| UIT-M3-104 | Regression M1 | Enter/save results | Existing results entry unchanged | Screenshot |
| UIT-M3-105 | Regression M1 | Breaker report | Existing breaker report unchanged | Screenshot |
| UIT-M3-106 | Regression M1 | Special races smoke | Existing Brace/Pogo/Medley outputs unchanged | Screenshots |
| UIT-M3-107 | Regression M1 | Relay team flow | Existing relay team/variance readout unchanged | Screenshots |
| UIT-M3-108 | Regression M1 | Archive/restore event | Existing archive/restore unchanged | Screenshots, DB/API |
| UIT-M3-109 | Regression M2 | Member History modal | Dated M2 rows unchanged | Screenshot, API rows |
| UIT-M3-110 | Regression M2 | Calendar event Time History | Dated event history unchanged | Screenshot, API rows |
| UIT-M3-111 | Regression M2 | M2 55-case runner | 55 PASS / 0 FAIL | Raw log |
| UIT-M3-112 | Regression M2 | M2 100-case runner | 98 PASS / 2 NA / 0 FAIL / 0 BLOCKED | Raw log |
| UIT-M3-113 | Responsiveness | Mobile pointscore report | Readable, no broken controls | Mobile screenshot |
| UIT-M3-114 | Responsiveness | Tablet pointscore report | Readable, no overlap | Tablet screenshot |
| UIT-M3-115 | Responsiveness | Desktop pointscore report | Polished and readable | Desktop screenshot |
| UIT-M3-116 | Accessibility | Keyboard through filters/export | Focus visible, no trap | Screenshot, notes |
| UIT-M3-117 | Accessibility | Long names and narrow cells | Text wraps/truncates cleanly | Screenshot |
| UIT-M3-118 | Out of Scope | Diff review for SaaS/commercial scope | No tenants/users/roles/commercial deployment added | Diff-review artifact |
| UIT-M3-119 | Evidence | Screenshot inventory complete | Every visible case links screenshot | Manifest |
| UIT-M3-120 | Final Gate | Produce final protocol | 120/120 classified with evidence links and no unresolved release-blocking gaps | Final protocol |

## Required Final Protocol Format

For every case:

```text
UIT-M3-### — [title]
Status: PASS | FAIL | BLOCKED | NOT APPLICABLE
Area:
Steps executed:
Expected result:
Actual result:
Evidence:
  Screenshots:
  Logs/API/DB/artifacts:
Notes:
```

## Required Claude Code Final Handoff

Claude Code must return:

- Starting branch/commit/version and final branch/commit/version.
- Changed files.
- Exact commands run.
- Raw logs.
- Screenshot manifest.
- CSV/export artifacts and hashes.
- Manual expected-results artifacts derived from Excel.
- Requirement-to-test-to-evidence matrix.
- Proof that no live data was mutated.
- Proof that no push, deploy, or tag was performed.
- Final verdict: ready for Balerion QA or not ready.
