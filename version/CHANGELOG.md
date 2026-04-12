# CHANGELOG (Codebasis)

## Entry Template
- **Date:** YYYY-MM-DD
- **Timestamp:** YYYY-MM-DD HH:MM:SS
- **App Version (from package.json):** X.Y.Z
- **Branch:** branch-name
- **RecordedCommit:** abc1234
- **Editor:** Name
- **Changes:** Kurzbeschreibung der Änderung

---

## 2026-04-12 — fix: restore exceeding report on results page
- **Timestamp:** 2026-04-12 18:09:56
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** 697bf93
- **Editor:** Balerion
- **Changes:** Restored the exceeding report (>2 seconds over PB) on the Results page for relevant races, using the same async load path again instead of suppressing it.

## 2026-04-12 — fix: calculate heat builder target as total plus start delay
- **Timestamp:** 2026-04-12 17:58:56
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** e2f0f5c
- **Editor:** Balerion
- **Changes:** Corrected Heat Builder target calculation so `Target = Total + Start Delay` instead of incorrectly reusing the Total value.
