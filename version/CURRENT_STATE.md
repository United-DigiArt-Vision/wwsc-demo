# CURRENT_STATE

**Version (from `package.json`):** 2.8.11
**BaseBranch:** main / origin/main
**BaseCommit:** 99d4903 (`merge: v2.8.10 bryan retest follow-up`)
**TargetBranch:** main / origin/main
**Branch:** main
**Current main tip:** dynamic — run `git rev-parse --short HEAD` on `main` / `origin/main`
**Tag:** v2.8.11
**Version bump commit:** 4001276 (`release: bump to v2.8.11 for Bryan polish pass`)
**Implementation commit:** 272bd45 (`fix: v2.8.11 Bryan polish feedback`)
**Verification screenshots commit:** 7c643d2 (`docs: refresh v2.8.11 verification screenshots`)
**Merge commit:** 0dcad22 (`merge: v2.8.11 Bryan polish pass`)
**LastEditor:** Balerion
**Date:** 2026-05-01
**Timestamp:** 2026-05-01 04:34:00
**WorkingTreeStatus:** released on `main`, pushed to GitHub, deployed live on Render; post-release docs commit pushed after merge
**Live deploy on Render:** ✅ live verified
**Live `/api/version`:** `{"version":"2.8.11","build":"2026-05-01T02:30:30.787Z"}`
**Version SSOT:** `package.json`
**Release Anchors:** `STABLE.md`, Git tag `v2.8.11`, `/api/version`, `src/public/index.html?v=2.8.11`

## Scope of v2.8.11

Focused Bryan 2026-05-01 v2.8.10 retest polish pass. This is not Pointscore/M3 and does not expand scope beyond the five feedback items.

### Changes released

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
  - Local app started on `http://127.0.0.1:3000`.
  - `node scripts/verify-v2811-ux.mjs`
  - Result: 56 PASS / 0 FAIL.
- Live verification:
  - GitHub push: `main 99d4903..0dcad22`, tag `v2.8.11`.
  - Render `/api/version` changed from `2.8.10` to `2.8.11` at build `2026-05-01T02:30:30.787Z`.
  - Browser snapshot confirmed live UI sidebar shows `v2.8.11` and `Build: 2026-05-01T02:30:30.787Z`.

## Current delivery status

- v2.8.11 is live on Render.
- Bryan reply draft prepared in `../messages/2026-05-01-outgoing-to-bryan-v2811-live.md`.

## Rules

- `package.json` is the only SSOT for semantic version numbers.
- `CURRENT_STATE.md` records the delivery anchor plus working-tree state.
- `version/CHANGELOG.md` must reflect the same release / branch / version for the corresponding delivery.
- If version changes, `package.json`, cache-busting in `src/public/index.html`, `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, and release anchors must stay in sync.
