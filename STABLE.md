# STABLE — WWSC Swimming App

## Current Stable (Live) Version
- **Version:** v2.8.8
- **Tag:** v2.8.8
- **Branch:** main
- **Current main tip:** dynamic — run `git rev-parse --short HEAD`
- **RecordedCommit:** 497f78d
- **Date:** 2026-04-18


## In-flight (prepared, awaiting Dino review / merge / deploy)
- **Version:** v2.8.11
- **Branch:** `dev/v2.8.11-bryan-polish`
- **Version bump commit:** `4001276`
- **RecordedCommit:** `272bd45`
- **Date:** 2026-05-01
- **Scope:** Bryan 2026-05-01 tight polish pass: clean Relay pre-generation state, consistent/prominent print headings, remove `(decides ranking)`, Event Report Special Entry `N` instead of `—` for present/null swimmers.
- **Verification:** `USER-INTERACTION-TEST-SPEC-v2.8.11.md` = 75 test cases; `USER-INTERACTION-TEST-PROTOCOL-v2.8.11.md` = 56 PASS / 0 FAIL with screenshots in `docs/screenshots/v2.8.11-bryan/`.
- **Release status:** not live until Dino merges/pushes/deploys and `/api/version` verifies `2.8.11`.

## In-flight (prepared, awaiting Balerion deployment)
- **Version:** v2.8.10
- **Branch:** `dev/v2.8.10-bryan-retest-followup`
- **RecordedCommit:** `4015f9c`
- **Date:** 2026-04-23
- **Scope:** Bryan 2026-04-23 retest follow-up — (B) 25m Team Relay swim-twice dropdown restricted to this team only, (D) View Event Report null-ref crash fixed, (E) Initial Generate Teams randomises per click (no more identical baseline). Issue A verified as non-reproducible. Issue C (Event Report content extension) deferred pending Bryan field clarification. Browser-verified on Preview.

## Previously in-flight (now live on Render since 2026-04-22/23)
- **Version:** v2.8.9
- **Branch merged:** `dev/v2.8.9-bryan-relay-randomness`
- **RecordedCommit:** `004d70f`
- **Date delivered:** 2026-04-21
- **Scope:** Bryan 2026-04-21 relay corrections. Bryan retest (2026-04-23) confirms points 1 and 3 as correct; point 2 (initial Generate randomness) carried forward into v2.8.10 as Fix E.

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
