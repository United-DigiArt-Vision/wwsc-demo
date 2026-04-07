# USER INTERACTION TEST PROTOCOL — WWSC Swimming App v2.7.3

**Datum:** 2026-04-07
**Tester:** Claude Code
**Umgebung:** Preview-Server (localhost:3000), frische DB (Seed: 23 Members)
**Testdaten:** 1 Event, 12 Swimmer present, Races: 25m, 50m, 25m Relay, Pogo, Medley Relay
**Version:** v2.7.3, Build: 2026-04-07T17:31:27.776Z

---

## J1: Dashboard

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| J1-1 | Version sichtbar | v2.7.3 unten links | v2.7.3 sichtbar | PASS |
| J1-2 | Active Members | 23 (Seed) | 23 | PASS |
| J1-3 | Kein Event aktiv | "Ready for New Event?" | Korrekt angezeigt | PASS |
| J1-4 | Present/Events/Date | "—" wenn kein Event | "—" | PASS |

---

## J2: Times Sheet

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| J2-1 | PBs ganze Sekunden | 16, 39, 62 etc. | Korrekt, keine Dezimalen | PASS |
| J2-2 | Medley Counter | Back/Breast/Free/Y Counts | Back:2, Breast:2, Free:2, Yes:3, No:3 | PASS |
| J2-3 | Standard Dropdown | Pogo | Pogo ausgewaehlt | PASS |
| J2-4 | Special Dropdown | Medley Relay | Medley Relay ausgewaehlt | PASS |
| J2-5 | Attendance Count | 12 | 12 | PASS |
| J2-6 | Medley Count | 9 (12-3N) | 9 | PASS |

---

## J3: Heat Builder

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| J3-1 | 5 Races im Progress Tracker | 25m+50m+Relay+Pogo+Medley | Alle sichtbar mit Checkmarks | PASS |

---

## J4: Results — Individual (25m)

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| J4-1 | "Exp. Finish" Spalte | Spaltenname "Exp. Finish" | Korrekt | PASS |
| J4-2 | Exp. Finish Berechnung | PB+Delay: 16+7=23 | 23 | PASS |
| J4-3 | PB/Delay/ExpFinish | Ganze Sekunden | Korrekt, keine Dezimalen | PASS |
| J4-4 | Finish/Net/Variance | XX.XX Format | 22.00, 15.00, -1.00 | PASS |
| J4-5 | Gold/Silver/Bronze | Farbige Medal-Zellen | Gold:3, Silver:3, Bronze:3 | PASS |
| J4-6 | Break Detection | Variance <= -1.00 → "BREAK" | 6 Break-Zeilen gefunden | PASS |
| J4-7 | Inline Breakers Report | Old PB (ganz), New (XX.XX), Imp (-X.XX) | 16, 15.00, -1.00 | PASS |
| J4-8 | Nachrechnung Greg | PB=16, D=7, F=22.00→N=15.00→V=-1.00 | Korrekt | PASS |
| J4-9 | Nachrechnung Felicia | PB=16, D=7, F=23.00→N=16.00→V=+0.00 | Korrekt | PASS |

---

## J5: Results — Medley Relay

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| J5-1 | Start: 2 s (flat) | Alle Teams Start=2 | "Start: 2 s" sichtbar | PASS |
| J5-2 | Stroke-Spalte | Back/Breast/Free | Sichtbar | PASS |
| J5-3 | Place rot+fett | "1st" in rot+fett | Korrekt | PASS |
| J5-4 | PBs stroke-spezifisch | Ben=37(back), Bryan=38(breast), Greg=16(free) | Korrekt | PASS |
| J5-5 | Target Berechnung | 37+38+16=91 | Target: 91 | PASS |
| J5-6 | Variance Nachrechnung | Total=94.00=9400cs, Var=9400-200-9100=100cs=+1.00 | +1.00 | PASS |
| J5-7 | Kein Exceeded Report | Nicht auf Relay-Seite | Nicht vorhanden | PASS |

---

## J5b: Results — Pogo

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| J5b-1 | T1/T2/Avg Spalten | 3 Spalten sichtbar | T1, T2, Avg mit Tooltips | PASS |
| J5b-2 | T1 Wert | 13.45 | 13.45 | PASS |
| J5b-3 | T2 Wert | 13.55 | 13.55 | PASS |
| J5b-4 | Average Berechnung | (1345+1355)/2=1350→13.50 | 13.50 (gruen hervorgehoben) | PASS |
| J5b-5 | Start: 2 s | Flat Start | "Start: 2 s" | PASS |
| J5b-6 | Target Berechnung | 13+16+18+21=68 | Target: 68 | PASS |
| J5b-7 | Place rot+fett | "1st" in rot+fett | Korrekt | PASS |

---

## J6: Finalize → Calendar → Report

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| J6-1 | Event im Calendar | Completed Event sichtbar | "Tue, 7 Apr 2026" mit Done | PASS |
| J6-2 | Event Details Modal | Participants + Races + Breakers | 12 Participants, 5 Races | PASS |
| J6-3 | Race Results im Modal | Top-3 mit formatTime | 25m: Greg(22.00), Jenny(21.00), Bryan(22.00) | PASS |
| J6-4 | Breakers im Modal | formatTime, keine rohen Werte | "13.00 → 12.00 (1.00)" | PASS |
| J6-5 | Keine rohen Centiseconds | Kein "1400s" oder "0.14" | Bestaetigt (Raw: false) | PASS |

---

## J7: Breaker Report Screen — Cross-Screen-Konsistenz

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| J7-1 | Breaker Count | 6 (3x25m + 3x50m) | 6 | PASS |
| J7-2 | Old PB Format | XX.XX (formatTime) | 13.00, 16.00, 18.00 | PASS |
| J7-3 | New Time Format | XX.XX | 12.00, 15.00, 17.00 | PASS |
| J7-4 | Improved By | -X.XX | -1.00 | PASS |
| J7-5 | Keine Duplikate | Genau 6, nicht 12 | 6 | PASS |
| J7-6 | Kein "0.14" | formatWhole wo noetig | Bestaetigt | PASS |
| J7-7 | Konsistenz Results↔Report | Gleiche Swimmer, gleiche Werte | Konsistent | PASS |
| J7-8 | Konsistenz Report↔Calendar | Gleiche Breakers | Konsistent (6 in beiden) | PASS |

---

## J8: Members + Datenhygiene

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| J8-1 | Member Count | 23 (Seed) | 23 | PASS |
| J8-2 | Keine Testdaten | 0 Dummy-Namen | 0 (kein CSV/Test/NoPB/Extra) | PASS |
| J8-3 | PBs ganze Sekunden | Keine Dezimalen | Bestaetigt | PASS |
| J8-4 | Alle Active | 23/23 | 23/23 | PASS |

---

## Console Errors

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| CE-1 | JS Console Errors | 0 | 0 | PASS |

---

## ZUSAMMENFASSUNG

| Kategorie | Tests | PASS | FAIL |
|-----------|-------|------|------|
| Dashboard | 4 | 4 | 0 |
| Times Sheet | 6 | 6 | 0 |
| Heat Builder | 1 | 1 | 0 |
| Results Individual | 9 | 9 | 0 |
| Medley Relay | 7 | 7 | 0 |
| Pogo | 7 | 7 | 0 |
| Calendar + Report | 5 | 5 | 0 |
| Cross-Screen Konsistenz | 8 | 8 | 0 |
| Members + Datenhygiene | 4 | 4 | 0 |
| Console | 1 | 1 | 0 |
| **GESAMT** | **52** | **52** | **0** |

---

## Endabnahme-Liste

### Fuer Bryan jetzt bereit:
- Individual Races (25m/50m/75m/Back/Breast/Fly) mit Handicap, Break-Detection, Medal-Styling
- 25m Relay mit Splits
- 25m/50m Brace (nearest-to-target)
- Medley Relay (stroke-specific PBs, Start=2, nearest-to-target, Gleichstand)
- Pogo (2 Timekeeper T1/T2/Avg, Start=2, nearest-to-target)
- Breakers Report (konsistent ueber alle Screens, keine Duplikate)
- Exceeded Report (korrekte PB-Formatierung)
- Season Calendar + Event Details (Participants + Races + Breakers)
- Equal Place bei gleicher Finish-Zeit (1,1,3)
- v2.7.3 mit Build-Timestamp, no-cache Headers

### Noch offen:
- 25m Break-Schwelle: -0.5s (Excel) vs -1.0s (App) — Bryan muss entscheiden
- Point Score System — fehlt komplett

### Spaeter / nice-to-have:
- Total Pointscore / Saison-Leaderboard
- Zeiten-Historie pro Distanz
- 10-Personen Relay
- Pogo Auto-Total aus Avg-Summe
