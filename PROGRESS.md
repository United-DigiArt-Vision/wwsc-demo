# PROGRESS — WWSC v2.9.0 M2 Time History

## 🎯 AKTUELLER STATUS
Phase: M2 V0015 independent verification complete — ready for controlled merge/deploy sequence
Schritt: Balerion independently reproduced the Full-Proof M2 runner on branch `dev/v2.9.0-m2-time-history` at HEAD `b5b99e2`. Re-run produced **55 PASS / 0 FAIL**. Every relevant M2 spec case is classified as PROVEN; no NOT PROVEN items remain for the agreed release gate. Verification note: `../messages/2026-05-18-0752-Balerion-V0015-M2-Full-Proof-Verification.md`.
Blockiert: Nein. Next controlled step is merge `dev/v2.9.0-m2-time-history` -> `main`, deploy, live smoke, then Bryan update.

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
Was: Controlled release sequence — merge `dev/v2.9.0-m2-time-history` into `main`, deploy to Render, verify `/api/version` reports `2.9.0`, run live smoke, then prepare Bryan update.
Dateien zuerst lesen: `../messages/2026-05-18-0752-Balerion-V0015-M2-Full-Proof-Verification.md`, `version/CURRENT_STATE.md`, `version/CHANGELOG.md`.
Kriterium fertig: Live v2.9.0 smoke passes and Bryan update draft/sent-confirmed is archived.

## ⚠️ OFFENE PUNKTE / SCOPE-GRENZEN
- Pointscore/M3 ist explizit ausgeschlossen. (verified clean by `UI-M2-G01` scan)
- Reports/graphs/constitution scoring sind explizit ausgeschlossen.
- Stable M1/v2.8.12 unverändert (backup-Branch und File-Snapshot existieren).
- **Keine Carry-overs mehr.** `UI-M2-F06` / `UI-M2-F08` / `UI-M2-C04` sind unter ausführbarer Browser-Evidenz geschlossen.

## 📊 FORTSCHRITT
Dev-loop preparation: 6/6 spec artifacts
Implementation: 9/9 checklist tasks done
Browser-E2E evidence: 55 PASS / 0 FAIL / 0 console errors (Full-Proof Rerun)
Quality gate: Balerion V0015 independent verification complete; ready for merge/deploy/live-smoke
