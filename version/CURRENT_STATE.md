# CURRENT_STATE

**Version (from `package.json`):** 2.8.6
**BaseBranch:** dev/v2.8.5-bryan-rework-user-tested
**BaseCommit:** bc0e92a
**TargetBranch:** dev/v2.8.6-dino-final-ux-fixes
**HEAD:** b82202d
**RecordedCommit:** fe60a7c
**LastEditor:** Claude Code
**Date:** 2026-04-17
**Timestamp:** 2026-04-17 18:15:00
**WorkingTreeStatus:** clean
**ModifiedFiles:** —
**Version SSOT:** `package.json`
**Release Anchors:** `STABLE.md`, Git Tag, `/api/version`, `src/public/index.html?v=2.8.6`

## Definition used across all v2.8.6 artifacts
- **RecordedCommit** = the substantive delivery commit that introduced the v2.8.6 feature work.
- **HEAD** = the current branch tip, which may be a later SSOT / docs / housekeeping commit on top of RecordedCommit.
- For v2.8.6: RecordedCommit = `fe60a7c` (feat: Dino final UX fixes — Brace/Medley/Pogo ranking transparency). HEAD = `6961b30` (docs: finalize SSOT cleanup). Commits in between: `7491f71` (chore: lockfile sync), `eb307c4` (docs: first SSOT finalization).

## Rules
- `package.json` is the only SSOT for semantic version numbers.
- `CURRENT_STATE.md` records the delivery anchor (`RecordedCommit`) plus the current `HEAD` and working tree state.
- `version/CHANGELOG.md` must reflect the same RecordedCommit / Branch / Version for the corresponding delivery.
- If version changes, `package.json`, cache-busting in `src/public/index.html`, `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, and release anchors must stay in sync.
