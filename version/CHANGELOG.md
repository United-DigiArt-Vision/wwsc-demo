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

## 2026-04-12 — fix: calculate heat builder target as total plus start delay
- **Timestamp:** 2026-04-12 17:58:56
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** e2f0f5c
- **Editor:** Balerion
- **Changes:** Corrected Heat Builder target calculation so `Target = Total + Start Delay` instead of incorrectly reusing the Total value.

## 2026-04-12 — fix: align heat builder total/target naming with results
- **Timestamp:** 2026-04-12 17:52:08
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** cd0e195
- **Editor:** Balerion
- **Changes:** Updated Heat Builder naming and calculations so `Total` = PB sum, `Start Delay` stays separate, and `Target` = Total + Start Delay, matching the Results page.
