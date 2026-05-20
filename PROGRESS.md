# PROGRESS — WWSC v2.9.0 M2 Time History

## 🎯 AKTUELLER STATUS
Phase: M2 v2.9.0 live-delivered to Bryan; Bryan replied with graph/report question
Schritt: Bryan asked on 2026-05-20 whether individual graphs can be created from the history report/data. Inbound archived and classified as M3 / reports-graphs scope question, not an M2 bug and not explicit M2 acceptance. Draft response prepared.
Blockiert: No technical blocker. Next action is client response handling while preserving the M2/M3 payment boundary.

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

## 📋 NÄCHSTER SCHRITT (sofort ausführbar)
Was: Send/adjust the prepared response to Bryan's graph/history-data question, then continue seeking M2 acceptance/payment boundary clarity.
Dateien zuerst lesen: `version/CURRENT_STATE.md`, `PROGRESS.md`, `../messages/2026-05-20-Bryan-inbound-graphs-history-question.md`, `../messages/2026-05-20-draft-to-bryan-graphs-history-question.md`.
Kriterium fertig: Bryan confirms M2 acceptance/release, funds/starts M3 reporting work, or provides a concrete in-scope M2 issue to address.

## ⚠️ OFFENE PUNKTE / SCOPE-GRENZEN
- Pointscore/M3 ist explizit ausgeschlossen. (verified clean by `UI-M2-G01` scan)
- Reports/graphs/constitution scoring sind explizit ausgeschlossen.
- Stable M1/v2.8.12 unverändert (backup-Branch und File-Snapshot existieren).
- **Keine Carry-overs mehr.** `UI-M2-F06` / `UI-M2-F08` / `UI-M2-C04` sind unter ausführbarer Browser-Evidenz geschlossen.

## 📊 FORTSCHRITT
Dev-loop preparation: 6/6 spec artifacts
Implementation: 9/9 checklist tasks done
Browser-E2E evidence: 55 PASS / 0 FAIL / 0 console errors (Full-Proof Rerun)
Expanded user-interaction screenshot spec: 98 PASS / 2 NOT APPLICABLE / 0 FAIL / 0 BLOCKED, 101 screenshots, Balerion V0015 review complete
Quality gate: local `main` post-merge verification complete; 100-case screenshot proof accepted; Render live-smoke passed; Bryan update sent; graph/report scope question received and draft response prepared
