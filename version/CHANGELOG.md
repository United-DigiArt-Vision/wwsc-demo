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

## 2026-04-14 — fix: Heat Builder print fits one page (v2.8.2)
- **Timestamp:** 2026-04-14 13:45:00
- **App Version (from package.json):** 2.8.2
- **Branch:** main
- **RecordedCommit:** 5f0d6be
- **Editor:** Claude Code
- **Changes:**
  - style.css: Overhauled @media print rules for one-page fit
  - Root cause: 6 heats × ~175px = ~1050px exceeded A4 printable area (~1023px)
  - Fix: @page margin 8mm, reduced cell padding (2px 4px), font 10px, card margin 4px, border 1px, line-height 1.2
  - Result: total print height 819px — fits comfortably on A4 (1063px printable)
  - Browser print-preview verified: all 6 heats on one page, readable B/W

## 2026-04-14 — feat: Heat Builder Print Button (v2.8.1)
- **Timestamp:** 2026-04-14 12:00:00
- **App Version (from package.json):** 2.8.1
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** c48c8d2
- **Editor:** Claude Code
- **Changes:**
  - Version bump 2.8.0 → 2.8.1 (package.json + index.html cache-busting)
  - heat-builder.js: Added Print button using same window.print() pattern as Results page
  - Button-/Pattern-Reuse only — no additional print styling needed
  - Browser-verified: Print button visible, onclick=window.print(), no existing actions broken

## 2026-04-12 — fix: Breaker Report sorting by strongest variance first
- **Timestamp:** 2026-04-12 19:25:00
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** b70bbba
- **Editor:** Claude Code
- **Changes:**
  - server.js: Added post-query sort to /api/reports/breakers — sorts by date DESC, then variance DESC (strongest break first), then name alphabetically for deterministic tie-break
  - Root cause: SQL ORDER BY used stroke+name but never variance
  - Browser-verified: -9.00 → -8.00 → -4.00 → -3.00 → -2.00 with alphabetical tie-break

## 2026-04-12 — fix: add deterministic tie-break for breaker report sorting
- **Timestamp:** 2026-04-12 19:13:36
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** 8489a28
- **Editor:** Balerion
- **Changes:** Added deterministic secondary sorting by swimmer name when breaker variance is equal, so group ordering is stable and predictable instead of depending on prior API order.

## 2026-04-12 — fix: use variance consistently in breaker reports
- **Timestamp:** 2026-04-12 18:55:38
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** 2cc54b2
- **Editor:** Balerion
- **Changes:** Switched breaker reports consistently from improvement-based display/sorting to variance-based display/sorting, including headings and row values, so the strongest variance appears first and the report matches the visible metric.
