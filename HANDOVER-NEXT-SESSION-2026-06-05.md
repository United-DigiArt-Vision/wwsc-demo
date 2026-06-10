# HANDOVER → NEXT CLAUDE SESSION — WWSC M3 (2026-06-05)

**Read this first. It tells you exactly where things stand and where to continue.**
Also read (mandatory): `../../../QUALITY_PLAYBOOK.md`, `../../../COLLABORATION_MODEL.md`, `version/CURRENT_STATE.md`, `PROGRESS.md`.

---

## ⚠️ FIRST: do not clobber in-progress work — verify with Dino/Balerion

When this handover was written, the working tree was on branch **`main`** with **10 uncommitted modified files** and `package.json` already bumped to **`2.10.2`**, and `src/pointscore.js` relay rule already changed to **5/4/3**. This is almost certainly **Balerion's in-progress v2.10.2 relay-correction**, synced onto this Intel MacBook via Dropbox.

**Before touching anything:**
1. Run `git -C code status` and `git -C code log --oneline -5`.
2. Confirm with Dino whether Balerion is actively working v2.10.2 on the Mac Mini. The collaboration model says Claude works on **feature branches, never directly on `main`**. If Balerion owns this WIP, do NOT commit over it — branch off and coordinate, or wait for a scoped `Balerion-To-Claude` directive.
3. Do not `git checkout --`/reset the uncommitted changes without confirming they are not Balerion's.

## Where M3 stands (delivered)

- **v2.10.1 M3 Pointscore/Reports was delivered to Bryan** (2026-06-04) and **merged to `main`** (commits `7f86b2d` release, `2154574` merge). Live-smoke recorded.
- **Balerion V0015 PASSED** the Bryan-Expectation Proof on HEAD `d3d3ada`: unit 13/0, isolation PASS, M2 55/0, M2 100 98/2/0/0, **M3-120 116 PASS / 2 NA / 2 CLIENT INPUT MISSING / 0 FAIL**, history-graphs 19/1/0. See `messages/2026-06-04-0920-Balerion-V0015-WWSC-M3-Bryan-Expectation-Proof-Verification.md`.
- Verdict on record: `PROVEN EXCEPT EXPLICIT CLIENT-MISSING CONSTITUTION / REPORT-DETAIL INPUT`.
- Matrix: `code/BRYAN-M3-EXPECTATION-PROOF-2026-06-04.md`.

## THE NEW TASK — Bryan's 2026-06-05 requirements

Source (read it): `messages/2026-06-05-Bryan-inbound-more-info-relay-reports-db-graphs.md` (+ the persistence follow-up `2026-06-05-Bryan-inbound-persistence-all-event-results-followup.md` and the draft replies). Bryan's exact asks:

1. **Relay points = 5/4/3** (1st/2nd/3rd). ⚠️ This OVERRIDES the previous 3/2/1 Excel working assumption. → already partially applied in the uncommitted `src/pointscore.js` (relay `pointsByPlace {1:5,2:4,3:3}`). **Verify/complete this** (see "What a full relay-rule change touches" below).
2. **Results by every stroke/event**: 25m, 50m, relay, 75m, 25m brace, 50m brace, breast, back, butterfly, 75m. → prepare completed retest examples across all categories (Balerion added a "Bryan retest event seed path", commit `c21c58a` — check `scripts/` for it).
3. **DB export** ("How do I export the DB?"). → currently CSV/report exports + a backup endpoint exist; there is NO customer-facing "download raw SQLite DB" UI. Decide/scope with Dino.
4. **Graphs** ("How can it produce graphs?"). → already exist (Members → per-swimmer time/PB graph from `time_history`). Mostly an explanation, not new code.
5. **Two now-CONCRETE reports** (these were previously `CLIENT INPUT MISSING` — Bryan has NOW defined them, so they are implementable):
   - **Breaks per person — overall and by event.** (Data: `time_history.is_break` / `heat_lane.is_break`.)
   - **Total time improvement per person — by event and overall.** (Data: `time_history` time vs previous_best.)

## What a full relay-rule change (5/4/3) touches — do ALL of these

The engine is built for this (centralized `POINTSCORE_RULES`), but a rule change is a full cycle:
- `src/pointscore.js` — `categories.relay.pointsByPlace` → `{1:5,2:4,3:3}` (DONE in WIP; confirm `finisherPoints` stays 0 unless Bryan says otherwise).
- `scripts/test-m3-pointscore-unit.cjs` — **UT1-rule-relay asserts 3/2/1** → update to 5/4/3 (check the WIP did this).
- `docs/evidence/m3-pointscore/POINTSCORE-RULE-SOURCE-*.md` + `BRYAN-M3-EXPECTATION-PROOF-2026-06-04.md` + `DESIGN-SPEC-M3-POINTSCORE-REPORTS.md` — every "relay 3/2/1" mention → 5/4/3, source-labeled as **Bryan-confirmed 2026-06-05** (no longer just Excel working assumption).
- `scripts/e2e-m3-pointscore-120.cjs` — UT10 note + any 3/2/1 references.
- Version: `package.json` (→ 2.10.2, DONE in WIP) + `src/public/index.html` cache-bust (→ 2.10.2, check).
- SSOT: `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, `PROGRESS.md`, `STABLE.md` (STABLE only after Dino authorizes).
- Re-run full evidence + write a Claude→Balerion handoff.

## ENVIRONMENT GOTCHAS (these cost the previous session hours — read carefully)

1. **`better-sqlite3` arch ping-pong (Dropbox).** This is an **Intel x86_64** MacBook; Balerion's Mac Mini is **arm64**. `node_modules` is inside the Dropbox-synced folder, so Balerion's arm64 build of `better-sqlite3` syncs here and breaks every run (`dlopen ... incompatible architecture (have 'arm64', need 'x86_64')`). **Fix each time:** `cd code && npm rebuild better-sqlite3`. It's gitignored, so commits are unaffected — but it re-syncs back to Balerion (he must rebuild arm64 on his side). **Recommend Dino exclude `node_modules` + `docs/screenshots` from Dropbox sync.**
2. **Browser suites hang on cleanup.** `e2e-m2-user-interaction-100.cjs`, `e2e-m3-pointscore-120.cjs`, `e2e-m3-history-graphs.cjs` frequently leave a Node/Chrome handle open AFTER writing a complete passing log (`browser.close()` intermittently hangs). The harness then never gets a normal exit. **Pattern that works:** run the suite in background, watchdog-poll the RAW LOG for the completion marker (`UIT-M3-120` for the 120; `TALLY`/`Total PASS` for M2; `Tally` in `m3-history-graphs-run.log`), then `kill -9` the PID, and **read results from the raw log, not stdout**. Balerion's V0015 also noted occasional `EADDRINUSE` on port 3004 → kill stale servers first.
3. **Dropbox sync I/O slows browser suites progressively.** Dropbox can run ~100% CPU syncing the 100+ screenshots each run writes into `docs/screenshots/` (which is in the Dropbox tree). Runs got slower each time (77→66→38 cases/window). `SHOT_DIR` is hardcoded; can't redirect to `/tmp` without editing the harness. **Before heavy runs:** `pkill -9 -f 'Google Chrome'; pkill -9 -f 'node .*src/server.js'` to clear orphans; consider doing browser evidence on the Mac Mini (Balerion's, where it runs green) instead of here.
4. **Do NOT chain multiple `&`-watchdog suites in one background command** — multi-`&` job-control is unreliable in the harness's background execution (it dies after the first suite). Run each browser suite as its OWN single-watchdog background command.
5. **Test ports:** unit 3010, isolation (own), M2-55 3003, M2-100 3004, history-graphs 3005, 120 = 3011. Test DBs in `/tmp`. Kill stale servers between runs.

## Evidence commands (order matters)

```bash
cd code
npm rebuild better-sqlite3                                   # fix arch first (Dropbox sync)
node scripts/test-m3-pointscore-unit.cjs                     # expect 13/0 (relay rule update may add a case)
node scripts/e2e-m3-pointscore-isolation.cjs                 # VERDICT: PASS
WWSC_E2E_EXPECTED_VERSION=2.10.2 node scripts/e2e-m2-time-history.cjs       > /tmp/m3p-m2-55.log  2>&1   # 55/0; NOTE expected version!
WWSC_E2E_EXPECTED_VERSION=2.10.2 node scripts/e2e-m2-user-interaction-100.cjs > /tmp/m3p-m2-100.log 2>&1   # 98/2/0/0
node scripts/e2e-m3-pointscore-120.cjs                       # M2 logs must carry commit=<HEAD> (111/112 HEAD-staleness gate)
WWSC_E2E_EXPECTED_VERSION=2.10.2 node scripts/e2e-m3-history-graphs.cjs     # 19/1/0
```
The 120's UIT-M3-111/112 BLOCK unless `/tmp/m3p-m2-*.log` carry `commit=<current HEAD>` — so run the M2 suites at the current commit FIRST, then the 120. unit + isolation must run before the 120 (it reads `pointscore-isolation-proof.json`). **If you bump the version, update the `WWSC_E2E_EXPECTED_VERSION` you pass.**

## Collaboration / boundaries (always)

- Code English, communication German. Feature branch, never direct on `main`. Commit messages end with the Co-Authored-By trailer.
- **Do not:** push to origin, deploy, tag, merge to main, mark STABLE as live, contact Bryan/client, mutate live data — unless Dino explicitly authorizes.
- Communicate with Balerion via `../messages/` (project root, i.e. `../messages/` from `code/`). Final handoff file: `messages/YYYY-MM-DD-HHMM-Claude-To-Balerion-...md`.
- SSOT discipline (CLAUDE.md): keep `version/CURRENT_STATE.md` + `version/CHANGELOG.md` in sync; never claim "done" without evidence + SSOT close.
- Quality Playbook: prove, don't claim; test what the user sees; fix ALL instances of a pattern; honest verdicts (`CLIENT INPUT MISSING` for unspecified Constitution/report rules — do not say "complete per Constitution").

## Key files

- Engine: `src/pointscore.js` · finalize hook + APIs + CSVs: `src/server.js` (members CSV at `GET /api/members/csv`, defined BEFORE `/api/members/:id`) · UI: `src/public/js/screens/pointscore.js`.
- Tests: `scripts/test-m3-pointscore-unit.cjs` (UT1–UT10), `e2e-m3-pointscore-isolation.cjs`, `e2e-m3-pointscore-120.cjs`, `e2e-m2-time-history.cjs`, `e2e-m2-user-interaction-100.cjs`, `e2e-m3-history-graphs.cjs`.
- Specs/docs: `BRYAN-M3-EXPECTATION-PROOF-2026-06-04.md`, `DESIGN-SPEC-M3-POINTSCORE-REPORTS.md`, `UNIT-/INTEGRATION-TEST-SPEC-M3-*.md`, `REQUIREMENT-TEST-EVIDENCE-MATRIX-M3-*.md`, `DEV-CHECKLIST-M3-*.md`, `USER-INTERACTION-TEST-SPEC-M3-POINTSCORE-REPORTS-v3.0.1.md`.
- Evidence: `docs/evidence/m3-user-interaction-v3.0.1/`, `docs/screenshots/m3-user-interaction-v3.0.1/`, `docs/evidence/m3-pointscore/`.

## Suggested first actions for the new session

1. Read this file + `version/CURRENT_STATE.md` + the 2026-06-05 Bryan inbound messages + the latest `Balerion-To-Claude` directive if one has arrived since 2026-06-04.
2. `git status` + clarify the uncommitted `main` WIP ownership with Dino (see top warning). Wait for / confirm a scoped directive for the v2.10.2 relay correction + the two new reports + DB export.
3. `npm rebuild better-sqlite3`, then run unit + isolation to get a fast green baseline before touching code.
4. Complete the relay 5/4/3 change across ALL the touch-points listed above, then the two new reports (breaks-per-person, total-improvement) per Bryan's now-concrete definitions, then evidence, then handoff.
