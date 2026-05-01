# STABLE — WWSC Swimming App

## Current Stable (Live) Version
- **Version:** v2.8.11
- **Tag:** v2.8.11
- **Branch:** main
- **Current main tip:** 0dcad22 (`merge: v2.8.11 Bryan polish pass`)
- **Version bump commit:** 4001276
- **Implementation commit:** 272bd45
- **Merge commit:** 0dcad22
- **Date:** 2026-05-01
- **Live Render verification:** `/api/version` returned `2.8.11`, build `2026-05-01T02:30:30.787Z`
- **Browser verification:** live sidebar shows `v2.8.11` and matching build timestamp.

## What's in v2.8.11
Focused Bryan 2026-05-01 polish pass for the latest delivered v2.8.10.

### Delivered corrections
- 25m Team Relay selection screen now stays clean before Generate Teams: no confusing `0/0 teams complete`, no unassigned pool, no Add Team button before teams exist.
- Relay print headings are consistent and prominent across the page: same font family, stronger hierarchy, Team 1/2/3 headings no longer print tiny.
- Removed the `(decides ranking)` wording from 25m Team Relay result variance rows while keeping variance/place information intact.
- Event Report Special Entry now shows `N` for present swimmers with missing/null special-entry data, fixing Andrew Barnes showing `—` when the Times Sheet effectively indicates `N`.
- Added repeatable v2.8.11 verification script, 75-case test spec, 56 PASS / 0 FAIL protocol, and screenshot evidence.

## Previous Stable
- **Version:** v2.8.10
- **Tag/merge anchor:** 99d4903 (`merge: v2.8.10 bryan retest follow-up`)
- **Live build:** `2026-04-23T20:28:05.605Z`
- **Scope:** Bryan 2026-04-23 retest follow-up — 25m Team Relay swim-twice dropdown scoped to this team only, View Event Report null-ref crash fixed, Initial Generate Teams randomises per click.

## Recovery
```bash
git fetch --all --prune
git checkout main
git reset --hard origin/main
PORT=3002 npm run dev
```
