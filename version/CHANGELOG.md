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

## 2026-04-12 — fix: make pogo result header visibly readable
- **Timestamp:** 2026-04-12 17:23:40
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** 330d022
- **Editor:** Balerion
- **Changes:** Made the Pogo `Result` table header visibly readable with strong contrast so the column name is clearly visible in the live UI.

## 2026-04-12 — fix: Pogo table headers — min-width + nowrap for all columns
- **Timestamp:** 2026-04-12 17:10:00
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** 837be2d
- **Editor:** Claude Code
- **Changes:** Adjusted Pogo table header styling with min-width + nowrap so all headers remain visible and aligned.

## 2026-04-12 — fix: Pogo crash investigation + defensive error handling
- **Timestamp:** 2026-04-12 16:50:00
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** 44aee23
- **Editor:** Claude Code
- **Changes:**
  - Executed exact 9-step repro sequence with real UI clicks — no crash, 0 console errors, 0 server errors
  - results.js: Added try/catch to enterPogoSplit1Inline and enterPogoSplit2Inline async callbacks
  - app.js: Added global window error + unhandledrejection handlers to catch and log any silent errors
  - If crash recurs, console will now capture the error instead of silent tab close

## 2026-04-12 — fix: Numpad re-edit UX — clear on open for existing values
- **Timestamp:** 2026-04-12 13:40:00
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** 6cc9514
- **Editor:** Claude Code
- **Changes:**
  - numpad.js: When re-editing an existing T1/T2 value, the numpad now starts with empty input (0.00) and shows "was: X.XXs" as reference.
