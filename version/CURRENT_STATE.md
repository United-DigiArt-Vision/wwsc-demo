# CURRENT_STATE

## CURRENT (2026-06-06) — v2.11.0 M3 Slice 2 Reports / DB Export / All Event Categories — DEPLOYED LIVE + PROVEN (authoritative top block)

**Version (from `package.json`):** 2.11.0
**Branch:** main deployed from `dev/v2.11.0-m3-slice2-reports-export` (off `dev/v2.10.2-relay-543@cea5d39`)
**Date:** 2026-06-06
**Timestamp:** 2026-06-06 17:38:00 Europe/Berlin
**LastEditor:** Balerion
**Cache-bust:** `src/public/index.html` = `?v=2.11.0` (matches package.json/package-lock).
**WorkingTreeStatus:** Bryan's 2026-06-05 latest Slice 2 expectations are implemented, independently re-proven, merged to `main`, tagged `v2.11.0`, pushed, deployed live to Render, and seeded with a Bryan-friendly completed retest event. Completed-category report covers 25m, 50m, relay, medley relay, 75m, 25m brace, 50m brace, breaststroke/backstroke/butterfly; break-count report overall + by event from `time_history.is_break`; total-time-improvement report overall + by event from `time_history.time` and `previous_best` where current time is faster; raw SQLite DB export at `GET /api/export/db` using SQLite backup API; Reports UI `DB & Graphs` tab explains DB export and graph source rows; graph entry/data mapping re-proven from `time_history`. Evidence: `docs/evidence/m3-slice2/V2.11.0-BRYAN-REPORTS-EXPORT-ALL-EVENTS-PROOF.md` plus Balerion 2026-06-06 local rerun. Gate results: Slice2 Unit/API **7 PASS / 0 FAIL**; Slice2 Browser/UI/File **13 PASS / 0 FAIL**; pointscore Unit/API **15 PASS / 0 FAIL**; M2-55 **55 PASS / 0 FAIL**; M2-100 **98 PASS / 2 NOT APPLICABLE / 0 FAIL / 0 BLOCKED**; history graphs **19 PASS / 1 NOT APPLICABLE / 0 FAIL**; final M3-120 **118 PASS / 2 NOT APPLICABLE / 0 FAIL / 0 BLOCKED / 0 CLIENT INPUT MISSING** after fresh `/tmp/m3p-m2-55.log` and `/tmp/m3p-m2-100.log` stalegate logs. Live smoke: `/api/version` returns `2.11.0`; `/api/reports/event-coverage`, `/api/reports/break-counts`, `/api/reports/improvements` return 200; `/api/export/db` returns 200 `application/octet-stream`, `content-length: 94208`, filename `wwsc-sqlite-db-v2.11.0-...db`. Live retest seed: event `1`, date `2026-06-06`, status `completed`, 18 present swimmers, 10 race categories (25m, 50m, 75m, backstroke, breaststroke, butterfly, 25m relay, medley relay, 25m brace, 50m brace); break-count, improvement, time-history/graph, season pointscore, and DB export checks all PASS. Evidence: `docs/evidence/bryan-v2110-live-retest-seed/seed-2026-06-06T15-50-55-798Z.json`. No NOT PROVEN items remain for Bryan's 2026-06-05 latest expectations; duplicate `75m` is NOT APPLICABLE WITH SOURCE because there is one supported 75m race type. Bryan/client contact still not sent by Balerion; Dino sends customer messages.
**Milestone status:** M2 v2.9.0 remains released/paid and protected. M3 v2.11.0 is now the latest deployed live version and has live retest data. Next action: Dino/Nedim sends the prepared Bryan update, then archive the sent confirmation.

---

## PREVIOUS (2026-06-06) — v2.10.2 Relay/Team Pointscore 5/4/3 — FULLY PROVEN both systems

**Version (from `package.json`):** 2.10.2
**Branch:** dev/v2.10.2-relay-543 (feature branch off `main@9106eaf`; NOT merged/deployed)
**Substantive anchors:** `c4ab774` (version bump 2.10.2 + index.html cache-bust), `2501fff` (engine relay 5/4/3 + new UT11/UT12), `cc7e67d` (M3 specs/docs relay 5/4/3, source-labeled Bryan-confirmed 2026-06-05), plus the v2.10.2 evidence/SSOT-close commit (resolve HEAD dynamically with `git rev-parse --short HEAD`).
**Date:** 2026-06-06
**Timestamp:** 2026-06-06 09:17:00 Europe/Berlin
**LastEditor:** Claude Code
**Cache-bust:** `src/public/index.html` = `?v=2.10.2` (matches package.json/package-lock).
**WorkingTreeStatus:** Narrow relay/team pointscore correction per Bryan's 2026-06-05 clarification ("Relay should be 5 points for 1st, 4 for 2nd and 3 for 3rd"). `src/pointscore.js` `categories.relay.pointsByPlace` → `{1:5,2:4,3:3}` (finisherPoints stays 0); individual scale unchanged (5/4/3/2 working assumption); centralized rule, so `src/server.js` finalize hook is unchanged. Relay 5/4/3 is now source-labeled **Bryan-confirmed (2026-06-05)**, distinct from the still-working-assumption individual scale and the still-unconfirmed full Constitution. This WIP began on Balerion's Mac Mini and synced via Dropbox onto local `main`; after Dino confirmed Balerion had stepped away, Claude took it over onto feature branch `dev/v2.10.2-relay-543` and left `main` untouched at `9106eaf`. Full evidence gate @ `50844a0` is GREEN on BOTH systems — Claude (Intel MacBook, local) AND Balerion (Mac Mini, independent QA in a temp copy `/tmp/wwsc-v2102-qa-...` isolated from Dropbox): unit/API **15 PASS / 0 FAIL** (incl. UT11 exact relay 5/4/3-by-place + UT12 relay totals → month/season aggregation); pointscore isolation **VERDICT PASS** (accepted-flow time_history/variance/is_break/breaker/ranking byte-identical disabled vs enabled); M2-55 **55 PASS / 0 FAIL**; M2-100 **98 PASS / 2 NOT APPLICABLE / 0 FAIL / 0 BLOCKED**; M3-120 **116 PASS / 0 FAIL / 0 BLOCKED / 2 NOT APPLICABLE / 2 CLIENT INPUT MISSING** (relay 5/4/3 end-to-end via UIT-M3-030 medley_relay "team points present (5/4/3)"; UIT-M3-111/112 PASS with both M2 logs carrying commit=50844a0; UIT-M3-029/031 brace/pogo NA = engine-proven via UT10; 2 CIM = improvement/attendance = Bryan's now-concrete Slice-2 reports); R-M3-05 history-graphs **19 PASS / 1 NOT APPLICABLE / 0 FAIL**; 0 console errors throughout. Proof matrix: `docs/evidence/m3-pointscore/V2.10.2-BRYAN-RELAY-543-PROOF.md`. ENVIRONMENT ARTIFACT (not a product gap): the Dropbox-synced `node_modules/better-sqlite3` native binary ping-pongs between Balerion's arm64 and this host's x86_64; mid-session Balerion's arm64 build clobbered the local x86_64 build and crashed server-restart cases with `ERR_DLOPEN_FAILED` — fixed by `npm rebuild better-sqlite3` before each local run (gitignored). Recommend excluding `node_modules` from Dropbox sync. A Dropbox "conflicted copy" of one M2-100 raw log appeared from the concurrent Claude/Balerion writes and is left for Dino/Balerion to delete.
**Milestone status:** M2 v2.9.0 RELEASED/PAID and protected. M3 v2.10.1 deployed live on Render (tag `v2.10.1`, `/api/version`=2.10.1). v2.10.2 is a NARROW relay/team 5/4/3 correction on feature branch `dev/v2.10.2-relay-543`, NOT yet merged/deployed; `main` untouched at `9106eaf`. Balerion independently reproduced the full gate GREEN at `50844a0` and issued QA verdict **v2.10.2 scope PROVEN** (`../messages/2026-06-06-0909-Balerion-To-Claude-WWSC-v2102-QA-Proof-Boundary.md` + `2026-06-06-Balerion-QA-v2102-proof-boundary.md`). Awaiting: (1) Dino's merge/deploy decision for v2.10.2; (2) Dino's Slice-2 decision — Bryan's two now-concrete reports (breaks-per-person overall+by-event; total-improvement per person by-event+overall) plus DB-export scope + all-event-type retest dataset. Balerion boundary: do NOT tell Bryan "everything finished" — relay/team 5/4/3 + current pointscore/report/graph/CSV slice is proven; the Slice-2 items are the next report/export slice. No push/deploy/tag/merge/Bryan-contact this session.

---

## PREVIOUS (2026-06-04) — v2.10.1 M3 Release Deploy

**Version (from `package.json`):** 2.10.1
**Branch:** main
**Substantive anchors:** `219bdd9` (engine + API + UI), `b3f9a82` (CSV-route refactor + test suite + specs + SSOT), `b598648` (first clean-HEAD evidence), `a94c0fc` (Balerion-QA hardening: unknown-race_type fix + UT9, M2 HEAD-staleness gate, first mobile-screenshot cleanup, TC-069 wording, 75m/breaststroke/butterfly seeding), `711c66d` (Balerion V0015 harness fix: robustly remove Calendar's standalone fixed-position Event Details modal before UIT-M3-113 mobile screenshot), `735f0b3` (refreshed clean M3-120 evidence after the overlay fix), `0096ecb` (Bryan-Expectation N/A closure: members CSV endpoint, UT10 brace/pogo->relay proof, 085/100->PASS, 076/077->CLIENT INPUT MISSING), `3630656` (Balerion independent proof verification), and the v2.10.1 release-prep commit.
**Date:** 2026-06-04
**Timestamp:** 2026-06-04 09:33:40 Europe/Berlin
**LastEditor:** Balerion
**Cache-bust:** `src/public/index.html` = `?v=2.10.1` (matches package.json/package-lock).
**WorkingTreeStatus:** M3 pointscore is implemented under Bryan's 2026-06-02 working assumptions (event-separated; monthly/season by simple addition; Excel pointscore sheets as working source; adjustable later - NOT confirmed Constitution). Balerion independently reproduced the current evidence gate on 2026-06-04: unit/API 13 PASS / 0 FAIL, pointscore isolation PASS, M2 55 PASS / 0 FAIL, M2 100 = 98 PASS / 2 NOT APPLICABLE / 0 FAIL / 0 BLOCKED, M3 120 = 116 PASS / 2 NOT APPLICABLE / 2 CLIENT INPUT MISSING / 0 FAIL / 0 BLOCKED, R-M3-05 history graphs = 19 PASS / 1 NOT APPLICABLE / 0 FAIL. Balerion visually confirmed the previously suspect `UIT-M3-113-resp-mobile.png` is clean after the harness fix. Determinism boundary documented (per-swimmer attribution varies via the accepted v2.8.9 randomized heat builder; all assertions are structural invariants). Constitution-specific accumulation/report rules that Bryan did not provide remain isolated and explicitly client-input-missing.
**Milestone status:** M2 v2.9.0 RELEASED/PAID and protected. M3 v2.10.1 is deployed live on Render from release merge `2154574` and tag `v2.10.1`; current `origin/main` after evidence/docs should be resolved dynamically with `git rev-parse --short origin/main` (last checked after deploy docs: `e47d2ae`). Live `/api/version` returned `2.10.1`; latest verified build during release closure was `2026-06-04T07:43:22.067Z` (docs-only redeploys may advance the build timestamp without changing app version). Read-only live browser smoke passed 8 PASS / 0 FAIL with evidence in `docs/evidence/live-smoke-v2.10.1-2026-06-04.json` and `docs/screenshots/live-smoke-2026-06-04/`. Dino/Nedim sent the v2.10.1 / M3 delivery update to Bryan at 09:53 Europe/Berlin on 2026-06-04; sent-confirmed record: `../messages/2026-06-04-outgoing-to-bryan-v2101-m3-delivery-sent-confirmed.md`. Bryan replied asking where completed events are saved and whether the 4 previously created completed events are available. Readonly live API checks at 2026-06-04 12:25+ showed no active/archived events: `/api/events=[]`, `/api/events?archived=1=[]`, `/api/pointscore/months=[]`, `/api/events/current=null`. Direct Render disk/backups are not inspectable from current tooling (no Render CLI/API key and user-browser relay unavailable). Balerion prepared a controlled retest seed script `scripts/seed-bryan-retest-events.cjs`; local isolated verification PASS created 4 completed events, visible monthly/season pointscore, and time history. Evidence: `docs/evidence/bryan-retest-seed/README.md` and `docs/evidence/bryan-retest-seed/seed-2026-06-04T10-37-23-577Z.json`. After restart/Dino instruction, hosted demo verification showed 4 completed deterministic retest events already visible live; the seed script's live guard refused a duplicate seed because 4 events existed. Read-only live verification passed 7/7 checks: version 2.10.1, expected April completed events visible, no current event, April and season pointscore visible, and time history visible. Evidence: `docs/evidence/bryan-retest-seed/live-verify-2026-06-04T12-06-20-652Z.json`. Dino confirmed at 14:14 Europe/Berlin that he sent the final completed-events/DB reply exactly as prepared; sent-confirmed record: `../messages/2026-06-04-outgoing-to-bryan-completed-events-db-question-sent-confirmed.md`. Bryan replied again on 2026-06-05 asking whether his completed events were saved, where they went, whether they can be found, whether results exist for all event types, and what happens after go-live; inbound record: `../messages/2026-06-05-Bryan-inbound-persistence-all-event-results-followup.md`. Bryan then sent more info saying relay should be 5/4/3, requesting results by event/stroke category, asking how to export the DB and how graphs are produced, and requesting break-count plus total-improvement reports; inbound record: `../messages/2026-06-05-Bryan-inbound-more-info-relay-reports-db-graphs.md`. Current client gate: persistence / relay rule correction / reporting requirement follow-up. Current `src/pointscore.js` relay/team rule is 3/2/1, so Bryan's 5/4/3 is a likely narrow v2.10.x correction. Do not claim original old events were recovered unless Render disk/backups are later inspected. No Bryan message by Balerion.
**M3 slice docs:** `DESIGN-SPEC-M3-POINTSCORE-REPORTS.md`, `UNIT-TEST-SPEC-M3-POINTSCORE-REPORTS.md`, `INTEGRATION-TEST-SPEC-M3-POINTSCORE-REPORTS.md`, `REQUIREMENT-TEST-EVIDENCE-MATRIX-M3-POINTSCORE-REPORTS.md`, `DEV-CHECKLIST-M3-POINTSCORE-REPORTS.md`. Evidence: `docs/evidence/m3-user-interaction-v3.0.1/`, `docs/screenshots/m3-user-interaction-v3.0.1/` (62 PNGs), `docs/evidence/m3-pointscore/`.

---

## v2.9.0 / M2 baseline anchors (historical — delivered/paid baseline, still protected)

**Version (from `package.json`):** 2.9.0
**BaseBranch:** main / origin/main
**BaseCommit:** eb87e11 (`docs: record v2.8.12 live verification`)
**Stable M1 backup branch:** backup/v2.8.12-m1-stable-20260518
**Stable M1 file backup:** `../backups/2026-05-18-0615-v2.8.12-m1-stable-origin-main/`
**TargetBranch:** dev/v2.9.0-m2-time-history
**Branch:** main
**Merge commit:** 1c01b10 (`merge: v2.9.0 M2 time history`)
**Version bump commit:** aa004be (`release: bump to v2.9.0 for M2 time history`)
**Implementation commit:** a864414 (`feat: v2.9.0 M2 time history implementation (T1-T7)`)
**Evidence commit (first delivery):** 3fce550 (`docs: M2 evidence package (...)`)
**Full-Proof runner extension commit:** 87b68b7 (`feat: M2 full-proof rerun — runner extension + harness setup script`)
**Full-Proof evidence commit:** be6ef8d (`docs: M2 full-proof evidence package (14 screenshots + refreshed run log)`)
**Full-Proof Protocol/Matrix commit:** c1d2522 (`docs: M2 full-proof Protocol + Coverage Matrix rewrite (PROVEN per case)`)
**Balerion V0015 verification:** `../messages/2026-05-18-0752-Balerion-V0015-M2-Full-Proof-Verification.md` — independently reproduced 55 PASS / 0 FAIL on HEAD `b5b99e2`
**Screenshot Evidence Gate audit:** `docs/evidence/m2-screenshot-evidence-gate-balerion-audit-2026-05-19.md` — Balerion visually reviewed 23/23 screenshots; Claude Code retested missing screenshot gaps for reload/restart/no-refresh/re-finalize; final verdict PROVEN.
**Expanded 100-case user-interaction screenshot spec:** `USER-INTERACTION-TEST-SPEC-M2-TIME-HISTORY.md` — rewritten on 2026-05-19 at Dino's request to require 100 screenshot-backed browser/user cases for all M2 Time History behavior. Execution handoff: `../messages/2026-05-19-Balerion-To-Claude-M2-100-user-interaction-screenshot-test-spec.md`. Claude Code executed the suite and produced `98 PASS / 2 NOT APPLICABLE / 0 FAIL / 0 BLOCKED` with 101 screenshots. Balerion V0015 review: `../messages/2026-05-19-Balerion-V0015-M2-100-case-screenshot-review.md`.
**RecordedCommit:** a864414 (substantive delivery anchor — three API/UI changes wiring M2 contract; the Full-Proof rerun did not modify any app-source file)
**LastEditor:** Balerion
**Date:** 2026-05-18
**Timestamp:** 2026-05-18 07:42:00 Europe/Berlin
**WorkingTreeStatus:** M2 merged into local `main`; post-merge browser E2E verification refreshed evidence artifacts. HEAD is dynamic — resolve with `git rev-parse --short HEAD` on branch `main`.
**Version SSOT:** `package.json`
**Release Anchors:** `package.json=2.9.0`, `src/public/index.html?v=2.9.0`, feature branch `dev/v2.9.0-m2-time-history`.

## Client / Milestone Status

**Current client status:** M2 RELEASED/PAID; M3 COMMISSIONED/AUTHORIZED, DEPLOYED, and DELIVERED TO BRYAN by Dino/Nedim. M2 remains protected and regression-tested. Dino authorized M3 deployment on 2026-06-04 after Balerion independently verified Claude's proof. M3 v2.10.1 was released under the exact working assumptions sent to Bryan: event-separated pointscore, monthly/season totals by simple addition, and existing Excel pointscore sheets as the working scoring source, with later adjustment if Bryan provides separate Constitution rules. Dino/Nedim sent the delivery update at 09:53 Europe/Berlin on 2026-06-04. Next action is not implementation; it is waiting for Bryan's response, then archiving/classifying it before any code or client-response step.

**M3 handoff:** `../messages/2026-05-29-1105-Balerion-To-Claude-WWSC-M3-Development-Handoff.md`

**M3 mandatory user-interaction proof spec:** `docs/tests/M3-USER-INTERACTION-TEST-SPEC-v3.0.0.md` — original 100-case M3 matrix. Updated pointscore proof target prepared 2026-06-03: `USER-INTERACTION-TEST-SPEC-M3-POINTSCORE-REPORTS-v3.0.1.md` (120 cases). Claude Code must implement/test against the updated v3.0.1 pointscore spec for the next M3 slice.

**M3 pointscore implementation directive prepared 2026-06-03:** `../messages/2026-06-03-0645-Balerion-To-Claude-WWSC-M3-Pointscore-Implementation-Directive.md`. This supersedes older "wait for another Bryan reply" operational gates for pointscore implementation. Implementation proceeds under the assumptions Dino/Nedim sent Bryan on 2026-06-02, while keeping Constitution/formula/season logic source-labeled and adjustable.

**Latest delivered M2 baseline verified on 2026-05-29:** `package.json=2.9.0`; `origin/main=3f225937247e797229cef77e2db224398b341469` (`docs: record v2.9.0 live smoke`); tag `v2.9.0=8d167fd` (`docs: mark v2.9.0 stable release candidate`). Local `main` is currently `7b4dcc5` (`docs: record Bryan graph scope question`) plus uncommitted continuity-doc updates; this is documentation-only on top of delivered v2.9.0 code. Claude must verify the exact repo/branch/commit before starting and should branch/worktree from the latest delivered M2 code truth, not from memory.

### Latest communication anchors

1. **2026-05-18:** Bryan activated and funded M2 on Upwork.
   - Source: `../messages/2026-05-18-Bryan-M2-active-funded.md`
2. **2026-05-18 06:08:** Dino sent M2 scope-confirmation to Bryan.
   - Sent-confirmed record: `../messages/2026-05-18-outgoing-to-bryan-m2-scope-confirmation-sent-confirmed.md`
   - Screenshot evidence: `../messages/attachments/2026-05-18-upwork-outgoing-m2-scope-confirmation-sent.png`
3. **2026-05-18 06:20:** Balerion prepared Claude Code implementation handoff.
   - Handoff: `../messages/2026-05-18-0620-Balerion-To-Claude-M2-Time-History-Implementation.md`
4. **2026-05-18 07:30:** Claude Code completed implementation + evidence run (38 PASS / 0 FAIL).
5. **2026-05-18 07:35:** Claude → Balerion delivery handoff.
   - Handoff: `../messages/2026-05-18-Claude-To-Balerion-M2-Time-History-Delivery.md`
6. **2026-05-18 07:12:** Balerion V0015 first-pass verification with 3 carry-overs identified.
   - `../messages/2026-05-18-0712-Balerion-V0015-M2-Time-History-Verification.md`
7. **2026-05-18 07:18:** Balerion `M2-Full-Proof-Required` — explicit demand to prove every case with browser evidence, close `UI-M2-F06`/`UI-M2-F08`/`UI-M2-C04`.
   - `../messages/2026-05-18-0718-Balerion-To-Claude-M2-Full-Proof-Required.md`
8. **2026-05-18 07:40:** Claude → Balerion Full-Proof Handoff. Runner extended (F06 / F08 / C04 + 7 explicit cases), harness setup script added, 55 PASS / 0 FAIL, 0 carry-overs.
   - `../messages/2026-05-18-Claude-To-Balerion-M2-Full-Proof-Handoff.md`
9. **2026-05-18 07:52:** Balerion independently reproduced the Full-Proof run from the SSOT branch at HEAD `b5b99e2`.
   - `../messages/2026-05-18-0752-Balerion-V0015-M2-Full-Proof-Verification.md`
   - Result: 55 PASS / 0 FAIL. V0015 classification: PROVEN for the agreed M2 release gate; NOT PROVEN: none.
10. **2026-05-19 10:11:** Balerion merged M2 into local `main` and re-ran the M2 browser E2E runner on `main`.
   - `../messages/2026-05-19-Balerion-M2-main-merge-post-merge-verification.md`
   - Merge commit: `1c01b10`
   - Result: 55 PASS / 0 FAIL.
11. **2026-05-19 10:44:** Screenshot Evidence Gate applied after Dino's new rule.
   - Balerion visually reviewed all 14 original M2 screenshots plus 9 new screenshot-gate retest screenshots.
   - Claude Code generated focused missing screenshot evidence for no-refresh finalize, browser reload, server restart with same DB, and re-finalize/no-duplicate UI table.
   - Audit: `docs/evidence/m2-screenshot-evidence-gate-balerion-audit-2026-05-19.md`
   - Retest protocol/log: `docs/evidence/m2-screenshot-gate-retest-2026-05-19.md`, `docs/evidence/m2-screenshot-gate-retest-2026-05-19.log`
   - Final verdict: PROVEN for M2 Screenshot Evidence Gate.
12. **2026-05-19 12:41:** Expanded 100-case screenshot evidence package reviewed after Claude Code handoff.
   - Claude handoff: `../messages/2026-05-19-Claude-To-Balerion-M2-100-case-screenshot-handoff.md`
   - Evidence commit before review note: `14c3118`
   - Result: `98 PASS / 2 NOT APPLICABLE / 0 FAIL / 0 BLOCKED`, 101 screenshots.
   - Balerion V0015 review: `../messages/2026-05-19-Balerion-V0015-M2-100-case-screenshot-review.md`
   - Final local verdict: PROVISIONALLY ACCEPTED for local M2 user-interaction screenshot gate. Deploy/live-smoke still pending.
13. **2026-05-19 13:39-13:42:** Balerion deployed `main` to Render and ran live smoke.
   - Pushed `main` from `eb87e11` to `8d167fd`; Render live `/api/version` returned `2.9.0`, build `2026-05-19T11:38:54.177Z`.
   - Live smoke evidence: `docs/evidence/live-smoke-v2.9.0-2026-05-19.json`.
   - Screenshots: `docs/screenshots/live-smoke-2026-05-19/`.
   - Result: PASS for live version, dashboard/sidebar, Members History actions, History empty-state modal on current no-history live DB, Season Calendar, no M3 leakage on loaded screens, and no relevant console/page errors.
   - Note: current live DB has no finalized events/history rows, so populated row/persistence behavior remains proven by local isolated E2E evidence rather than by mutating live production data.
14. **2026-05-19 15:10-15:16:** Local-install handover gap closed and Bryan M2 delivery update drafted.
   - Future handbook requirement: `../handover/HANDBOOK-REQUIREMENTS.md`.
   - Local install/backup PDF: `../handover/MS2-handover-2026-05-19/WWSC-Local-Installation-and-Backup-Guide-2026-05-19.pdf`.
   - Bryan draft: `../messages/2026-05-19-draft-to-bryan-v290-m2-delivery.md`.
15. **2026-05-19 15:23:** Dino confirmed he sent the v2.9.0 / M2 delivery update to Bryan.
   - Sent-confirmed record: `../messages/2026-05-19-outgoing-to-bryan-v290-m2-delivery-sent-confirmed.md`.
   - No screenshot was provided with this confirmation.
   - Current client gate: wait for Bryan response; archive inbound first, then classify against M2 scope and payment boundary.
16. **2026-05-20 21:10:** Dino relayed Bryan's first response after v2.9.0 / M2 delivery.
   - Inbound record: `../messages/2026-05-20-Bryan-inbound-graphs-history-question.md`.
   - Screenshot: `../messages/attachments/2026-05-20-upwork-bryan-graphs-history-question.png`.
   - Draft response: `../messages/2026-05-20-draft-to-bryan-graphs-history-question.md`.
   - Classification: M3 / reports-graphs scope question. The M2 history data is a structured foundation for graphing, but graph UI/report views belong to the next reporting layer/M3 unless Dino explicitly chooses a different strategy or Bryan funds/starts M3.
17. **2026-05-21 09:42 visible screenshot time:** Dino relayed Bryan's next Upwork question: "Hi Nedim What do you need from me now ?"
   - Inbound record: `../messages/2026-05-21-Bryan-inbound-what-do-you-need-now.md`.
   - Screenshot: `../messages/attachments/2026-05-21-upwork-bryan-what-do-you-need-now.png`.
   - Draft response: `../messages/2026-05-21-draft-to-bryan-next-needed-m2-acceptance-m3-gate.md`.
   - Classification: status / next-step clarification. Not an M2 bug and not explicit M2 acceptance. Recommended stance: ask Bryan to review/accept M2 or provide exact M2 reproduction details; keep graph/report views in M3.
18. **2026-05-21 19:06 Europe/Berlin:** Dino confirmed he sent the M2 acceptance request / M3 gate reply to Bryan.
   - Sent-confirmed record: `../messages/2026-05-21-outgoing-to-bryan-m2-acceptance-request-sent-confirmed.md`.
   - Screenshot: `../messages/attachments/2026-05-21-upwork-outgoing-bryan-m2-acceptance-request-sent.png`.
   - Exact visible ask: Bryan should review the current M2 update and confirm acceptance/close-release or provide a specific time-history issue; graph/report views are stated as the next reporting layer / M3 after M2 acceptance.
   - Current gate: wait for Bryan's next reply; archive and classify before doing any new work.
19. **2026-05-23 04:14 visible screenshot time:** Dino relayed Bryan's next Upwork reply.
   - Inbound record: `../messages/2026-05-23-Bryan-inbound-m2-met-production-questions.md`.
   - Screenshots: `../messages/attachments/2026-05-23-upwork-bryan-m2-met-production-questions-1.png`, `../messages/attachments/2026-05-23-upwork-bryan-m2-met-production-questions-2.png`.
   - Draft response: `../messages/2026-05-23-draft-to-bryan-m2-release-production-questions.md`.
   - Exact key signal: "Milestone 2 was quite simple and I think it is met."
   - Classification: positive M2 acceptance signal + production/commercial questions. Not an M2 bug report and not authorization to start M3 implementation. Recommended stance: ask Bryan to formally release/accept M2 in Upwork; answer CSV/report/history-limit/production questions while preserving the M3 boundary.
20. **2026-05-23 05:53 Europe/Berlin:** Dino confirmed he sent the final M2 release / commercial production boundary reply to Bryan.
   - Sent-confirmed record: `../messages/2026-05-23-outgoing-to-bryan-commercial-scope-boundary-sent-confirmed.md`.
   - Discord screenshot evidence filenames: `IMG_7068---55fece90-4e7e-4c22-b2e3-e184c18a95ce.png`, `IMG_7069---deeb1580-4fa3-4924-97cb-ddf007061fd0.png`.
   - Exact sent boundary: commercial hosted version with multiple clubs, customer data separation, backups, access control, maintenance, and separate instances vs multi-customer platform is separate scope from the current three milestones and must be separately scoped/quoted.
   - Current gate: wait for Bryan reply or formal Upwork M2 release/acceptance. Archive and classify the next inbound before doing any new work.
21. **2026-05-29 11:04 Europe/Berlin:** Dino confirmed the commercial gate changed.
   - Source: Dino direct confirmation in current OpenClaw/Balerion context.
   - Exact operational signal: Bryan has paid Milestone 2 and commissioned Milestone 3.
   - Classification: M2 released/paid + M3 authorized.
   - Balerion role: orchestrate and quality-gate.
   - Claude Code role: implement M3.
   - Handoff: `../messages/2026-05-29-1105-Balerion-To-Claude-WWSC-M3-Development-Handoff.md`.
   - Safety boundary: no origin push, deploy, tag, Bryan/client contact, or live data mutation without explicit authorization.
22. **2026-05-29 11:12-11:35 Europe/Berlin:** Balerion QA spec hardening for M3.
   - Created mandatory M3 user-interaction proof spec: `docs/tests/M3-USER-INTERACTION-TEST-SPEC-v3.0.0.md`.
   - Spec contains 100 concrete user-interaction cases for reports/graphs, individual swimmer history graphs from M2 data, pointscore, yearly/season accumulation, constitution accumulation, event/report/export/print flows, filters, responsive/accessibility checks, and M1/M2 regressions.
   - Updated Claude handoff to require this spec before implementation signoff and to require spec updates if the M3 PRD changes scope.
23. **2026-05-29 ~11:50 Europe/Berlin:** Claude Code completed M3 Phase 1 (PRD-only, no code).
   - Branch: `dev/m3-prd-planning` off `main@7b4dcc5`.
   - Artifacts: `REQUIREMENTS-M3-POINTSCORE-REPORTS.md`, `DEV-CHECKLIST-M3-POINTSCORE-REPORTS.md`, `M3-QUESTIONS-AND-ASSUMPTIONS-2026-05-29.md`.
   - PRD covers R-M3-01..R-M3-12 + Cross-Reference table to UIT-M3-001..UIT-M3-100. Acceptance checklist's evidence layout follows the UIT-M3-v3.0.0 Required Final Protocol Format verbatim. Questions doc adds a "QA → UIT-M3 PROVISIONAL Unblock Map".
   - Claude → Balerion handoff: `../messages/2026-05-29-Claude-To-Balerion-WWSC-M3-PRD-Handoff.md`.
   - No code, no version bump, no push/deploy, no Bryan/client contact.
   - Blocked on Bryan answers to QA-01 (pointscore formula), QA-05 (constitution doc location), QA-06 (constitution rules) before any pointscore/constitution code can start.
24. **2026-05-29 12:10 Europe/Berlin:** Balerion "You Are Next" implementation directive.
   - Handoff: `../messages/2026-05-29-1210-Balerion-To-Claude-WWSC-M3-You-Are-Next.md`.
   - Authorizes Claude to begin M3 implementation immediately on the UNAMBIGUOUS items, while continuing to hold the PROVISIONAL pointscore/constitution items behind Bryan's answers. Balerion reserves the held-back final QA matrix until Claude reports implementation complete.
25. **2026-05-29 ~12:35 Europe/Berlin:** Claude Code delivered the M3 R-M3-05 history-graphs slice (V0014 first commit on `dev/v2.10.0-m3-history-graphs`).
   - Branch: `dev/v2.10.0-m3-history-graphs` off `dev/m3-prd-planning@f043dea`.
   - Version: `2.10.0` (V0014 bump commit `7712067`).
   - Implementation: `6283ce6` (`feat: M3 R-M3-05 individual swimmer history graph (SVG, vanilla JS)`).
   - Test runner: `7f7a0a3` (`test: M3 R-M3-05 e2e runner + member-graph circle-marker tweak`).
   - R-M3-05 UIT-M3-001..020: **19 PASS / 1 NOT APPLICABLE / 0 FAIL** under `WWSC_E2E_EXPECTED_VERSION=2.10.0`.
   - R-M3-11 M2 regression on the same branch: **55 PASS / 0 FAIL** + **98 PASS / 2 NA / 0 FAIL** — identical to the 2.9.0 baseline.
   - R-M3-08 documentation answer: `docs/M3-HISTORY-RETENTION-POLICY.md`.
   - R-M3-12 review: clean (`src/server.js`, `src/db.js`, `render.yaml`, `package-lock.json` zero diff).
   - Carry-overs explicitly preserved: every other R-M3 + every PROVISIONAL UIT-M3 case stays blocked on QA-01 / QA-05 / QA-06.
   - Claude → Balerion delivery handoff: `../messages/2026-05-29-Claude-To-Balerion-WWSC-M3-History-Graphs-Delivery.md`.
   - No push, no deploy, no tag, no Bryan/client contact.
26. **2026-05-29 18:02 Europe/Berlin:** Balerion R-M3-05 QA Fix Directive — CONDITIONAL PASS with 5 required corrections.
   - `../messages/2026-05-29-1802-Balerion-To-Claude-WWSC-M3-R-M3-05-QA-Fix-Directive.md`.
27. **2026-05-29 ~18:35 Europe/Berlin:** Claude Code applied all 5 corrections (fix commit `95ce853`).
   - (1) Real date-range filter in `member-graph.js`; (2) real browser back/forward in UIT-M3-015; (3) exact point→row mapping in UIT-M3-019 via `data-*` attributes + `m3-data-correctness-mapping.json`; (4) 6-event seed for UIT-M3-001; (5) stale screenshots removed (dir now 20 PNGs, one per case).
   - Re-run: 19 PASS / 1 NOT APPLICABLE / 0 FAIL / 0 BLOCKED / 0 PROVISIONAL, 0 console errors.
   - Protocol Rev 2 + evidence: `../messages/2026-05-29-Claude-To-Balerion-WWSC-M3-R-M3-05-QA-Fix-Evidence.md`.
   - R-M3-12 still clean (`src/server.js`/`src/db.js`/`render.yaml` unchanged). No push/deploy/tag/Bryan contact.
28. **2026-05-29 21:21 Europe/Berlin:** Balerion Clean-HEAD Evidence Rerun directive — substantive fixes accepted, but evidence metadata still referenced baseline `06ec2da`; required a rerun from clean HEAD so records/log/protocol show the actual HEAD.
   - `../messages/2026-05-29-2121-Balerion-To-Claude-WWSC-M3-R-M3-05-Clean-HEAD-Evidence-Rerun.md`.
29. **2026-05-29 ~21:40 Europe/Berlin:** Claude Code reran the R-M3-05 gate from clean HEAD `1545ea7`.
   - Working tree clean before and after. Evidence metadata now captures `1545ea7` (run.log, records.json, mapping.json, protocol Rev 3 with explicit HEAD field).
   - Result reconfirmed: 19 PASS / 1 NOT APPLICABLE / 0 FAIL / 0 BLOCKED / 0 PROVISIONAL, 0 console errors. 20 screenshots (byte-identical, deterministic render).
   - Evidence-refresh commit: `926e9aa`. Handoff: `../messages/2026-05-29-Claude-To-Balerion-WWSC-M3-R-M3-05-Clean-HEAD-Evidence.md`.
   - No push/deploy/tag/Bryan contact/live-data mutation.
30. **2026-05-29 21:47 Europe/Berlin:** Balerion accepted R-M3-05 as PASS and issued the forward-build guardrail (protect M1/M2/v2.9.0 baseline; pointscore from accepted app logic + Excel as candidate; constitution blocked).
   - `../messages/2026-05-29-2147-Balerion-To-Claude-WWSC-M3-Accepted-Logic-Guardrail-And-Next-Scope.md`.
31. **2026-05-29 ~22:05 Europe/Berlin:** Claude Code returned the four required guardrail lists (no code).
   - Doc: `M3-FORWARD-BUILD-GUARDRAIL-2026-05-29.md`. Handoff: `../messages/2026-05-29-Claude-To-Balerion-WWSC-M3-Forward-Build-Guardrail-Response.md`.
   - Audit finding: `pointscore_entry` is a stub table with NO write path / NO formula in code (db.js:110/134, server.js:371). The `bryan-excel-original.xlsm` carries 12 pointscore sheets (per-race + Total Pointscore + Total Improvement + Attendance) as a CANDIDATE, source-labeled basis only — not confirmed.
   - Critical blockers restated: QA-01 (formula = Excel sheets?) + QA-05/06 (Constitution = Excel?). N1 pointscore write path is designed as additive + isolated, gated behind a new R5 isolation regression proof.
   - No code/push/deploy/tag/Bryan contact.
32. **2026-05-29 22:15-22:22 Europe/Berlin:** Dino/Nedim sent Bryan the M3 Pointscore / Constitution clarification questions.
   - Sent-confirmed record: `../messages/2026-05-29-outgoing-to-bryan-m3-pointscore-constitution-questions-sent-confirmed.md`.
   - Message thanked Bryan for M2 confirmation/payment and M3 funding, stated M3 work has started, and asked for exact club rules before further pointscore / accumulation implementation.
   - Questions covered Excel pointscore confirmation (`5/4/3/2`, `Break=2`), whether Excel equals official Constitution rules, bonus/special cases, reset basis, and most important M3 report outputs.
   - Current gate: wait for Bryan's reply. Do not guess missing Pointscore / Constitution rules. Archive and classify Bryan's answer before issuing the next Claude Code directive.
33. **2026-06-02 09:34 visible message time / 21:02 Europe/Berlin relayed:** Dino relayed Bryan's partial M3 pointscore answer by screenshot.
   - Inbound record: `../messages/2026-06-02-Bryan-inbound-m3-event-separated-month-season-addition.md`.
   - Key substance: keep pointscore/points for each event separately; overall winners are computed by simple addition at the end of each month and season.
   - Classification: M3 Pointscore / Accumulation partial clarification.
   - Mapping: QA-01 PARTIAL (aggregation shape clarified, formula still blocked); QA-02/QA-03/QA-04 PARTIAL (month/season reporting periods indicated, exact season boundary/reset/filter still blocked); QA-05 BLOCKED; QA-06 PARTIAL; QA-07 PARTIAL.
   - Current gate: do not implement final pointscore write logic yet. The data/reporting direction may be event-separated pointscore rows plus monthly/season aggregate views, but point values, Constitution source, season boundary, bonus/special cases, eligibility, race weighting, and tie-breakers are still unanswered.
34. **2026-06-02 21:09-21:10 visible Discord context / confirmed 2026-06-03:** Dino decided not to chase Bryan for more detail and sent a transparent assumptions message to Bryan.
   - Sent-confirmed record: `../messages/2026-06-02-outgoing-to-bryan-m3-pointscore-assumptions-sent-confirmed.md`.
   - Exact operational stance: proceed with pointscore implementation under these assumptions: each event keeps its own pointscore separately; monthly overall winners are calculated by adding relevant event totals at month end; season overall winners are calculated by adding relevant event totals at season end; existing Excel pointscore sheets are the working source for the scoring formula; any separate Constitution rule can be adjusted afterwards once Bryan sends it.
   - Current implementation gate: continue M3 pointscore under the sent assumptions, but keep formula/season/Constitution logic isolated and adjustable. Do not claim Constitution rules are confirmed.
35. **2026-06-03 06:45 Europe/Berlin:** Balerion prepared the constrained Claude Code pointscore implementation package.
   - Directive: `../messages/2026-06-03-0645-Balerion-To-Claude-WWSC-M3-Pointscore-Implementation-Directive.md`.
   - Mandatory user-interaction proof spec: `USER-INTERACTION-TEST-SPEC-M3-POINTSCORE-REPORTS-v3.0.1.md` with 120 cases covering Excel formula extraction, event-separated pointscore, monthly totals, season totals, reports, CSV/export, graphs, regression, responsiveness, accessibility, out-of-scope guard, and final evidence.
   - Current implementation gate: hand the directive/spec to Claude Code. Claude must implement and test, then return evidence. Balerion remains QA gate before any delivery/deploy/client message.
36. **2026-06-04 09:53 Europe/Berlin:** Dino/Nedim sent the v2.10.1 / M3 delivery update to Bryan.
   - Sent-confirmed record: `../messages/2026-06-04-outgoing-to-bryan-v2101-m3-delivery-sent-confirmed.md`.
   - Evidence source: Discord screenshot attachment `IMG_7239---9a5755db-4d2c-4775-b796-b80dd248cc2a.png` relayed by Dino at 09:54 Europe/Berlin.
   - Message delivered live demo URL `https://wwsc-demo.onrender.com/`, the working assumptions, included M3 pointscore/report items, and asked Bryan to send exact Constitution rules or example expected results if the scoring should differ.
   - Important evidence nuance: the visible sent message is shorter than the prepared draft and does not show the separate test paragraph/M2-regression bullet. Treat those as internal proof, not as confirmed client-facing wording.
   - Current gate: **WAITING FOR BRYAN TEST / ACCEPTANCE / CONSTITUTION-RULE FEEDBACK**. Next Bryan reply must be archived and classified before code changes or another client response.

## Current Boundary

- M2 scope: "Generate solution for recording time changes and archiving historical times with dates."
- Pointscore, accumulated season totals, reports/graphs, and constitution accumulation are **Milestone 3**, now commissioned/authorized after M2 payment. Bryan's 2026-06-02 answer partially clarified the aggregation shape, and Dino/Nedim then sent Bryan a working-assumptions message: keep event points separate, compute month/season overall winners by simple addition, use existing Excel pointscore sheets as the working scoring source, and adjust later if a separate Constitution rule differs. Implementation may proceed under those sent assumptions, with formula/season/Constitution logic isolated and adjustable. Do not claim Constitution rules are confirmed.
- Commercial hosted version, multiple clubs/customer access, customer data isolation, backups, access control, maintenance, server operations, and multi-customer/SaaS productization are **not included in M1/M2/M3**. Treat as separate commercial production/productization scope requiring separate planning and quote.
- M1/v2.8.12 stable code is protected by backup branch and file snapshot.
- M2 is now merged into local `main`. Further release changes should happen through controlled commits, then deploy/live-smoke.

## M2 Dev-Loop Artifacts

- Progress: `PROGRESS.md`
- Requirements: `REQUIREMENTS-M2-TIME-HISTORY.md`
- Design: `DESIGN-SPEC-M2-TIME-HISTORY.md`
- Unit tests: `UNIT-TEST-SPEC-M2-TIME-HISTORY.md`
- Integration tests: `INTEGRATION-TEST-SPEC-M2-TIME-HISTORY.md`
- User interaction tests: `USER-INTERACTION-TEST-SPEC-M2-TIME-HISTORY.md`
- Dev checklist: `DEV-CHECKLIST-M2-TIME-HISTORY.md` (all 9 tasks ticked)
- Test protocol: `USER-INTERACTION-TEST-PROTOCOL-M2-TIME-HISTORY.md`
- Coverage matrix: `USER-INTERACTION-COVERAGE-MATRIX-M2-TIME-HISTORY.md`
- Expanded 100-case screenshot interaction spec: `USER-INTERACTION-TEST-SPEC-M2-TIME-HISTORY.md`
- Raw run + browser console capture: `docs/evidence/m2-time-history-run.log` + `docs/evidence/m2-time-history-console-errors.log`
- Screenshots: `docs/screenshots/m2-time-history/` (14 PNGs)
- Screenshot Gate audit: `docs/evidence/m2-screenshot-evidence-gate-balerion-audit-2026-05-19.md`
- Screenshot Gate retest: `docs/evidence/m2-screenshot-gate-retest-2026-05-19.md`, `docs/screenshots/m2-time-history-screenshot-gate-2026-05-19/` (9 PNGs)
- E2E runner: `scripts/e2e-m2-time-history.cjs`

## M2 Delivery Summary

Three client-side contract pieces, one new server endpoint, one new E2E runner, full evidence:

- `src/server.js`:
  - `GET /api/events/:eventId/time-history` joins `event` so each row carries `event_date` (R-M2-02).
  - New `GET /api/members/:memberId/time-history` returns the per-swimmer dated timeline (R-M2-03), validates the id, 404 on unknown member.
- `src/public/js/api.js`: `API.getMemberTimeHistory(memberId)` wrapper.
- `src/public/js/screens/members.js`: per-row `📜 History` action and `showMemberHistoryModal(id)` rendering Date / Stroke / Time / Previous Best / Break.
- `src/public/js/screens/calendar.js`: completed-event detail modal now exposes a "Time History (M2)" section.
- `scripts/e2e-m2-time-history.cjs`: self-contained runner, isolated server on PORT=3003 with WWSC_DB_PATH=/tmp/wwsc-m2-test/wwsc.db, 38 PASS / 0 FAIL.

## Final SSOT Note

The SSOT completion commit is a documentation anchor per SR-VERSION-003. `RecordedCommit` points to the substantive implementation commit `a864414`; the current HEAD may be a later SSOT-only commit. Resolve HEAD dynamically with `git rev-parse --short HEAD`.

## Next Action

Current quality sequence:
- Dino confirmed on 2026-05-29 11:04 Europe/Berlin that Bryan paid/released M2 and commissioned M3.
- R-M3-05 Individual Swimmer History Graphs is accepted PASS after the clean-HEAD evidence rerun.
- Claude Code has returned the forward-build guardrail lists and should protect M1/M2/v2.9.0 accepted baseline behavior.
- Dino/Nedim sent Bryan the M3 Pointscore / Constitution clarification questions on 2026-05-29 ~22:15 Europe/Berlin.
- Bryan partially answered on 2026-06-02: event-separated points plus simple monthly/season addition for overall winners.
- Current state: Claude Code implemented M3 pointscore/reports, Balerion verified the proof, Dino authorized release, v2.10.1 was deployed/live-smoked, and Dino/Nedim sent the M3 delivery update to Bryan on 2026-06-04 at 09:53 Europe/Berlin.
- Next action: wait for Bryan's response. Archive and classify before any implementation, deploy, or client response. If Bryan gives Constitution rules/examples, map them to a narrow v2.10.x adjustment with fresh evidence. If Bryan accepts M3, prepare the M3 acceptance/payment-close path.
- Do not start commercial webhost/SaaS/productization work unless separately scoped and quoted.

## SSOT Rule

- Operative project SSOT: `~/Dropbox/Dino-Balerion-Claude-Code/Projekte/0004_swimming-app/`
- Code SSOT: this `code/` directory.
- Status SSOT: `code/version/CURRENT_STATE.md`.
- Messages/evidence: `messages/`.
- Do not treat `~/wwsc-demo`, `projects/0004_swimming-app/`, daily notes, or chat memory as a second project truth.

## 2026-05-29 22:30 Resume Note

Bryan's 2026-06-02 reply is archived and mapped as a partial answer. Dino/Nedim then sent Bryan the working assumptions message. Balerion prepared the constrained Claude Code directive for M3 pointscore under those sent assumptions: event-separated points, monthly/season totals by simple addition, existing Excel pointscore sheets as working scoring source, and separate Constitution differences adjustable later. Do not invent Constitution rules or hard-code them as confirmed truth; keep formula/season/Constitution behavior isolated and adjustable.

Protected baseline: accepted/paid/deployed `v2.9.0` / M1 / M2 behavior, especially Race/Heat/Breaker/Ranking/Time-History logic. Restore/comparison reference: `backups/2026-05-29-v2.9.0-accepted-paid-deployed/`, source `v2.9.0` commit `8d167fdcc787f663c7b4168d32096ff5baa66b35`.

Last known Claude Code state: branch `dev/v2.10.0-m3-history-graphs`, HEAD `79751e6`, guardrail accepted, R-M3-05 PASS, no push/deploy/tag/Bryan contact. Next Claude work must use the 2026-06-03 directive and include a strict evidence gate: browser E2E flows, raw logs, screenshots/traces, 120-case protocol, pointscore isolation proof, and Requirement -> Test -> Evidence mapping.
