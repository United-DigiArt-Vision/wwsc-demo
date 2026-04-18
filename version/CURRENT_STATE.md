# CURRENT_STATE

**Version (from `package.json`):** 2.8.8
**BaseBranch:** main
**BaseCommit:** 642e52d
**TargetBranch:** dev/v2.8.8-header-completeness-audit
**Branch:** main
**Current branch tip:** dynamic — run `git rev-parse --short HEAD` on branch `main`
**RecordedCommit:** 497f78d
**LastEditor:** Balerion
**Date:** 2026-04-18
**Timestamp:** 2026-04-18 18:45:48
**WorkingTreeStatus:** clean (at the v2.8.8 live-release sync commit)
**ModifiedFiles:** —
**Version SSOT:** `package.json`
**Release Anchors:** `STABLE.md`, Git Tag, `/api/version`, `src/public/index.html?v=2.8.8`

## Definition used across all v2.8.8 artifacts
- **RecordedCommit** = the substantive delivery commit for v2.8.8 after all Dino re-test rounds. For v2.8.8: `497f78d` (feat: v2.8.8 iteration 7 — Pogo Heat Builder mirrors Pogo Results columns minus result fields). Prior iterations: `3de4265` (rowspan — empty cells moved into row 2); `d103c44` (Team group header — group row read as explanatory text); `474d063` (flat single-row but Tap/Variance/Place titles rendered white-on-pale-yellow and were effectively invisible); `bea39db` (flat + uniform contrast — header completeness correct); `ddabb81` ((Y) marker fix — reflects current attendance, not stale auto flag); `0368840` (Brace Results — add Target column per Dino ask; R7-consistent).
- **Live release transfer** = fast-forward from `main@642e52d` to the delivered v2.8.8 branch tip, then push `main` to GitHub for Render auto-deploy.
- **Current branch tip (HEAD)** is intentionally NOT stored as a static value in versioned artifacts, because any commit that writes a HEAD value changes HEAD. Resolve it dynamically with `git rev-parse --short HEAD` on the branch `main`.

## Rules
- `package.json` is the only SSOT for semantic version numbers.
- `CURRENT_STATE.md` records the delivery anchor (`RecordedCommit`) plus working-tree state. It does not freeze a static HEAD hash.
- `version/CHANGELOG.md` must reflect the same RecordedCommit / Branch / Version for the corresponding delivery.
- If version changes, `package.json`, cache-busting in `src/public/index.html`, `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, and release anchors must stay in sync.
