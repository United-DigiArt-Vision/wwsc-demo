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

## 2026-04-12 — fix: Pogo crash investigation + defensive error handling
- **Timestamp:** 2026-04-12 16:50:00
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** PENDING
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
  - numpad.js: When re-editing an existing T1/T2 value, the numpad now starts with empty input (0.00) and shows "was: X.XXs" as reference. Previously the old value was pre-filled with 2 decimal places, blocking further digit entry without visible backspace effect — this was the root cause of the re-edit bug.
  - Browser-verified with real UI clicks: open numpad on existing 13.50 → type 12.00 → OK → Result recalculates to 13.25, T2 unchanged at 14.50, Variance updates to -1.75

## 2026-04-12 — fix: Pogo Results table layout + numpad guard + auto-recalc
- **Timestamp:** 2026-04-12 13:20:00
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** c230151
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
- **RecordedCommit:** 1d8f120
- **Editor:** Balerion
- **Changes:** Final SSOT completion commit after the numpad-fix so CURRENT_STATE and CHANGELOG point to the documented commit anchor.

## 2026-04-12 — fix: reset stale numpad handlers before reopening
- **Timestamp:** 2026-04-12 12:27:00
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** 60e502b
- **Editor:** Balerion
- **Changes:** Fixed stale numpad state by closing any previous numpad instance before opening a new one, so existing T1/T2 values can be edited again.
