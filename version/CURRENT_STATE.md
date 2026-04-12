# CURRENT_STATE

**Version (from `package.json`):** 2.8.0
**Base Branch:** main
**Base Commit:** 15275df
**Target Branch:** dev/v2.8.0-bryan-feedback
**Last Commit:** 8109830
**Last Editor:** Balerion
**Date:** 2026-04-12
**Version SSOT:** `package.json`
**Release Anchors:** `STABLE.md`, Git Tag, `/api/version`, `src/public/index.html?v=2.8.0`

## Rules
- `package.json` is the only SSOT for semantic version numbers.
- `CURRENT_STATE.md` is the SSOT for current branch / commit / codebase context.
- Before marking work as done, `git rev-parse HEAD` MUST match `Last Commit` above.
- If version changes, `package.json`, cache-busting in `src/public/index.html`, `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, and release anchors MUST stay in sync.
- SR-VERSION-002: `CURRENT_STATE.md` must show the absolute HEAD.
- SR-VERSION-003: The final SSOT completion commit is the terminating end-state; no further sync commit is required after it.
