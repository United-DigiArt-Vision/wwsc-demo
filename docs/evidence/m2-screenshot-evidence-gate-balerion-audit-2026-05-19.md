# M2 Screenshot Evidence Gate — Balerion Audit

**Date:** 2026-05-19
**Auditor:** Balerion
**Project:** WWSC Swimming App
**Version:** 2.9.0
**Branch:** main
**Scope:** Apply SR-032 / V0006 v5.8 / V0015 v1.3 Screenshot Evidence Gate to M2 Time History.

## Screenshot Inventory Reviewed

### Original M2 Full-Proof Screenshots

Folder: `docs/screenshots/m2-time-history/`

Reviewed visually by Balerion: **14 / 14**

- `breaker-report-screen.png`
- `calendar-after-archive.png`
- `calendar-after-restore.png`
- `calendar-overview.png`
- `event-detail-after-refinalize.png`
- `event-detail-time-history-ev1.png`
- `event-detail-time-history-ev3-scrolled.png`
- `event-detail-time-history-ev3.png`
- `member-history-after-time-change.png`
- `member-history-modal-alice.png`
- `member-history-modal-empty-state.png`
- `members-screen-with-history-action.png`
- `results-relay-event-overview.png`
- `results-relay-readout-detail.png`

### Screenshot Gate Retest Screenshots

Folder: `docs/screenshots/m2-time-history-screenshot-gate-2026-05-19/`

Reviewed visually by Balerion: **9 / 9**

- `C01-C02-member-history-modal-after-finalize.png`
- `C01-calendar-screen.png`
- `C01-event-detail-time-history.png`
- `C01-event-detail-time-history-scrolled.png`
- `C01-members-screen-after-finalize.png`
- `C03-member-history-after-browser-reload.png`
- `C04-member-history-after-server-restart.png`
- `D01-event-detail-time-history-after-refinalize.png`
- `D01-event-detail-time-history-heading.png`

Total reviewed: **23 / 23 screenshots**.

## Claim Mapping

| Claim | Screenshot Evidence | Additional Log/API Evidence | Verdict |
|---|---|---|---|
| Members screen exposes a History action per swimmer | `members-screen-with-history-action.png` | `m2-time-history-run.log` `UI-M2-A01 history buttons=24` | PROVEN |
| Member history modal opens with dated rows | `member-history-modal-alice.png` | `UI-M2-A02 rows=3 visible=true` | PROVEN |
| Modal shows Date / Stroke-Race / Time / Previous Best / Break | `member-history-modal-alice.png`, `member-history-after-time-change.png` | `UI-M2-A03`, `UI-M2-D02` | PROVEN |
| Newest-first member timeline ordering | `member-history-modal-alice.png` visibly shows Apr 18, Apr 11, Apr 4; `member-history-after-time-change.png` visibly shows same order | `UT-M2-02-2 dates desc=2026-04-18,2026-04-11,2026-04-04` | PROVEN |
| Empty-state for swimmer without history | `member-history-modal-empty-state.png` | `UI-M2-A05` | PROVEN |
| Calendar/Event detail exposes Time History (M2) | `event-detail-time-history-ev3.png`, `event-detail-time-history-ev3-scrolled.png`, `event-detail-time-history-ev1.png` | `UI-M2-B01..B04` | PROVEN |
| Event-specific weekly separation | `event-detail-time-history-ev3-scrolled.png`, `event-detail-time-history-ev1.png`, `calendar-overview.png` | `UI-M2-B04`, API rows by event | PROVEN |
| Changed time after re-finalize is visible | `member-history-after-time-change.png` shows Sue Williams row with `11.00` on Apr 11 | `UI-M2-D02` | PROVEN |
| Break marker consistent with Breaker Report | `member-history-modal-alice.png`, `breaker-report-screen.png` | `UI-M2-D03` | PROVEN |
| Time formatting is X.XX and PB is not `0.X` | `member-history-modal-alice.png`, `member-history-after-time-change.png`, `event-detail-time-history-ev3-scrolled.png` | `UT-M2-04-*`, `UI-M2-E01..E02` | PROVEN |
| M1 regression: relay readout still renders | `results-relay-event-overview.png`, `results-relay-readout-detail.png` | `UI-M2-F06-*` | PROVEN |
| M1 regression: archive/restore still works visually | `calendar-after-archive.png`, `calendar-after-restore.png` | `UI-M2-F08-archive/restore` | PROVEN |
| No-refresh visibility after finalize | `C01-C02-member-history-modal-after-finalize.png`, `C01-event-detail-time-history-scrolled.png` | `m2-screenshot-gate-retest-2026-05-19.log` finalize before screenshot in same browser session | PROVEN |
| Browser reload persistence | `C03-member-history-after-browser-reload.png` | Retest log: hard `page.reload()`, modal rows after reload = 2 | PROVEN |
| Server restart persistence with same DB | `C04-member-history-after-server-restart.png` | Retest log: server stopped/restarted with same DB; API returned event/member history rows | PROVEN |
| Re-finalize no duplicate rows | `D01-event-detail-time-history-after-refinalize.png`, `D01-event-detail-time-history-heading.png` | Retest log: before=5, after=5, noDuplicates=true, UI tbody rows=5 | PROVEN |

## Beweisgrenzen

Screenshots prove the visible browser state: rows, dates, columns, PB labels, Time History sections, and UI continuity after reload/restart.

The following non-visual properties are proven by the paired raw logs/API checks, not by screenshots alone:

- exact DB row count before/after re-finalize
- no duplicate DB rows
- the fact that the server process was actually stopped and restarted
- the fact that the same DB path was reused
- full API response shape

This is acceptable under SR-032 because every non-visual claim is paired with raw log/API evidence and every UI claim now has direct screenshot coverage.

## Final Verdict

- Screenshots reviewed by Balerion: **23 / 23**
- Screenshot gaps found before retest: reload, server restart, no-refresh finalize, re-finalize table/no-duplicate visibility
- Screenshot gaps after Claude Code retest: **none**
- Remaining `NOT PROVEN`: **none**

**Final verdict: PROVEN for M2 Screenshot Evidence Gate.**
