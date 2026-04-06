# STABLE — WWSC Swimming App

## Current Stable Version
- **Version:** v2.7.0
- **Tag:** v2.7.0
- **Commit:** 51074c5
- **Branch:** dev/v2.6.0-bryan-feedback-r2
- **Date:** 2026-04-04

## What's in v2.7.0
Complete implementation of Bryan's feedback from 04.04.2026 (26 items).

### Key fixes:
- Relay PBs now show actual values (was showing "—")
- Start time displayed prominently in all relays (⏱️ Start: XX s)
- Add Swimmer dropdown lists ALL medley swimmers (not just team)
- Stroke counter in Timesheet for team balancing
- Gold/Silver/Bronze medal row highlights
- Exceeding Report matches Breakers Report format
- Event Complete navigates to Calendar (not Timesheet)
- Event Report includes breakers data
- All member times in whole seconds
- "N" swimmers excluded from medley relay generation
- Medley teams start at 2s delay, nearest-to-target wins, equal placement for equal variance
- Tab navigation across all sheets
- Relay results RED+BOLD
- Slow swimmers removed from relay pages

## Recovery
```bash
git checkout v2.7.0
rm -f data/wwsc.db
PORT=3002 node server.js
```
