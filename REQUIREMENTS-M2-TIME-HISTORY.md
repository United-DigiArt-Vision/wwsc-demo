# REQUIREMENTS — M2 Time History

Version: v2.9.0
Branch: `dev/v2.9.0-m2-time-history`
Status: Specification for implementation
Date: 2026-05-18

## Source Evidence

- Upwork M2 activated/funded: `../messages/2026-05-18-Bryan-M2-active-funded.md`
- M2 scope confirmation sent to Bryan: `../messages/2026-05-18-outgoing-to-bryan-m2-scope-confirmation-sent-confirmed.md`
- Kickoff checklist: `../messages/2026-05-18-M2-kickoff-acceptance-checklist.md`
- Stable base backup: `../backups/2026-05-18-0615-v2.8.12-m1-stable-origin-main/`
- Stable base branch: `backup/v2.8.12-m1-stable-20260518`

## Scope Boundary

M2 implements: "Generate solution for recording time changes and archiving historical times with dates."

M2 does not implement Pointscore, accumulated season totals, reports/graphs, or constitution-based scoring. Those are M3.

## Requirements

### R-M2-01 — Record Time Changes

Whenever a finalized individual race records a swimmer time, the system must store a durable historical record for that swimmer.

Acceptance:
- Finalizing an event creates one history row per swimmer result with a finish/net time.
- Re-finalizing the same event must not create duplicate history rows for that event.
- Existing v2.8.12 breaker behavior remains intact.

### R-M2-02 — Preserve Dates

Every history entry must show the date attached to the event/result.

Acceptance:
- API responses include `event_date`.
- UI history views display the date in a human-readable form.
- If two entries have the same swimmer and stroke, date makes them distinguishable.

### R-M2-03 — Per-Swimmer Timeline

Bryan must be able to inspect a swimmer's time history by swimmer.

Acceptance:
- From a member/swimmer context, a user can access that swimmer's historical times.
- Timeline sorts entries newest-first by date.
- Entries include date, stroke/race, new recorded time, previous best, and break marker.

### R-M2-04 — Week-by-Week / Dated Historical Review

Bryan must be able to review historical times across dated weekly events.

Acceptance:
- A dated view can show all time-history rows for a selected completed event.
- Calendar/event history can expose the historical times for that event.
- Multiple weekly events remain reviewable after browser refresh and server restart when the same DB path is used.

### R-M2-05 — Existing Stable Behavior Must Not Regress

The delivered M1/v2.8.12 behavior must remain stable.

Acceptance:
- Members CRUD still works.
- Event setup, heat builder, results entry, relays, breakers, calendar/archive/restore, and v2.8.12 relay/report fixes still pass smoke checks.
- No M3 features appear in the M2 UI.

## Open Questions

None blocking for M2. The scope is narrow enough to implement using existing `time_history`, event dates, and UI/API views.

