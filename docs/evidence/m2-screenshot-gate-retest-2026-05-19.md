# M2 Time History Screenshot Gate Retest — 2026-05-19

## Run metadata
- Date: 2026-05-19
- Operator: Claude Code automated retest
- DB: /tmp/wwsc-gate-test-2026-05-19.db (isolated, /tmp)
- Port: 3099
- Browser: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
- Puppeteer: puppeteer-core from project node_modules or /tmp/wwsc-screenshot-tool
- Screenshots: docs/screenshots/m2-time-history-screenshot-gate-2026-05-19/
- Log: docs/evidence/m2-screenshot-gate-retest-2026-05-19.log

## Evidence Matrix

| Claim | Screenshot file | Log / API evidence | Verdict |
|---|---|---|---|
| UI-M2-C01/C02 | C01-C02-member-history-modal-after-finalize.png | Finalize API: {"ok":true,"breakers_count":5}; member history modal opened in same browser session without full page reload; event detail Time History section found (found=true, rows=6) | **PROVEN** |
| UI-M2-C03 | C03-member-history-after-browser-reload.png | Hard browser reload performed; DOM row count in modal after reload=2 | **PROVEN** |
| UI-M2-C04 | C04-member-history-after-server-restart.png | Server stopped and restarted with same DB (/tmp/wwsc-gate-test-2026-05-19.db); API returned 5 event history entries and 1 member history entries; DOM row count in modal=2 | **PROVEN** |
| UI-M2-D01 | D01-event-detail-time-history-after-refinalize.png | Before re-finalize: 5 rows; After re-finalize: 5 rows; noDuplicates=true; UI tbody rows visible=5 | **PROVEN** |

## Notes on what each screenshot proves vs. what log/API proves

- **UI-M2-C01/C02**: The screenshot of the member history modal proves the UI rendered time history rows in the browser (visual). The log/API evidence proves finalize was called once in the same browser session before any full page reload.
- **UI-M2-C03**: The screenshot proves the rows are visible after a hard browser reload (page.reload()). The log shows the reload was performed and the modal was opened in a fresh JS context.
- **UI-M2-C04**: The screenshot proves the rows are visible after a full server stop+restart with the same DB path. The API log line shows the /api/events/:id/time-history GET returned non-zero rows after restart — proving DB persistence, not just RAM caching.
- **UI-M2-D01**: The screenshot proves the Time History section is visible in the event detail modal after re-finalize. The log evidence proves before==after row count (no duplicates created by re-finalize), satisfying the idempotency requirement.

## Overall

**OVERALL: PROVEN**
