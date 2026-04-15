# CURRENT_STATE

**Version (from `package.json`):** 2.8.3
**BaseBranch:** main
**BaseCommit:** e1e99a1
**TargetBranch:** dev/v2.8.3-medley-leftover-swim-twice
**RecordedCommit:** 8192cd9
**LastEditor:** Claude Code
**Date:** 2026-04-15
**Timestamp:** 2026-04-15 08:00:00
**WorkingTreeStatus:** modified
**ModifiedFiles:** version/CURRENT_STATE.md, version/CHANGELOG.md
**Version SSOT:** `package.json`
**Release Anchors:** `STABLE.md`, Git Tag, `/api/version`, `src/public/index.html?v=2.8.3`

## Rules
- `package.json` is the only SSOT for semantic version numbers.
- `CURRENT_STATE.md` records the last documented commit anchor plus working tree state.
- `version/CHANGELOG.md` must reflect the same RecordedCommit / Branch / Version.
- If version changes, `package.json`, cache-busting in `src/public/index.html`, `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, and release anchors must stay in sync.
