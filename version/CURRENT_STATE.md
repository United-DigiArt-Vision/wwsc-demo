# CURRENT_STATE

**Version (from `package.json`):** 2.8.6
**BaseBranch:** dev/v2.8.5-bryan-rework-user-tested
**BaseCommit:** bc0e92a
**TargetBranch:** dev/v2.8.6-dino-final-ux-fixes
**RecordedCommit:** fe60a7c
**LastEditor:** Claude Code
**Date:** 2026-04-17
**Timestamp:** 2026-04-17 16:45:00
**WorkingTreeStatus:** modified
**ModifiedFiles:** version/CURRENT_STATE.md, version/CHANGELOG.md
**Version SSOT:** `package.json`
**Release Anchors:** `STABLE.md`, Git Tag, `/api/version`, `src/public/index.html?v=2.8.6`

## Rules
- `package.json` is the only SSOT for semantic version numbers.
- `CURRENT_STATE.md` records the last documented commit anchor plus working tree state.
- `version/CHANGELOG.md` must reflect the same RecordedCommit / Branch / Version.
- If version changes, `package.json`, cache-busting in `src/public/index.html`, `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, and release anchors must stay in sync.
