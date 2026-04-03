# STABLE — WWSC Swimming App

**Tag:** v2.5.0
**Date:** 2026-04-03
**Commit:** 9c8694e
**Branch:** main
**SSOT Version:** package.json → "version": "2.5.0"

## What's in v2.5.0 (Bryan Feedback Release)
- **Centiseconds UI Fix:** Times Sheet now correctly displays decimal points (e.g., 16.23).
- **Heat Distribution Fix:** Optimized algorithm (13 swimmers → 4 heats of 4+3+3+3, not 5 heats).
- **Manual vs Auto Placing:** Separate columns in Results (🟢 Auto + 🔴 Manual/Judge) with visual indicators.
- **Relay "Swim Twice":** Added dropdown + button to all relay teams to allow swimmers to compete twice in uneven teams.
- **Medley Correlation:** Bold color-coded team boxes and stroke-based row colors for instant team identification.
- **Consolidated Breaker Report:** New view showing all breakers across all events on a single page.
- **Readout Mode:** 🗣️ Button in Results for a clean, copyable text view for poolside announcements.

## Rollback
```bash
git checkout v2.5.0
```
