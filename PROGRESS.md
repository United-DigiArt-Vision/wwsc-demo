# PROGRESS — WWSC Swimming App v2.8.12

## 🎯 AKTUELLER STATUS
Phase: 18 — Bryan v2.8.11 Response → v2.8.12 Final M1 Polish + Persistence
Schritt: v2.8.12 ist auf `main` gemergt, getaggt, gepusht und live auf Render verifiziert. `/api/version` = `2.8.12`, Build `2026-05-06T12:12:59.088Z`.
Blockiert: Nein für diese Delivery; Bryan-Nachricht ist als Draft vorzubereiten/zu senden.

## ✅ ERLEDIGT (mit Dateireferenz)
- [x] Bryan Response Teil 1 archiviert: `../messages/2026-05-06-Bryan-inbound-v2811-response-part1.md`.
- [x] Bryan Response Teil 2 + Screenshots archiviert: `../messages/2026-05-06-Bryan-inbound-v2811-response-part2.md`.
- [x] Combined Classification geschrieben: `../messages/2026-05-06-bryan-v2811-response-combined-classification.md`.
- [x] Branch angelegt: `dev/v2.8.12-bryan-final-polish-persistence`.
- [x] Version-bump-first commit: `79eb9cc` → `package.json=2.8.12`, cache bust `?v=2.8.12`.
- [x] User-Test-Spec VOR Implementierung geschrieben: `USER-INTERACTION-TEST-SPEC-v2.8.12.md` mit 40 User-Testcases.
- [x] Test-Spec commit: `5562ec4`.
- [x] Fix 1: Medley Relay Readout zeigt signed Variance + Members/Strokes.
- [x] Fix 2: Season Calendar Event Details zeigen 25m Relay + Medley Relay Team Members und Variance.
- [x] Fix 3: Event Report Relay-Abschnitte zeigen Team Members + Team Total + Variance.
- [x] Fix 4: 25m Break threshold auf >= 0.50s gesetzt; 0.49s bleibt kein Break; 50m 0.50s bleibt Regression-Guard kein Break.
- [x] Fix 5: Persistenz gehärtet via `WWSC_DB_PATH`, `WWSC_DATA_DIR`, `WWSC_BACKUP_DIR`; Render config setzt `/var/data/wwsc.db` + persistent disk.
- [x] Implementation commit: `2321284`.
- [x] Syntaxchecks: `src/db.js`, `src/server.js`, `src/public/js/screens/results.js`, `src/public/js/screens/calendar.js`, `scripts/e2e-v2812-bryan.cjs` — PASS.
- [x] Browser-E2E mit installiertem Chrome/Playwright: `scripts/e2e-v2812-bryan.cjs` — 31 PASS / 0 FAIL.
- [x] Browser-E2E Evidence: `docs/evidence/WWSC-v2.8.12-bryan-browser-e2e-evidence.md`.
- [x] Raw Browser-E2E Log: `docs/evidence/WWSC-v2.8.12-browser-e2e-raw.log`.
- [x] Screenshots/Text/HTML Evidence: `docs/screenshots/v2.8.12-bryan/`.
- [x] Persistence Restart Proof: Server mit gleicher `/tmp/wwsc-v2812-data/wwsc.db` neu gestartet; 2 finalized active events blieben erhalten.
- [x] Persistence Evidence: `docs/evidence/WWSC-v2.8.12-persistence-restart-proof.md` + raw log.
- [x] Merge to main: `596458f` (`merge: v2.8.12 Bryan final polish and persistence`).
- [x] Release docs commit/tag: `b082d25`, tag `v2.8.12`.
- [x] GitHub push: `main 2b60cad..b082d25`, tag `v2.8.12`.
- [x] Render live verification: `/api/version` returned `2.8.12`, build `2026-05-06T12:12:59.088Z`.
- [x] Live browser snapshot: sidebar shows `v2.8.12` and matching build timestamp.

## 📋 NÄCHSTER SCHRITT (sofort ausführbar)
Was: Bryan-Antwort an Dino liefern/senden.
Dateien zuerst lesen: `messages/2026-05-06-draft-to-bryan-v2812-live.md`, `version/CURRENT_STATE.md`.
Kriterium fertig: Bryan hat die v2.8.12-Live-Info mit detaillierten Änderungen seit seiner letzten Rückmeldung erhalten.

## ⚠️ OFFENE PUNKTE / SCOPE-GRENZEN
- Nicht gestartet: Pointscore/M3.
- Live `/api/events?archived=1` returns `[]` after persistent disk switch. This is acceptable for forward persistence but means old ephemeral saved test/demo events were not migrated.
- Do not create test events on Bryan's live demo just to prove persistence unless Dino explicitly approves polluting/resetting live demo data.

## 📊 FORTSCHRITT
Gesamt: 10/10 für v2.8.12 Delivery
Test Spec: 40 Cases
Browser-E2E/API Checks: 31 PASS / 0 FAIL
Persistence Restart Proof: 2 PASS / 0 FAIL
Syntax Checks: PASS
Live Deploy: PASS (`/api/version=2.8.12`)
