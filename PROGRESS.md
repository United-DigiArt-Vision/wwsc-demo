# PROGRESS — WWSC v2.9.0 M2 Released / M3 Kickoff

## 🎯 AKTUELLER STATUS
Phase: M2 v2.9.0 released/paid by Bryan; M3 commissioned/authorized
Schritt: R-M3-05 Individual Swimmer History Graphs is accepted PASS. Dino/Nedim sent Bryan the M3 Pointscore / Constitution clarification questions on 2026-05-29 ~22:15 Europe/Berlin. Bryan gave a partial answer on 2026-06-02: keep event points separate and combine by simple addition for monthly and season overall winners. Dino/Nedim then sent Bryan a transparent assumptions message: proceed using event-separated points, monthly/season totals by simple addition, existing Excel pointscore sheets as the working scoring source, and adjust later if a separate Constitution rule differs. Balerion remains orchestrator/quality gate; Claude Code implements only after scoped directives.
Blockiert: Do not block on another Bryan clarification round. Implement M3 pointscore under the assumptions sent to Bryan, while keeping formula/season/Constitution behavior isolated and adjustable. Do not claim Constitution rules are confirmed. M1/M2/v2.9.0 accepted baseline behavior is protected.

## 🆕 M3 POINTSCORE SLICE — IMPLEMENTED + TESTED (2026-06-03, awaiting Balerion QA)

Implemented per Balerion's 2026-06-03 06:45 directive under Bryan's 2026-06-02 working assumptions. Engine commit `219bdd9`; CSV-route refactor + test suite + specs + SSOT committed on `dev/v2.10.0-m3-history-graphs` (resolve HEAD dynamically). The prior session completed implementation + ran the evidence but hit its context limit mid-closure; this slice was re-verified first-hand and closed out in a fresh session.

- [x] Isolated scoring engine `src/pointscore.js` (adjustable POINTSCORE_RULES 5/4/3/2 + 3/2/1; reads accepted results; writes only `pointscore_entry`; `WWSC_POINTSCORE_DISABLED` switch).
- [x] Additive finalize hook + read APIs + CSV exports (`src/server.js`); `🎯 Pointscore` UI screen (`src/public/js/screens/pointscore.js`, nav in `sidebar.js`/`app.js`).
- [x] Excel scoring source extracted + source-labeled: `scripts/extract-pointscore.py`, `docs/evidence/m3-pointscore/POINTSCORE-RULE-SOURCE-2026-06-03.md`.
- [x] Specs: `DESIGN-SPEC` / `UNIT-TEST-SPEC` / `INTEGRATION-TEST-SPEC` / `REQUIREMENT-TEST-EVIDENCE-MATRIX` (M3 pointscore); `DEV-CHECKLIST-M3` → IMPLEMENTED.
- [x] Unit/API: `scripts/test-m3-pointscore-unit.cjs` = 12 PASS / 0 FAIL (incl. UT9 unknown-race_type → individual).
- [x] Isolation proof: `scripts/e2e-m3-pointscore-isolation.cjs` = PASS (accepted flow byte-identical with pointscore on/off).
- [x] 120-case browser suite: `scripts/e2e-m3-pointscore-120.cjs` = 114 PASS / 6 NA / 0 FAIL / 0 BLOCKED (clean-HEAD evidence in `docs/evidence/m3-user-interaction-v3.0.1/`, 64 screenshots).
- [x] Regression: M2 55/0, M2 100 = 98/2/0/0, R-M3-05 history-graphs 19/1/0; out-of-scope guard clean.
- [ ] Balerion V0015 QA of the evidence package — pending.
- [ ] `STABLE.md` update + merge to `main` + deploy — only after Balerion sign-off.

## ✅ ERLEDIGT (mit Dateireferenz)
- [x] M2 activated/funded evidence: `../messages/2026-05-18-Bryan-M2-active-funded.md`.
- [x] M2 scope-confirmation sent/evidence: `../messages/2026-05-18-outgoing-to-bryan-m2-scope-confirmation-sent-confirmed.md`.
- [x] Stable M1 file backup: `../backups/2026-05-18-0615-v2.8.12-m1-stable-origin-main/`.
- [x] Stable M1 git backup branch: `backup/v2.8.12-m1-stable-20260518` at `eb87e11`.
- [x] M2 feature branch: `dev/v2.9.0-m2-time-history`.
- [x] Version bump first commit: `aa004be` (`2.9.0`).
- [x] Requirements: `REQUIREMENTS-M2-TIME-HISTORY.md`.
- [x] Design: `DESIGN-SPEC-M2-TIME-HISTORY.md`.
- [x] Unit tests: `UNIT-TEST-SPEC-M2-TIME-HISTORY.md`.
- [x] Integration tests: `INTEGRATION-TEST-SPEC-M2-TIME-HISTORY.md`.
- [x] User interaction tests: `USER-INTERACTION-TEST-SPEC-M2-TIME-HISTORY.md`.
- [x] Dev checklist: `DEV-CHECKLIST-M2-TIME-HISTORY.md`.
- [x] T1 API enrichment (`event_date` on event time-history). `src/server.js`.
- [x] T2 New member time-history endpoint. `src/server.js`.
- [x] T3 Frontend API wrapper. `src/public/js/api.js`.
- [x] T4 Members screen History action + modal. `src/public/js/screens/members.js`.
- [x] T5 Calendar/Event-detail Time History section. `src/public/js/screens/calendar.js`.
- [x] T6 Automated E2E runner. `scripts/e2e-m2-time-history.cjs`.
- [x] T7 M1 regression smoke executed inside the E2E run (dashboard + 6 screens + console gate).
- [x] Browser-E2E evidence: `docs/evidence/m2-time-history-run.log`, `docs/evidence/m2-time-history-console-errors.log`, `docs/screenshots/m2-time-history/` (9 PNGs).
- [x] Test protocol + coverage matrix: `USER-INTERACTION-TEST-PROTOCOL-M2-TIME-HISTORY.md`, `USER-INTERACTION-COVERAGE-MATRIX-M2-TIME-HISTORY.md`.
- [x] T8 CHANGELOG + CURRENT_STATE updated.
- [x] T9 Final SSOT completion commit (delivery close).
- [x] Expanded 100-case screenshot user-interaction spec: `USER-INTERACTION-TEST-SPEC-M2-TIME-HISTORY.md`.
- [x] Claude Code execution handoff for 100-case spec: `../messages/2026-05-19-Balerion-To-Claude-M2-100-user-interaction-screenshot-test-spec.md`.
- [x] Claude Code 100-case execution handoff: `../messages/2026-05-19-Claude-To-Balerion-M2-100-case-screenshot-handoff.md`.
- [x] 100-case screenshot evidence package: `docs/evidence/m2-user-interaction-100-test-protocol-2026-05-19.md`, `docs/evidence/m2-user-interaction-100-raw-2026-05-19.log`, `docs/evidence/m2-user-interaction-100-records.json`, `docs/screenshots/m2-user-interaction-100/` (101 PNGs).
- [x] Balerion V0015 review of 100-case evidence: `../messages/2026-05-19-Balerion-V0015-M2-100-case-screenshot-review.md`.
- [x] Local installation/backup handover addendum created after Dino asked whether Bryan's handbooks explain local install/run requirements: `../handover/MS2-handover-2026-05-19/WWSC-Local-Installation-and-Backup-Guide-2026-05-19.pdf` plus source `.md`/`.html`.
- [x] Future handbook requirement locked in: `../handover/HANDBOOK-REQUIREMENTS.md` now requires local install, SQLite licence/runtime notes, local data storage, backups, and troubleshooting in every future customer handbook.
- [x] v2.9.0 / M2 delivery update sent to Bryan by Dino and archived: `../messages/2026-05-19-outgoing-to-bryan-v290-m2-delivery-sent-confirmed.md`.
- [x] Bryan graph/history-data question archived: `../messages/2026-05-20-Bryan-inbound-graphs-history-question.md`.
- [x] Screenshot archived: `../messages/attachments/2026-05-20-upwork-bryan-graphs-history-question.png`.
- [x] Reply draft prepared: `../messages/2026-05-20-draft-to-bryan-graphs-history-question.md`.
- [x] Bryan next-step question archived: `../messages/2026-05-21-Bryan-inbound-what-do-you-need-now.md`.
- [x] Screenshot archived: `../messages/attachments/2026-05-21-upwork-bryan-what-do-you-need-now.png`.
- [x] Reply draft prepared: `../messages/2026-05-21-draft-to-bryan-next-needed-m2-acceptance-m3-gate.md`.
- [x] Dino sent M2 acceptance request / M3 gate reply to Bryan: `../messages/2026-05-21-outgoing-to-bryan-m2-acceptance-request-sent-confirmed.md`.
- [x] Sent screenshot archived: `../messages/attachments/2026-05-21-upwork-outgoing-bryan-m2-acceptance-request-sent.png`.
- [x] Bryan M2 "is met" + production/commercial questions archived: `../messages/2026-05-23-Bryan-inbound-m2-met-production-questions.md`.
- [x] Dino sent final M2 release / commercial production boundary reply: `../messages/2026-05-23-outgoing-to-bryan-commercial-scope-boundary-sent-confirmed.md`.
- [x] Dino confirmed on 2026-05-29 11:04 Europe/Berlin: Bryan paid/released M2 and commissioned M3.
- [x] Claude Code M3 development handoff created: `../messages/2026-05-29-1105-Balerion-To-Claude-WWSC-M3-Development-Handoff.md`.
- [x] Mandatory M3 user-interaction proof spec created: `docs/tests/M3-USER-INTERACTION-TEST-SPEC-v3.0.0.md` (100 cases).
- [x] Claude Code M3 handoff amended to require the spec before implementation signoff.
- [x] M3 Phase-1 baseline verification (branch=main, HEAD 7b4dcc5, origin/main 3f22593, tag v2.9.0=8d167fd, package.json 2.9.0) — matches Balerion's claimed baseline.
- [x] M3 PRD authored on branch `dev/m3-prd-planning`: `REQUIREMENTS-M3-POINTSCORE-REPORTS.md` (R-M3-01..R-M3-12 + Cross-Reference to UIT-M3-001..UIT-M3-100).
- [x] M3 acceptance checklist: `DEV-CHECKLIST-M3-POINTSCORE-REPORTS.md` (per-requirement gates + blocking-dependency matrix + evidence layout that matches the UIT-M3 spec's Required Final Protocol Format).
- [x] M3 questions and assumptions: `M3-QUESTIONS-AND-ASSUMPTIONS-2026-05-29.md` (QA-01..QA-13 + QA → UIT-M3 PROVISIONAL unblock map).
- [x] Claude → Balerion PRD-phase handoff: `../messages/2026-05-29-Claude-To-Balerion-WWSC-M3-PRD-Handoff.md`.
- [x] Balerion 2026-05-29 12:10 "You Are Next" implementation directive received: `../messages/2026-05-29-1210-Balerion-To-Claude-WWSC-M3-You-Are-Next.md`.
- [x] M3 V0014 first commit on feature branch: `7712067` bumps to v2.10.0 on `dev/v2.10.0-m3-history-graphs`.
- [x] R-M3-05 implementation: `src/public/js/screens/member-graph.js` + Members "📈 Graphs" action + script tag. Commit `6283ce6`.
- [x] R-M3-05 E2E runner: `scripts/e2e-m3-history-graphs.cjs` (commit `7f7a0a3`).
- [x] R-M3-05 evidence: 19 PASS / 1 NA (UIT-M3-016 deferred) / 0 FAIL / 0 PROVISIONAL, 0 console errors, 20 screenshots under `docs/screenshots/m3-user-interaction-v3.0.0/`, protocol at `docs/evidence/m3-user-interaction-v3.0.0/m3-history-graphs-protocol.md`.
- [x] R-M3-08 history retention policy documentation: `docs/M3-HISTORY-RETENTION-POLICY.md` (QA-12 working answer).
- [x] R-M3-11 M2 regression rerun on M3 branch with `WWSC_E2E_EXPECTED_VERSION=2.10.0`: 55 PASS / 0 FAIL (`e2e-m2-time-history`) + 98 PASS / 2 NA / 0 FAIL (`e2e-m2-user-interaction-100`). Logs archived as `docs/evidence/m2-*.log.m3-regression`.
- [x] R-M3-12 out-of-scope code review: clean (`src/server.js`, `src/db.js`, `src/seed.js`, `render.yaml`, `package-lock.json` all untouched).
- [x] Claude → Balerion delivery handoff (R-M3-05 slice): `../messages/2026-05-29-Claude-To-Balerion-WWSC-M3-History-Graphs-Delivery.md`.
- [x] R-M3-05 accepted PASS after clean-HEAD evidence rerun and Balerion QA.
- [x] Accepted/paid/deployed M2 baseline backup created: `../backups/2026-05-29-v2.9.0-accepted-paid-deployed/`.
- [x] Forward-build guardrail established: M1/M2/v2.9.0 accepted behavior is protected; M3 must build additively and not guess unknown rules.
- [x] Dino/Nedim sent Bryan the M3 Pointscore / Constitution clarification questions on 2026-05-29 ~22:15 Europe/Berlin; sent-confirmed record: `../messages/2026-05-29-outgoing-to-bryan-m3-pointscore-constitution-questions-sent-confirmed.md`.
- [x] Bryan's 2026-06-02 partial pointscore answer archived and mapped: `../messages/2026-06-02-Bryan-inbound-m3-event-separated-month-season-addition.md`.
- [x] Dino/Nedim sent Bryan the M3 pointscore assumptions message after deciding not to chase another clarification round: `../messages/2026-06-02-outgoing-to-bryan-m3-pointscore-assumptions-sent-confirmed.md`.
- [x] Balerion prepared the strict M3 pointscore Claude Code directive: `../messages/2026-06-03-0645-Balerion-To-Claude-WWSC-M3-Pointscore-Implementation-Directive.md`.
- [x] Balerion prepared the mandatory 120-case M3 user-interaction test spec: `USER-INTERACTION-TEST-SPEC-M3-POINTSCORE-REPORTS-v3.0.1.md`.

## 📋 NÄCHSTER SCHRITT (sofort ausführbar)
Was: Give Claude Code `../messages/2026-06-03-0645-Balerion-To-Claude-WWSC-M3-Pointscore-Implementation-Directive.md` and require execution against `USER-INTERACTION-TEST-SPEC-M3-POINTSCORE-REPORTS-v3.0.1.md` (120 cases). Claude must implement pointscore under the assumptions already sent to Bryan: event-separated points, monthly/season totals by simple addition, existing Excel pointscore sheets as working scoring source, Constitution differences adjustable later. Require isolated/configurable scoring logic, browser E2E evidence, no v2.9.0 baseline regressions, no push/deploy/tag/client contact/live-data mutation.

Dateien zuerst lesen: `../messages/2026-06-03-0645-Balerion-To-Claude-WWSC-M3-Pointscore-Implementation-Directive.md`, `USER-INTERACTION-TEST-SPEC-M3-POINTSCORE-REPORTS-v3.0.1.md`, `../messages/2026-06-02-Bryan-inbound-m3-event-separated-month-season-addition.md`, `../messages/2026-06-02-outgoing-to-bryan-m3-pointscore-assumptions-sent-confirmed.md`, `M3-QUESTIONS-AND-ASSUMPTIONS-2026-05-29.md`, `REQUIREMENTS-M3-POINTSCORE-REPORTS.md`, `DEV-CHECKLIST-M3-POINTSCORE-REPORTS.md`, `M3-FORWARD-BUILD-GUARDRAIL-2026-05-29.md`.
Kriterium fertig (current gate): Claude receives and executes the directive; final handoff includes implementation evidence, 120-case UI protocol, raw logs, screenshot manifest, M2/M3 regression results, pointscore isolation proof, and explicit no-push/no-deploy/no-tag/no-client-contact statement.

## ⚠️ OFFENE PUNKTE / SCOPE-GRENZEN
- M3 is now commissioned, but exact implementation must be scoped from project messages before coding. If acceptance criteria are incomplete, Claude's first deliverable is the PRD/acceptance checklist/questions list.
- The 100-case M3 user-interaction spec is mandatory; if PRD scope changes, Claude must update the spec before final test execution.
- Pointscore/reports/graphs/constitution scoring are M3, not retroactive M2. Bryan's 2026-06-02 answer partially clarified event-separated points plus monthly/season addition; Dino/Nedim then sent Bryan the working assumptions. Implementation may proceed under those sent assumptions, but Constitution-specific behavior remains "adjustable later" unless Bryan provides a separate Constitution document.
- Commercial hosted version / multiple clubs / customer isolation / backups / access control / maintenance remain separate commercial/productization scope, not automatic M3.
- Stable M1/v2.8.12 unverändert (backup-Branch und File-Snapshot existieren).
- **Keine Carry-overs mehr.** `UI-M2-F06` / `UI-M2-F08` / `UI-M2-C04` sind unter ausführbarer Browser-Evidenz geschlossen.
- Safety: no push to origin, no deploy, no tag, no Bryan/client contact, no live data mutation unless explicitly authorized by Dino/Balerion.

## 📊 FORTSCHRITT
Dev-loop preparation: 6/6 spec artifacts
Implementation: 9/9 checklist tasks done
Browser-E2E evidence: 55 PASS / 0 FAIL / 0 console errors (Full-Proof Rerun)
Expanded user-interaction screenshot spec: 98 PASS / 2 NOT APPLICABLE / 0 FAIL / 0 BLOCKED, 101 screenshots, Balerion V0015 review complete
Quality gate: local `main` post-merge verification complete; 100-case screenshot proof accepted; Render live-smoke passed; Bryan update sent; Bryan M2 acceptance/payment now confirmed by Dino; M3 commissioned; R-M3-05 accepted PASS; M2 accepted/paid/deployed backup created; Bryan clarification questions sent; Bryan partial aggregation answer archived/mapped; Dino/Nedim sent the follow-up assumptions message; Balerion prepared constrained Claude Code pointscore directive plus 120-case v3.0.1 UI proof spec; next action is to hand this to Claude Code. Balerion QA remains required before any delivery/deploy/client communication.

## 2026-05-29 22:30 Resume Note

Bryan's 2026-06-02 reply is archived and mapped as a partial answer. Dino/Nedim then sent Bryan the assumptions message, so we are no longer waiting for another clarification round before pointscore work. Next: release a constrained M3 pointscore directive to Claude Code under the sent assumptions: event-separated points, monthly/season totals by simple addition, existing Excel pointscore sheets as working scoring source, separate Constitution differences adjustable later. Do not invent Constitution rules or hard-code them as confirmed truth.

Protect the accepted/paid/deployed `v2.9.0` / M1 / M2 baseline, especially Race/Heat/Breaker/Ranking/Time-History behavior. Restore/comparison backup: `../backups/2026-05-29-v2.9.0-accepted-paid-deployed/`, source `v2.9.0` commit `8d167fdcc787f663c7b4168d32096ff5baa66b35`.

Last known Claude Code state: branch `dev/v2.10.0-m3-history-graphs`, HEAD `79751e6`, R-M3-05 PASS, guardrail accepted, no push/deploy/tag/Bryan contact. Next evidence gate must include browser E2E flows, raw logs, screenshots/traces, console-error check, and Requirement -> Test -> Evidence mapping.
