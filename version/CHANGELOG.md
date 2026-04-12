# CHANGELOG (Codebasis)

## Entry Template
- **Date:** YYYY-MM-DD
- **App Version (from package.json):** X.Y.Z
- **Branch:** branch-name
- **Commit:** abc1234
- **Editor:** Name
- **Changes:** Kurzbeschreibung der Änderung

---

## 2026-04-12 — docs: finalize version ssot state
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** TO_BE_FINALIZED
- **Editor:** Balerion
- **Changes:** Final SSOT completion commit according to SR-VERSION-003. Current state and changelog aligned to the absolute HEAD without requiring another sync commit.

## 2026-04-12 — docs: sync version changelog with HEAD history
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** 30d3c19
- **Editor:** Balerion
- **Changes:** Synced `version/CHANGELOG.md` with the recent HEAD history of versioning-related commits.

## 2026-04-12 — docs: sync current state with latest versioning commit
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** 71511ad
- **Editor:** Balerion
- **Changes:** Synced `version/CURRENT_STATE.md` to the absolute HEAD commit after versioning-documentation updates.

## 2026-04-12 — docs: enforce consistent version changelog schema
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** 96c1e94
- **Editor:** Balerion
- **Changes:** Standardized `version/CHANGELOG.md` schema with mandatory fields and strengthened `CLAUDE.md` consistency rules for CURRENT_STATE vs CHANGELOG.

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
