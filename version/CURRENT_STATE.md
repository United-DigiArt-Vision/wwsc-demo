# CURRENT_STATE

**Version (from `package.json`):** 2.8.6
**BaseBranch:** dev/v2.8.5-bryan-rework-user-tested
**BaseCommit:** bc0e92a
**TargetBranch:** dev/v2.8.6-dino-final-ux-fixes
**Branch:** dev/v2.8.6-dino-final-ux-fixes
**Current branch tip:** dynamic — run `git rev-parse --short HEAD` on branch `dev/v2.8.6-dino-final-ux-fixes`
**RecordedCommit:** fe60a7c
**LastEditor:** Claude Code
**Date:** 2026-04-17
**Timestamp:** 2026-04-17 21:30:00
**WorkingTreeStatus:** clean
**ModifiedFiles:** —
**Version SSOT:** `package.json`
**Release Anchors:** `STABLE.md`, Git Tag, `/api/version`, `src/public/index.html?v=2.8.6`

## Definition used across all v2.8.6 artifacts
- **RecordedCommit** = the substantive delivery commit that introduced the v2.8.6 feature work. For v2.8.6: `fe60a7c` (feat: Dino final UX fixes — Brace/Medley/Pogo ranking transparency).
- **Current branch tip (HEAD)** is intentionally NOT stored as a static value in versioned artifacts, because any commit that writes a HEAD value changes HEAD. Resolve it dynamically with `git rev-parse --short HEAD` on the branch `dev/v2.8.6-dino-final-ux-fixes`.

## Rules
- `package.json` is the only SSOT for semantic version numbers.
- `CURRENT_STATE.md` records the delivery anchor (`RecordedCommit`) plus working-tree state. It does not freeze a static HEAD hash.
- `version/CHANGELOG.md` must reflect the same RecordedCommit / Branch / Version for the corresponding delivery.
- If version changes, `package.json`, cache-busting in `src/public/index.html`, `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, and release anchors must stay in sync.
