# CURRENT_STATE

**Version (from `package.json`):** 2.9.0
**BaseBranch:** main / origin/main
**BaseCommit:** eb87e11 (`docs: record v2.8.12 live verification`)
**Stable M1 backup branch:** backup/v2.8.12-m1-stable-20260518
**Stable M1 file backup:** `../backups/2026-05-18-0615-v2.8.12-m1-stable-origin-main/`
**TargetBranch:** dev/v2.9.0-m2-time-history
**Branch:** dev/v2.9.0-m2-time-history
**RecordedCommit:** c0c0c68 (`docs: define M2 time history dev loop specs`)
**Version bump commit:** aa004be (`release: bump to v2.9.0 for M2 time history`)
**LastEditor:** Balerion
**Date:** 2026-05-18
**Timestamp:** 2026-05-18 06:22:00 Europe/Berlin
**WorkingTreeStatus:** modified by this SSOT update; final SSOT commit pending.
**Version SSOT:** `package.json`
**Release Anchors:** `package.json=2.9.0`, `src/public/index.html?v=2.9.0`, feature branch `dev/v2.9.0-m2-time-history`.

## Client / Milestone Status

**Current client status:** M2 ACTIVE & FUNDED. Implement scoped M2 only.

### Latest communication anchors

1. **2026-05-18:** Bryan activated and funded M2 on Upwork.
   - Source: `../messages/2026-05-18-Bryan-M2-active-funded.md`
2. **2026-05-18 06:08:** Dino sent M2 scope-confirmation to Bryan.
   - Sent-confirmed record: `../messages/2026-05-18-outgoing-to-bryan-m2-scope-confirmation-sent-confirmed.md`
   - Screenshot evidence: `../messages/attachments/2026-05-18-upwork-outgoing-m2-scope-confirmation-sent.png`
3. **2026-05-18 06:20:** Balerion prepared Claude Code implementation handoff.
   - Handoff: `../messages/2026-05-18-0620-Balerion-To-Claude-M2-Time-History-Implementation.md`

## Current Boundary

- M2 scope: "Generate solution for recording time changes and archiving historical times with dates."
- Pointscore, accumulated season totals, reports/graphs, and constitution accumulation are **Milestone 3**, not M2.
- M1/v2.8.12 stable code is protected by backup branch and file snapshot.
- Development must stay on `dev/v2.9.0-m2-time-history`; no direct `main` development.

## M2 Dev-Loop Artifacts

- Progress: `PROGRESS.md`
- Requirements: `REQUIREMENTS-M2-TIME-HISTORY.md`
- Design: `DESIGN-SPEC-M2-TIME-HISTORY.md`
- Unit tests: `UNIT-TEST-SPEC-M2-TIME-HISTORY.md`
- Integration tests: `INTEGRATION-TEST-SPEC-M2-TIME-HISTORY.md`
- User interaction tests: `USER-INTERACTION-TEST-SPEC-M2-TIME-HISTORY.md`
- Dev checklist: `DEV-CHECKLIST-M2-TIME-HISTORY.md`

## Next Action

Claude Code implements from the M2 handoff. Balerion then verifies the result using V0015:
- branch/commit/version truth
- diff review
- API tests
- Browser-E2E user flows with raw logs/screenshots
- M1 regression smoke
- no M3 leakage

## SSOT Rule

- Operative project SSOT: `~/Dropbox/Dino-Balerion-Claude-Code/Projekte/0004_swimming-app/`
- Code SSOT: this `code/` directory.
- Status SSOT: `code/version/CURRENT_STATE.md`.
- Messages/evidence: `messages/`.
- Do not treat `~/wwsc-demo`, `projects/0004_swimming-app/`, daily notes, or chat memory as a second project truth.

