# CURRENT_STATE

**Version (from `package.json`):** 2.8.9
**BaseBranch:** main
**BaseCommit:** 70fed2e
**TargetBranch:** dev/v2.8.9-bryan-relay-randomness
**Branch:** dev/v2.8.9-bryan-relay-randomness
**Current branch tip:** dynamic — run `git rev-parse --short HEAD` on branch `dev/v2.8.9-bryan-relay-randomness`
**RecordedCommit:** fc8d1a1
**LastEditor:** Balerion
**Date:** 2026-04-21
**Timestamp:** 2026-04-21 20:58:00
**WorkingTreeStatus:** modified (Bryan 2026-04-21 relay corrections in progress)
**ModifiedFiles:** `src/public/js/api.js`, `src/public/js/screens/event-setup.js`, `src/public/js/screens/heat-builder.js`, `src/server.js`, `PROGRESS.md`
**Version SSOT:** `package.json`
**Release Anchors:** `STABLE.md`, Git Tag, `/api/version`, `src/public/index.html?v=2.8.9`

## Definition used across current v2.8.9 working artifacts
- **RecordedCommit** = the last fully documented anchor before the in-progress Bryan 2026-04-21 relay corrections. For this branch that anchor is the mandatory first commit `fc8d1a1` (`chore: version bump to v2.8.9`).
- **Scope of current working tree** = implement Bryan's newly reported relay corrections on top of `origin/main@70fed2e`: (1) Brace weeks still include the standard relay, (2) Shuffle in Brace/Relay must produce a visibly fresh assignment.
- **Current branch tip (HEAD)** is intentionally NOT stored as a static value in versioned artifacts, because any commit that writes a HEAD value changes HEAD. Resolve it dynamically with `git rev-parse --short HEAD` on the branch `dev/v2.8.9-bryan-relay-randomness`.

## Rules
- `package.json` is the only SSOT for semantic version numbers.
- `CURRENT_STATE.md` records the delivery anchor (`RecordedCommit`) plus working-tree state. It does not freeze a static HEAD hash.
- `version/CHANGELOG.md` must reflect the same RecordedCommit / Branch / Version for the corresponding delivery.
- If version changes, `package.json`, cache-busting in `src/public/index.html`, `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, and release anchors must stay in sync.
