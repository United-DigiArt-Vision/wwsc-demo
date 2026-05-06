# CURRENT_STATE

**Version (from `package.json`):** 2.8.12
**BaseBranch:** main / origin/main
**BaseCommit:** v2.8.11 line (`0dcad22` release lineage plus local evidence commits)
**TargetBranch:** main / origin/main after Dino review
**Branch:** dev/v2.8.12-bryan-final-polish-persistence
**Current branch tip:** dynamic — run `git rev-parse --short HEAD`
**Tag:** not created yet for v2.8.12
**Version bump commit:** 79eb9cc (`release: bump to v2.8.12 for Bryan final polish`)
**Test spec commit:** 5562ec4 (`test: define v2.8.12 Bryan user test spec`)
**Implementation commit:** 2321284 (`fix: v2.8.12 Bryan relay reporting and persistence`)
**Evidence commit:** pending at time of this file update
**LastEditor:** Balerion
**Date:** 2026-05-06
**Timestamp:** 2026-05-06 11:57 Europe/Berlin
**WorkingTreeStatus:** v2.8.12 implemented and locally verified on branch; not merged, not pushed, not deployed live yet.
**Live deploy on Render:** not yet
**Live `/api/version`:** still expected v2.8.11 until merge/push/deploy
**Version SSOT:** `package.json`
**Release Anchors:** `package.json`, `src/public/index.html?v=2.8.12`, `USER-INTERACTION-TEST-SPEC-v2.8.12.md`, `docs/evidence/WWSC-v2.8.12-bryan-browser-e2e-evidence.md`, `docs/evidence/WWSC-v2.8.12-persistence-restart-proof.md`

## Scope of v2.8.12

Narrow Bryan 2026-05-06 final M1 polish + persistence hardening pass. This does not start Pointscore/M3.

### Changes implemented

- `src/public/js/screens/results.js`
  - Relay readout now includes signed variance for relay teams.
  - Relay readout now includes team participant/member names; Medley includes stroke labels where available.
  - Event Report relay sections now show team total and signed variance directly in the team heading.
  - 25m breaker UI logic uses the new 0.50s threshold while non-25m races keep the prior 1.00s threshold.
- `src/public/js/screens/calendar.js`
  - Season Calendar event details now show relay team members for completed 25m Team Relay and Medley Relay results.
  - Calendar event details also include signed variance for relay teams.
- `src/server.js`
  - Time entry breaker calculation now joins the race type and applies race-specific thresholds.
  - 25m break threshold: improvement >= 0.50s (`variance <= -50`).
  - Other standard races keep existing >= 1.00s threshold (`variance <= -100`).
- `src/db.js`
  - Database path is configurable via `WWSC_DB_PATH`.
  - `WWSC_DATA_DIR` and `WWSC_BACKUP_DIR` are also supported for hosted/persistent deployments.
  - Default local behavior remains `src/data/wwsc.db`.
- `render.yaml`
  - Adds Render persistent disk config at `/var/data` and sets `WWSC_DB_PATH=/var/data/wwsc.db`.

## Verification

- Syntax checks:
  - `node --check src/db.js` — PASS
  - `node --check src/server.js` — PASS
  - `node --check src/public/js/screens/results.js` — PASS
  - `node --check src/public/js/screens/calendar.js` — PASS
  - `node --check scripts/e2e-v2812-bryan.cjs` — PASS
- Browser-E2E / API evidence:
  - Script: `scripts/e2e-v2812-bryan.cjs`
  - Raw log: `docs/evidence/WWSC-v2.8.12-browser-e2e-raw.log`
  - Evidence summary: `docs/evidence/WWSC-v2.8.12-bryan-browser-e2e-evidence.md`
  - Result: 31 PASS / 0 FAIL
  - Screenshots/text/html: `docs/screenshots/v2.8.12-bryan/`
- Persistence restart proof:
  - DB path: `/tmp/wwsc-v2812-data/wwsc.db`
  - Restarted server with same `WWSC_DB_PATH`.
  - `/api/events?archived=1` still returned 2 finalized active events after restart.
  - Evidence: `docs/evidence/WWSC-v2.8.12-persistence-restart-proof.md`
  - Raw log: `docs/evidence/WWSC-v2.8.12-persistence-restart-raw.log`

## Current delivery status

- v2.8.12 is implemented and locally proven.
- Branch is ready for final documentation commit, then Dino review.
- Not yet deployed live.
- Render persistent disk support is in config, but live Render dashboard/deploy must still be verified after push/deploy.

## Scope boundaries

- Pointscore/M3 was not implemented.
- No new milestone scope beyond Bryan's explicit v2.8.11 notes.
- Persistence hardening addresses the likely root cause of disappearing hosted events: SQLite must live on persistent storage, not ephemeral app filesystem.
