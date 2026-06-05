# DESIGN SPEC — M3 Pointscore / Reports

**Version:** v2.10.0 (M3 slice)
**Branch:** `dev/v2.10.0-m3-history-graphs`
**Date:** 2026-06-03
**Status:** Implemented. Working assumptions per Bryan 2026-06-02 (event-separated; monthly/season by simple addition; Excel pointscore sheets as working source; adjustable later — not a confirmed Constitution).

## 1. Design principles (forward-build guardrail)

- **Additive + isolated.** The pointscore layer reads accepted race results and writes only the `pointscore_entry` table. It never modifies variance, net_time, is_break, place/ranking, heat or relay generation, or time_history (the protected P1–P13 flows from `M3-FORWARD-BUILD-GUARDRAIL-2026-05-29.md`).
- **Centralized, adjustable rule.** All points-per-place numbers live in one `POINTSCORE_RULES` config (`src/pointscore.js`). Adopting a confirmed Constitution is a config change, not a code change.
- **Source-labeled.** The UI and APIs disclose that the Excel sheets are the working scoring source, not a confirmed Constitution.

## 2. Scoring engine — `src/pointscore.js`

| Export | Behavior |
|---|---|
| `POINTSCORE_RULES` | Config: `categories.individual` (5/4/3/2 by place, Excel working assumption), `categories.relay` (5/4/3 by place, Bryan-confirmed 2026-06-05), plus `source`, `version` metadata. |
| `categoryForRaceType(raceType)` | Maps a race_type to `individual` or `relay`. |
| `pointsForPlace(cat, place, finished)` | Returns points for a place; finishers without a podium place get the category `finisherPoints`; non-finishers get 0. |
| `computeEventPointscoreRows(db, eventId)` | Reads `heat_lane.place`/`manual_place` (individual) and `relay_team.place` + `relay_team_member` (relay). Returns rows, no writes. |
| `writeEventPointscore(db, eventId)` | Idempotent: DELETE existing rows for the event's races, aggregate per `(event_race_id, member_id)`, INSERT. No-op if `WWSC_POINTSCORE_DISABLED=1`. |
| `isPointscoreEnabled()` | Reads the isolation switch. |

**Finalize hook:** `pointscore.writeEventPointscore(db, eventId)` is called inside the existing finalize transaction in `src/server.js`, AFTER the accepted `time_history` write and BEFORE the event-status update. It is the only new line in the finalize path.

## 3. Persistence

- Uses the pre-existing `pointscore_entry(event_race_id, member_id, points, UNIQUE(event_race_id, member_id))` table. No schema change, no migration.
- Idempotency comes from the per-finalize DELETE + the UNIQUE constraint + per-(race,member) aggregation.

## 4. API surface (read-only over pointscore data)

| Endpoint | Purpose |
|---|---|
| `GET /api/pointscore/rules` | Rule config + aggregation + season default for the transparency banner. |
| `GET /api/events/:eventId/pointscore` | Event-separated per-swimmer + per-race detail + event totals. |
| `GET /api/pointscore/month/:ym` | Monthly winners by simple addition (non-archived finalized/completed events in `YYYY-MM`). |
| `GET /api/pointscore/season/:year` | Season winners by simple addition (calendar-year working default). |
| `GET /api/members/:memberId/pointscore` | Per-swimmer contribution detail + total. |
| `GET /api/pointscore/months` | List of `YYYY-MM` with scored events (UI pickers). |
| `GET /api/events/:eventId/pointscore/csv` | Event CSV export. |
| `GET /api/pointscore/month/:ym/csv` | Monthly CSV. |
| `GET /api/pointscore/season/:year/csv` | Season CSV. |
| `GET /api/time-history/csv` | Full dated time-history CSV (M2 data). |

> Note: CSV routes use a `/csv` path segment (not a `.csv` extension) to avoid Express parameter-extension ambiguity.

## 5. UI — `src/public/js/screens/pointscore.js`

- New `🎯 Pointscore` sidebar entry + `pointscore` route (`sidebar.js`, `app.js`).
- Four tabs: **Per-Event**, **Monthly Winners**, **Season Winners**, **Swimmer Card**.
- Every tab shows the rule-transparency banner (Excel working source; not a confirmed Constitution; event-separated + simple-addition aggregation; calendar-year season default).
- Each tab: a selector (event / month / season / swimmer), a sortable standings/detail table, a CSV export button, and a Print button. Controls carry `print-hide`; the table is inside a `print-area`.

## 6. Aggregation rules (working assumption)

- **Event:** each event's pointscore is stored and shown on its own. No cross-event mixing at the event level.
- **Monthly:** `SUM(points)` over all non-archived finalized/completed events whose date is in `YYYY-MM`, grouped per swimmer. Simple addition.
- **Season:** same, scoped to a calendar year (`YYYY`). The season boundary is a documented working default, shown in the UI, adjustable.
- **Archived events** are excluded (`WHERE archived = 0 OR archived IS NULL`), consistent with how the Season Calendar already hides archived events.

## 7. What is intentionally NOT in this slice

- Constitution-specific accumulation (break-reallocation, eligibility, weighting) — blocked until Bryan confirms the Constitution. The engine is structured so these become config/strategy additions.
- PB-break bonus / attendance points — the Excel `Total Pointscore` excludes the Improvement/Attendance sheets, so the working assumption is no bonus.
- Members CSV / improvement report / attendance report — not required by the working assumption; can be added later.

## 8. Regression protection

- `scripts/e2e-m3-pointscore-isolation.cjs` proves the accepted flow is byte-identical with pointscore on/off.
- `scripts/test-m3-pointscore-unit.cjs` proves the formula, idempotency, and monthly/season addition.
- `scripts/e2e-m2-time-history.cjs` (55) + `scripts/e2e-m2-user-interaction-100.cjs` (100) re-run green on the M3 branch (the M3-leakage scan was scoped to `#content` so the legitimate Pointscore nav link is not a false positive).
- `scripts/e2e-m3-history-graphs.cjs` (20) confirms R-M3-05 still passes.
- `scripts/e2e-m3-pointscore-120.cjs` executes the mandatory 120-case v3.0.1 spec.
