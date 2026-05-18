# PROGRESS — WWSC v2.9.0 M2 Time History

## 🎯 AKTUELLER STATUS
Phase: M2 Phase 4 complete + Full-Proof Rerun — all carry-overs closed under executable browser evidence
Schritt: After Balerion's `M2-Full-Proof-Required` brief, the runner was extended to cover `UI-M2-F06` (relay readout), `UI-M2-F08` (archive/restore), `UI-M2-C04` (cross-process server restart) and seven additional explicit cases. Re-run produced **55 PASS / 0 FAIL** with 0 console errors. Every spec case is now classified as PROVEN with concrete evidence anchors. Harness bootstrap script (`scripts/setup-m2-harness.sh`) added for reproducibility.
Blockiert: Nein. Awaiting Balerion's V0015 independent re-run on this branch.

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

## 📋 NÄCHSTER SCHRITT (sofort ausführbar)
Was: Balerion V0015 independent re-run after the Full-Proof Rerun — `./scripts/setup-m2-harness.sh && node scripts/e2e-m2-time-history.cjs`, expect 55 PASS / 0 FAIL. Confirm by diff that no app-source modification happened in this rerun (runner + harness + docs only) and that the `UI-M2-F06`/`UI-M2-F08`/`UI-M2-C04` cases are now PROVEN with screenshots + log lines.
Dateien zuerst lesen: `USER-INTERACTION-TEST-PROTOCOL-M2-TIME-HISTORY.md`, `USER-INTERACTION-COVERAGE-MATRIX-M2-TIME-HISTORY.md`, `docs/evidence/m2-time-history-run.log`, `../messages/2026-05-18-Claude-To-Balerion-M2-Full-Proof-Handoff.md`, `version/CHANGELOG.md`, `version/CURRENT_STATE.md`, `DEV-CHECKLIST-M2-TIME-HISTORY.md`.
Kriterium fertig: Balerion V0015 reproduce + sign-off → merge to main → Render deploy → Dino → Bryan.

## ⚠️ OFFENE PUNKTE / SCOPE-GRENZEN
- Pointscore/M3 ist explizit ausgeschlossen. (verified clean by `UI-M2-G01` scan)
- Reports/graphs/constitution scoring sind explizit ausgeschlossen.
- Stable M1/v2.8.12 unverändert (backup-Branch und File-Snapshot existieren).
- **Keine Carry-overs mehr.** `UI-M2-F06` / `UI-M2-F08` / `UI-M2-C04` sind unter ausführbarer Browser-Evidenz geschlossen.

## 📊 FORTSCHRITT
Dev-loop preparation: 6/6 spec artifacts
Implementation: 9/9 checklist tasks done
Browser-E2E evidence: 55 PASS / 0 FAIL / 0 console errors (Full-Proof Rerun)
Quality gate: ready for Balerion V0015 independent re-run
