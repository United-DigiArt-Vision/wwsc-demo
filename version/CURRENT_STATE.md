# CURRENT_STATE

**Version (from `package.json`):** 2.8.12
**BaseBranch:** main / origin/main
**BaseCommit:** 2b60cad (`docs: record v2.8.11 Bryan message sent`) plus local Bryan classification b417c0a
**TargetBranch:** main / origin/main
**Branch:** main
**Current main tip:** dynamic — run `git rev-parse --short HEAD` on `main` / `origin/main`
**Tag:** v2.8.12
**Version bump commit:** 79eb9cc (`release: bump to v2.8.12 for Bryan final polish`)
**Test spec commit:** 5562ec4 (`test: define v2.8.12 Bryan user test spec`)
**Implementation commit:** 2321284 (`fix: v2.8.12 Bryan relay reporting and persistence`)
**Evidence commit:** f39be1b (`docs: add v2.8.12 Bryan evidence package`)
**Merge commit:** 596458f (`merge: v2.8.12 Bryan final polish and persistence`)
**LastEditor:** Balerion
**Date:** 2026-05-06
**Timestamp:** 2026-05-06 14:12 Europe/Berlin
**WorkingTreeStatus:** release docs being finalized for push/deploy; local Browser-E2E and persistence restart proof PASS.
**Live deploy on Render:** pending push/deploy verification
**Live `/api/version`:** pending; expected `2.8.12` after Render deploy
**Version SSOT:** `package.json`
**Release Anchors:** `STABLE.md`, Git tag `v2.8.12`, `/api/version`, `src/public/index.html?v=2.8.12`, evidence docs.

## Scope of v2.8.12

Narrow Bryan 2026-05-06 final M1 polish + persistence hardening pass. This does not start Pointscore/M3.

### Changes released

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

## Verification before deploy

- Syntax checks PASS: `src/db.js`, `src/server.js`, `src/public/js/screens/results.js`, `src/public/js/screens/calendar.js`, `scripts/e2e-v2812-bryan.cjs`.
- Browser-E2E/API: `scripts/e2e-v2812-bryan.cjs` — 31 PASS / 0 FAIL.
- Evidence summary: `docs/evidence/WWSC-v2.8.12-bryan-browser-e2e-evidence.md`.
- Raw log: `docs/evidence/WWSC-v2.8.12-browser-e2e-raw.log`.
- Screenshots/text/html: `docs/screenshots/v2.8.12-bryan/`.
- Persistence restart proof: `docs/evidence/WWSC-v2.8.12-persistence-restart-proof.md` — restarted local server with same `WWSC_DB_PATH`; 2 finalized active events survived.

## Current delivery status

- v2.8.12 is merged locally to `main` and ready for push/deploy.
- After push, verify live `/api/version=2.8.12`, sidebar version, and persistence/disk behavior.

## Scope boundaries

- Pointscore/M3 was not implemented.
- No new phases started.
- Live Render persistent disk behavior must be verified after deployment.
