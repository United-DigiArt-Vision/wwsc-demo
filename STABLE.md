## Current Stable Live Version

- **Version:** v2.9.0
- **Tag:** v2.9.0
- **Branch:** main
- **Deployed main tip:** 8d167fd (`docs: mark v2.9.0 stable release candidate`)
- **Version bump commit:** aa004be (`release: bump to v2.9.0 for M2 time history`)
- **Implementation commit:** a864414 (`feat: v2.9.0 M2 time history implementation (T1-T7)`)
- **Merge commit:** 1c01b10 (`merge: v2.9.0 M2 time history`)
- **Evidence commit:** 14c3118 (`docs: M2 100-case screenshot evidence package (98 PASS / 2 NA / 0 FAIL)`)
- **Balerion review commit:** 0e637eb (`docs: record M2 100-case screenshot review`)
- **Date:** 2026-05-19
- **Local verification:** 55 PASS / 0 FAIL post-merge, plus 98 PASS / 2 NOT APPLICABLE / 0 FAIL / 0 BLOCKED expanded screenshot gate.
- **Live Render verification:** `/api/version` returned `2.9.0`, build `2026-05-19T11:38:54.177Z`.
- **Browser verification:** live sidebar shows `v2.9.0`; Members screen exposes History actions; member History modal opens and shows the correct no-history empty state on the current live DB; Season Calendar loads; no relevant console/page errors.
- **Live smoke evidence:** `docs/evidence/live-smoke-v2.9.0-2026-05-19.json`, screenshots under `docs/screenshots/live-smoke-2026-05-19/`.

## What's in v2.9.0

Milestone 2 Time History delivery for Bryan:

- Records finalized individual race times into durable `time_history` rows.
- Adds dated per-swimmer Time History access from the Members screen.
- Adds dated event Time History in completed Calendar event details.
- Preserves event dates in history API responses and UI.
- Keeps re-finalize idempotent so the same event does not create duplicate history rows.
- Keeps M2 scoped to time-history only; Pointscore, accumulated season totals, reports/graphs, and constitution scoring remain M3.
- Preserves v2.8.12 M1 behavior through regression checks for members, event setup, heat builder, results, relays, breakers, calendar/archive/restore, and prior relay/report fixes.

## Previous Stable

- **Version:** v2.8.12
- **Tag:** v2.8.12
- **Scope:** Bryan final M1 polish plus persistence hardening.
- **Live Render verification before v2.9.0 deploy:** `/api/version` returned `2.8.12`, build `2026-05-06T12:15:38.380Z`.

## Recovery

```bash
git fetch --all --prune
git checkout main
git reset --hard origin/main
PORT=3002 npm run dev
```
