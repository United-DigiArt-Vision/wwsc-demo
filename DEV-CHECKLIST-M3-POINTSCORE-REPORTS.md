# DEV CHECKLIST — M3 Pointscore / Reports / Constitution Accumulation

**Status:** PRD-phase checklist. None of the implementation tasks below may start until the corresponding open questions in `M3-QUESTIONS-AND-ASSUMPTIONS-2026-05-29.md` are answered (or Balerion explicitly authorizes a working assumption).

## Phase 0 — Project Truth (must complete before anything else)

- [x] Read Balerion's 2026-05-29 M3 handoff message.
- [x] Verify branch / commit / version / tag / remote against the claimed baseline.
- [x] Read the eight context messages listed in Balerion's handoff.
- [x] Confirm uncommitted continuity-doc-only modifications on `main` are documentation deltas, not code.
- [x] Branch `dev/m3-prd-planning` created from `main` for PRD/spec authoring (no code, no version bump yet).

## Phase 1 — Specification (THIS PHASE)

- [x] PRD: `REQUIREMENTS-M3-POINTSCORE-REPORTS.md`.
- [x] Acceptance checklist (this file).
- [x] Questions / assumptions: `M3-QUESTIONS-AND-ASSUMPTIONS-2026-05-29.md`.
- [ ] **Bryan answers to QA-01 / QA-05 / QA-06 received** — blocking gate for any pointscore/constitution code.
- [ ] Bryan answers to QA-02, QA-03, QA-04, QA-07, QA-08, QA-09, QA-10, QA-11, QA-12, QA-13 received.
- [ ] Design spec: `DESIGN-SPEC-M3-POINTSCORE-REPORTS.md`.
- [ ] Unit test spec: `UNIT-TEST-SPEC-M3-POINTSCORE-REPORTS.md`.
- [ ] Integration test spec: `INTEGRATION-TEST-SPEC-M3-POINTSCORE-REPORTS.md`.
- [ ] User-interaction test spec: `USER-INTERACTION-TEST-SPEC-M3-POINTSCORE-REPORTS.md`.

## Phase 2 — Per-Requirement Acceptance Gates

### R-M3-01 — Automated pointscore recording per event race

- [ ] On `POST /api/events/:eventId/finalize`, the server writes pointscore rows for every finished individual race lane (and for relay teams / members per QA-01 outcome).
- [ ] Unit test: row count after finalize equals expected count per race type for the configured formula.
- [ ] Idempotency test: re-finalize same event does not duplicate pointscore rows (mirrors the M2 `time_history` defense).
- [ ] Browser-E2E: open Results → finalize → screenshot shows new pointscore value(s) for at least one participant in the rendered UI.

### R-M3-02 — Pointscore accumulation per swimmer

- [ ] New API `GET /api/members/:memberId/pointscore` returns the running total + per-event breakdown for the configured season window.
- [ ] Unit test: known-fixture event seeds produce a verifiable accumulated total.
- [ ] Browser-E2E: open Members → swimmer → screenshot shows accumulated points + per-event breakdown.

### R-M3-03 — Constitution-based accumulation rules

- [ ] Constitution rules implemented exactly per Bryan's answer to QA-05 / QA-06 — not invented, not paraphrased.
- [ ] Pointscore rule banner (R-M3-10) shows the same wording as the implemented rule.
- [ ] Unit tests for each rule branch (e.g., "PB break bonus", "attendance bonus", "double-points race") with passing fixtures.

### R-M3-04 — Season pointscore standings report

- [ ] New screen `Pointscore` (or sub-screen under `Reports`) shows sortable table with columns confirmed via QA-07.
- [ ] Default sort = points DESC, then name ASC.
- [ ] Browser-E2E: load standings, screenshot of top 10 + tie/edge case rendering.

### R-M3-05 — Individual swimmer graph

- [ ] Graph view opens from Members → swimmer → "Graphs" action (or similar entry point per design spec).
- [ ] Each graph type confirmed via QA-08 is rendered with a labeled axis and data points sourced from `time_history`.
- [ ] Browser-E2E: per graph type, screenshot of the chart for memberA seeded with 4 dated events.
- [ ] Empty-state for swimmer without history.

### R-M3-06 — Internal reports

- [ ] One screen per report confirmed via QA-09.
- [ ] Each report navigable from a top-level "Reports" entry in nav.
- [ ] Browser-E2E: one screenshot per report in non-empty state + empty-state where applicable.

### R-M3-07 — CSV export

- [ ] Each dataset confirmed via QA-10 exports as `application/csv` with the columns from QA-11.
- [ ] Filename pattern is deterministic (e.g. `wwsc-time-history-YYYY-MM-DD.csv`).
- [ ] Browser-E2E: download triggered by click, file landed in headless browser's downloads dir, CSV parsed for header + at least one row.

### R-M3-08 — History retention policy

- [ ] Policy documented in `STABLE.md` + `REQUIREMENTS-M3-POINTSCORE-REPORTS.md` per QA-12.
- [ ] No code change unless QA-12 explicitly requires one.

### R-M3-09 — Print / PDF-friendly report output

- [ ] CSS `@media print` rules adjusted to hide non-report chrome (mirrors v2.8.1 / v2.8.2 print fit pattern).
- [ ] If PDF chosen per QA-13: a documented dependency added + a "Download PDF" button on each report screen + Browser-E2E screenshot of the PDF.

### R-M3-10 — Pointscore rules transparency banner

- [ ] Each ranked screen shows a banner explaining the rule in one sentence.
- [ ] Wording verified to match QA-01 / QA-06 answers.

### R-M3-11 — No regression on M1 + M2 surfaces

- [ ] `scripts/e2e-m2-time-history.cjs` returns 55 PASS / 0 FAIL on the M3 branch.
- [ ] `scripts/e2e-m2-user-interaction-100.cjs` returns 98 PASS / 2 NOT APPLICABLE / 0 FAIL / 0 BLOCKED.
- [ ] No new console errors.

### R-M3-12 — Out-of-scope guard (commercial/SaaS)

- [ ] Diff review confirms no new tenant/customer/access-control/role tables, columns, routes, or UI.
- [ ] `render.yaml` unchanged except for documented new env vars (none expected by current scope).
- [ ] No commercial-deployment scripts added.

## Phase 3 — Evidence Package (delivery gate)

The mandatory test target is `docs/tests/M3-USER-INTERACTION-TEST-SPEC-v3.0.0.md` (UIT-M3-001..UIT-M3-100). Evidence layout follows that spec verbatim:

- [ ] Per UIT case screenshots under `docs/screenshots/m3-user-interaction-v3.0.0/UIT-M3-###-<short>.png`.
- [ ] Data-correctness artifacts under `docs/evidence/m3-user-interaction-v3.0.0/`.
- [ ] Browser console / page-error capture for the full run.
- [ ] Final protocol formatted exactly as the spec's "Required Final Protocol Format" block (`UIT-M3-### — [title] / Status: … / Area: …`).
- [ ] Pass/Fail tally (PASS / FAIL / BLOCKED / PROVISIONAL / NOT APPLICABLE) — every count audited by UIT-M3-100 final-proof-gate case.
- [ ] Manual-expected-results sheet for the pointscore/constitution PROVISIONAL cases (UIT-M3-021..029, UIT-M3-035, UIT-M3-041, UIT-M3-044, UIT-M3-048, UIT-M3-051, UIT-M3-052, UIT-M3-063, UIT-M3-064, UIT-M3-071..080) — Balerion will verify these against the constitution rules answered via QA-05/QA-06.

Plus existing M2 regression rerun (separate, not a UIT-M3 case but enforced by R-M3-11):

- [ ] M2 regression rerun: `scripts/e2e-m2-time-history.cjs` (55 PASS / 0 FAIL on M3 branch).
- [ ] M2 100-case rerun: `scripts/e2e-m2-user-interaction-100.cjs` (98 PASS / 2 NA / 0 FAIL / 0 BLOCKED on M3 branch).

## Phase 4 — SSOT Closure (delivery gate)

- [ ] `package.json` bumped to the agreed M3 release (likely `2.10.0`) — V0014 first commit on the feature branch.
- [ ] `src/public/index.html` cache-bust matches `package.json`.
- [ ] `version/CHANGELOG.md` entry added.
- [ ] `version/CURRENT_STATE.md` updated.
- [ ] `PROGRESS.md` updated.
- [ ] `STABLE.md` updated only after Balerion sign-off + merge to `main`.
- [ ] Claude → Balerion delivery handoff message in `messages/`.

## Hard Guards (apply throughout)

- [ ] No push to `origin`.
- [ ] No `git tag` creation/move.
- [ ] No deploy.
- [ ] No contact with Bryan or any client.
- [ ] No live data mutation.
- [ ] No commercial/SaaS scope.
- [ ] No bypass of Balerion QA.
- [ ] No "done" claim before evidence + SSOT closure are both green.

## Blocking-Dependency Matrix

| Code requirement | Blocked by |
|---|---|
| R-M3-01 | QA-01 |
| R-M3-02 | QA-02, QA-03, QA-04 |
| R-M3-03 | QA-05, QA-06 |
| R-M3-04 | QA-07 + R-M3-02 done |
| R-M3-05 | QA-08 |
| R-M3-06 | QA-09 |
| R-M3-07 | QA-10, QA-11 |
| R-M3-08 | QA-12 (no code blocker unless policy = cap) |
| R-M3-09 | QA-13 |
| R-M3-10 | QA-01 + QA-06 |
| R-M3-11 | none (rerun-of-existing-suites) |
| R-M3-12 | none (review-level) |
