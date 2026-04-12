# PROGRESS — WWSC Swimming App v2.8.0

## 🎯 AKTUELLER STATUS
Phase: 7 — Dino Acceptance Test / Hotfix Phase
Schritt: Pogo Variance Anzeige wurde im Runtime-Code gefixt (individuelle Variance pro Schwimmer statt Team-Variance). Tab-Absturz als OS-Gesten-Eingriff identifiziert. Test steht aus.
Blockiert: Nein — Warten auf erneuten Acceptance-Test durch Dino

## ✅ ERLEDIGT (mit Dateireferenz)
- [x] Phase 0: Workspace & State Verifikation (`git fetch`, Hard Reset auf `origin/main` - Stand v2.7.4).
- [x] Phase 1: PRD → `REQUIREMENTS.md` (R1 bis R20 erfasst; R17-R20 aus Acceptance ergänzt).
- [x] Phase 2: Design Spec → `DESIGN-SPEC.md` / `docs/DESIGN_SPEC.md` (aktive + Legacy-Logiken dokumentiert; Widersprüche sichtbar gemacht).
- [x] Phase 3a: Test-Spec-Ausbau → `USER-INTERACTION-TEST-SPEC.md` (UI-TC-1 bis UI-TC-168 vorhanden).
- [x] Phase 4: Claude-Handoffs für R17/R20 und Konsolidierung erstellt (`messages/2026-04-10-*.md`).
- [x] Acceptance Finding: R17 live von Dino im Browser verifiziert — 25m Brace zeigt jetzt nur noch eine 25m-Variante.
- [x] Interim Delivery Note: Diese Verbesserung kommt in die nächste Bryan-Nachricht.
- [x] Phase 6.5: Pre-Delivery Browser Sweep (TC-69 bis TC-168) — 99 PASS / 0 FAIL / 1 DOC-AMBIGUITY.
- [x] Phase 6.5 gesamt (TC-01 bis TC-168): 160 PASS / 0 FAIL / 1 TEST-BUG / 1 DOC-AMBIGUITY.
- [x] Runtime wieder online gebracht über direkten Start mit `node src/server.js` im Pfad `temp/wwsc-v280-runtime`; Test-URL war wieder erreichbar.
- [x] Dino hat live bestätigt: Bei Pogo speichern T1/T2 für Teilnehmer 1 und 2 korrekt und getrennt.
- [x] Pogo Variance Anzeige-Bug isoliert (renderte Team-Variance statt Swimmer-Variance). Code in `results.js` korrigiert. Test-Server läuft wieder.

## 📋 NÄCHSTER SCHRITT (sofort ausführbar)
Was: Dino führt den letzten finalen Acceptance-Test im Pogo Results Screen durch.
Datei lesen: N/A
Kriterium fertig: Dino gibt "grünes Licht", dann Version taggen und ausliefern.

## ⚠️ OFFENE PUNKTE / BLOCKER
- **R20 (DOC-AMBIGUITY / TC-148):** Ranking-Logik für Special Races (Brace / Medley / Pogo) — App nutzt `fastest_total_time`, Legacy-Doku sagt `nearest-to-target`. Bryan-Bestätigung erforderlich.
- **R18:** Medley-Leftover für einzelnen gültigen Teilnehmer — Fachfrage an Bryan offen.
- **Release-Gate:** Warten auf Dinos finales Go nach dem Variance-Fix.

## 📊 FORTSCHRITT
Gesamt: 8.5/10 Schritte
Unit Tests: legacy vorhanden / nicht Fokus dieser Runde
Integration Tests: legacy vorhanden / teilweise überholt
UI Tests: 168 spezifiziert / 160 PASS / 0 FAIL / 1 TEST-BUG / 1 DOC-AMBIGUITY + neuer Acceptance-Befund offen
Console Errors: unbekannt für den neuen Pogo-Befund — morgen explizit prüfen
