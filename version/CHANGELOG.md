# CHANGELOG (Codebasis)

## Entry Template
- **Date:** YYYY-MM-DD
- **Timestamp:** YYYY-MM-DD HH:MM:SS
- **App Version (from package.json):** X.Y.Z
- **Branch:** branch-name
- **Commit:** abc1234
- **Editor:** Name
- **Changes:** Kurzbeschreibung der Änderung

---

## 2026-04-12 — fix: Pogo Results table layout + numpad guard + auto-recalc
- **Timestamp:** 2026-04-12 13:20:00
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** d57e781
- **Editor:** Claude Code
- **Changes:**
  - results.js: Pogo table uses table-layout:fixed with colgroup + overflow-x:auto so all 10 columns (Swimmer|PB|Start|Exp.F|Total|Tgt|T1|T2|Result|Var.) fit without horizontal scroll
  - numpad.js: Re-entry guard — if numpad is already open when showNumpad is called, existing instance is closed first to prevent stacked handlers
  - server.js: New function recalcPogoTeamIfNeeded() called from split + split2 endpoints — auto-calculates team total_time (sum of member averages), variance, and live place for Pogo teams
  - Browser-verified: T1/T2 independent, Result correct, Variance correct, re-edit works, 0 console errors

## 2026-04-12 — docs: finalize version ssot state
- **Timestamp:** 2026-04-12 12:27:33
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** 1d8f120
- **Editor:** Balerion
- **Changes:** Final SSOT completion commit after the numpad-fix so CURRENT_STATE and CHANGELOG point to the absolute HEAD.

## 2026-04-12 — fix: reset stale numpad handlers before reopening
- **Timestamp:** 2026-04-12 12:27:00
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** 60e502b
- **Editor:** Balerion
- **Changes:** Fixed stale numpad state by closing any previous numpad instance before opening a new one, so existing T1/T2 values can be edited again.

## 2026-04-12 — docs: finalize version ssot state
- **Timestamp:** 2026-04-12 11:39:30
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** 4828c54
- **Editor:** Balerion
- **Changes:** Final SSOT completion commit after enforcing the mandatory post-commit version workflow and synchronizing CURRENT_STATE / CHANGELOG to the absolute HEAD.

## 2026-04-12 — docs: enforce mandatory post-commit version workflow
- **Timestamp:** 2026-04-12 11:39:30
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** 8109830
- **Editor:** Balerion
- **Changes:** Hardened the rules so no one may report work as done before `version/CHANGELOG.md`, `version/CURRENT_STATE.md`, and the final SSOT completion commit are completed.

## 2026-04-12 — feat: add expected finish column to pogo results
- **Timestamp:** 2026-04-12 11:39:30
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** 734eaf1
- **Editor:** Balerion
- **Changes:** Added `Exp. Finish` column to Pogo results table so users can see expected target time (`PB + Start`) next to Result and Variance.

## 2026-04-12 — docs: finalize version ssot state
- **Timestamp:** 2026-04-12 11:39:30
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** f755d7b
- **Editor:** Balerion
- **Changes:** Final SSOT completion commit according to SR-VERSION-003. Current state and changelog aligned to the absolute HEAD without requiring another sync commit.

## 2026-04-12 — docs: sync version changelog with HEAD history
- **Timestamp:** 2026-04-12 11:39:30
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** 30d3c19
- **Editor:** Balerion
- **Changes:** Synced `version/CHANGELOG.md` with the recent HEAD history of versioning-related commits.

## 2026-04-12 — docs: sync current state with latest versioning commit
- **Timestamp:** 2026-04-12 11:39:30
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** 71511ad
- **Editor:** Balerion
- **Changes:** Synced `version/CURRENT_STATE.md` to the absolute HEAD commit after versioning-documentation updates.

## 2026-04-12 — docs: enforce consistent version changelog schema
- **Timestamp:** 2026-04-12 11:39:30
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** 96c1e94
- **Editor:** Balerion
- **Changes:** Standardized `version/CHANGELOG.md` schema with mandatory fields and strengthened `CLAUDE.md` consistency rules for CURRENT_STATE vs CHANGELOG.

## 2026-04-12 — docs: align versioning SSOT with V0014
- **Timestamp:** 2026-04-12 11:39:30
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** 6d51c60
- **Editor:** Balerion
- **Changes:** Aligned project versioning with V0014. Clarified SSOT split (`package.json` = semantic version, `version/CURRENT_STATE.md` = code-state, `version/CHANGELOG.md` = history). Strengthened `CLAUDE.md` rules for branch-start version bump, cache-busting sync, and release-anchor checks.

## 2026-04-12 — chore: setup centralized version tracking and CLAUDE.md rules
- **Timestamp:** 2026-04-12 11:39:30
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** d24b793
- **Editor:** Balerion
- **Changes:** Introduced centralized project-local version tracking with `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, and enforced Claude Code rules in `CLAUDE.md`.

## 2026-04-12 — fix: Pogo individual variance display in results table
- **Timestamp:** 2026-04-12 11:39:30
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **Commit:** 3d3e3d1
- **Editor:** Balerion
- **Changes:** Fixed Pogo individual variance display in `src/public/js/screens/results.js`. Replaced repeated team variance with calculated swimmer-specific variance.
