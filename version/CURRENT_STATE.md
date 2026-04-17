# CURRENT_STATE

**Version (from `package.json`):** 2.8.7
**BaseBranch:** dev/v2.8.6-dino-final-ux-fixes
**BaseCommit:** 8e05014
**TargetBranch:** dev/v2.8.7-manual-team-management
**Branch:** dev/v2.8.7-manual-team-management
**Current branch tip:** dynamic — run `git rev-parse --short HEAD` on branch `dev/v2.8.7-manual-team-management`
**RecordedCommit:** e2fd553
**LastEditor:** Claude Code
**Date:** 2026-04-17
**Timestamp:** 2026-04-17 22:15:00
**WorkingTreeStatus:** clean (at the closing SSOT commit)
**ModifiedFiles:** —
**Version SSOT:** `package.json`
**Release Anchors:** `STABLE.md`, Git Tag, `/api/version`, `src/public/index.html?v=2.8.7`

## Definition used across all v2.8.7 artifacts
- **RecordedCommit** = the substantive delivery commit that introduced the v2.8.7 feature work. For v2.8.7: `e2fd553` (feat: v2.8.7 R27 manual team management for eligible relay races).
- **Current branch tip (HEAD)** is intentionally NOT stored as a static value in versioned artifacts, because any commit that writes a HEAD value changes HEAD. Resolve it dynamically with `git rev-parse --short HEAD` on the branch `dev/v2.8.7-manual-team-management`.

## Rules
- `package.json` is the only SSOT for semantic version numbers.
- `CURRENT_STATE.md` records the delivery anchor (`RecordedCommit`) plus working-tree state. It does not freeze a static HEAD hash.
- `version/CHANGELOG.md` must reflect the same RecordedCommit / Branch / Version for the corresponding delivery.
- If version changes, `package.json`, cache-busting in `src/public/index.html`, `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, and release anchors must stay in sync.
