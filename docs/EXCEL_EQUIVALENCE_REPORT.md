# EXCEL EQUIVALENCE REPORT — WWSC Swimming App v2.7.1

## 1. Kurzfazit

**Ist die App fachlich aequivalent zur Excel? TEILWEISE.**

Die Kernlogik (Handicap, Heat-Generierung, Zeiteingabe, Breaker-Erkennung) ist korrekt abgebildet. Aber es gibt signifikante Luecken bei Point Scores, Break-Schwellenwerten, und dem 10-Personen-Relay. Die Excel ist deutlich umfangreicher als die App.

---

## 2. Excel-Inventar

### 2.1 Sheets (45 total)

| Kategorie | Sheets | Status in App |
|-----------|--------|---------------|
| **Steuerung** | Times Sheet, Event Entry, Instructions, Requirements, Updates | Abgebildet |
| **Individual Races** | 25m, 50m, 75m, Backstroke, Breaststroke, Butterfly | Abgebildet |
| **Relay/Brace** | 25m Relay, 25m Brace, 50m Brace, Pogo, Medley Relay | Abgebildet |
| **Handicap-Hilfs-Sheets** | 25m Brace Handicap, 50m Brace Handicap, Medley Relay Handicap | Nicht in App (Logik im Server) |
| **Zeiten-Tracking** | 25m times, 50m times, 75m times, Backstroke times, Breaststroke times, Butterfly times | FEHLT |
| **Point Scores** | 25m/50m/75m/Relay/Backstroke/Breaststroke/Butterfly/25m Brace/50m Brace/Medley Relay Point score | FEHLT |
| **Total** | Total Pointscore, Total Improvement | FEHLT |
| **Admin** | Attendance, Donations, Visitor payments, Raffle Winners | FEHLT |
| **10er Relay** | Relay, Womens relay | FEHLT |

### 2.2 VBA Makros (19 mit Code)

| Makro | Funktion | Status in App |
|-------|----------|---------------|
| Sheet1.Worksheet_Change | Sheet-Sichtbarkeit steuern via Dropdown | Abgebildet (Event Config) |
| Module3.Heat_Builder_v3 | RAND einfrieren fuer Heat-Zuweisung | Abgebildet (Shuffle + Confirm) |
| Module8.clear_Content_of_cells | Zeiteingaben zuruecksetzen | Abgebildet (Re-Shuffle) |
| Module2.Print_area | Drucken | Teilweise (Print-Button) |
| Module5.FormatPainter | Handicap-Spalten verschieben | Nicht direkt (Season-Management) |
| Module12.Pointscore_prepare | Point Score Workflow | FEHLT |
| Module13.Timesheet_Update | Handicap + Reset | Abgebildet (Weekly Reset) |
| Sheet41.Worksheet_Change | Zeigt/Versteckt Statistik-Sheets | Nicht direkt |

### 2.3 Datenfluss

```
Times Sheet (PBs)
  → Event Entry (Random Shuffle + Heat Assignment)
    → 25m/50m/... Sheets (Handicap + Zeiteingabe + Ergebnisse)
      → Point Score Sheets (kumulative Punkte pro Event)
        → Total Pointscore (Gesamtranking)

Parallel: Times Sheet → 25m times etc. (PB-Historie)
```

---

## 3. Logik- und Berechnungsvergleich

### 3.1 Handicap-Berechnung (Individual Races)

| Element | Excel | App | Match? |
|---------|-------|-----|--------|
| Max Time | `ROUND(MAX(heat PBs), 0) + 2` | `Math.max(...PBs) + 2` (BASE_OFFSET) | **MATCH** |
| Start Delay | `ROUND(Max - PB, 0)` | `maxTime - handicap_time` | **MATCH** |
| Net Time | `Finish - Start` | `finish_time(cs) - start_delay(s)*100` | **MATCH** (nach v2.7.1 Fix) |
| Variance | `Net - PB` | `net_time(cs) - handicap_time(s)*100` | **MATCH** |
| Winner (Race) | `RANK(Finish, heat_range, ASC)` | Ranking by finish_time per heat | **MATCH** |

### 3.2 Break-Erkennung

| Element | Excel | App | Match? |
|---------|-------|-----|--------|
| 25m Break | `Variance < -0.5` | `variance <= -100` (cs) = -1.00s | **DELTA** |
| 50m Break | `Variance < -1` | `variance <= -100` (cs) = -1.00s | **MATCH** |
| 75m Break | `Variance < -1` | `variance <= -100` (cs) = -1.00s | **MATCH** |
| Backstroke Break | `Variance < -1` | `variance <= -100` (cs) = -1.00s | **MATCH** |
| Breaststroke Break | `Variance < -1` | `variance <= -100` (cs) = -1.00s | **MATCH** |
| Butterfly Break | `Variance < -1` | `variance <= -100` (cs) = -1.00s | **MATCH** |

**DELTA bei 25m:** Excel erkennt Breaks ab 0.5 Sekunden Verbesserung, App erst ab 1.0 Sekunden. Das ist ein fachlicher Unterschied.

### 3.3 25m Relay

| Element | Excel | App | Match? |
|---------|-------|-----|--------|
| Team-Groesse | 3 oder 4 Lanes (>30 Swimmer → 4) | 3 Teams default, 4 if >30 | **MATCH** |
| Team-Zusammensetzung | Manuelle Reihenfolge (Event Entry K-Spalte) | Automatische Round-Robin-Verteilung | **DELTA** |
| Zeiterfassung | Keine Split-Zeiten | Hat Split-Zeiten pro Swimmer | **App hat MEHR** |
| Handicap | Kein Handicap, nur Teamanzeige | Staggered Start (Max+2) | **DELTA** |

**DELTA:** Excel hat KEIN Handicap fuer den 25m Relay — es ist nur eine Team-Zusammenstellungs-Tabelle. Die App berechnet Start Delays, was in der Excel nicht vorkommt.

### 3.4 25m Brace / 50m Brace

| Element | Excel | App | Match? |
|---------|-------|-----|--------|
| Team-Groesse | Paare (2 pro Team) | Paare | **MATCH** |
| Start | Flat 2s | Staggered (Max+2) | **DELTA** |
| Ranking | Nearest-to-target (abs(variance)) EVENT-WEIT | Nearest-to-target | **MATCH** |
| Punkte | 1st=5, 2nd=4, 3rd=3, 4th=2 | Keine Punkte | **FEHLT** |

**DELTA:** Excel nutzt flat 2s Start fuer Brace, App nutzt staggered Start. In der Excel ist Brace ein "nearest-to-time" Event mit flachem Start.

### 3.5 Medley Relay

| Element | Excel | App | Match? |
|---------|-------|-----|--------|
| Team-Groesse | 3 (Back + Breast + Free) | 3 | **MATCH** |
| Strokes | Backstroke + Breaststroke + Freestyle | Back + Breast + Free | **MATCH** |
| PB-Referenz | Alle nutzen 25m Zeit (!!) | Back=backstroke PB, Breast=breaststroke PB, Free=25m PB | **DELTA** |
| Start | Flat 2s | Flat 2s | **MATCH** |
| Ranking | Nearest-to-target (abs(variance)) EVENT-WEIT | Nearest-to-target | **MATCH** |
| Gleichstand | Nicht explizit behandelt | Gleicher Platz | **App hat MEHR** |

**KRITISCHER DELTA bei PB-Referenz:** In der Excel nutzen ALLE drei Medley-Swimmer die 25m-Zeit als PB. In der App nutzt der Backstroke-Swimmer den Backstroke-PB, der Breaststroke-Swimmer den Breaststroke-PB. Das fuehrt zu komplett anderen Target Times.

### 3.6 Pogo

| Element | Excel | App | Match? |
|---------|-------|-----|--------|
| Start | Flat 2s | Staggered (Max+2) | **DELTA** |
| Zeiteingabe | 2 Finish-Zeiten, AVERAGE | 1 Finish-Zeit | **DELTA** |
| Net Time | `AVERAGE(Finish1, Finish2) - Start` | `total_time - start_delay*100` | **DELTA** |
| Ranking | Nearest-to-target (abs(variance)) gesamt | Fastest total_time | **DELTA** |

**MEHRERE DELTAS:** Pogo ist in der Excel fundamental anders als in der App. Excel: 2 Zeiteingaben, Durchschnitt, flat Start, nearest-to-target. App: 1 Zeiteingabe, staggered Start, fastest wins.

### 3.7 Zeiten-System

| Element | Excel | App | Match? |
|---------|-------|-----|--------|
| PB-Speicherung | Ganze Sekunden | Ganze Sekunden | **MATCH** |
| Finish-Eingabe | Dezimalsekunden (z.B. 17.01) | Centisekunden via Numpad (z.B. 1701) | **Semantisch MATCH** |
| Berechnungen | Alles in Sekunden (Dezimal) | PBs in Sekunden, Stopwatch in CS, Konvertierung | **Funktional MATCH** |

### 3.8 Punkte-System

| Element | Excel | App | Match? |
|---------|-------|-----|--------|
| Punktevergabe | Break=2, 1st=5, 2nd=4, 3rd=3, 4th=2 | Keine Punkte | **FEHLT** |
| Kumulative Punkte | Pro Event + Total | Nicht vorhanden | **FEHLT** |
| Saison-Leaderboard | Total Pointscore Sheet | Nicht vorhanden | **FEHLT** |

---

## 4. Gap Analysis

### VOLLSTAENDIG ABGEDECKT
- Swimmer-Verwaltung (Members)
- Times Sheet / Attendance
- Individual Heat-Generierung (25m, 50m, 75m, Backstroke, Breaststroke, Butterfly)
- Handicap-Berechnung (Max+2, Start Delay)
- Zeiteingabe + Net Time + Variance
- Break-Erkennung (50m, 75m, Backstroke, Breaststroke, Butterfly)
- Heat-Zuweisung (Shuffle + Confirm)
- Medley Start = 2 (flat)
- Nearest-to-target Ranking (Brace, Medley)
- Weekly Reset / Season Calendar

### TEILWEISE ABGEDECKT
- **25m Break-Schwelle:** App nutzt -1.00s, Excel nutzt -0.5s
- **Medley PB-Referenz:** App nutzt stroke-spezifische PBs, Excel nutzt 25m fuer alle
- **25m Relay:** App hat Handicap-System, Excel hat nur Team-Zusammenstellung
- **Brace Start:** App nutzt staggered, Excel nutzt flat 2s
- **Pogo:** Grundstruktur vorhanden, aber Logik anders (1 vs 2 Zeiten, Ranking-Methode)

### FEHLT
- **Point Score System** (komplett)
- **Saison-Leaderboard / Total Pointscore**
- **Zeiten-Historie pro Distanz** (25m times, 50m times etc.)
- **Total Improvement Tracking**
- **10-Personen Relay** (Relay + Womens Relay Sheets)
- **Administrative Sheets** (Donations, Visitor Payments, Raffle)
- **Druck-Bereiche** (Recording vs. Display Print)

### UNKLAR / MUSS INTERPRETIERT WERDEN
- **Medley Relay PB-Referenz:** Excel nutzt 25m fuer alle Strokes — ist das beabsichtigt oder ein Excel-Bug? Bryan muss gefragt werden.
- **Pogo 2-Zeiten-System:** Ist das aktuell noch in Verwendung?
- **25m Break-Schwelle 0.5s:** Absichtlich anders als andere Distanzen oder Versehen?

---

## 5. Risikobereiche

### KRITISCH — Bryan erwartet anderes Verhalten

1. **Medley PB-Referenz:** Wenn Bryan die Excel benutzt, sind alle Medley-Target-Times basierend auf 25m. In der App sind sie stroke-spezifisch. Das fuehrt zu komplett anderen Rankings. Bryan koennte sagen: "Die Medley-Zeiten stimmen nicht."

2. **25m Break-Schwelle:** In der Excel wird ein Break ab 0.5s Verbesserung erkannt. In der App erst ab 1.0s. Bryan koennte Breaks in der Excel sehen die in der App nicht erscheinen.

3. **Pogo-Logik:** Excel und App haben fundamental verschiedene Pogo-Implementierungen. Bryan koennte komplett andere Ergebnisse erwarten.

### WICHTIG — Fehlende Features

4. **Point Scores:** Bryan trackt kumulierte Punkte pro Saison. Das existiert in der App nicht. Er muss das manuell machen oder es fehlt komplett.

5. **10-Personen Relay:** Existiert in der Excel, nicht in der App. Falls Bryan das nutzt, fehlt es.

### MITTEL — Abweichungen die moeglicherweise akzeptabel sind

6. **Brace flat Start vs. staggered:** Funktional aehnlich (nearest-to-target), aber die Start-Delays unterscheiden sich.

7. **25m Relay Handicap:** Die App hat MEHR als die Excel (Handicap-System). Bryan muss entscheiden ob er das will oder ob es nur Team-Zusammenstellung sein soll.

---

## 6. Empfohlene naechste Schritte

### Kritisch (VOR naechster Auslieferung klaeren)
1. **Bryan fragen:** Medley PB — soll 25m fuer alle gelten (wie Excel), oder stroke-spezifisch (wie App)?
2. **Bryan fragen:** 25m Break-Schwelle — 0.5s (wie Excel) oder 1.0s (wie App)?
3. **Bryan fragen:** Pogo — 2-Zeiten-Durchschnitt (wie Excel) oder 1 Zeit (wie App)?

### Wichtig (naechste Version)
4. **Point Score System implementieren:** Break=2, 1st=5, 2nd=4, 3rd=3, 4th=2
5. **Total Pointscore:** Saison-Leaderboard
6. **Brace Start:** Von staggered auf flat 2s umstellen (Excel-konform)

### Nice-to-have
7. **10-Personen Relay:** Implementieren falls Bryan es nutzt
8. **Zeiten-Historie:** PB-Verlauf pro Distanz
9. **Total Improvement:** Gesamtverbesserung tracken
10. **Administrative Sheets:** Donations, Raffle etc.

---

## 7. Unsicherheitsliste (gemaess Quality Playbook)

### Sicher bewiesen:
- Handicap-Formel (Max+2, Start Delay) ist identisch
- Individual Race Workflow stimmt ueberein
- Break-Erkennung stimmt fuer 50m+ ueberein
- Medley Start=2 ist korrekt
- Nearest-to-target Ranking stimmt ueberein

### Plausibel, aber nicht mit Bryan bestaetigt:
- Medley PB-Referenz: App nutzt stroke-spezifisch, Excel nutzt 25m — unklar was Bryan will
- 25m Break-Schwelle: moeglicher Unterschied -0.5s vs -1.0s
- Pogo-Logik: fundamental unterschiedlich

### Noch offen:
- Point Score System: fehlt komplett in der App
- 10-Personen Relay: Nutzung durch Bryan unklar
- Administrative Features: Relevanz unklar
