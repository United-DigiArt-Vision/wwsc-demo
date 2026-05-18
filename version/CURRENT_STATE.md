# CURRENT_STATE

**Version (from `package.json`):** 2.9.0
**BaseBranch:** main / origin/main
**BaseCommit:** eb87e11 (`docs: record v2.8.12 live verification`)
**Stable M1 backup branch:** backup/v2.8.12-m1-stable-20260518
**Stable M1 file backup:** `../backups/2026-05-18-0615-v2.8.12-m1-stable-origin-main/`
**TargetBranch:** dev/v2.9.0-m2-time-history
**Branch:** dev/v2.9.0-m2-time-history
**Version bump commit:** aa004be (`release: bump to v2.9.0 for M2 time history`)
**Implementation commit:** a864414 (`feat: v2.9.0 M2 time history implementation (T1-T7)`)
**Evidence commit (first delivery):** 3fce550 (`docs: M2 evidence package (...)`)
**Full-Proof runner extension commit:** 87b68b7 (`feat: M2 full-proof rerun — runner extension + harness setup script`)
**Full-Proof evidence commit:** be6ef8d (`docs: M2 full-proof evidence package (14 screenshots + refreshed run log)`)
**Full-Proof Protocol/Matrix commit:** c1d2522 (`docs: M2 full-proof Protocol + Coverage Matrix rewrite (PROVEN per case)`)
**RecordedCommit:** a864414 (substantive delivery anchor — three API/UI changes wiring M2 contract; the Full-Proof rerun did not modify any app-source file)
**LastEditor:** Claude Code
**Date:** 2026-05-18
**Timestamp:** 2026-05-18 07:42:00 Europe/Berlin
**WorkingTreeStatus:** clean after Full-Proof SSOT closure commit; HEAD is dynamic — resolve with `git rev-parse --short HEAD` on branch `dev/v2.9.0-m2-time-history`.
**Version SSOT:** `package.json`
**Release Anchors:** `package.json=2.9.0`, `src/public/index.html?v=2.9.0`, feature branch `dev/v2.9.0-m2-time-history`.

## Client / Milestone Status

**Current client status:** M2 ACTIVE & FUNDED. Implementation delivered, awaiting Balerion V0015 verification.

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

## Current Boundary

- M2 scope: "Generate solution for recording time changes and archiving historical times with dates."
- Pointscore, accumulated season totals, reports/graphs, and constitution accumulation are **Milestone 3**, not M2.
- M1/v2.8.12 stable code is protected by backup branch and file snapshot.
- Development stays on `dev/v2.9.0-m2-time-history`; no direct `main` development.

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
- Raw run + browser console capture: `docs/evidence/m2-time-history-run.log` + `docs/evidence/m2-time-history-console-errors.log`
- Screenshots: `docs/screenshots/m2-time-history/` (9 PNGs)
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

Balerion executes V0015 verification on this branch:
- branch/commit/version truth
- diff review
- API tests (re-run `node scripts/e2e-m2-time-history.cjs`)
- Browser-E2E manual reproduction of UI-M2-A..G + the carry-overs `UI-M2-F06` (relay readout), `UI-M2-F08` (archive/restore), `UI-M2-C04` (server-restart persistence)
- M1 regression smoke
- no M3 leakage scan

## SSOT Rule

- Operative project SSOT: `~/Dropbox/Dino-Balerion-Claude-Code/Projekte/0004_swimming-app/`
- Code SSOT: this `code/` directory.
- Status SSOT: `code/version/CURRENT_STATE.md`.
- Messages/evidence: `messages/`.
- Do not treat `~/wwsc-demo`, `projects/0004_swimming-app/`, daily notes, or chat memory as a second project truth.
