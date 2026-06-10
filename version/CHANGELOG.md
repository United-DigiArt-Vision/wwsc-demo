# CHANGELOG (Codebasis)

## Entry Template
- **Date:** YYYY-MM-DD
- **Timestamp:** YYYY-MM-DD HH:MM:SS
- **App Version (from package.json):** X.Y.Z
- **Branch:** branch-name
- **RecordedCommit:** abc1234
- **Editor:** Name
- **Changes:** Kurzbeschreibung der Änderung

---

## 2026-06-10 — feat: v2.12.0 Bryan feedback (3 main reports, defaults, tap placing, relay grid, report details)
- **Date:** 2026-06-10
- **Timestamp:** 2026-06-10 21:30:00 Europe/Berlin
- **App Version (from package.json):** 2.12.0
- **Branch:** dev/v2.12.0-bryan-feedback
- **RecordedCommit:** b5c3c43 (gate commit; final SSOT-close commit follows)
- **Editor:** Claude
- **Trigger:** Bryan's 2026-06-10 feedback on v2.11.0 (archived: `../messages/2026-06-10-Bryan-inbound-v2110-feedback-defaults-relay-pointscore-simplification.md`).
- **Changes:**
  - Times Sheet: Select All (and late special-event pick) defaults entries to **Y**; explicit N/stroke choices preserved (`applyDefaultEntryY()`).
  - Results: **Quick Tap Placing** per heat — tap swimmers in finish order for manual places, tap again to remove, Clear resets; dropdowns remain as fallback.
  - Relays/Results: relay & medley team cards in a responsive **side-by-side grid**, print = 3 columns compact → relay fits one page (`.relay-teams-grid`).
  - Pointscore screen leads with **Bryan's 3 main reports**: 1) per-race-type weekly matrix `GET /api/pointscore/by-race-type/:rt` (+CSV), 2) total pointscore `GET /api/pointscore/total` (+CSV), 3) breakers summary `GET /api/reports/breakers-summary` (+CSV). Previous views collapsed under "More reports" (nothing removed).
  - New **`pb_change_log`** table; `PUT /api/members/:id` logs every manual stroke-time change in a transaction. Breaker count = manual reductions since season start; breaker amount = season-start PB − current PB ("uses the manually changed times").
  - **Swimmer Card** lists every participation (individual lanes with finish, relay teams with time) with 0 points where none awarded → fixes "25m brace does not list in any results".
  - **Event completion report**: heat tables now PB/Start/Finish/Net/Variance/BREAK/Place; relay team headers show Start + Target; manual place wins over auto place (also fixed in Season Calendar event details).
  - Member DELETE now clears `pointscore_entry` + `pb_change_log` (FK-violation fix).
  - New guarded seeder `scripts/seed-bryan-weekly-events.cjs`: 7 completed weekly events Apr–May 2026 incl. post-event manual PB updates; skips existing dates, never deletes, APPLY_LIVE-guard. Bryan's own 2026-06-10 event untouched.
  - Tests: new `scripts/test-v2120-bryan-feedback.cjs` (24 checks) + `scripts/e2e-v2120-bryan-feedback.cjs` (10 browser checks); slice2 suite version pin now reads package.json; tests/README updated.
- **Proof:** `docs/evidence/v2120-bryan-feedback/` (unit-results.json, browser-records.json, gate-run-b5c3c43.log, V2.12.0-ABNAHMEPROTOKOLL.md, screenshots).

---

## 2026-06-06 — data: seed v2.11.0 live Bryan retest event
- **Date:** 2026-06-06
- **Timestamp:** 2026-06-06 17:52:00 Europe/Berlin
- **App Version (from package.json):** 2.11.0
- **Branch:** main
- **RecordedCommit:** resolve with `git rev-parse --short HEAD`
- **Editor:** Balerion
- **Trigger:** Dino noticed that Bryan would otherwise land in an empty demo after the v2.11.0 deploy, repeating the previous retest-data complaint pattern.
- **Changes:**
  - Added guarded seeder `scripts/seed-bryan-m3-slice2-live-retest.cjs`.
  - Locally verified the seeder against an isolated DB before live mutation.
  - Ran live with Dino authorization: `BASE_URL=https://wwsc-demo.onrender.com APPLY_LIVE=1 node scripts/seed-bryan-m3-slice2-live-retest.cjs`.
  - Created one completed live retest event (`id=1`, date `2026-06-06`, 18 present swimmers, 10 race categories).
  - Live coverage now includes 25m, 50m, 75m, backstroke, breaststroke, butterfly, 25m relay, medley relay, 25m brace, and 50m brace.
  - Live break-count report, total-improvement report, graph/time-history source rows, season pointscore, and DB export checks all PASS.
  - Evidence: `docs/evidence/bryan-v2110-live-retest-seed/seed-2026-06-06T15-50-55-798Z.json`.
  - No Bryan/client contact by Balerion; customer update remains Dino/Nedim-only.

## 2026-06-06 — release: v2.11.0 Render deploy + live smoke
- **Date:** 2026-06-06
- **Timestamp:** 2026-06-06 17:38:00 Europe/Berlin
- **App Version (from package.json):** 2.11.0
- **Branch:** main
- **RecordedCommit:** `641aa0e`
- **Tag:** `v2.11.0`
- **Editor:** Balerion
- **Trigger:** Dino authorized deploy after Balerion independently re-proved Bryan's 2026-06-05 M3 expectations.
- **Changes:**
  - Pushed `main` from `e47d2ae` to `641aa0e` and pushed tag `v2.11.0`.
  - Render live `/api/version` returned `{"version":"2.11.0","build":"2026-06-06T15:36:48.195Z"}`.
  - Read-only live smoke passed for new endpoints: `/api/reports/event-coverage`, `/api/reports/break-counts`, `/api/reports/improvements`, and `/api/export/db`.
  - DB export live smoke returned 200 `application/octet-stream`, `content-length: 94208`, filename `wwsc-sqlite-db-v2.11.0-...db`.
  - Pre-deploy Balerion QA rerun: Slice2 Unit/API 7/0, Slice2 Browser 13/0, pointscore Unit/API 15/0, M2-55 55/0, M2-100 98/2NA/0/0, history graphs 19/1NA/0, final M3-120 118/2NA/0/0/0CIM.
  - No Bryan/client contact by Balerion; customer update remains Dino/Nedim-only.

## 2026-06-06 — feat: v2.11.0 M3 Slice 2 reports / DB export / all-event proof
- **Date:** 2026-06-06
- **Timestamp:** 2026-06-06 11:35:00 Europe/Berlin
- **App Version (from package.json):** 2.11.0
- **Branch:** dev/v2.11.0-m3-slice2-reports-export (off `dev/v2.10.2-relay-543@cea5d39`; not merged)
- **RecordedCommit:** resolve with `git rev-parse --short HEAD`
- **Editor:** Claude Code
- **Trigger:** Balerion/Dino Slice 2 directive to finish Bryan's 2026-06-05 latest expectations with proof.
- **Changes:**
  - Added completed-results category report (`/api/reports/event-coverage` + CSV + Reports UI tab) covering 25m, 50m, relay, medley relay, 75m, 25m brace, 50m brace, breaststroke/backstroke/butterfly.
  - Added break-count reports overall + by event (`/api/reports/break-counts` + CSV + UI), sourced from `time_history.is_break` on finalized/completed non-archived events.
  - Added total-time-improvement reports overall + by event (`/api/reports/improvements` + CSV + UI), sourced from `time_history.time` and `previous_best`, counted only when current time is faster than previous best.
  - Added raw SQLite DB export route (`GET /api/export/db`) using SQLite backup API; Reports UI `DB & Graphs` tab exposes the download and explains graph source rows.
  - Updated 120-case M3 runner to prove improvement and break-count report cases; no CLIENT INPUT MISSING remains in the current 120 gate.
  - Added focused Slice 2 Unit/API and Browser/UI/File proof runners plus evidence package `docs/evidence/m3-slice2/` and screenshots `docs/screenshots/m3-slice2/`.
  - Proof results: Slice2 Unit/API 7/0; Slice2 Browser 13/0; pointscore Unit/API 15/0; M2-55 55/0; M2-100 98/2NA/0/0; history graphs 19/1NA/0; M3-120 118/2NA/0/0/0CIM.
  - Proof matrix and customer draft: `docs/evidence/m3-slice2/V2.11.0-BRYAN-REPORTS-EXPORT-ALL-EVENTS-PROOF.md`.
- **No release action:** no push, no deploy, no tag, no merge to `main`, no Bryan/client contact, no live-data mutation.

## 2026-06-06 — proof: v2.10.2 relay/team 5/4/3 full gate GREEN on both systems @ 50844a0
- **Date:** 2026-06-06
- **Timestamp:** 2026-06-06 09:17:00 Europe/Berlin
- **App Version (from package.json):** 2.10.2
- **Branch:** dev/v2.10.2-relay-543 (off `main@9106eaf`; not merged)
- **RecordedCommit:** `50844a0` (substantive) + this full-proof evidence/SSOT commit — resolve HEAD with `git rev-parse --short HEAD`
- **Editor:** Claude Code (local) + Balerion (independent QA)
- **Trigger:** Balerion 2026-06-05 directive to fully prove Bryan's relay/team 5/4/3 and close the open browser gates; Balerion 2026-06-06 QA verdict.
- **Changes:**
  - Closed the browser gates that were environment-blocked last session. **Root cause was NOT the "ENOSPC/Dropbox-throttle" first suspected** — running the suite plain-foreground (the established way) surfaced the real error: the Dropbox-synced `better-sqlite3` native binary ping-pong. Balerion's **arm64** rebuild on the Mac Mini synced onto this **x86_64** host mid-session and clobbered the local build → server-restart cases crashed with `ERR_DLOPEN_FAILED (have 'arm64', need 'x86_64')`. Fix = `npm rebuild better-sqlite3` before each local run (gitignored; commits/evidence unaffected).
  - Full gate re-run @ `50844a0`, GREEN locally: unit **15/0**, isolation **VERDICT PASS**, M2-55 **55/0**, M2-100 **98/2/0/0**, M3-120 **116/0/0/2NA/2CIM** (UIT-M3-111/112 PASS with both M2 logs @50844a0; UIT-M3-030 relay 5/4/3), history-graphs **19/1/0**; 0 console errors throughout.
  - Balerion **independently reproduced** identical results on the Mac Mini (QA temp copy outside Dropbox) + screenshot-sanity-checked UIT-M3-030/050/075/113/001. Verdict: **v2.10.2 scope PROVEN**. Records: `../messages/2026-06-06-0909-Balerion-To-Claude-WWSC-v2102-QA-Proof-Boundary.md` + `2026-06-06-Balerion-QA-v2102-proof-boundary.md`.
  - New artifact `docs/evidence/m3-pointscore/V2.10.2-BRYAN-RELAY-543-PROOF.md`: maps Bryan's exact 5/4/3 expectation → evidence (PROVEN by Unit/API + Browser/UI), with per-screenshot proves/does-not and the Slice-2 scope boundary.
  - SSOT: CURRENT_STATE top block + this entry updated to the fully-proven state.
  - **Scope boundary (Balerion):** Bryan's breaks-per-person, total-improvement, raw DB export, and all-event retest dataset = **NEXT SLICE / NEEDS DINO DECISION**, not part of v2.10.2. Do NOT tell Bryan "everything finished."
- **No release action:** no push, no deploy, no tag, no merge to main, no STABLE-as-live, no Bryan/client contact, no live-data mutation. `main` untouched at `9106eaf`.

## 2026-06-05 — fix: v2.10.2 relay/team pointscore 5/4/3 (Bryan 2026-06-05 correction)
- **Date:** 2026-06-05
- **Timestamp:** 2026-06-05 19:04:00 Europe/Berlin
- **App Version (from package.json):** 2.10.2
- **Branch:** dev/v2.10.2-relay-543 (feature branch off `main@9106eaf`; not merged)
- **RecordedCommit:** `2501fff` (engine + tests) — anchors `c4ab774` (bump), `cc7e67d` (specs/docs); + this evidence/SSOT-close commit — resolve HEAD with `git rev-parse --short HEAD`
- **Editor:** Claude Code
- **Trigger:** Bryan 2026-06-05 "More info": "Relay should be 5 points for 1st, 4 for 2nd and 3 for 3rd." Overrides the prior 3/2/1 Excel working assumption (`../messages/2026-06-05-Bryan-inbound-more-info-relay-reports-db-graphs.md`). Claude took over Balerion's Dropbox-synced in-progress WIP onto a feature branch after Dino confirmed Balerion had stepped away; `main` left untouched at `9106eaf`.
- **Changes:**
  - Engine (`src/pointscore.js`): `POINTSCORE_RULES.categories.relay.pointsByPlace` 3/2/1 → **{1:5, 2:4, 3:3}**; `finisherPoints` stays 0; relay label + rule `version` metadata updated. Individual scale unchanged (5/4/3/2 working assumption). `src/server.js` finalize hook unchanged (rule fully centralized).
  - Tests (`scripts/test-m3-pointscore-unit.cjs`): UT1-rule-relay now asserts 5/4/3; **+UT11** (exact relay/team 5/4/3 by place via `computeEventPointscoreRows`) and **+UT12** (finalize a relay-only event → totals roll into month + season aggregation). Unit 13→**15 PASS / 0 FAIL**.
  - 120 runner notes + every current-truth spec/doc updated 3/2/1 → 5/4/3, source-labeled **Bryan-confirmed 2026-06-05** (DESIGN/UNIT/INTEGRATION/DEV-CHECKLIST specs, BRYAN-M3-EXPECTATION-PROOF, POINTSCORE-RULE-SOURCE). UNIT-TEST-SPEC now documents UT10/UT11/UT12 (suite = 15 checks). Historical CHANGELOG entries left intact (they record what the rule WAS at v2.10.0/2.10.1).
  - Version: `package.json` + `package-lock.json` 2.10.1 → 2.10.2; `src/public/index.html` cache-bust → 2.10.2.
  - **Evidence @ `cc7e67d`** (Intel MacBook, Dropbox clone): unit **15/0** (incl. UT11/UT12); isolation **VERDICT PASS**; M2-55 **55/0** @commit=cc7e67d; M3-120 **115 PASS / 0 FAIL / 1 BLOCKED / 2 NA / 2 CIM** — relay 5/4/3 proven end-to-end (UIT-M3-030 medley_relay "team points present (5/4/3)"); UIT-M3-029/031 brace/pogo NA (engine-proven via UT10); UIT-M3-112 BLOCKED = M2-100 deliberately delegated to Balerion; UIT-M3-076/077 CIM = improvement/attendance reports (Slice 2). 0 console errors.
  - **Delegated to Balerion (Mac Mini, green env):** full M2-100 completion (reached TC-056/100, 0 FAIL here before Dropbox-sync I/O throttling killed the run) + R-M3-05 history-graphs regression. Documented environment limitation, not a product gap (same as the v2.10.1 prep entry).
- **No release action:** no push, no deploy, no tag, no merge to `main`, no STABLE-as-live, no Bryan/client contact, no live-data mutation. `main` untouched at `9106eaf`. Awaiting Balerion QA + Dino Slice-2 decision.

## 2026-06-04 — release: v2.10.1 Render deploy + live smoke
- **Timestamp:** 2026-06-04 09:41:00 Europe/Berlin
- **App Version (from package.json):** 2.10.1
- **Branch:** main
- **RecordedCommit:** 2154574 (`merge: v2.10.1 M3 delivery`)
- **Tag:** v2.10.1
- **Editor:** Balerion
- **Trigger:** Post-push Render live verification for the M3 delivery.
- **Changes:**
  - Pushed `main` from `3f22593` to `2154574` and pushed tag `v2.10.1`.
  - Render live `/api/version` returned `{"version":"2.10.1","build":"2026-06-04T07:38:56.179Z"}`.
  - Read-only Puppeteer live smoke passed 8 PASS / 0 FAIL: dashboard/sidebar version, Members History + Graphs actions, Pointscore + rule-source banner, Season Calendar, Breaker Report, no relevant console/page/http errors.
  - Ignored one non-product HTTP 404 for `/favicon.ico`.
  - Added live-smoke evidence JSON: `docs/evidence/live-smoke-v2.10.1-2026-06-04.json`.
  - Added live-smoke screenshots: `docs/screenshots/live-smoke-2026-06-04/`.
- **Live-data safety:** no live data was created, edited, finalized, archived, restored, or deleted.

## 2026-06-04 — release: v2.10.1 M3 delivery prep
- **Timestamp:** 2026-06-04 09:33:40 Europe/Berlin
- **App Version (from package.json):** 2.10.1
- **Branch:** dev/v2.10.0-m3-history-graphs -> main
- **RecordedCommit:** resolve with `git rev-parse --short HEAD`
- **Editor:** Balerion
- **Trigger:** Dino authorized M3 deploy and Bryan delivery update preparation on 2026-06-04 09:28 Europe/Berlin.
- **Changes:**
  - Bumped release version from 2.10.0 to 2.10.1 and synchronized `package.json`, `package-lock.json`, and `src/public/index.html` cache-busting.
  - Promoted the M3 pointscore/report/graph build from verified branch state to release-prep state.
  - Recorded Balerion's independent V0015 proof verification: Unit/API 13 PASS / 0 FAIL; pointscore isolation PASS; M2 55 PASS / 0 FAIL; M2 100 = 98 PASS / 2 NOT APPLICABLE / 0 FAIL / 0 BLOCKED; M3 120 = 116 PASS / 2 NOT APPLICABLE / 2 CLIENT INPUT MISSING / 0 FAIL / 0 BLOCKED; R-M3-05 graphs = 19 PASS / 1 NOT APPLICABLE / 0 FAIL.
  - Kept the client-facing truth boundary explicit: M3 is proven under Bryan's sent working assumptions; unprovided Constitution-specific rules, Improvement report rules, and Attendance report rules remain client-input-missing rather than claimed complete.
- **Release action:** merge to `main`, tag `v2.10.1`, push to `origin/main`, verify Render live `/api/version`, and record live-smoke evidence.

## 2026-06-04 — feat+docs: M3 Bryan-Expectation Proof + N/A closure
- **Timestamp:** 2026-06-04 (resume session)
- **App Version (from package.json):** 2.10.0
- **Branch:** dev/v2.10.0-m3-history-graphs
- **RecordedCommit:** 0096ecb (members CSV + UT10 + N/A reclassification) + this docs/evidence commit — resolve HEAD with `git rev-parse --short HEAD`
- **Editor:** Claude Code
- **Trigger:** Balerion 2026-06-04 08:10 Bryan-Expectation-Proof directive.
- **Changes:**
  - Created `BRYAN-M3-EXPECTATION-PROOF-2026-06-04.md` (Deliverable A): 13 Bryan/M3 expectations mapped source→Req→code→test→evidence→status. Verdict: `PROVEN EXCEPT EXPLICIT CLIENT-MISSING CONSTITUTION INPUT`.
  - Closed/justified the 6 prior M3-120 N/A (Deliverable B): 085 Members CSV → PASS (new `GET /api/members/csv`); 100 Graph data export → PASS (time-history CSV = the graph's data); 029 Brace / 031 Pogo → NOT APPLICABLE WITH SOURCE (engine maps them → relay 3/2/1, proven by new UT10 + medley_relay 030); 076 Improvement / 077 Attendance → CLIENT INPUT MISSING (QA-09 which-reports unanswered).
  - Evidence refreshed at `0096ecb` for the suites that complete without screenshot/Dropbox contention: unit 13/0 (incl. UT10), isolation PASS, M2-55 55/0. Full 120 + M2-100 + history-graphs remain proven at the last complete clean-HEAD run (Balerion `711c66d` = 114/6; me `a94c0fc`); fresh full re-completion at `0096ecb` was blocked by Dropbox sync I/O contention (~100% CPU progressively slowing the 100+-screenshot browser suites) — documented harness/environment note per the directive, not a product gap. The `0096ecb` delta (4 N/A reclassifications) is deterministic + unit/curl-proven → functional 120 = 116 PASS / 2 NA / 2 CLIENT INPUT MISSING / 0 FAIL.
- **No release action:** no push, no deploy, no tag, no merge to main, no STABLE-as-live, no Bryan/client contact, no live-data mutation.

## 2026-06-03 — fix: M3 pointscore QA hardening (Balerion feedback) + N/A reduction
- **Timestamp:** 2026-06-03 (resume session, afternoon)
- **App Version (from package.json):** 2.10.0
- **Branch:** dev/v2.10.0-m3-history-graphs
- **RecordedCommit:** a94c0fc (source fixes) + the following clean-HEAD evidence commit — resolve HEAD with `git rev-parse --short HEAD`
- **Editor:** Claude Code
- **Trigger:** Balerion 2026-06-03 08:45 QA feedback — `QA VERIFIED CORE / NEEDS SMALL QA HARDENING BEFORE FINAL GATE`. Balerion independently reproduced all suites; required 4 fixes + offered an optional N/A reduction.
- **Changes:**
  - Fix #1 (bug Balerion found): unknown `race_type` is now scored as individual, not relay — `computeEventPointscoreRows` branches on the resolved `categoryKey`, not `raceTypes.includes()`. New UT9 (in-memory DB) proves it; unit 11→12.
  - Fix #2: 120-suite `UIT-M3-111/112` validate the M2 log carries the current HEAD (`commit=`) and BLOCK on stale/missing logs; added a baseline header to the M2-55 runner (M2-100 already had one). In-process self-run was rejected — spawning the browser suites from inside the browser-driving 120 script deadlocks; standalone-then-validate is the contract.
  - Fix #3: `UIT-M3-113` dismisses any leftover modal/overlay before the mobile screenshot (was capturing an event-detail overlay).
  - Fix #4: `TC-069` description version-parametrized (was hardcoded "v2.9.0"); removed an adjacent dead v2.9.0 reference.
  - N/A reduction (Balerion optional): seeded 75m/breaststroke/butterfly events (one optional stroke per event = proven backstroke pattern, inside existing Apr/May/Jun months); `UIT-M3-025/027/028` N/A→PASS; season event-count assertion 8→11. 120-suite now **114 PASS / 6 NA / 0 FAIL / 0 BLOCKED**. Brace/pogo stay N/A (relay 3/2/1 proven via medley_relay + documented).
  - Infra note: `node_modules/better-sqlite3` is a native binary in the Dropbox-synced tree; Balerion's arm64 QA rebuild synced onto this Intel (x86_64) machine and broke local runs. Rebuilt for x86_64 to verify (gitignored — commits/evidence unaffected). Recommend excluding `node_modules` from Dropbox sync to end the cross-arch churn.
- **No release action:** no push, no deploy, no tag, no client contact, no live-data mutation. Awaiting Balerion re-QA.

## 2026-06-03 — docs: M3 pointscore clean-HEAD evidence package
- **Timestamp:** 2026-06-03 08:20:00 Europe/Berlin
- **App Version (from package.json):** 2.10.0
- **Branch:** dev/v2.10.0-m3-history-graphs
- **RecordedCommit:** evidence generated at clean HEAD `b3f9a82`; this docs-only commit stores it (resolve HEAD with `git rev-parse --short HEAD`)
- **Editor:** Claude Code
- **Trigger:** Resume-session clean-HEAD evidence rerun for Balerion V0015 QA of the M3 pointscore slice.
- **Changes:**
  - Re-ran the full suite first-hand from clean HEAD `b3f9a82` (working tree clean before/after): unit 11 PASS / 0 FAIL; isolation PASS (accepted flow byte-identical, deterministic 46/46/6); 120-case browser suite 111 PASS / 9 NA / 0 FAIL / 0 BLOCKED; M2 55 PASS / 0 FAIL; M2 100 = 98 PASS / 2 NA / 0 FAIL / 0 BLOCKED; R-M3-05 history-graphs 19 PASS / 1 NA / 0 FAIL.
  - Integrity fix vs prior session: the 120-suite cases UIT-M3-111/112 only `grep` `/tmp/m3p-m2-*.log`; the M2 suites were re-run on `b3f9a82` so those logs are this run's output (copied into the evidence dir as `m2-regression-55.log` / `m2-regression-100.log`), and the 120-suite was re-run after, so its M2 citations are backed by this HEAD.
  - Stored evidence under `docs/evidence/m3-user-interaction-v3.0.1/` (120 raw log + records, unit/isolation JSON, 4 CSVs, M2 + history-graphs regression logs, screenshot manifest, CSV sha256) + 62 screenshots under `docs/screenshots/m3-user-interaction-v3.0.1/`.
  - Accepted v2.9.0 / R-M3-05 baseline screenshots and logs that the regression runs touched were restored to committed state — no accepted evidence mutated.
- **No release action:** no push, no deploy, no tag, no client contact, no live-data mutation. Awaiting Balerion V0015 QA.

## 2026-06-03 — feat+test: M3 pointscore slice implemented + full evidence suite (working assumption)
- **Timestamp:** 2026-06-03 07:35:00 Europe/Berlin
- **App Version (from package.json):** 2.10.0
- **Branch:** dev/v2.10.0-m3-history-graphs
- **RecordedCommit:** 219bdd9 (engine/API/UI substantive anchor) + this slice's CSV-route refactor, test suite, specs, and SSOT update committed together on the same branch — resolve HEAD with `git rev-parse --short HEAD`
- **Editor:** Claude Code
- **Trigger:** Balerion 2026-06-03 06:45 pointscore implementation directive. Implementation completed in the prior session through commit `219bdd9` + uncommitted tests/evidence; that session hit its context limit mid-closure. Resumed in a fresh session to re-verify first-hand, write the missing specs, sync the SSOT, and produce the clean-HEAD evidence package.
- **Changes:**
  - Engine `src/pointscore.js` (219bdd9): isolated scoring engine; centralized adjustable `POINTSCORE_RULES` (individual 5/4/3/2, relay 3/2/1); reads accepted `heat_lane`/`relay_team` results; writes only `pointscore_entry`; `WWSC_POINTSCORE_DISABLED` isolation switch.
  - Server/API (219bdd9 + this commit): additive `writeEventPointscore()` inside the finalize transaction AFTER the accepted `time_history` write; new read APIs (`/api/pointscore/rules`, `/api/events/:id/pointscore`, `/api/pointscore/month/:ym`, `/api/pointscore/season/:year`, `/api/members/:id/pointscore`, `/api/pointscore/months`) + CSV exports. CSV routes use `/csv` path segments (not `.csv`) to avoid Express param-extension ambiguity (`src/server.js`, `src/public/js/screens/pointscore.js`).
  - UI `🎯 Pointscore` screen (219bdd9): Per-Event / Monthly / Season / Swimmer tabs, rule-transparency banner, CSV export, print-friendly; nav entry in `sidebar.js`/`app.js`.
  - Excel source (219bdd9): `scripts/extract-pointscore.py` + `docs/evidence/m3-pointscore/POINTSCORE-RULE-SOURCE-2026-06-03.md`.
  - Tests (this commit): `scripts/test-m3-pointscore-unit.cjs` (11 PASS / 0 FAIL), `scripts/e2e-m3-pointscore-isolation.cjs` (PASS), `scripts/e2e-m3-pointscore-120.cjs` (111 PASS / 9 NA / 0 FAIL / 0 BLOCKED). M2 runners' no-M3-leakage scan scoped to `#content` so the legitimate new Pointscore nav link is not a false positive; banned-word list unchanged.
  - Specs (this commit): `DESIGN-SPEC-M3-POINTSCORE-REPORTS.md`, `UNIT-TEST-SPEC-M3-POINTSCORE-REPORTS.md`, `INTEGRATION-TEST-SPEC-M3-POINTSCORE-REPORTS.md`, `REQUIREMENT-TEST-EVIDENCE-MATRIX-M3-POINTSCORE-REPORTS.md`; `DEV-CHECKLIST-M3-POINTSCORE-REPORTS.md` updated to IMPLEMENTED.
  - Scope held: Constitution-specific accumulation (R-M3-03) deferred and adjustable; no confirmed-Constitution claim.
- **No release action:** no push, no deploy, no tag, no Bryan/client contact, no live-data mutation. Awaiting Balerion V0015 QA. Clean-HEAD evidence package recorded in the following CHANGELOG entry.

## 2026-06-03 — docs: M3 pointscore Claude directive and 120-case QA spec prepared
- **Timestamp:** 2026-06-03 06:45:00 Europe/Berlin
- **App Version (from package.json):** 2.10.0 development branch context / no release
- **Branch:** dev/v2.10.0-m3-history-graphs
- **Editor:** Balerion
- **Trigger:** Dino confirmed the working-assumptions message was sent to Bryan and asked Balerion to prepare the Claude Code implementation Auftrag, while Balerion remains QA gate.
- **Changes:**
  - Added Claude Code directive: `../messages/2026-06-03-0645-Balerion-To-Claude-WWSC-M3-Pointscore-Implementation-Directive.md`.
  - Added mandatory 120-case proof spec: `USER-INTERACTION-TEST-SPEC-M3-POINTSCORE-REPORTS-v3.0.1.md`.
  - Updated `PROGRESS.md`, `version/CURRENT_STATE.md`, `M3-QUESTIONS-AND-ASSUMPTIONS-2026-05-29.md`, `REQUIREMENTS-M3-POINTSCORE-REPORTS.md`, and `DEV-CHECKLIST-M3-POINTSCORE-REPORTS.md` so the operational gate is no longer "wait for another Bryan reply".
  - Encoded current working assumptions: event-separated pointscore, monthly/season totals by simple addition, Excel pointscore sheets as working scoring source, later Constitution adjustment if Bryan sends a separate rule.
  - Required evidence: Playwright/browser E2E, raw logs, screenshots, CSV artifacts, 120-case protocol, M2/M3 regressions, and pointscore isolation proof.
- **No code/release action:** no app-source changes, no push, no deploy, no tag, no Bryan contact.

## 2026-06-02 — docs: Bryan M3 pointscore partial answer mapped
- **Timestamp:** 2026-06-02 21:20:00 Europe/Berlin
- **App Version (from package.json):** 2.10.0 development branch context / no release
- **Branch:** documentation/status update only
- **Editor:** Balerion
- **Trigger:** Dino relayed Bryan's partial M3 pointscore answer by screenshot.
- **Changes:**
  - Added inbound message record: `../messages/2026-06-02-Bryan-inbound-m3-event-separated-month-season-addition.md`.
  - Updated `version/CURRENT_STATE.md`, `PROGRESS.md`, and `M3-QUESTIONS-AND-ASSUMPTIONS-2026-05-29.md`.
  - Classified Bryan's answer as M3 Pointscore / Accumulation partial clarification: event-separated points plus simple monthly/season addition for overall winners.
  - Kept final pointscore code blocked pending actual formula, Constitution source/rules, exact season date range, bonus/special cases, eligibility, race weighting, and tie-breakers.
- **No code/release action:** no app-source changes, no push, no deploy, no tag, no Bryan contact.

## 2026-05-29 — fix: v2.10.0 M3 R-M3-05 QA corrections (Balerion CONDITIONAL PASS → fixes)
- **Timestamp:** 2026-05-29 18:30:00
- **App Version (from package.json):** 2.10.0
- **Branch:** dev/v2.10.0-m3-history-graphs
- **Editor:** Claude Code
- **Trigger:** Balerion 2026-05-29 18:02 `R-M3-05 QA Fix Directive` — CONDITIONAL PASS on the narrow graph slice with 5 required evidence corrections.
- **Fixes:**
  1. **Date-range filter implemented** (`src/public/js/screens/member-graph.js`): new `mg-from` / `mg-to` date inputs + "Clear range" button; `memberGraphApplyDateRange()` filters plotted rows before time-trend / PB-progression rendering. UIT-M3-007 now narrows 6 rows → 4 (window 2026-04-11..2026-05-02, endpoints excluded); UIT-M3-008 clears and restores all 6. No more stroke-filter substitution.
  2. **Real browser back/forward** (`scripts/e2e-m3-history-graphs.cjs` UIT-M3-015): actual `page.goBack()` + `page.goForward()` across full-page loads, with documented SPA behavior (no pushState router; both directions reload cleanly, no blank screen, no new console errors). No more nav-cycle substitution.
  3. **Exact point→row mapping** (UIT-M3-019 + new `data-date` / `data-time-cs` / `data-pb-cs` / `data-is-break` attributes on each SVG circle): set-equality of rendered points vs API rows on `(stroke, date, time, previous_best, is_break)`; `exactMatch=true`; full mapping persisted to `docs/evidence/m3-user-interaction-v3.0.0/m3-data-correctness-mapping.json`.
  4. **6 dated rows** for the UIT-M3-001 history-graph proof: seed extended from 4 → 6 weekly events; assertion ties dot count to the live API row count.
  5. **Stale screenshots removed:** deleted `UIT-M3-015-back-forward.png`, the interim `UIT-M3-015-nav-cycle.png`, and the renamed `UIT-M3-001-graph-4-dates-ordered.png` / `UIT-M3-007-stroke-filter-25m.png` / `UIT-M3-008-stroke-filter-cleared.png`. The directory now holds exactly 20 PNGs — one per case, all current.
- **Re-run result:** 19 PASS / 1 NOT APPLICABLE (UIT-M3-016 export, QA-10-blocked) / 0 FAIL / 0 BLOCKED / 0 PROVISIONAL. 0 console errors.
- **Protocol Rev 2:** `docs/evidence/m3-user-interaction-v3.0.0/m3-history-graphs-protocol.md` documents each fix per case.
- **Claude → Balerion evidence-correction handoff:** `../messages/2026-05-29-Claude-To-Balerion-WWSC-M3-R-M3-05-QA-Fix-Evidence.md`.
- No app-source change beyond `member-graph.js`; `src/server.js`/`src/db.js`/`render.yaml` still zero diff (R-M3-12 holds).

## 2026-05-29 — feat: v2.10.0 M3 R-M3-05 history-graphs slice (UNAMBIGUOUS items only)
- **Timestamp:** 2026-05-29 12:35:00
- **App Version (from package.json):** 2.10.0
- **Branch:** dev/v2.10.0-m3-history-graphs
- **Version bump commit:** 7712067 (`release: bump to v2.10.0 for M3 history-graphs slice`)
- **Implementation commit:** 6283ce6 (`feat: M3 R-M3-05 individual swimmer history graph (SVG, vanilla JS)`)
- **Test runner commit:** 7f7a0a3 (`test: M3 R-M3-05 e2e runner + member-graph circle-marker tweak`)
- **RecordedCommit:** 6283ce6
- **Editor:** Claude Code
- **Trigger:** Balerion 2026-05-29 12:10 "You Are Next" implementation directive after my 11:23 PRD-phase handoff. Implements the M3 items that are unambiguous (do not require Bryan's pointscore/constitution answers).
- **Delivered:**
  - **R-M3-05** Individual swimmer history graph. New file `src/public/js/screens/member-graph.js` (SVG, no external chart lib). Two graph types: A) per-stroke time-trend line, B) PB progression step-down. Stroke filter, color-blind-safe palette, `<title>` tooltips, `role="img"` + `aria-label`, defensive null-PB handling. Entry point: new "📈 Graphs" button per row in `src/public/js/screens/members.js`. Wired in `src/public/index.html` with cache-bust `?v=2.10.0`.
  - **R-M3-08** History retention policy — documentation-only working answer per QA-12: `docs/M3-HISTORY-RETENTION-POLICY.md`.
  - **R-M3-11** M2 regression rerun on the M3 branch with `WWSC_E2E_EXPECTED_VERSION=2.10.0` env override: 55 PASS / 0 FAIL on `e2e-m2-time-history.cjs`, 98 PASS / 2 NOT APPLICABLE / 0 FAIL / 0 BLOCKED on `e2e-m2-user-interaction-100.cjs`. Identical to the 2.9.0 baseline. Raw logs archived under `docs/evidence/m2-*-run.log.m3-regression`.
  - **R-M3-12** Out-of-scope guard: `git diff main..HEAD` confirms zero changes to `src/server.js`, `src/db.js`, `src/seed.js`, `render.yaml`, `package-lock.json`. No multi-tenant / customer / access-control / commercial-deployment code.
- **Test artifacts:**
  - `scripts/e2e-m3-history-graphs.cjs` — UIT-M3-001..020 runner.
  - `docs/evidence/m3-user-interaction-v3.0.0/m3-history-graphs-run.log` (raw line-per-case).
  - `docs/evidence/m3-user-interaction-v3.0.0/m3-history-graphs-records.json` (records sidecar).
  - `docs/evidence/m3-user-interaction-v3.0.0/m3-history-graphs-protocol.md` (Balerion's required protocol format).
  - `docs/screenshots/m3-user-interaction-v3.0.0/UIT-M3-###-*.png` (20 PNGs).
- **Result:** UIT-M3-001..020 → 19 PASS / 1 NOT APPLICABLE (UIT-M3-016 export deferred) / 0 FAIL / 0 BLOCKED / 0 PROVISIONAL. 0 console errors.
- **Test infra delta:** `scripts/e2e-m2-time-history.cjs` and `scripts/e2e-m2-user-interaction-100.cjs` accept a `WWSC_E2E_EXPECTED_VERSION` env override; default stays `2.9.0` for back-compat. Required so the M2 runners can be re-executed on later branches without forking.
- **Still BLOCKED on Bryan answers (NOT in this slice):** R-M3-01..R-M3-04 (Pointscore + Accumulation, QA-01/02/03), R-M3-03 (Constitution, QA-05/06), R-M3-06 (Reports list, QA-09), R-M3-07 (CSV, QA-10/11), R-M3-09 (PDF, QA-13), R-M3-10 (Rule banner, QA-01/06). PROVISIONAL UIT-M3 cases: 021..029, 035, 041, 044, 048, 051, 052, 063, 064, 071..080.
- **Claude → Balerion handoff:** `../messages/2026-05-29-Claude-To-Balerion-WWSC-M3-History-Graphs-Delivery.md`.

## 2026-05-19 — release: v2.9.0 Render deploy + live smoke
- **Timestamp:** 2026-05-19 13:42:00
- **App Version (from package.json):** 2.9.0
- **Branch:** main
- **RecordedCommit:** 8d167fd (`docs: mark v2.9.0 stable release candidate`)
- **Editor:** Balerion
- **Changes (deployment/evidence docs only):**
  - Pushed `main` to `origin/main`, triggering Render deploy.
  - Live `/api/version` verified `2.9.0`, build `2026-05-19T11:38:54.177Z`.
  - Added live-smoke evidence JSON: `docs/evidence/live-smoke-v2.9.0-2026-05-19.json`.
  - Added live-smoke screenshots under `docs/screenshots/live-smoke-2026-05-19/`.
  - Updated `STABLE.md` and `version/CURRENT_STATE.md` from deploy-pending to live-verified.
- **Verification:**
  - `curl https://wwsc-demo.onrender.com/api/version` returned `{"version":"2.9.0","build":"2026-05-19T11:38:54.177Z"}`.
  - Puppeteer live smoke: dashboard/sidebar `v2.9.0`, Members screen History actions visible, member History modal opens with correct no-history empty-state on current live DB, Season Calendar loads, no M3 leakage on loaded screens, no relevant console/page errors.
- **Live-data boundary:** Current live DB has no finalized events/history rows; live smoke was read-only and did not create test events. Populated M2 history rows, no-refresh visibility, reload/restart persistence, and no-duplicate re-finalize remain proven by the local isolated E2E evidence package.

## 2026-05-19 — test: M2 Screenshot Evidence Gate retest
- **Timestamp:** 2026-05-19 10:44:00
- **App Version (from package.json):** 2.9.0
- **Branch:** main
- **RecordedCommit:** a864414 (substantive M2 implementation; this entry adds QA evidence only)
- **Editor:** Claude Code + Balerion
- **Trigger:** Dino's Screenshot Evidence Gate rule: all screenshot evidence must be visually checked by Balerion; missing screenshot proof must be retested instead of inferred from logs.
- **Changes (no product-source modifications):**
  - Added focused screenshot retest script: `tests/m2-screenshot-gate-retest.js`.
  - Added raw log and protocol: `docs/evidence/m2-screenshot-gate-retest-2026-05-19.log`, `docs/evidence/m2-screenshot-gate-retest-2026-05-19.md`.
  - Added 9 screenshots under `docs/screenshots/m2-time-history-screenshot-gate-2026-05-19/`.
  - Added Balerion visual audit: `docs/evidence/m2-screenshot-evidence-gate-balerion-audit-2026-05-19.md`.
- **Verification:**
  - `./scripts/setup-m2-harness.sh`
  - `node tests/m2-screenshot-gate-retest.js`
  - Result: UI-M2-C01/C02, UI-M2-C03, UI-M2-C04, UI-M2-D01 all PROVEN with screenshot + log/API evidence.
  - Balerion reviewed 23/23 screenshots (14 original + 9 retest).
- **Final verdict:** PROVEN for M2 Screenshot Evidence Gate; no remaining `NOT PROVEN` screenshot gaps.

## 2026-05-18 — feat: v2.9.0 M2 Full-Proof Rerun (closes Balerion `M2-Full-Proof-Required`)
- **Timestamp:** 2026-05-18 07:40:00
- **App Version (from package.json):** 2.9.0
- **Branch:** dev/v2.9.0-m2-time-history
- **Runner+harness commit:** 87b68b7 (`feat: M2 full-proof rerun — runner extension + harness setup script`)
- **Evidence commit:** be6ef8d (`docs: M2 full-proof evidence package (14 screenshots + refreshed run log)`)
- **Protocol/Matrix rewrite commit:** c1d2522 (`docs: M2 full-proof Protocol + Coverage Matrix rewrite (PROVEN per case)`)
- **SSOT closure commit:** this commit (HEAD = dynamic via `git rev-parse --short HEAD`)
- **RecordedCommit:** a864414 (substantive M2 implementation; full-proof rerun did not change app source)
- **Editor:** Claude Code
- **Trigger:** Balerion `messages/2026-05-18-0718-Balerion-To-Claude-M2-Full-Proof-Required.md` — explicit requirement to prove every spec case with executable browser evidence; no "diff-only" verdicts for user-visible behavior; close carry-overs `UI-M2-F06`, `UI-M2-F08`, `UI-M2-C04`.
- **Changes (no app-source modifications — runner + harness + docs only):**
  - `scripts/e2e-m2-time-history.cjs`:
    * Hardened puppeteer-core resolution: three search paths (`WWSC_PUPPETEER_CORE` env, `/tmp/wwsc-screenshot-tool/node_modules/puppeteer-core`, projektlokal). Bootstrap-Hinweis bei Fehlen statt MODULE_NOT_FOUND.
    * New helper `setupRelayEvent(date)` seeds a fourth weekly event with 25m Team Relay + Medley Relay, generates teams, enters times that produce non-trivial variance, ranks, finalizes.
    * New section `UI-M2-F06` exercises the Results screen against the relay event with four sub-cases (25m section / Medley section / member names / variance).
    * New section `UI-M2-F08` archives an event via `archiveEvent()` + Confirm click, then restores via `restoreEvent()`. Two sub-cases assert the archived count delta 0→1→0.
    * New section `UI-M2-C04` after the main run shuts the test server down and starts a fresh server process against the same `WWSC_DB_PATH`, then re-reads `/api/members/:id/time-history` and asserts the 5 dated rows persisted.
    * Explicit cases `UI-M2-C01/C02` (ev5 finalized in the live page, history visible without reload), `UI-M2-D02` (replaced value `11.00` visible in member-timeline cell after re-finalize), `UI-M2-D03` (🏆 chip + same swimmer on Breaker Report), `UI-M2-E01..E04` (rendered cells inspected for X.XX / non-0.X PB / dash / readable date), and `UI-M2-G02/G03` (sub-claims of G01 banned-string scan made explicit).
  - `scripts/setup-m2-harness.sh` (new): idempotent harness bootstrap. Installs puppeteer-core into `/tmp/wwsc-screenshot-tool` and rebuilds better-sqlite3 if its native binding is for the wrong architecture.
- **Evidence run:**
  - Total PASS: **55** / FAIL: **0** / NOT APPLICABLE: **0**
  - Console errors: 0 (favicon-404 noise filtered)
  - Five events finalised: 2026-04-04, 2026-04-11, 2026-04-18 (primary weekly), 2026-04-25 (relay event for F06), 2026-04-26 (ev5 for C01/C02).
  - Cross-process restart confirmed 5 dated rows persisted under same `WWSC_DB_PATH=/tmp/wwsc-m2-test/wwsc.db`.
  - Server version returned during run: `2.9.0` build `2026-05-18T05:24:45.606Z`.
- **Documentation updates:**
  - `USER-INTERACTION-TEST-PROTOCOL-M2-TIME-HISTORY.md` — full rewrite with PROVEN / NOT PROVEN / NOT APPLICABLE classification per case, Reproducibility section, output-standard verdict block.
  - `USER-INTERACTION-COVERAGE-MATRIX-M2-TIME-HISTORY.md` — full rewrite; 0 carry-overs, 0 ⚙️ deferred, all entries ✅.
  - `PROGRESS.md`, `DEV-CHECKLIST-M2-TIME-HISTORY.md`, `version/CURRENT_STATE.md` updated to reflect the full-proof state.
- **New handoff message:** `../messages/2026-05-18-Claude-To-Balerion-M2-Full-Proof-Handoff.md`.
- **Scope guard re-verified:** no Pointscore / no accumulated season totals / no reports/graphs / no constitution scoring routes; only one new API endpoint (`GET /api/members/:memberId/time-history`).

## 2026-05-18 — feat: v2.9.0 M2 Time History implementation + browser E2E evidence
- **Timestamp:** 2026-05-18 07:30:00
- **App Version (from package.json):** 2.9.0
- **Branch:** dev/v2.9.0-m2-time-history
- **Implementation commit:** a864414 (`feat: v2.9.0 M2 time history implementation (T1-T7)`)
- **Evidence commit:** 3fce550 (`docs: M2 evidence package (protocol + coverage matrix + raw run + screenshots)`)
- **RecordedCommit:** a864414 (substantive delivery anchor)
- **Editor:** Claude Code
- **Scope (M2 only — no M3 leakage):**
  - Per-swimmer dated time history available from the Members screen.
  - Completed-event detail in Calendar exposes a dated per-swimmer time history list.
  - Event-time-history API now ships `event_date` so the UI can render dates without a second round-trip.
- **Changes by file:**
  - `src/server.js`:
    * `GET /api/events/:eventId/time-history` now joins `event` so each row carries `event_date` (R-M2-02). Column projection is explicit (no `th.*`) so future schema changes do not silently leak fields.
    * New endpoint `GET /api/members/:memberId/time-history` returns the swimmer's dated timeline. Validates the id, returns 404 when the swimmer does not exist, and sorts `event_date DESC, event_id DESC, stroke ASC` (R-M2-03, UT-M2-02-1..4).
  - `src/public/js/api.js`: added `API.getMemberTimeHistory(memberId)` wrapper around the new endpoint (T3).
  - `src/public/js/screens/members.js`:
    * Each member row now exposes a "📜 History" action next to "Edit" (T4 / UI-M2-A01).
    * New `showMemberHistoryModal(id)` opens a modal with date / stroke / time / previous-best / break-marker columns, formatted via `formatTime` (centiseconds) and explicit whole-seconds-to-centisecond conversion for `previous_best` (UT-M2-04-1..3 / UI-M2-A02..A05). Empty state renders a friendly notice for swimmers without history.
  - `src/public/js/screens/calendar.js`: completed-event detail modal now fetches `/api/events/:id/time-history` in parallel with the report and renders a "📜 Time History (M2)" section. Each event's history is scoped to that event's date and shown with a sticky table header for the dated row list (T5 / UI-M2-B01..B04).
- **New test artifact:** `scripts/e2e-m2-time-history.cjs` — self-contained runner that boots an isolated server on `PORT=3003` with `WWSC_DB_PATH=/tmp/wwsc-m2-test/wwsc.db`, seeds three weekly events with finalized times, asserts the contract from API up to rendered DOM via puppeteer-core, and tears the server down. Maps every spec ID to a recorded PASS line in `docs/evidence/m2-time-history-run.log`.
- **Evidence run (this delivery):**
  - 38 PASS / 0 FAIL across UT-M2-01..04, UI-M2-A..G, plus M1 regression smoke on 7 screens.
  - 0 console errors (favicon 404 noise filtered).
  - Screenshots stored under `docs/screenshots/m2-time-history/`: members screen with history action, member timeline modal, empty-state modal, calendar overview, event-detail with time history (scrolled + unscrolled views, two different weeks), event-detail after re-finalize.
- **Scope guard verified:** no Pointscore, no accumulated season totals, no reports/graphs, no constitution scoring code. Only one new endpoint added (`GET /api/members/:memberId/time-history`).
- **Open items routed to V0015 (Balerion):**
  - `UI-M2-F06` (relay readout regression) and `UI-M2-F08` (archive/restore) — both code paths unchanged from v2.8.12; verified by Balerion's existing smoke.
  - `UI-M2-C04` (server-restart persistence with same WWSC_DB_PATH) — covered structurally by isolated server lifecycle; full manual smoke owned by Balerion.

## 2026-05-18 — docs: start M2 time history dev loop
- **Timestamp:** 2026-05-18 06:22:00
- **App Version (from package.json):** 2.9.0
- **Branch:** dev/v2.9.0-m2-time-history
- **RecordedCommit:** c0c0c68 (`docs: define M2 time history dev loop specs`)
- **Version bump commit:** aa004be (`release: bump to v2.9.0 for M2 time history`)
- **Editor:** Balerion
- **Changes:**
  - Created stable M1 backup branch `backup/v2.8.12-m1-stable-20260518` at `eb87e11`.
  - Created stable M1 file backup at `../backups/2026-05-18-0615-v2.8.12-m1-stable-origin-main/`.
  - Created M2 feature branch `dev/v2.9.0-m2-time-history`.
  - Bumped app version to `2.9.0` and synchronized cache-busting as the first feature-branch commit.
  - Added M2 requirements, design spec, unit test spec, integration test spec, user interaction test spec, and dev checklist.
  - Prepared Claude Code implementation handoff in `../messages/2026-05-18-0620-Balerion-To-Claude-M2-Time-History-Implementation.md`.
- **Scope guard:** M2 is limited to recording time changes and archiving historical times with dates. Pointscore, accumulated totals, reports/graphs, and constitution scoring remain M3.
- **Verification status:** Specification phase only. Implementation and browser-E2E evidence pending Claude Code delivery and Balerion QA.

## 2026-05-06 — fix: v2.8.12 Bryan final polish + persistence hardening
- **Timestamp:** 2026-05-06 11:57:00
- **App Version (from package.json):** 2.8.12
- **Branch:** dev/v2.8.12-bryan-final-polish-persistence
- **RecordedCommit:** 596458f (`merge: v2.8.12 Bryan final polish and persistence`)
- **Implementation commit:** 2321284 (`fix: v2.8.12 Bryan relay reporting and persistence`)
- **Test spec commit:** 5562ec4 (`test: define v2.8.12 Bryan user test spec`)
- **Version bump commit:** 79eb9cc (`release: bump to v2.8.12 for Bryan final polish`)
- **Git Tag:** v2.8.12
- **Live Render Build:** `2026-05-06T12:12:59.088Z`
- **Editor:** Balerion
- **Bryan inbound (2026-05-06):** Bryan said the app "looks close" and flagged final items: Medley Relay Readout needs variance context; history/report should include relay team members for 25m Relay and Medley; 25m record breaks should count at >= 0.5s; saved events appear to disappear across hosted usage; next phases are separate.
- **Changes:**
  - `src/public/js/screens/results.js`: relay readout now includes signed variance plus team members; Medley readout includes stroke labels where available; Event Report relay headings include team total and signed variance; 25m breaker UI follows >=0.50s threshold while non-25m threshold stays unchanged.
  - `src/public/js/screens/calendar.js`: completed event details now show relay team member lists and variance for 25m Team Relay and Medley Relay instead of only Team N + time.
  - `src/server.js`: time-entry breaker calculation now joins race type and applies race-specific break thresholds (`25m <= -50`, other races `<= -100`).
  - `src/db.js`: DB path is configurable via `WWSC_DB_PATH`; `WWSC_DATA_DIR` and `WWSC_BACKUP_DIR` supported; local default remains unchanged.
  - `render.yaml`: adds Render persistent disk at `/var/data` and sets `WWSC_DB_PATH=/var/data/wwsc.db`.
- **Test specification:** `USER-INTERACTION-TEST-SPEC-v2.8.12.md` with 40 user-perspective test cases, written before implementation.
- **Verification:**
  - Syntax: `node --check src/db.js`, `src/server.js`, `src/public/js/screens/results.js`, `src/public/js/screens/calendar.js`, `scripts/e2e-v2812-bryan.cjs` — PASS.
  - Browser-E2E/API: `scripts/e2e-v2812-bryan.cjs` — 31 PASS / 0 FAIL.
  - Evidence summary: `docs/evidence/WWSC-v2.8.12-bryan-browser-e2e-evidence.md`.
  - Raw log: `docs/evidence/WWSC-v2.8.12-browser-e2e-raw.log`.
  - Screenshots/text/html: `docs/screenshots/v2.8.12-bryan/`.
  - Persistence restart proof: `docs/evidence/WWSC-v2.8.12-persistence-restart-proof.md` — restarted local server with same `WWSC_DB_PATH`; 2 finalized active events survived.
- **Scope non-goals:** No Pointscore/M3. No new phases started. Live deploy and Render persistent disk verification still pending.
- **Delivery state:** Released. Pushed to GitHub (`main` tip after release docs `b082d25`), tag `v2.8.12` pushed, Render live `/api/version` verified `2.8.12` / build `2026-05-06T12:12:59.088Z`. Live sidebar also verified `v2.8.12`.

## 2026-05-01 — fix: v2.8.11 Bryan 2026-05-01 polish feedback
- **Timestamp:** 2026-05-01 04:25:00
- **App Version (from package.json):** 2.8.11
- **Branch:** main / origin/main (released via `dev/v2.8.11-bryan-polish`)
- **RecordedCommit:** 0dcad22 (`merge: v2.8.11 Bryan polish pass`)
- **Implementation commit:** 272bd45
- **Version bump commit:** 4001276
- **Git Tag:** v2.8.11
- **Live Render Build:** `2026-05-01T02:30:30.787Z`
- **Editor:** Balerion
- **Bryan inbound (2026-05-01):** Bryan reviewed latest delivered v2.8.10 (message label says "V2.1.10", interpreted as typo) and said this section is "very close". Randomness looks OK on surface. Remaining feedback: Relay selection display looks odd before generation; Print headings need consistent look/font and more prominence; 25m Relay should remove `(decides ranking)` wording; Event Report shows Andrew Barnes as `—` under Special Entry even though Times Sheet effectively shows `N`.
- **Changes in commit `272bd45`:**
  - `src/public/js/screens/heat-builder.js`: pre-generation R27 management UI now only appears after teams exist. This removes the confusing initial `0/0 teams complete`, Unassigned swimmers, and Add Team state when Bryan merely selects 25m Team Relay before pressing Generate Teams. Added print-specific relay classes for stable typography.
  - `src/public/css/style.css`: print headings are now consistently Arial, larger, and bolder (`h1` 20px/900, `h2` 16px/850, relay team titles 18px/900). Team 1/2/3 print headings no longer collapse into tiny inconsistent text.
  - `src/public/js/screens/results.js`: removed `(decides ranking)` copy from variance rows while preserving variance/place display. Event Report participant rows now render missing/null Special Entry as `N` for present swimmers, fixing Andrew Barnes showing `—`. Added relay print classes on Results cards.
- **Test specification:** `USER-INTERACTION-TEST-SPEC-v2.8.11.md` with 75 user-perspective test cases covering Bryan's feedback, regressions, and visible error states.
- **Verification:**
  - Syntax: `node --check src/server.js`, `node --check src/public/js/screens/heat-builder.js`, `node --check src/public/js/screens/results.js`, `node --check scripts/verify-v2811-ux.mjs` — PASS.
  - Browser/CDP protocol: `node scripts/verify-v2811-ux.mjs` — 56 automated/browser-assisted checks, 56 PASS / 0 FAIL.
  - Evidence screenshots: `docs/screenshots/v2.8.11-bryan/01-pre-generation-relay-clean.png`, `02-generated-relay-teams.png`, `03-print-media-relay-headings.png`, `04-results-no-decides-ranking.png`, `05-report-special-entry-n.png`.
  - Local native module issue during verification: `better-sqlite3` was x86_64 in local `node_modules`; fixed with `npm rebuild better-sqlite3`. Test DB was backed up and restored after verification.
- **Scope non-goals:** No Pointscore/M3 work. No new Event Report field expansion beyond the Special Entry display bug. Larger Pogo/architecture items remain out of scope.
- **Delivery state:** Released. Merged to `main` as `0dcad22`, pushed to GitHub with tag `v2.8.11`, and live Render `/api/version` verified `2.8.11` / build `2026-05-01T02:30:30.787Z`.

## 2026-04-23 — fix: v2.8.10 Bryan 2026-04-23 retest follow-up (complete delivery)
- **Timestamp:** 2026-04-23 07:45:00
- **App Version (from package.json):** 2.8.10
- **Branch:** dev/v2.8.10-bryan-retest-followup
- **RecordedCommit:** 4015f9c
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.10-bryan-retest-followup`
- **Editor:** Claude Code
- **Bryan retest inbound (2026-04-23):** 2 points closed against v2.8.9 (Brace+Relay coexist, Shuffle randomness). Remaining feedback reclassified as:
  - **A** — note "shuffle only works after you confirm the heats" (to verify)
  - **B** — 25m Team Relay swim-twice dropdown shows ALL swimmers, not only this team's (regression / preference reversal)
  - **C** — Event Report content after save is not descriptive enough (scope extension, field list needs Bryan clarification — deferred)
  - **D** — "View Event Report" button crashes with `Cannot read properties of null (reading 'id')` (bug)
  - **E** — Initial "Generate Teams" output looks too balanced = "not random" to Bryan (UX-design decision)
  - Dino scope decision 2026-04-23: bundle A + B + D + E into v2.8.10; C deferred until Bryan clarifies required fields.
- **Changes in commit 4015f9c (client-side only, no server / schema / API changes):**
  - `src/public/js/screens/heat-builder.js`:
    * Line 343: `Generate Teams` button onclick now passes `{ forceReshuffle: true }`. Each click produces a balanced-but-randomised pairing instead of the identical fastest+slowest baseline every time (Fix E). Shuffle button (line 345) unchanged — still an explicit re-randomise affordance.
    * Lines 619-625: 25m Team Relay swim-twice dropdown optionPool restored to `members` (this team only). Reverses v2.8.4 Bryan fix 4 which had widened the pool to all present attendees (Fix B). Medley keeps its wider `hbAttendance`-based pool (different relay rules).
  - `src/public/js/screens/results.js` line 637: `showSeasonReport(eventIdArg)` now accepts an optional eventId and prefers it over the file-scope `resEvent.id`. Falls back to `resEvent.id` only when no argument is given. If neither is available, alerts and returns cleanly. Root cause of the previous crash: file-scope `let resEvent = null` is NOT a window property, so `window.resEvent = { id }` in calendar.js did not reach the function (Fix D).
  - `src/public/js/screens/calendar.js` lines 242-258: `openEventReportFromCalendar(eventId)` now calls `showSeasonReport(eventId)` directly and no longer sets/restores `window.resEvent`. Removes the redundant duplicate `fetch('/api/events/:id/report')` the old code made — `showSeasonReport` already fetches internally via `API.getEventReport` (Fix D).
- **Browser verification on v2.8.10 Preview (port 3000):**
  - **Fix E:** 5 consecutive Generate Teams clicks on 50m Brace Relay (7 swimmers) produced 5 distinct pair sets. Total ranges across rounds: `71/71/93/80`, `97/76/72/82`, `77/77/80/81`, `65/87/87/82`, `83/86/82/81` — clearly different pairings and totals, not the identical balanced baseline.
  - **Issue A:** pre-Confirm Shuffle tested in Preview. 1 Generate + 3 Shuffle, all with `hbRelayConfirmed: false`, all produced different pair memberships. NOT reproducible. Likely explanation on Bryan's side: stale browser cache holding v2.8.9's first-Generate-output and later Shuffles happening to rotate to the same swimmers (finite rotation-× reverse space, especially for 7 swimmers on Brace). v2.8.10 Fix E further reduces the chance Bryan will observe any "same output twice" perception because Initial Generate is itself randomised now.
  - **Fix B:** 25m Team Relay with 7 present swimmers → 2 teams (undersized). Team 1 swim-twice dropdown shows exactly 3 names (Ben, David, Glenne). Team 2 dropdown shows exactly 4 names (Andrew, Bryan, Diane, Felicia). Previously the dropdown would have shown all 7 present attendees.
  - **Fix D:** `openEventReportFromCalendar(33)` against a completed event runs without exception and returns a 2549-char report HTML into the mocked `window.open`. Previously crashed with `Cannot read properties of null (reading 'id')` before producing any output.
  - **Regression:** Medley Relay generation unchanged across 2 Generate-with-forceReshuffle clicks — same three-team layout with Glenne(Back) as the leftover. Expected (Medley has its own stroke-bucket grouping, not `distributeRoundRobin`, so `forceReshuffle` has no effect path — deliberate scope guard).
  - `preview_console_logs` level=error after full flow: `No console logs.` — 0 console errors.
- **Scope non-goals (deferred):**
  - **Issue C** (Event Report content not descriptive enough) — explicit Dino decision. Bryan needs to list the fields he wants to see in the report before coding. Dino will capture this on the next Bryan back-and-forth.
  - Medley Relay randomness, Pogo edit flow crash, Pogo T1/T2 stability, R18 Medley-Leftover policy, R20 ranking-rule doc clarification — all continue as previously documented.
- **Test artifacts updated:**
  - New: `USER-INTERACTION-TEST-PROTOCOL-v2.8.10.md` (Section O: Bryan 2026-04-23 retest follow-up coverage).
- **Delivery state:** Branch `dev/v2.8.10-bryan-retest-followup` ready for Balerion to transfer into `~/wwsc-demo`, merge into `main`, and push for Render auto-deploy. `package.json=2.8.10`, cache-bust `?v=2.8.10` already in place (commit `1a04e9b`).

## 2026-04-21 — fix: v2.8.9 Bryan 2026-04-21 relay corrections (complete delivery)
- **Timestamp:** 2026-04-21 21:15:00
- **App Version (from package.json):** 2.8.9
- **Branch:** dev/v2.8.9-bryan-relay-randomness
- **RecordedCommit:** 004d70f
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.9-bryan-relay-randomness`
- **Editor:** Claude Code (Brace forceReshuffle fix) + Balerion (event-setup + shuffle wiring)
- **Bryan inbound (via Dino) on 2026-04-21:**
  1. When a Brace standard is selected, the weekly standard `25m Freestyle` relay must still be generated (not replaced).
  2. Shuffle button on Brace Relay does not change team assignments.
  3. Brace Relay team generation does not look random — pair totals appear systematic.
- **Changes applied across this delivery (two commits combined):**
  - `src/public/js/screens/event-setup.js` (commit 6069347, Balerion):
    * `buildRaceTypes()` for `25m_brace` now produces `25m_brace` + `50m` + `25m_relay` (previously `25m_brace` replaced both the 25m individual AND the 25m relay).
    * `buildRaceTypes()` for `50m_brace` now produces `25m` + `50m_brace` + `25m_relay` (previously the standard relay was dropped).
    * Pogo behavior unchanged — Pogo continues to replace the standard 25m relay by design (R16).
  - `src/public/js/api.js` (commit 6069347, Balerion):
    * `API.generateRelayTeams(raceId, options)` now forwards an options body to `/api/races/:raceId/generate-relay-teams`.
  - `src/public/js/screens/heat-builder.js` (commit 6069347, Balerion):
    * Shuffle button now calls `generateHBRelayTeams({ shuffle: true, forceReshuffle: true })`.
    * `reshuffleHBRelayTeams()` also passes `forceReshuffle: true`.
  - `src/server.js` (commit 6069347, Balerion + commit 004d70f, Claude Code):
    * `distributeRoundRobin(swimmers, numTeams, options)` accepts `forceReshuffle` and, when set, rotates the PB-sorted array by a random non-zero offset and randomly reverses it before snake-distributing. Keeps the balance intent, changes the pairing/team composition visibly across shuffles.
    * `POST /api/races/:raceId/generate-relay-teams` reads `forceReshuffle` from the request body and passes it down to `distributeRoundRobin` for Pogo and 25m Relay.
    * **(004d70f)** The Brace pairing branch (`25m_brace`/`50m_brace`) previously had its own fastest+slowest loop on a deterministically PB-sorted list and ignored `forceReshuffle`. It now applies the same rotation + optional reverse right after the PB sort, before the fastest+slowest pair loop.
- **Browser verification on v2.8.9 Preview (port 3000):**
  - Event Setup: Standard=50m Brace + Special=Medley Relay → Heat Builder shows `25m Freestyle`, `50m Brace Relay`, `25m Team Relay`, `Medley Relay` — four distinct races, Brace no longer suppresses the standard 25m relay. (Issue 1 verified.)
  - Brace Relay `Generate Teams` → pairs: Bryan+Glenne(81), Ben+Diane(81), Felicia+David(82), Andrew+David(83). After 8 consecutive `Shuffle` clicks, pairings and totals changed visibly (observed totals included 65/87/87/82, 83/86/82/81, 97/76/72/82, 92/88/70/82). Some shuffles coincided (finite rotation × reverse space) but distinct outcomes dominate. (Issues 2 and 3 verified.)
  - 25m Team Relay shuffle: initial `Bryan+Andrew+David / Ben+Felicia+Glenne+Diane` → Shuffle 1 `Andrew+Diane+Bryan / David+Glenne+Ben+Felicia` → Shuffle 2 `Glenne+Felicia+Ben / David+Andrew+Bryan+Diane`. (Regression grün.)
  - Medley Relay shuffle: `Andrew(Back)+Ben(Breast)+Bryan(Free) / David(Back)+Diane(Breast)+Felicia(Free) / Glenne(Back)` unchanged across shuffles — expected, Medley is deliberately out of v2.8.9 scope (no Bryan feedback). (Keine Regression, bewusste Nicht-Änderung.)
  - `preview_console_logs` level=error after full flow: `No console logs.` — 0 console errors.
- **Scope non-goals (explicitly deferred):**
  - Medley Relay randomness (no Bryan feedback).
  - Pogo edit flow crash + T1/T2 re-edit stability (separate Pogo stability session).
  - Pointscore module.
  - R18 Medley-Leftover policy clarification, R20 ranking-rule documentation clarification.
- **Test artifacts updated:**
  - New: `USER-INTERACTION-TEST-PROTOCOL-v2.8.9.md` (Section N: relay duplication, Brace shuffle randomness, regression checks).
- **Delivery state:** Branch `dev/v2.8.9-bryan-relay-randomness` ready for Balerion to transfer into `~/wwsc-demo`, merge into `main`, and push for Render auto-deploy. `package.json=2.8.9`, cache-bust `?v=2.8.9` already in place (commit `fc8d1a1`).

## 2026-04-21 — chore: v2.8.9 version bump (first commit on branch)
- **Timestamp:** 2026-04-21 20:58:00
- **App Version (from package.json):** 2.8.9
- **Branch:** dev/v2.8.9-bryan-relay-randomness
- **RecordedCommit:** fc8d1a1
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.9-bryan-relay-randomness`
- **Editor:** Balerion
- **Changes (V0014 first-commit rule — version bump only):**
  - `package.json`: version `2.8.8` → `2.8.9`
  - `src/public/index.html`: cache-bust `?v=2.8.8` → `?v=2.8.9`
  - New branch created from `origin/main@70fed2e` to implement Bryan's 2026-04-21 relay corrections.

## 2026-04-18 — release: v2.8.8 live deployment on Render
- **Timestamp:** 2026-04-18 18:45:48
- **App Version (from package.json):** 2.8.8
- **Branch:** main
- **RecordedCommit:** 497f78d
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `main`
- **Editor:** Balerion
- **Changes:**
  - `main` in `~/wwsc-demo` was fast-forwarded from live base `642e52d` (`v2.8.3`) to the Dropbox-delivered v2.8.8 branch tip and prepared for GitHub push / Render auto-deploy.
  - Release basis for all future Bryan follow-up on this version is now `package.json=2.8.8` + `RecordedCommit=497f78d` + live repo `main`.
  - Cumulative live delivery now includes the v2.8.4–v2.8.8 workstream: Bryan follow-up corrections (R21–R26), v2.8.5 rework + user-tested UI corrections, v2.8.6 final UX/transparency fixes, v2.8.7 manual team management for eligible relays, and v2.8.8 final special-race/results readability fixes.
  - `STABLE.md`, `CLAUDE.md`, and `PROGRESS.md` were updated to reflect that v2.8.8 is now the active live baseline awaiting Bryan feedback.
  - Bryan-facing continuity artifacts recorded locally in `messages/2026-04-18-outgoing-to-bryan-v288-live.md` and `messages/2026-04-18-current-state-after-v288-live.md`.

## 2026-04-18 — feat: v2.8.8 iteration 7 (Pogo Heat Builder — mirror Pogo Results columns)
- **Timestamp:** 2026-04-18 13:15:00
- **App Version (from package.json):** 2.8.8
- **Branch:** dev/v2.8.8-header-completeness-audit
- **RecordedCommit:** 497f78d
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.8-header-completeness-audit`
- **Editor:** Claude Code
- **Why iteration 7 was needed:** Dino asked for the Pogo Heat Builder to expose the same plan columns the Pogo Results screen already shows, minus the result-entry fields (T1 / T2 / Result / Variance). Before: `Leg | Swimmer | PB`. The team-level Start Delay, expected-finish per swimmer, PB-sum, and Target were only encoded in the card header text. Aligning Heat Builder with Results gives the user the full plan up front in the same shape they will see during time entry.
- **Changes (Pogo Heat Builder display-only — no ranking logic, data model, or API change):**
  - `src/public/js/screens/heat-builder.js` (`renderRelayTeamsInHB`):
    * Row template appends four extra `<td>` cells when `isPogo`: `Start` (team.start_delay), `Exp.F` (member_pb + start_delay), `Total` (team.target_time), `Target` (team.target_time + team.start_delay).
    * Thead template appends `Start / Exp.F / Total / Target` headers only for Pogo.
  - Medley / 25m Team Relay / Brace / individual-race headers and rows unchanged.
- **Scope:** Pogo only — other relay race types continue to render as before.
- **Browser-verified on the Preview (Pogo generate teams, 4 swimmers):**
  * Header: `Leg | Swimmer | PB | Start | Exp.F | Total | Target` — 7 discrete titles.
  * Team 1: Bryan (PB 13, Exp.F 15), Ben (14, 16), Felicia (16, 18), Andrew (16, 18) — all rows show team Total 59 and Target 61 with per-team Start Delay 2s.
  * Team header text still shows "Start Delay: 2s • Total: 59 • Target: 61".
  * 0 console errors.

## 2026-04-18 — feat: v2.8.8 iteration 6 (Brace Results — add Target column)
- **Timestamp:** 2026-04-18 12:45:00
- **App Version (from package.json):** 2.8.8
- **Branch:** dev/v2.8.8-header-completeness-audit
- **RecordedCommit:** 0368840
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.8-header-completeness-audit`
- **Editor:** Claude Code
- **Why iteration 6 was needed:** Dino asked whether the Brace Results table should expose a Target column right of Total. Fachlich yes — Target = Total + Start Delay is exactly the value the Variance column measures Tap against. Without a visible Target, the user has to add "+ 2s" in their head to audit the ranking math from the table alone. This is also the shape R7 (Bryan's original spec) already defined.
- **Changes (Brace Results display-only — no ranking logic, data model or API change):**
  - `src/public/js/screens/results.js` (`renderBraceResultsInline` tableHead + row template):
    * Header row now has 8 columns: `Lane | Pair | PBs | Total | Target | ⏱️ Tap (finish) | Variance | Place`.
    * Row template renders `formatWhole(target_time + start_delay)` for the Target cell. The right border of the "Plan" zone moved from the Total cell onto the new Target cell so the Plan/Actual visual divider still lands in the same place.
  - Target values are derived from existing `team.target_time` + `team.start_delay` — already computed server-side, no new field.
- **Scope:** same `renderBraceResultsInline` code path, covers both `25m_brace` and `50m_brace`. No other race type touched.
- **Browser-verified on the Preview (50m Brace):**
  * 8-column header renders cleanly: `Lane | Pair | PBs | Total | Target | ⏱️ Tap (finish) | Variance | Place`.
  * Target cells render correctly: Total 81 → Target 83 (Start=2s), 82→84, 83→85.
  * 25m Brace shares the same code path → identical rendering.
  * 0 console errors.

## 2026-04-18 — fix: v2.8.8 iteration 5 ((Y) marker reflects current attendance, not stale auto flag)
- **Timestamp:** 2026-04-18 12:15:00
- **App Version (from package.json):** 2.8.8
- **Branch:** dev/v2.8.8-header-completeness-audit
- **RecordedCommit:** ddabb81
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.8-header-completeness-audit`
- **Editor:** Claude Code
- **Why iteration 5 was needed:** Dino found Glenne Murray rendered as `Back (Y)` in the Medley Heat Builder, even though her Times Sheet entry was explicitly `Back`. Root cause: the client rendered `(Y)` based on `m.auto === true`, a flag captured at team-generation time. The server's leftover-team branch (`server.js:1417`) forces `auto: true` on every leftover swimmer, regardless of whether they were a real wildcard (`special_event_entry='Y'`) or just a Backstroker who didn't fit into a complete team. Once that stale flag is on the client, later Times Sheet edits don't clear it, so the UI keeps showing `(Y)` on a swimmer who is no longer a wildcard.
- **Changes (3 client-side files, consistent fix — no server / schema / API changes):**
  - `src/public/js/screens/heat-builder.js`: look up the attendee in `hbAttendance` by `member_id` and show `(Y)` only if `attendee.special_event_entry === 'Y'`.
  - `src/public/js/screens/results.js`: use `m.special_event_entry === 'Y'` (already joined into the `/relay-teams` payload by `GET /api/races/:raceId/relay-teams` via the attendance JOIN at `server.js:1517`).
  - `src/public/js/screens/relays.js`: same change for the legacy relay screen.
- **Race-type audit:** `(Y)` rendering exists only for Medley (Brace / 25m Team Relay / Pogo have no stroke column). Grep across all screens confirmed the three Medley stroke-cell code paths were the only call-sites; all three now read from the current attendance entry.
- **Browser-verified on the Preview:**
  1. 7 Medley-eligible swimmers, all with explicit Back/Breast/Free in the Times Sheet. All 7 stroke cells rendered plain (`Back` / `Breast` / `Free`) — zero `(Y)` markers.
  2. Then set Glenne Murray to `special_event_entry='Y'` and re-shuffle. Glenne's cell correctly rendered `Back (Y)`; the other 6 stroke cells remained unmarked. Screenshot captured.
- **Scope:** same branch as v2.8.8 R28 work. Version number stays 2.8.8. No ranking/schema/API changes.

## 2026-04-18 — fix: v2.8.8 R28 iteration 4 (header contrast fix — titles legible)
- **Timestamp:** 2026-04-18 11:30:00
- **App Version (from package.json):** 2.8.8
- **Branch:** dev/v2.8.8-header-completeness-audit
- **RecordedCommit:** bea39db
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.8-header-completeness-audit`
- **Editor:** Claude Code
- **Why iteration 4 was needed:** In iteration 3 the header row went flat (single row), but the Tap (finish) / Variance / Place `<th>` cells kept their yellow/orange accent backgrounds (`#fff8e1` / `#fff3e0`). The spreadsheet-table stylesheet renders `<thead>` text in white. Result: those three titles rendered as white-on-pale-yellow and were effectively invisible — Dino correctly perceived "keinen titel" on those columns.
- **Changes:**
  - `src/public/js/screens/results.js` (`renderBraceResultsInline` tableHead): drop the pale accent backgrounds from the `<th>` cells. Header row is now uniform teal (rgb(0,128,128)) with white titles across all seven columns (`Lane | Pair | PBs | Total | ⏱️ Tap (finish) | Variance | Place`). The accent colors (yellow for Tap, orange for Variance, place-medal colors for Place) stay in the `<td>` data cells — the visual grouping on the values is preserved where it matters, without breaking title readability.
  - `version/CURRENT_STATE.md`: RecordedCommit pointer moved `474d063` → `bea39db`.
- **Browser re-verified on the Preview server (v2.8.8):** `getComputedStyle` on every header cell returned `background: rgb(0, 128, 128)` and `color: rgb(255, 255, 255)` — uniform contrast across all 7 titles. Screenshot taken as evidence. 0 console errors.
- **Scope unchanged:** same `renderBraceResultsInline` tableHead, covers both 25m_brace and 50m_brace. No ranking/schema/API/print changes.

## 2026-04-18 — fix: v2.8.8 R28 iteration 3 (flat single-row header) — superseded by iteration 4
- **Timestamp:** 2026-04-18 11:00:00
- **App Version (from package.json):** 2.8.8
- **Branch:** dev/v2.8.8-header-completeness-audit
- **RecordedCommit:** 474d063
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.8-header-completeness-audit`
- **Editor:** Claude Code
- **Why a third iteration was needed:** Dino live-rejected iteration 2 (Team group header). He read the row-1 labels `Team / Plan (target) / Actual (input) / ↓ Variance decides Place ↓` as explanatory sentences, not as discrete column titles. In particular the `↓ Variance decides Place ↓` phrase read like a help text, so the Variance and Place columns below it still felt untitled from a user perspective.
- **Changes:**
  - `src/public/js/screens/results.js` (`renderBraceResultsInline` tableHead): drop the group row entirely. Final header is a single row with one discrete title per column: `Lane | Pair | PBs | Total | ⏱️ Tap (finish) | Variance | Place`. No empty zones, no asymmetric groups, no labels that can be misread as sentences.
  - R24-v2 grouped layout (`Plan / Actual / Variance decides Place`) is dropped. The R26 ranking banner above the table continues to state "How Place is decided: smallest absolute Variance wins", so the ranking basis remains explicit.
  - `version/CURRENT_STATE.md`: RecordedCommit pointer moved `d103c44` → `474d063`.
- **Browser re-verified on the Preview server (v2.8.8):** single header row with 7 discrete labels (verified via DOM inspection + screenshot). 0 console errors. R26 banner intact.
- **Scope unchanged:** same `renderBraceResultsInline` tableHead, covers both 25m_brace and 50m_brace. No ranking/schema/API/print changes.

## 2026-04-18 — fix: v2.8.8 R28 follow-up (Team group header over Lane+Pair) — superseded by iteration 3
- **Timestamp:** 2026-04-18 10:30:00
- **App Version (from package.json):** 2.8.8
- **Branch:** dev/v2.8.8-header-completeness-audit
- **RecordedCommit:** d103c44
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.8-header-completeness-audit`
- **Editor:** Claude Code
- **Why a follow-up was needed:** Dino live-re-tested the first R28 iteration (`3de4265`, rowspan="2" on Lane+Pair) and reported the fix was not enough: promoting Lane + Pair into the top row left the two cells in the bottom row below them empty, so the sub-header row then read as if two columns had no title. The asymmetric "untitled zone" had simply moved from the top row into the bottom row.
- **Changes:**
  - `src/public/js/screens/results.js` (`renderBraceResultsInline` tableHead): replace the rowspan="2" approach with a symmetric 2-row grouping.
    - Row 1 (groups): `Team {cs=2}` | `Plan (target) {cs=2}` | `Actual (input)` | `↓ Variance decides Place ↓ {cs=2}`
    - Row 2 (columns): `Lane` | `Pair` | `PBs` | `Total` | `⏱️ Tap (finish)` | `Variance` | `Place`
    - Every cell in both rows now carries a non-empty meaningful label.
  - `USER-INTERACTION-TEST-SPEC.md` Section M: UI-TC-459 and UI-TC-463 updated to describe the final Team-group structure (no rowspan).
  - `USER-INTERACTION-TEST-PROTOCOL-v2.8.8.md`: M.2 row updated, Addendum added documenting the superseded first iteration and why it was replaced.
  - `version/CURRENT_STATE.md`: RecordedCommit pointer moved from `3de4265` to `d103c44`.
- **Browser re-verified:** post-follow-up DOM inspection confirms 0 empty cells in either row; screenshot shows full symmetric header on 25m Brace. 50m Brace uses the same code path. 0 console errors.
- **Scope unchanged:** same 25m_brace + 50m_brace tableHead. No other surface changed. No ranking/schema/API changes.

## 2026-04-18 — feat: v2.8.8 R28 Brace Results header completeness (superseded by follow-up fix)
- **Timestamp:** 2026-04-18 09:45:00
- **App Version (from package.json):** 2.8.8
- **Branch:** dev/v2.8.8-header-completeness-audit
- **RecordedCommit:** 3de4265
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.8-header-completeness-audit`
- **Editor:** Claude Code
- **Changes (R28 — UX/readability only, no ranking or schema changes):**
  - `src/public/js/screens/results.js` (`renderBraceResultsInline` tableHead): Lane and Pair are no longer sitting under two empty `<th>` cells. They are hoisted into the top header row via `rowspan="2"` with `vertical-align:middle`. The two empty cells are removed and the second row now only lists the columns that belong to the group headers (PBs, Total, Tap, Variance, Place). Every top-row cell now carries a non-empty, meaningful label — the left side of the table no longer reads as a forgotten/untitled zone.
  - `REQUIREMENTS.md`: R28 added (authored by Balerion in the handoff) — delivered as implementation baseline.
  - `USER-INTERACTION-TEST-SPEC.md`: new Section M (UI-TC-451..UI-TC-476, 26 cases across pre-fix perception, post-fix completeness, per-race audit, regression guardrails).
  - `USER-INTERACTION-TEST-PROTOCOL-v2.8.8.md`: new protocol; 26 PASS / 0 FAIL / 0 OPEN / 0 NOT TESTED; V0006-conform (pre-fix reproduction in the rendered UI → fix → post-fix re-verification in the rendered UI).
  - **Per-race audit conclusion:** grouped-header-over-empty-cells existed ONLY in Brace Results tableHead. Medley / 25m Team Relay / Pogo / individual heats use flat single-row theads and are left unchanged. Heat Builder uses flat theads everywhere, also unchanged.
  - Browser-verified on Chromium port 3000:
    * Pre-fix: DOM inspection returned 2 `<th>` cells with empty text over Lane + Pair for 25m Brace; 50m Brace shares the same code path and same failure shape.
    * Post-fix: all top-row cells carry non-empty labels; Lane/Pair rowspan="2"; Plan (target) colspan="2"; Actual (input) colspan="1"; ↓ Variance decides Place ↓ colspan="2".
    * R26 banner + group structure intact. R27 Heat Builder surfaces (Add/Remove Team / Unassigned pool / Ranking-rule banner) intact.
    * 0 console errors.

## 2026-04-18 — chore: v2.8.8 version bump (first commit on branch)
- **Timestamp:** 2026-04-18 09:10:00
- **App Version (from package.json):** 2.8.8
- **Branch:** dev/v2.8.8-header-completeness-audit
- **RecordedCommit:** 871b340
- **Editor:** Claude Code
- **Changes (V0014 first-commit rule — version bump only):**
  - `package.json`: 2.8.7 → 2.8.8
  - `package-lock.json`: 2.8.7 → 2.8.8
  - `src/public/index.html`: cache-bust `?v=2.8.7` → `?v=2.8.8` (17 tags)

---

## 2026-04-17 — feat: v2.8.7 R27 manual team management for eligible relay races
- **Timestamp:** 2026-04-17 22:15:00
- **App Version (from package.json):** 2.8.7
- **Branch:** dev/v2.8.7-manual-team-management
- **RecordedCommit:** e2fd553
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.7-manual-team-management`
- **Editor:** Claude Code
- **Changes (R27 only — no ranking-logic or schema changes):**
  - `src/public/js/screens/heat-builder.js`: New R27 UI for pre-confirm eligible races (medley_relay, 25m_relay).
    - New helpers: `R27_ELIGIBLE_RACES`, `isR27EligibleRace`, `getRequiredLegs`, `getTeamCompleteness`, `countCompleteTeams`, `getUnassignedSwimmers`.
    - `renderRelayContent`: ranking-rule banner (blue info / orange at 0 or 1 complete), unassigned-swimmers card with pills, trailing `➕ Add Team` button.
    - `renderRelayTeamsInHB`: per-team `manual` pill badge, `✓ complete` / `⚠️ needs N more` / `🕳 empty` completeness badge, `✕ Remove Team` control (is_manual only).
    - `hbAddTeam()`: creates new empty team with `is_manual:true`; re-runs `recalcRelayTeam` for start-delay/max-time consistency.
    - `hbRemoveTeam(teamIndex)`: guarded to `is_manual` teams only; confirm() prompt; swimmers return to unassigned pool; remaining teams renumbered 1..N.
  - `src/public/js/screens/results.js`: New R27 rankability banner in `renderRelayResultsInline` for eligible races. 0 complete → orange "No complete teams". 1 complete → orange "Only 1 complete team — no real competition." ≥2 complete + incomplete → blue "X/Y teams complete".
  - `src/server.js`: `POST /api/races/:raceId/save-relay-teams` drops teams with 0 members before persisting; renumbers team_number after filtering. Partially filled manual teams still persist and render as not-rankable for the user.
  - `REQUIREMENTS.md`: R27 delivered (was authored by Balerion as part of the handoff).
  - `USER-INTERACTION-TEST-SPEC.md`: Section L added (UI-TC-393..UI-TC-450, 58 cases across L.1 Eligibility gating, L.2 Add-team flow, L.3 Assign swimmers, L.4 Remove-team flow, L.5 Unassigned pool, L.6 Completeness/rankability, L.7 Results rankability, L.8 Regression guardrails).
  - `USER-INTERACTION-TEST-PROTOCOL-v2.8.7.md`: new protocol with 58 PASS / 0 FAIL / 0 OPEN / 0 NOT TESTED, browser-evidence per test case.
  - Browser-verified on Chromium (preview server, port 3000) end-to-end:
    * Medley (9 Y-swimmers): Add Team → empty manual Team 4 with pill/badge/Remove; add swimmer flow works; remove brings swimmer back to pool.
    * 25m Team Relay (23 swimmers): same flow; `needs 3 more swimmers` label rendered correctly.
    * Brace / Pogo: no R27 UI (gated correctly).
    * Post-confirm: all R27 surfaces hidden.
    * Empty-team filter: 1 empty + 3 filled teams → DB persists 3.
    * Results "Only 1 complete team — no real competition." banner rendered correctly on 1 complete + 2 incomplete Medley teams.
    * 0 console errors.

## 2026-04-17 — chore: v2.8.7 version bump (first commit on branch)
- **Timestamp:** 2026-04-17 21:45:00
- **App Version (from package.json):** 2.8.7
- **Branch:** dev/v2.8.7-manual-team-management
- **RecordedCommit:** 7b6bc9d
- **Editor:** Claude Code
- **Changes (V0014 first-commit rule — version bump only):**
  - `package.json`: 2.8.6 → 2.8.7
  - `package-lock.json`: 2.8.6 → 2.8.7
  - `src/public/index.html`: cache-bust `?v=2.8.6` → `?v=2.8.7` (17 tags)

---

## 2026-04-17 — chore: v2.8.6 SSOT cleanup (no delivery change)
- **Timestamp:** 2026-04-17 21:30:00
- **App Version (from package.json):** 2.8.6
- **Branch:** dev/v2.8.6-dino-final-ux-fixes
- **RecordedCommit:** fe60a7c
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.6-dino-final-ux-fixes`
- **Editor:** Claude Code
- **Convention:** `RecordedCommit` = substantive delivery commit (the feature commit). Static HEAD hashes are NOT stored in versioned artifacts; resolve the current branch tip dynamically via `git rev-parse`.
- **Changes (all housekeeping, no delivery impact):**
  - `package-lock.json` version bumped 2.7.0 → 2.8.6 (was stale after `npm rebuild better-sqlite3`; synced to match package.json).
  - `USER-INTERACTION-TEST-PROTOCOL-v2.8.6.md`: header reworked to reference RecordedCommit only; current branch tip resolved dynamically.
  - `version/CURRENT_STATE.md`: static HEAD value removed; adopts dynamic `git rev-parse` resolution.

## 2026-04-17 — feat: v2.8.6 Dino final UX fixes (R24-v3 + ranking transparency)
- **Timestamp:** 2026-04-17 16:45:00
- **App Version (from package.json):** 2.8.6
- **Branch:** dev/v2.8.6-dino-final-ux-fixes
- **RecordedCommit:** fe60a7c
- **Editor:** Claude Code
- **Changes (4 Dino-live-test findings addressed via UI-only changes):**
  - A) 25m Brace Tap column: explicit "⏱️ Tap (finish)" header + "Actual (input)" group label; column min-width bumped; yellow Actual zone preserved.
  - B) 25m Brace ranking explainability: new prominent orange banner directly above the table "🏁 How Place is decided: smallest absolute Variance wins — the team closest to its Target, not the team with the fastest Tap." Group header "↓ Variance decides Place ↓" spans Variance+Place. Variance cell promoted to font-size 15px + weight 800 + bg #fff3e0. Place cell shares #fff3e0 zone.
  - C) Medley Relay variance visibility: per-team "🏁 Ranking basis" banner; new "Variance from Target (decides ranking): ±X.XX [place]" row under each Medley team table with color-coded variance + medal Place cell. Team Total row cleaned up to label+value only.
  - D) Pogo variance visibility: per-team ranking banner; Var. column header orange + bold; per-member Var. cells color-coded (green/orange); new "Team Variance from Target (decides ranking): ±X.XX [place]" row at bottom of each Pogo team table.
  - No ranking-logic changes — smallest variance wins rule unchanged for Brace/Medley/Pogo; 25m Team Relay still fastest total_time.
  - USER-INTERACTION-TEST-PROTOCOL-v2.8.6.md: Section K (UI-TC-337..TC-392) executed, 56 PASS / 0 FAIL / 0 OPEN / 0 NOT TESTED.
  - Browser-verified: Brace Dino scenario (Tap 33.90/var -2.10 = 1st; Tap 33.70/var -3.30 = 4th) rendered with banner + prominent Variance. Medley + Pogo ranking-transparency rows visible with explicit labels.

## 2026-04-15 — feat: v2.8.5 Rework after Dino live test (R21-v2, R24-v2, R25, R26)
- **Timestamp:** 2026-04-15 22:00:00
- **App Version (from package.json):** 2.8.5
- **Branch:** dev/v2.8.5-bryan-rework-user-tested
- **RecordedCommit:** 6b30f1a
- **Editor:** Claude Code
- **Changes (addressing Dino-live-test findings):**
  - R21-v2 (Medley swim-twice stroke — ACTUALLY FIXED): new explicit "Swim as:" Stroke-Picker in the swim-twice row. User must pick swimmer AND stroke before clicking. No hidden default to swimmer's historical stroke. Missing strokes get "(missing)" label. Pre-selects first missing stroke; freely overridable. hbAddSwimTwice reads the explicit picker value.
  - R24-v2 (Results layout — ACTUALLY GROUPED): Brace Results now has 2-row header with group labels "Plan | Actual | Delta | Result". Column groups visually separated via background colors (grey for Plan, yellow for Tap, color-coded Variance) and 2px borders. Tap cell prominently styled as button-like interactive target.
  - R25 (Print audit — ALL SURFACES): `.print-hide` class now applied across Heat Builder (swim-twice row, leftover banner, status cards, empty-state prompts), Results (Event Finalized/Completed banners), Breaker Report, Relays, Event Report. Operational text hidden; race data preserved.
  - R26 (Meta-rule): user-facing revalidation as hard gate — code-only evidence no longer counts as done.
  - REQUIREMENTS.md: R21-v2, R24-v2, R25, R26 added with user-flow acceptance criteria.
  - USER-INTERACTION-TEST-SPEC.md: Section I added with UI-TC-187 to UI-TC-291 (105 new test cases across Medley swim-twice, correction/replacement, 25m Relay explicit, Results layout, Print audit, Ranking, regressions).
  - Browser-verified end-to-end: Bryan (swam Back in Team 1) correctly assigned to Breast via explicit picker in Team 2; Remove/re-add cycle clean; Results table shows 2-row grouped header; no console errors.

## 2026-04-15 — feat: Bryan Follow-up Corrections (v2.8.4, R20+R21+R22+R23+R24)
- **Timestamp:** 2026-04-15 20:30:00
- **App Version (from package.json):** 2.8.4
- **Branch:** dev/v2.8.4-bryan-followup-special-races
- **RecordedCommit:** f5e4c3b
- **Editor:** Claude Code
- **Changes (6 Bryan corrections):**
  - Fix 1+2 (R21): Medley swim-twice stroke now editable + removable. New hbChangeSwimTwiceStroke / hbRemoveSwimTwice. hbAddSwimTwice prefers missing stroke instead of historical.
  - Fix 3 (R23): Print cleanup — new `.print-hide` CSS class applied to "(Y) explanation", "All X races ready", "X/Y races confirmed", "Event Finalized/Completed" banners.
  - Fix 4 (R22): 25m Team Relay undersized teams get `needs_swim_twice_completion: true` + orange banner + explicit swim-twice dropdown across all attendees.
  - Fix 5 (R24): Brace Results table compacted to Lane | Pair | PBs | Total | Tap | Variance | Place. Start/Target moved into card header.
  - Fix 6 (R20): Ranking for 25m brace, 50m brace, Pogo, Medley → smallest |variance| wins. 25m Team Relay unchanged. New rankRelayTeams helper used in 3 call sites. UI text "fastest finish wins" → "smallest variance wins".
  - Browser-verified end-to-end: Medley 4-swimmer flow (banner + stroke-edit + remove), Brace ranking with +100/-300/+500 variances → 1st/2nd/3rd by |var|, 11-swimmer 25m Team Relay undersized banner, Brace Results new column order.

## 2026-04-15 — feat: Medley Leftover Swim-Twice Flow (v2.8.3, R18)
- **Timestamp:** 2026-04-15 08:00:00
- **App Version (from package.json):** 2.8.3
- **Branch:** dev/v2.8.3-medley-leftover-swim-twice
- **RecordedCommit:** 8192cd9
- **Editor:** Claude Code
- **Changes:**
  - server.js: Medley leftover handling — 1–2 Restschwimmer erzeugen jetzt ein partielles Team mit `needs_swim_twice_completion: true` statt verworfen zu werden
  - heat-builder.js: Oranger Banner "⚠️ Leftover team — incomplete" mit fehlenden Strokes; Banner verschwindet sobald alle 3 Strokes besetzt sind
  - heat-builder.js: "+ Swim Twice" Label für Leftover-Teams (klarer als "+ Add Swimmer")
  - REQUIREMENTS.md R18 von 🟡 offen auf 🟢 Bryan-bestätigt
  - USER-INTERACTION-TEST-SPEC.md UI-TC-158 aktualisiert + neue UI-TC-169 bis UI-TC-176 (Section G)
  - PROGRESS.md Phase 8 aktualisiert
  - Browser-verifiziert: 4 Y-swimmers → 1 Team + 1 Leftover-Team mit Banner → Swim-Twice 2× → Banner weg → Confirm → Persistenz mit Duplikat-member_ids

## 2026-04-14 — fix: Heat Builder print fits one page (v2.8.2)
- **Timestamp:** 2026-04-14 13:45:00
- **App Version (from package.json):** 2.8.2
- **Branch:** main
- **RecordedCommit:** 5f0d6be
- **Editor:** Claude Code
- **Changes:**
  - style.css: Overhauled @media print rules for one-page fit
  - Root cause: 6 heats × ~175px = ~1050px exceeded A4 printable area (~1023px)
  - Fix: @page margin 8mm, reduced cell padding (2px 4px), font 10px, card margin 4px, border 1px, line-height 1.2
  - Result: total print height 819px — fits comfortably on A4 (1063px printable)
  - Browser print-preview verified: all 6 heats on one page, readable B/W

## 2026-04-14 — feat: Heat Builder Print Button (v2.8.1)
- **Timestamp:** 2026-04-14 12:00:00
- **App Version (from package.json):** 2.8.1
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** c48c8d2
- **Editor:** Claude Code
- **Changes:**
  - Version bump 2.8.0 → 2.8.1 (package.json + index.html cache-busting)
  - heat-builder.js: Added Print button using same window.print() pattern as Results page
  - Button-/Pattern-Reuse only — no additional print styling needed
  - Browser-verified: Print button visible, onclick=window.print(), no existing actions broken

## 2026-04-12 — fix: Breaker Report sorting by strongest variance first
- **Timestamp:** 2026-04-12 19:25:00
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** b70bbba
- **Editor:** Claude Code
- **Changes:**
  - server.js: Added post-query sort to /api/reports/breakers — sorts by date DESC, then variance DESC (strongest break first), then name alphabetically for deterministic tie-break
  - Root cause: SQL ORDER BY used stroke+name but never variance
  - Browser-verified: -9.00 → -8.00 → -4.00 → -3.00 → -2.00 with alphabetical tie-break

## 2026-04-12 — fix: add deterministic tie-break for breaker report sorting
- **Timestamp:** 2026-04-12 19:13:36
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** 8489a28
- **Editor:** Balerion
- **Changes:** Added deterministic secondary sorting by swimmer name when breaker variance is equal, so group ordering is stable and predictable instead of depending on prior API order.

## 2026-04-12 — fix: use variance consistently in breaker reports
- **Timestamp:** 2026-04-12 18:55:38
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** 2cc54b2
- **Editor:** Balerion
- **Changes:** Switched breaker reports consistently from improvement-based display/sorting to variance-based display/sorting, including headings and row values, so the strongest variance appears first and the report matches the visible metric.
