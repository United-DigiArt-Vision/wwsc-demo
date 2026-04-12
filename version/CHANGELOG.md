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

## 2026-04-12 — fix: sort breaker report by variance descending
- **Timestamp:** 2026-04-12 18:39:06
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** 2fe7250
- **Editor:** Balerion
- **Changes:** Changed Breaker Report sorting to use `variance` descending exactly as requested, instead of sorting by improvement.

## 2026-04-12 — fix: sort consolidated breakers by improvement descending
- **Timestamp:** 2026-04-12 18:35:14
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** 795ca96
- **Editor:** Balerion
- **Changes:** Sorted the Breaker Report page within each group by highest improvement first, so the swimmer with the strongest variance/improvement appears at the top.
