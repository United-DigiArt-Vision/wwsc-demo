# History Retention Policy — M3 R-M3-08 (Working Answer)

**Status:** Balerion-authorized working answer pending Bryan confirmation.
**Triggering question:** Bryan 2026-05-23 inbound — *"Is there a limitation on the historical records that can be kept?"*
**Underlying open question:** QA-12 in `M3-QUESTIONS-AND-ASSUMPTIONS-2026-05-29.md`.

## Policy

The WWSC database imposes **no hard cap** on the number of `time_history` rows kept per swimmer or per event. Historical records persist indefinitely subject only to:

- **Disk space** on the host that runs the SQLite database (`WWSC_DB_PATH`). On a typical Render persistent disk (1 GiB+), this is effectively unbounded for a club of 30 swimmers and weekly events (≈ 1,500 rows / season at ~150 bytes / row ≈ < 1 MiB / season).
- **Pagination implicit to the rendered UI**. The per-swimmer history modal (M2 v2.9.0) and the per-event history list use scrollable containers with `max-height: 60vh` and do not load more than the swimmer's actual rows in a single fetch.

## Rationale

- **Why no auto-archive cap?** Bryan's recorded use-case is a single small swim club; the data volume per season is in the low thousands of rows. The cost of an auto-archive flow (write-time pruning, restore UX, archive-vs-active filters everywhere) outweighs the disk savings.
- **Why no time-window cap?** Constitution-based accumulation (R-M3-03, blocked on QA-05/06) may need to look back across multiple seasons; capping the data shape would constrain a feature that has not been specified yet.

## Operational consequences

- **Backup is the host's responsibility.** SQLite via `better-sqlite3` continues to keep the DB at `WWSC_DB_PATH`; the existing `createBackup()` server helper (used by `POST /api/backup` and other internal paths) writes timestamped `.db` files to `WWSC_BACKUP_DIR`. No new backup work in this slice.
- **Render persistent disk size will eventually become the limit.** When that becomes relevant, the answer will be to upgrade the disk size, not to retroactively prune history.

## What this policy explicitly does NOT do

- It does NOT introduce a "Cleanup old records" admin button.
- It does NOT add a `retention_days` config field.
- It does NOT change any existing M1/M2 read or write path.

The above are reserved for a future scope change if Bryan asks for them.

## Confirmation flow

This working answer is the QA-12 "minimum working assumption" from `M3-QUESTIONS-AND-ASSUMPTIONS-2026-05-29.md`. Bryan can confirm or reject via the normal Upwork channel (no contact from Claude — Dino owns the outreach). On confirmation, this file becomes the definitive policy. On rejection, the rejection text becomes the new policy input and this file is rewritten.
