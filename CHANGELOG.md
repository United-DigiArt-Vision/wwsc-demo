# CHANGELOG — WWSC Swimming App

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
