# CHANGELOG (Codebasis)

## Entry Template
- **Date:** YYYY-MM-DD
- **App Version (from package.json):** X.Y.Z
- **Branch:** branch-name
- **Commit:** abc1234
- **Editor:** Name
- **Changes:** Kurzbeschreibung der Änderung

---

## 2026-04-12 — docs: align versioning SSOT with V0014
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** 6d51c60
- **Editor:** Balerion
- **Changes:** Aligned project versioning with V0014. Clarified SSOT split (`package.json` = semantic version, `version/CURRENT_STATE.md` = code-state, `version/CHANGELOG.md` = history). Strengthened `CLAUDE.md` rules for branch-start version bump, cache-busting sync, and release-anchor checks.

## 2026-04-12 — chore: setup centralized version tracking and CLAUDE.md rules
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** d24b793
- **Editor:** Balerion
- **Changes:** Introduced centralized project-local version tracking with `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, and enforced Claude Code rules in `CLAUDE.md`.

## 2026-04-12 — fix: Pogo individual variance display in results table
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** 3d3e3d1
- **Editor:** Balerion
- **Changes:** Fixed Pogo individual variance display in `src/public/js/screens/results.js`. Replaced repeated team variance with calculated swimmer-specific variance.
