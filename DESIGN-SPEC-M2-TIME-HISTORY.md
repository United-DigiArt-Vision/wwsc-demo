# DESIGN SPEC — M2 Time History

Version: v2.9.0
Branch: `dev/v2.9.0-m2-time-history`
Date: 2026-05-18

## Current Code Baseline

Existing table:
- `time_history(id, member_id, event_id, stroke, time, is_break, previous_best)`

Existing write path:
- `POST /api/events/:eventId/finalize`
- Deletes prior rows for the event before re-inserting, preventing duplicate rows on re-finalize.
- Writes rows for individual race lanes only; relay types are skipped.

Existing read path:
- `GET /api/events/:eventId/time-history`
- Currently returns event-scoped rows joined to member names.

Existing frontend API:
- `API.getTimeHistory(eventId)`

## Target Design

### D-M2-01 — Keep `time_history` as the SSOT

No new history table is required. `time_history` remains the single source of truth for recorded individual time history.

Required improvements:
- Add event date to history read APIs via joins to `event`.
- Add member-scoped history API for per-swimmer timeline.
- Keep re-finalize duplicate prevention.

### D-M2-02 — API Contract

`GET /api/events/:eventId/time-history` returns:
- `id`, `member_id`, `member_name`, `event_id`, `event_date`, `stroke`, `time`, `previous_best`, `is_break`

Sort:
- stroke ascending
- member name ascending

`GET /api/members/:memberId/time-history` returns the same fields, sorted by event date descending, event id descending, stroke ascending.

404 behavior:
- If member does not exist, return 404.

### D-M2-03 — Frontend Entry Points

Members screen:
- Add a clear `History` action for each swimmer.
- Action opens a modal or inline panel with that swimmer's timeline.

Calendar/Event detail:
- Completed event details expose historical times for that event.
- Use existing event report/calendar patterns where possible.

### D-M2-04 — Formatting Rules

- `time` is centiseconds and must use the existing centisecond formatter.
- `previous_best` is whole seconds and must use whole-second formatting or explicit conversion before centisecond display.
- `event_date` must be visibly shown.
- Break rows should be visually marked but must not alter Pointscore or season totals.

### D-M2-05 — Regression Boundary

Do not change:
- breaker threshold logic
- relay team generation
- pointscore table/logic
- report/graph/constitution scoring
- Render persistence settings

## Implementation Order

1. API: enrich event history with `event_date`.
2. API: add member-scoped history endpoint.
3. Frontend API wrapper: add `getMemberTimeHistory(memberId)`.
4. Members UI: add swimmer history action and modal/panel.
5. Calendar/Event UI: expose event time history in completed event details.
6. Tests: API and browser E2E for member timeline, event dated review, re-finalize duplicate prevention, and M1 regression smoke.

