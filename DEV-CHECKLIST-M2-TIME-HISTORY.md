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

- [x] T1: Enrich `GET /api/events/:eventId/time-history` with `event_date`. (`src/server.js`)
- [x] T2: Add `GET /api/members/:memberId/time-history`. (`src/server.js`)
- [x] T3: Add frontend API wrapper `getMemberTimeHistory(memberId)`. (`src/public/js/api.js`)
- [x] T4: Add Members screen History action and modal/panel. (`src/public/js/screens/members.js`)
- [x] T5: Add completed-event Time History access in Calendar/Event detail. (`src/public/js/screens/calendar.js`)
- [x] T6: Add/adjust automated tests/scripts for M2 flows. (`scripts/e2e-m2-time-history.cjs`)
- [x] T7: Run M1 regression smoke. (UI-M2-F-dashboard, UI-M2-F01..F05, UI-M2-F07, UI-M2-F09 — all PASS in this run; UI-M2-F06/F08 deferred to V0015 manual)
- [x] T8: Update version/CHANGELOG.md and version/CURRENT_STATE.md. (entries dated 2026-05-18)
- [x] T9: Final SSOT completion commit. (created at delivery close)

## Hard Guards

- [x] No Pointscore implementation. (UI-M2-G01 scan returned clean across 7 screens)
- [x] No reports/graphs/constitution scoring implementation. (server route audit shows only `GET /api/members/:memberId/time-history` added)
- [x] No development on `main`. (Working branch is `dev/v2.9.0-m2-time-history`)
- [x] No delivery without browser E2E evidence and raw logs. (`docs/evidence/m2-time-history-run.log` + screenshots under `docs/screenshots/m2-time-history/`)
- [x] No "done" claim before V0014 SSOT files are updated. (CURRENT_STATE.md + CHANGELOG.md updated; final SSOT commit closes the cycle)

