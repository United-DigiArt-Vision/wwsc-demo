# CURRENT_STATE

**Version (from `package.json`):** 2.8.11
**BaseBranch:** main / origin/main
**BaseCommit:** 99d4903 (`merge: v2.8.10 bryan retest follow-up`)
**TargetBranch:** dev/v2.8.11-bryan-polish
**Branch:** dev/v2.8.11-bryan-polish
**Current branch tip:** dynamic — run `git rev-parse --short HEAD` on branch `dev/v2.8.11-bryan-polish`
**Version bump commit:** 4001276 (`release: bump to v2.8.11 for Bryan polish pass`)
**RecordedCommit:** 272bd45 (`fix: v2.8.11 Bryan polish feedback`)
**LastEditor:** Balerion
**Date:** 2026-05-01
**Timestamp:** 2026-05-01 04:25:00
**WorkingTreeStatus:** implementation committed; SSOT docs update pending/finalizing
**Live deploy on Render:** not deployed; production still expected to be v2.8.10 until merge/push/deploy
**Version SSOT:** `package.json`
**Release Anchors:** `STABLE.md`, Git Tag when released, `/api/version`, `src/public/index.html?v=2.8.11`

## Scope of v2.8.11

Focused Bryan 2026-05-01 v2.8.10 retest polish pass. This is not Pointscore/M3 and does not expand scope beyond the five feedback items.

### Changes in commit `272bd45`

- `src/public/js/screens/heat-builder.js`
  - 25m Team Relay pre-generation state now stays clean: no `0/0 teams complete` banner, no unassigned swimmer pool, no Add Team button before any teams exist.
  - Relay team cards now have stable print classes (`relay-team-card`, `relay-team-header`, `relay-team-title`, `relay-team-meta`) for consistent print typography.
- `src/public/css/style.css`
  - Print headings are larger/bolder and consistently use Arial.
  - Relay team print headings are fixed at prominent 18px / 900 weight instead of collapsing into tiny print text.
- `src/public/js/screens/results.js`
  - Removed `(decides ranking)` wording from variance rows.
  - Event Report participants table now renders missing/null `special_event_entry` as user-facing `N` for present swimmers, so Andrew Barnes no longer appears as `—` when Times Sheet effectively shows `N`.
  - Relay/Pogo result cards use the same print heading classes for consistency.
- Test/spec artifacts:
  - `USER-INTERACTION-TEST-SPEC-v2.8.11.md` — 75 user-perspective test cases.
  - `USER-INTERACTION-TEST-PROTOCOL-v2.8.11.md` — 56 automated/browser-assisted checks, 56 PASS / 0 FAIL.
  - `docs/screenshots/v2.8.11-bryan/` — 5 screenshot evidence files.
  - `scripts/verify-v2811-ux.mjs` — repeatable CDP verification script.

## Verification

- Syntax checks:
  - `node --check src/server.js`
  - `node --check src/public/js/screens/heat-builder.js`
  - `node --check src/public/js/screens/results.js`
  - `node --check scripts/verify-v2811-ux.mjs`
- Runtime/browser-assisted verification:
  - Local app started on `http://127.0.0.1:3000` after `npm rebuild better-sqlite3` fixed local native-module architecture.
  - `node scripts/verify-v2811-ux.mjs`
  - Result: 56 PASS / 0 FAIL.
- Test DB mutation was restored from pre-test backup after verification.

## Current delivery status

- v2.8.11 is implemented and tested on branch `dev/v2.8.11-bryan-polish`.
- Not pushed/deployed by Balerion. Dino review/merge/deploy remains the release gate.

## Rules

- `package.json` is the only SSOT for semantic version numbers.
- `CURRENT_STATE.md` records the delivery anchor (`RecordedCommit`) plus working-tree state. It does not freeze a static HEAD hash.
- `version/CHANGELOG.md` must reflect the same RecordedCommit / Branch / Version for the corresponding delivery.
- If version changes, `package.json`, cache-busting in `src/public/index.html`, `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, and release anchors must stay in sync.
