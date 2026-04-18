# STABLE — WWSC Swimming App

## Current Stable Version
- **Version:** v2.8.8
- **Tag:** v2.8.8
- **Branch:** main
- **Current main tip:** dynamic — run `git rev-parse --short HEAD`
- **RecordedCommit:** 497f78d
- **Date:** 2026-04-18

## What's in v2.8.8
This live release rolls the verified v2.8.4 → v2.8.8 workstream into the real Render deployment.

### Key delivered improvements
- Bryan follow-up corrections for Medley/25m relay behavior, print cleanup, results layout, and special-race ranking clarity (R21–R26)
- Reworked user-tested UI corrections from the v2.8.5 round
- v2.8.6 final UX/transparency fixes across Brace, Medley, and Pogo result surfaces
- v2.8.7 manual team management for eligible relay races
- v2.8.8 readability/consistency fixes, including final Brace/Pogo result-table improvements and Heat Builder parity updates

### Continuation rule
- Future Bryan work must continue from `main` / `origin/main` / `package.json=2.8.8`.
- Use `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, and `messages/2026-04-18-current-state-after-v288-live.md` as the continuity baseline.

## Recovery
```bash
git fetch --all --prune
git checkout main
git reset --hard origin/main
PORT=3002 npm run dev
```
