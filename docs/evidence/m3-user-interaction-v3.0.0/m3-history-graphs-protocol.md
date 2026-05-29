# M3 R-M3-05 — UIT-M3-001..UIT-M3-020 Test Protocol (Rev 3 — clean-HEAD evidence rerun)

**Branch:** `dev/v2.10.0-m3-history-graphs`
**HEAD at this evidence run:** `1545ea7` (full `1545ea7211f56d494a2e83b6ecf4d5face0092f3`) — working tree clean before the run; all `records`/`run.log`/`mapping` metadata captured this HEAD.
**Baseline before bump:** `dev/m3-prd-planning` @ `f043dea` (off `main@7b4dcc5`)
**Version after V0014 bump:** `2.10.0`
**Date executed:** 2026-05-29 (Rev 3 clean-HEAD rerun per Balerion 21:21 directive, after the Rev 2 QA fixes from the 18:02 directive)
**Runner:** `scripts/e2e-m3-history-graphs.cjs` (puppeteer-core + headless Chrome)
**Test data:** isolated server PORT=3005, DB `/tmp/wwsc-m3-graphs-test/wwsc.db` (fresh per run); **6 weekly events** so memberA has 6 dated rows
**Raw run log:** `m3-history-graphs-run.log`
**Records sidecar:** `m3-history-graphs-records.json`
**Exact-mapping data:** `m3-data-correctness-mapping.json`
**Screenshots:** `code/docs/screenshots/m3-user-interaction-v3.0.0/UIT-M3-###-*.png` (20 PNGs, one per case)

## Balerion CONDITIONAL-PASS fixes applied in Rev 2

1. **Date-range, not stroke-filter (fix #1):** UIT-M3-007/008 now exercise the real from/to date-range filter (new `mg-from` / `mg-to` / Clear-range controls in `member-graph.js`). UIT-M3-007 narrows 6 rows → 4 (window 2026-04-11..2026-05-02, endpoints excluded); UIT-M3-008 clears the range and restores all 6.
2. **Real browser back/forward (fix #2):** UIT-M3-015 now runs actual `page.goBack()` + `page.goForward()` across full-page loads and records the documented SPA behavior, instead of a nav-cycle substitution.
3. **Exact point→row mapping (fix #3):** UIT-M3-019 reads each rendered circle's `data-date` / `data-time-cs` / `data-pb-cs` / `data-is-break` and asserts an exact set-equality against the API rows on `(stroke, date, time, previous_best, is_break)`. Full mapping persisted to `m3-data-correctness-mapping.json`. `exactMatch=true`.
4. **6-row history proof (fix #4):** seed extended from 4 → 6 weekly events; UIT-M3-001 now asserts `apiRows >= 6 && dots === apiRows && xLabels >= 6`.
5. **Stale screenshot removed (fix #5):** `UIT-M3-015-back-forward.png` and the interim `UIT-M3-015-nav-cycle.png` are deleted; the only UIT-M3-015 artifact is `UIT-M3-015-browser-back-forward.png`.

## Result Summary (Rev 2)

| Status | Count |
|---|---|
| **PASS** | 19 |
| **NOT APPLICABLE** | 1 |
| **FAIL** | 0 |
| **BLOCKED** | 0 |
| **PROVISIONAL** | 0 |
| **Console errors (favicon + 404 filtered)** | 0 |

## Case-by-Case

UIT-M3-001 — Open swimmer with 6 dated 25m rows; graph appears with all dates ordered
Status: PASS
Area: History graphs
Screenshot: `docs/screenshots/m3-user-interaction-v3.0.0/UIT-M3-001-graph-6-dates-ordered.png`
Visible evidence: SVG rendered, data-graph-type=time-trend, 6 data points = 6 API rows, X-axis labels `04 Apr / 11 Apr / 18 Apr / 26 Apr / 02 May / 09 May`
Notes: Held-back-gate 6-row expectation met (Balerion fix #4). Assertion now ties dot count to the live API row count, not a fixed number.

UIT-M3-002 — Switch stroke filter from "All" to single stroke
Status: PASS
Screenshot: `…UIT-M3-002-stroke-filter-applied.png`
Visible evidence: After setting stroke filter = `25m`, chart redrew; data point count remained consistent with the swimmer's 25m-only rows.

UIT-M3-003 — Axis labels readable, two-decimal times
Status: PASS
Screenshot: `…UIT-M3-003-axis-labels-readable.png`
Visible evidence: Y-axis ticks: `15.20 / 15.28 / 15.35 / 15.43 / 15.50` — all match the X.XX centisecond format.

UIT-M3-004 — PB progression overlay
Status: PASS
Screenshot: `…UIT-M3-004-pb-progression.png`
Visible evidence: After switching graph type to PB progression, SVG `data-graph-type=pb-progression` and 4 series dots rendered.

UIT-M3-005 — No-history swimmer empty state
Status: PASS
Screenshot: `…UIT-M3-005-empty-state-no-history.png`
Visible evidence: Empty-state copy ("No time history yet for this swimmer. Graphs appear here after at least one event is finalized.") rendered; zero non-favicon console errors.

UIT-M3-006 — Sparse swimmer (1 history row)
Status: PASS
Screenshot: `…UIT-M3-006-sparse-one-row.png`
Visible evidence: SVG renders exactly 1 data point (counted via `circle[data-series-pt]` selector to exclude the legend marker).

UIT-M3-007 — Date range covering the middle events only
Status: PASS
Screenshot: `…UIT-M3-007-date-range-middle.png`
Visible evidence: Window 2026-04-11..2026-05-02 → exactly 4 rendered points (full=6); rendered dates `2026-04-11, 2026-04-18, 2026-04-26, 2026-05-02`; both endpoints (04-04, 05-09) excluded.
Notes: Real from/to date-range filter (Balerion fix #1), not a stroke-filter substitution.

UIT-M3-008 — Clear the date range; full history returns without reload
Status: PASS
Screenshot: `…UIT-M3-008-date-range-cleared.png`
Visible evidence: After "Clear range" click, `mg-from`/`mg-to` empty and 6 points re-rendered without a page reload.

UIT-M3-009 — Members search narrows to swimmer A
Status: PASS
Screenshot: `…UIT-M3-009-search-narrowed.png`
Visible evidence: Search for memberA name returns 1 row on the Members screen.

UIT-M3-010 — Switch swimmers, no A leakage into B
Status: PASS
Screenshot: `…UIT-M3-010-switched-swimmer.png`
Visible evidence: After switching to memberB, modal heading shows `Graphs — Ben Chandler` and dot count drops to memberB's actual row count (1).

UIT-M3-011 — Mobile viewport 390x844
Status: PASS
Screenshot: `…UIT-M3-011-mobile-graph.png`
Visible evidence: SVG present, modal rendered at mobile width.

UIT-M3-012 — Tablet viewport 768x1024
Status: PASS
Screenshot: `…UIT-M3-012-tablet-graph.png`
Visible evidence: SVG present, controls readable.

UIT-M3-013 — Desktop viewport 1440x900
Status: PASS
Screenshot: `…UIT-M3-013-desktop-graph.png`
Visible evidence: SVG present, full-width layout.

UIT-M3-014 — Browser refresh after modal interactions
Status: PASS
Screenshot: `…UIT-M3-014-after-refresh.png`
Visible evidence: App surface re-mounts after reload (documented behavior: modals do not persist across reload by design).

UIT-M3-015 — Real browser back/forward
Status: PASS
Screenshot: `…UIT-M3-015-browser-back-forward.png`
Visible evidence: Actual `page.goBack()` then `page.goForward()` across full-page loads. After back: app present, body length 320+. After forward: app present, body length 320+. No new console errors introduced by either direction.
Notes: Balerion fix #2 — real back/forward, not a nav-cycle. WWSC is an SPA whose nav buttons do not call pushState, so the browser history stack holds the full-page `?cb=` loads; both directions reload the app document cleanly with no blank screen.

UIT-M3-016 — Export graph view
Status: NOT APPLICABLE
Screenshot: `…UIT-M3-016-export-na.png`
Visible evidence: Export is deferred to a later slice after QA-10 (CSV shape) is answered. This branch covers R-M3-05 only.
Notes: Balerion-authorized scope split per `REQUIREMENTS-M3-POINTSCORE-REPORTS.md` Section 6 + the `M3-QUESTIONS-AND-ASSUMPTIONS-2026-05-29.md` blocking matrix.

UIT-M3-017 — Print stylesheet
Status: PASS
Screenshot: `…UIT-M3-017-print-view.png`
Visible evidence: Print-media-emulated viewport still renders the SVG without clipping.

UIT-M3-018 — Null previous_best row defensive rendering
Status: PASS
Screenshot: `…UIT-M3-018-null-pb-row.png`
Visible evidence: SVG output contains zero `NaN | undefined | null` tokens (defensive numeric guards).

UIT-M3-019 — Data correctness vs API (exact point→row mapping)
Status: PASS
Screenshot: `…UIT-M3-019-data-correctness.png`
Visible evidence: Each rendered circle's `data-date` / `data-time-cs` / `data-pb-cs` / `data-is-break` was read and set-equality-compared against the API rows on the composite key `(stroke, date, time, previous_best, is_break)`. rendered=6, api=6, `exactMatch=true`.
Raw/log evidence: full mapping in `m3-data-correctness-mapping.json` (apiKeys vs renKeys arrays).
Notes: Balerion fix #3 — proves exact date/time/PB mapping, not just dot count.

UIT-M3-020 — Accessibility (keyboard + alt text)
Status: PASS
Screenshot: `…UIT-M3-020-a11y.png`
Visible evidence: Type picker is keyboard-focusable, stroke picker reachable, SVG `role="img"` and `aria-label="Time-trend graph"`.

## M1/M2 Regression on This Branch (R-M3-11)

Both M2 runners were re-executed on `dev/v2.10.0-m3-history-graphs` with `WWSC_E2E_EXPECTED_VERSION=2.10.0` so the version-pinned cases accept the bumped version:

| Runner | Result | Console errors | Raw log |
|---|---|---|---|
| `scripts/e2e-m2-time-history.cjs` | **55 PASS / 0 FAIL** | 0 | `docs/evidence/m2-time-history-run.log.m3-regression` |
| `scripts/e2e-m2-user-interaction-100.cjs` | **98 PASS / 2 NOT APPLICABLE / 0 FAIL / 0 BLOCKED** | 0 | `docs/evidence/m2-user-interaction-100-raw-2026-05-19.log.m3-regression` |

The M2 runner change to support `WWSC_E2E_EXPECTED_VERSION` is the only runner edit on this branch; it preserves the original 2.9.0 default for back-compat. Both runners produce identical PASS profiles on the 2.10.0 branch as they did on the 2.9.0 baseline.

## Out-of-Scope Guard (R-M3-12)

Per `git diff main..HEAD` on this branch, application source touched only:

- `src/public/index.html` — cache-bust `?v=2.9.0` → `?v=2.10.0` (17 tags) + one new `<script>` line for `member-graph.js`.
- `src/public/js/screens/members.js` — one new button "📈 Graphs" per row.
- `src/public/js/screens/member-graph.js` — new file, M3 R-M3-05 implementation.

NOT touched:

- `src/server.js`, `src/db.js`, `src/seed.js` — zero diff.
- `render.yaml` — zero diff.
- `package-lock.json` — zero diff (no new runtime dependencies; SVG is hand-rolled).

No multi-tenant / role / customer / access-control / commercial-deployment code was introduced. The R-M3-12 review is **clean**.

## UIT-M3 Cases Still PROVISIONAL (blocked on Bryan answers)

UIT-M3-021..029 (Pointscore engine), UIT-M3-031..040 (Weekly reports), UIT-M3-041..050 (Season standings), UIT-M3-051..060 (Reports export), UIT-M3-063, UIT-M3-064, UIT-M3-071..080 (Constitution accumulation), and UIT-M3-081..090 (Navigation/responsiveness/accessibility for those screens) remain PROVISIONAL.

They are blocked by QA-01 (pointscore formula), QA-05 (constitution doc), QA-06 (constitution rules) and the secondary QA-07..QA-13. See `M3-QUESTIONS-AND-ASSUMPTIONS-2026-05-29.md` "QA → UIT-M3 PROVISIONAL Unblock Map" for the full dependency.

This branch deliberately does NOT touch the PROVISIONAL areas — per Balerion's 2026-05-29 ambiguity rule "Only implement unambiguous items. Do not guess unresolved scoring/reporting/constitution behavior and then claim it as complete."

## Verdict for the R-M3-05 slice

**Ready for Balerion QA on UIT-M3-001..UIT-M3-020 + M2 regression + R-M3-08 documentation + R-M3-12 out-of-scope review.**

Carry-overs: every other R-M3 + every PROVISIONAL UIT-M3 case remains open and explicitly documented as such. They will be implemented in subsequent branches once Bryan answers QA-01 / QA-05 / QA-06 (the three critical blockers).
