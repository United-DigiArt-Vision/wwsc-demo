# CURRENT_STATE

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

**Current client status:** M2 ACTIVE & FUNDED. Implementation is merged into local `main`, post-merge verification passed, and the expanded 100-case screenshot evidence gate is provisionally accepted by Balerion. Next gate is deploy -> live smoke. Do not message Bryan before live smoke.

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

## Current Boundary

- M2 scope: "Generate solution for recording time changes and archiving historical times with dates."
- Pointscore, accumulated season totals, reports/graphs, and constitution accumulation are **Milestone 3**, not M2.
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
- Continue the controlled release sequence: deploy to Render, live smoke (`/api/version` must report `2.9.0`, core UI must load, M2 Time History must be visible), then prepare/send Bryan update and archive the sent-confirmed record.

## SSOT Rule

- Operative project SSOT: `~/Dropbox/Dino-Balerion-Claude-Code/Projekte/0004_swimming-app/`
- Code SSOT: this `code/` directory.
- Status SSOT: `code/version/CURRENT_STATE.md`.
- Messages/evidence: `messages/`.
- Do not treat `~/wwsc-demo`, `projects/0004_swimming-app/`, daily notes, or chat memory as a second project truth.
