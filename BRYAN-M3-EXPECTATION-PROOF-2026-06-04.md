# BRYAN M3 EXPECTATION PROOF — 2026-06-04

**Author:** Claude Code · **Branch:** `dev/v2.10.0-m3-history-graphs` · **Version:** `2.10.0`
**Purpose:** Prove, per Balerion's 2026-06-04 directive, that every reasonable Bryan/M3 expectation is implemented + tested + evidenced — or honestly classified when it cannot be.

## Verdict

**`PROVEN EXCEPT EXPLICIT CLIENT-MISSING CONSTITUTION INPUT`**

Every implementable M3 expectation under Bryan's 2026-06-02 working-assumptions message is implemented, tested, and evidenced. What cannot be proven is **Constitution-specific accumulation** (Bryan never sent/confirmed a Constitution) and **two specific report types** (improvement / attendance) whose definition Bryan never specified (QA-09 unanswered). These are classified `CLIENT INPUT MISSING`, not hidden as N/A.

## Sources (client truth)

- **S1** — Bryan 2026-05-23 (`messages/2026-05-23-Bryan-inbound-m2-met-production-questions.md`): "data can be exported as a .csv file as well as internal reports created by the app", "Is there a limitation on the historical records that can be kept?", and Milestone Three = "Create automated points core recording and accumulating / Generate reports / **Accumulate results as defined in the constitution**".
- **S2** — Bryan 2026-06-02 (`messages/2026-06-02-Bryan-inbound-m3-event-separated-month-season-addition.md`): "keep the [points] for each event separately. We do combine some of them for overall winners but [that] would be a simple addition at the end of each month and season."
- **S3** — Dino/Nedim 2026-06-02 assumptions sent to Bryan (`messages/2026-06-02-outgoing-to-bryan-m3-pointscore-assumptions-sent-confirmed.md`): event-separated points; monthly/season by simple addition; existing Excel pointscore sheets as the working scoring source; Constitution adjustable later if Bryan sends a separate rule.
- **S4** — Dino 2026-05-23 boundary (`messages/2026-05-23-outgoing-to-bryan-commercial-scope-boundary-sent-confirmed.md`): commercial hosted / multi-club / customer isolation is **separate scope**, not M1/M2/M3.
- **QA-09/10/11** (`M3-QUESTIONS-AND-ASSUMPTIONS-2026-05-29.md`): which specific reports / which CSVs / which columns — **never answered by Bryan**.

## Expectation Matrix

Status legend: **P** = PROVEN · **PWA** = PROVEN UNDER WORKING ASSUMPTION (Bryan-sent 2026-06-02) · **NAS** = NOT APPLICABLE WITH SOURCE · **CIM** = CLIENT INPUT MISSING · **GAP** = real gap.

| # | Bryan/M3 expectation | Source | Req | Implementation | API / UI | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | Automated pointscore recording per event | S1 (Third), S2 | R-M3-01 | `src/pointscore.js` `writeEventPointscore()` in finalize txn (`src/server.js`) | finalize → `GET /api/events/:id/pointscore` ; 🎯 Pointscore→Per-Event | UT2, UT3, UT4; UIT-M3-023, 037–044 | `pointscore-unit-results.json`; `event-pointscore.csv`; screenshots 023/037–044 | **PWA** |
| 2 | Event-separated pointscore | S2 ("each event separately") | R-M3-01/04 | per-`event_race` rows; per-event read API | `GET /api/events/:id/pointscore` ; Per-Event tab | UT2; UIT-M3-038, 039 | screenshots 038/039; `event-pointscore.csv` | **PWA** |
| 3 | Monthly winners by simple addition | S2 ("addition at end of each month") | R-M3-04 | `GET /api/pointscore/month/:ym` SUM over month | Monthly Winners tab | UT5; UIT-M3-050–060 | `monthly-2026-05.csv`; screenshots 050–060 | **PWA** |
| 4 | Season winners by simple addition | S2 ("...and season") | R-M3-04 | `GET /api/pointscore/season/:year` SUM over year | Season Winners tab | UT6; UIT-M3-061–070 | `season-2026.csv`; screenshots 061–070 | **PWA** |
| 5 | Excel pointscore sheets as working scoring source | S3 | R-M3-01/10 | `POINTSCORE_RULES` (5/4/3/2 indiv working assumption, 5/4/3 relay Bryan-confirmed 2026-06-05) + `scripts/extract-pointscore.py` | rule banner; `GET /api/pointscore/rules` | UT1; UIT-M3-011–022 | `docs/evidence/m3-pointscore/POINTSCORE-RULE-SOURCE-2026-06-03.md`, `pointscore-extract-raw.json`; banner screenshots | **PWA** |
| 6 | Constitution-specific accumulation | S1 ("Accumulate results as defined in the constitution") | R-M3-03 | engine keeps formula/season/Constitution isolated + adjustable; NOT hard-coded as confirmed | rule banner discloses "working assumption, not confirmed Constitution" | — (cannot test unconfirmed rules) | `DESIGN-SPEC-M3 §7`; banner | **CIM** — Bryan has not sent/confirmed the Constitution (QA-05/06). Next: Dino obtains the Constitution; then implement as a config/strategy addition. |
| 7 | Internal reports created by the app | S1 ("internal reports created by the app") | R-M3-06 | Pointscore reports (per-event / monthly / season / swimmer card) + existing breaker report | 🎯 Pointscore (4 tabs); Breaker report | UIT-M3-071–075; M1 breaker UIT-M3-105 | report screenshots | **PWA** (pointscore reports). Improvement (076) + Attendance (077) reports → **CIM**: Bryan asked for "reports" but never answered QA-09 (which reports + rules). |
| 8 | Individual graphs based on history data | Bryan 2026-05-20 graph question; R-M3-05 | R-M3-05 | `member-graph.js` SVG over `time_history` (accepted v2.10.0) | Members → swimmer → graph | `e2e-m3-history-graphs.cjs` (19/1/0); UIT-M3-091–099 | history-graphs regression log; graph screenshots | **P** |
| 9 | CSV export of data | S1 ("exported as a .csv file") | R-M3-07 | `/csv` endpoints: event, month, season, time-history, **members** | 4 pointscore/history CSV buttons + `GET /api/members/csv` | UIT-M3-081–090 (incl. 085 members) | `event-pointscore.csv`, `monthly-2026-05.csv`, `season-2026.csv`, `time-history.csv`, `members.csv` + `csv-sha256.txt` | **P** |
| 10 | Historical records limitation / retention | S1 ("limitation on the historical records") | R-M3-08 | documented policy: no hard cap; paginated | — (documentation answer) | — | `docs/M3-HISTORY-RETENTION-POLICY.md` | **P** (documented). Confirm with Bryan if he wants a cap. |
| 11 | Print / report presentation | R-M3-09 | R-M3-09 | `@media print` CSS; print buttons on reports | print controls on each report | UIT-M3-059, 070, 099 | print screenshots | **P** |
| 12 | M1/M2 regression protection | accepted v2.9.0 baseline; S4 | R-M3-11 | additive finalize hook; isolation switch; `#content`-scoped leakage scan | — | isolation proof; M2 55 + 100; UIT-M3-101–112 | `pointscore-isolation-proof.json`; `m2-regression-55/100.log`; screenshots 101–110 | **P** |
| 13 | Commercial hosted / multiple-club scope | S4 | R-M3-12 | none added (no tenant/role/access-control tables, routes, UI) | — | UIT-M3-118 diff review | `out-of-scope-diff.txt` | **NAS** — explicitly separate commercial scope per Dino's 2026-05-23 boundary message. |

## Deliverable B — disposition of the 6 prior M3-120 NOT APPLICABLE cases

| Case | Was | Now | Justification |
|---|---|---|---|
| UIT-M3-029 Brace | N/A | **NAS** | Special-team browser UI not seeded, but engine maps `25m_brace`/`50m_brace` → relay 5/4/3 (**UT10**) and the relay rule is exercised end-to-end by `medley_relay` (UIT-M3-030 PASS). Bryan's pointscore therefore applies correctly to brace. |
| UIT-M3-031 Pogo | N/A | **NAS** | Same as Brace: engine maps `pogo` → relay 5/4/3 (UT10); relay rule proven via medley_relay. |
| UIT-M3-076 Improvement report | N/A | **CIM** | Bryan asked for "internal reports" (S1) but never answered QA-09 (which reports + improvement criteria/period). Core pointscore reports delivered; this awaits Bryan input. |
| UIT-M3-077 Attendance report | N/A | **CIM** | Attendance data exists in-app, but QA-09 (which reports + any attendance scoring) is unanswered. Awaits Bryan input — not a casual N/A. |
| UIT-M3-085 Members CSV | N/A | **PASS** | Implemented `GET /api/members/csv` (member roster export; R-M3-07 lists member roster). Header + rows verified. |
| UIT-M3-100 Graph data export | N/A | **PASS** | The individual graph plots `time_history`; `GET /api/time-history/csv` exports the same dated rows — i.e. the graph's data export already exists. Header verified. |

Result: 6 prior N/A → **2 PASS** (085, 100), **2 NOT APPLICABLE WITH SOURCE** (029, 031 — engine-proven), **2 CLIENT INPUT MISSING** (076, 077).

## What we can honestly tell Dino / Bryan

- **Fully proven (no assumptions):** individual history graphs; CSV export (event / month / season / time-history / members); print-friendly reports; M1/M2 regression protection; history retention documented.
- **Proven under the 2026-06-02 working assumptions already sent to Bryan:** automated per-event pointscore; event-separated points; monthly + season winners by simple addition; Excel sheets (5/4/3/2 indiv) as the working scoring source, with relay/team corrected to 5/4/3 per Bryan's 2026-06-05 clarification. Individual scale + accumulation labelled in-app as working assumption, not confirmed Constitution; relay 5/4/3 is Bryan-confirmed.
- **Cannot be proven without Bryan input:** Constitution-specific accumulation rules (Bryan has not sent/confirmed the Constitution); the specific improvement + attendance report definitions (QA-09 unanswered).
- **Out of M3 by commercial boundary:** hosted/multi-club/customer-isolation/access-control (Dino's 2026-05-23 boundary message).

**Do not** tell Bryan the pointscore is "complete per the Constitution" — say it implements the agreed working assumptions and is adjustable when he sends the Constitution.

## Evidence run (clean HEAD)

See the accompanying delivery message for exact commands and tallies: unit 13/0 (incl. UT10), isolation PASS, M2 55/0, M2 100 98/2/0/0, M3-120 116 PASS / 2 NA / 2 CLIENT INPUT MISSING / 0 FAIL / 0 BLOCKED, history-graphs 19/1/0. No push / deploy / tag / merge / client-contact / live-data mutation.
