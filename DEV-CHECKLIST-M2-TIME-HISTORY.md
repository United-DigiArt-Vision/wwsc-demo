# DEV CHECKLIST — M2 Time History

Version: v2.9.0
Branch: `dev/v2.9.0-m2-time-history`
Date: 2026-05-18

## Phase 0 — Already Done by Balerion

- [x] Remote truth fetched.
- [x] Stable M1/v2.8.12 backup branch created: `backup/v2.8.12-m1-stable-20260518`.
- [x] Stable M1/v2.8.12 file backup created: `../backups/2026-05-18-0615-v2.8.12-m1-stable-origin-main/`.
- [x] Feature branch created: `dev/v2.9.0-m2-time-history`.
- [x] First feature-branch commit is version bump to `2.9.0`: `aa004be`.

## Phase 1-3 — Specs

- [x] Requirements: `REQUIREMENTS-M2-TIME-HISTORY.md`.
- [x] Design: `DESIGN-SPEC-M2-TIME-HISTORY.md`.
- [x] Unit tests: `UNIT-TEST-SPEC-M2-TIME-HISTORY.md`.
- [x] Integration tests: `INTEGRATION-TEST-SPEC-M2-TIME-HISTORY.md`.
- [x] User interaction tests: `USER-INTERACTION-TEST-SPEC-M2-TIME-HISTORY.md`.

## Phase 4 — Implementation Tasks

- [ ] T1: Enrich `GET /api/events/:eventId/time-history` with `event_date`.
- [ ] T2: Add `GET /api/members/:memberId/time-history`.
- [ ] T3: Add frontend API wrapper `getMemberTimeHistory(memberId)`.
- [ ] T4: Add Members screen History action and modal/panel.
- [ ] T5: Add completed-event Time History access in Calendar/Event detail.
- [ ] T6: Add/adjust automated tests/scripts for M2 flows.
- [ ] T7: Run M1 regression smoke.
- [ ] T8: Update version/CHANGELOG.md and version/CURRENT_STATE.md.
- [ ] T9: Final SSOT completion commit.

## Hard Guards

- [ ] No Pointscore implementation.
- [ ] No reports/graphs/constitution scoring implementation.
- [ ] No development on `main`.
- [ ] No delivery without browser E2E evidence and raw logs.
- [ ] No "done" claim before V0014 SSOT files are updated.

