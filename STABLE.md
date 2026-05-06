## Current Stable (Live) Version
- **Version:** v2.8.12
- **Tag:** v2.8.12
- **Branch:** main
- **Current main tip:** dynamic — run `git rev-parse --short HEAD` on `main` / `origin/main`
- **Version bump commit:** 79eb9cc
- **Test spec commit:** 5562ec4
- **Implementation commit:** 2321284
- **Evidence commit:** f39be1b
- **Merge commit:** 596458f
- **Date:** 2026-05-06
- **Live Render verification:** `/api/version` returned `2.8.12`, build `2026-05-06T12:12:59.088Z`
- **Browser verification:** live sidebar shows `v2.8.12` and `Build: 2026-05-06T12:12:59.088Z`

## What's in v2.8.12
Focused Bryan 2026-05-06 final M1 polish plus persistence hardening based on his latest v2.8.11 feedback.

### Delivered corrections
- Medley Relay readout now includes signed variance and relay participants/strokes, so ranking by smallest absolute variance is understandable without explanation.
- Season Calendar / History event details now include relay team members for 25m Team Relay and Medley Relay instead of only Team N + time.
- Full Event Report relay sections now include team members, team total, and signed variance for auditability.
- 25m record breaks now count at >= 0.50 seconds improvement; 0.49 seconds remains no break; non-25m races keep the prior 1.00 second threshold unless separately changed.
- Hosted data persistence is hardened: SQLite path can be configured via `WWSC_DB_PATH`, and Render is configured for persistent disk storage at `/var/data/wwsc.db`.
- Added repeatable v2.8.12 Browser-E2E/API evidence: 31 PASS / 0 FAIL, screenshot evidence, and persistence restart proof.

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
