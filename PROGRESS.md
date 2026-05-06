# PROGRESS — WWSC Swimming App v2.8.12

## 🎯 AKTUELLER STATUS
Phase: 18 — Bryan v2.8.11 Response → v2.8.12 Final M1 Polish + Persistence
Schritt: v2.8.12 ist implementiert und lokal mit Browser-E2E + Persistence-Restart-Proof verifiziert. Branch ist `dev/v2.8.12-bryan-final-polish-persistence`. Noch nicht gemergt, nicht gepusht, nicht live deployed.
Blockiert: Live-Deploy/Render-Verifikation offen bis Dino Review/Freigabe.

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

## 📋 NÄCHSTER SCHRITT (sofort ausführbar)
Was: Evidence/Docs final committen, dann Dino Review. Danach erst Merge/Push/Render Deploy + Live `/api/version`/Browser-Verifikation.
Dateien zuerst lesen: `version/CURRENT_STATE.md`, `docs/evidence/WWSC-v2.8.12-bryan-browser-e2e-evidence.md`, `docs/evidence/WWSC-v2.8.12-persistence-restart-proof.md`.
Kriterium fertig: v2.8.12 ist auf `main` gemergt, getaggt, live deployed, `/api/version=2.8.12` live verifiziert, und Bryan-Antwort vorbereitet.

## ⚠️ OFFENE PUNKTE / SCOPE-GRENZEN
- Nicht gestartet: Pointscore/M3.
- Live Render persistent disk muss nach Deploy in Render/live verifiziert werden; lokal ist der gleiche Mechanismus mit `WWSC_DB_PATH` bewiesen.
- Wenn Render den persistent disk plan/config nicht automatisch akzeptiert, muss die Disk im Render Dashboard bestätigt/eingerichtet werden.

## 📊 FORTSCHRITT
Gesamt: 8/10 für v2.8.12 Delivery
Test Spec: 40 Cases
Browser-E2E/API Checks: 31 PASS / 0 FAIL
Persistence Restart Proof: 2 PASS / 0 FAIL
Syntax Checks: PASS
Live Deploy: offen
