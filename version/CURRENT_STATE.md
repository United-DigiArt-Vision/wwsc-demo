# CURRENT_STATE

**Version (from `package.json`):** 2.8.0
**Base Branch:** main
**Base Commit:** 15275df
**Target Branch:** dev/v2.8.0-bryan-feedback
**Last Commit:** 30d3c19
**Last Editor:** Balerion
**Date:** 2026-04-12
**Version SSOT:** `package.json`
**Release Anchors:** `STABLE.md`, Git Tag, `/api/version`, `src/public/index.html?v=2.8.0`

## Rules
- `package.json` is the only SSOT for semantic version numbers.
- `CURRENT_STATE.md` is the SSOT for current branch / commit / codebase context.
- Before marking work as done, `git rev-parse HEAD` MUST match `Last Commit` above.
- If version changes, `package.json`, cache-busting in `src/public/index.html`, `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, and release anchors MUST stay in sync.

