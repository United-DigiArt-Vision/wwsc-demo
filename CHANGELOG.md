# CHANGELOG — WWSC Swimming App

## v2.7.4 (2026-04-08)

### Features (Bryan Feedback)
- **Brace Relay Layout:** Kompaktes lane-basiertes Layout (eine Zeile pro Pair statt ausufernde Team-Karten)
- **Brace Start=2:** Alle Brace Teams starten bei 2 (flat, wie Medley/Pogo)
- **Brace Teilnahme:** Y+N beide im Brace (Standard Distance, kein Special Filter)
- **Brace keine Breakers:** Gewinner = lowest variance overall
- **Relay Team Count:** <11 Swimmer = 2 Teams, >=11 = 3 Teams (statt >30=4, sonst 3)

---

## v2.7.3 (2026-04-07)

### Features
- **Pogo 2-Timekeeper UI:** Relays + Results zeigen T1/T2/Avg Spalten pro Swimmer
- **Pogo Ranking:** nearest-to-target (wie Excel), flat 2s Start

### Fixes
- **Re-Finalize Duplikate:** DELETE vor INSERT in time_history verhindert doppelte Breakers
- **Calendar:** Zeigt jetzt finalized UND completed Events
- **Exceeded PB Format:** formatWhole statt formatTime fuer PB im Breaker Report
- **Cache:** JS/CSS mit no-cache Headers, Build-Timestamp in /api/version
- **Medley:** Target nur aus Members mit PB, fehlende PBs werden markiert
- **Datenhygiene:** .dropboxignore fuer src/data/ und node_modules/

---

## v2.7.2 (2026-04-06)

### Fixes
- **Calendar:** Finalisierte Events werden jetzt im Season Calendar angezeigt (nicht nur completed)
- **Exceeded Report:** PB-Werte zeigen jetzt korrekt "14" statt "0.14" (formatWhole statt formatTime)
- **Medley Teams:** Target Time wird nur aus Members MIT PB berechnet; Teams mit fehlenden PBs werden markiert
- **Datenhygiene:** .dropboxignore verhindert Sync von Test-DB und node_modules

### Infrastruktur
- `.dropboxignore` fuer `src/data/` und `node_modules/`

---

## v2.7.1 (2026-04-06)

### Fixes
- **Relay Variance:** Einheiten-Mismatch gefixt (Centiseconds vs. Sekunden bei start_delay/target_time)
- **Breakers Improved By:** Frontend berechnet jetzt `handicap_time * 100 - net_time` (korrekte Konvertierung)
- **Equal Place:** Gleiche Finish-Zeit ergibt gleichen Platz (1,1,3 statt 1,2,3)
- **Event Report:** formatTime() statt rohe Centisecond-Werte
- **Season Calendar Modal:** Zeigt jetzt Participants + Race Results + Breakers (nicht nur Breakers)
- **Relay Swim-Twice:** recalcRelayTeam() berechnet target/delay/max nach Add Swimmer
- **Heat Builder Relay Total:** formatTime(cs) / formatWhole(s) je nach Zeittyp
- **Relay Place Styling:** Rot + Fett in relays.js und heat-builder.js
- **Standard Relay Filter:** 25m_relay schloss alle Swimmer aus wenn kein Special Event aktiv war

### Tests
- 4 Test-Suiten: reqa.py (56), reqa-v2.7.1.py (38), matrix (93), usecases (58)
- 26 Display-Tests (DOM-Pruefung)
- Server Health Check in allen Test-Scripts
- tests/README.md mit Setup-Anleitung

### Dokumentation
- DATA_DICTIONARY.md, USE_CASES.md, TEST_ARCHITECTURE.md, TRACEABILITY_MATRIX.md
- QUALITY_PLAYBOOK.md v1.2 (Dropbox-Root)
- COLLABORATION_MODEL.md v1.2 (Dropbox-Root)
- EXCEL_EQUIVALENCE_REPORT.md

---

## v2.7.0 (Baseline)
- Stand wie vom Kunden getestet
- 7 bekannte Bugs (Bryans Feedback vom 06.04.2026)
