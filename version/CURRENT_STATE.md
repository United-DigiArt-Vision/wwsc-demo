# CURRENT_STATE

**Version (from `package.json`):** 2.8.8
**BaseBranch:** dev/v2.8.7-manual-team-management
**BaseCommit:** b065b19
**TargetBranch:** dev/v2.8.8-header-completeness-audit
**Branch:** dev/v2.8.8-header-completeness-audit
**Current branch tip:** dynamic — run `git rev-parse --short HEAD` on branch `dev/v2.8.8-header-completeness-audit`
**RecordedCommit:** 474d063
**LastEditor:** Claude Code
**Date:** 2026-04-18
**Timestamp:** 2026-04-18 11:00:00
**WorkingTreeStatus:** clean (at the closing SSOT commit)
**ModifiedFiles:** —
**Version SSOT:** `package.json`
**Release Anchors:** `STABLE.md`, Git Tag, `/api/version`, `src/public/index.html?v=2.8.8`

## Definition used across all v2.8.8 artifacts
- **RecordedCommit** = the substantive delivery commit for v2.8.8 after the Dino re-test rounds. For v2.8.8: `474d063` (fix: v2.8.8 R28 iteration 3 — flat single-row header). Superseded iterations: `3de4265` (rowspan — empty cells moved into row 2) and `d103c44` (Team group header — group row was read as explanatory text, not as discrete column titles).
- **Current branch tip (HEAD)** is intentionally NOT stored as a static value in versioned artifacts, because any commit that writes a HEAD value changes HEAD. Resolve it dynamically with `git rev-parse --short HEAD` on the branch `dev/v2.8.8-header-completeness-audit`.

## Rules
- `package.json` is the only SSOT for semantic version numbers.
- `CURRENT_STATE.md` records the delivery anchor (`RecordedCommit`) plus working-tree state. It does not freeze a static HEAD hash.
- `version/CHANGELOG.md` must reflect the same RecordedCommit / Branch / Version for the corresponding delivery.
- If version changes, `package.json`, cache-busting in `src/public/index.html`, `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, and release anchors must stay in sync.
