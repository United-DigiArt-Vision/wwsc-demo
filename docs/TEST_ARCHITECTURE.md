# TEST-ARCHITEKTUR — WWSC Swimming App (ab v2.7.1)

## Lektion
v2.7.0 wurde mit 56 bestandenen API-Tests als "fertig" ausgeliefert.
Der Kunde fand 7 Bugs. 6 davon waren für den Kunden sichtbar, aber von keinem Test abgedeckt.
Die Tests prüften den falschen Layer: API-Responses statt User-sichtbare Werte.

## Grundprinzip: Teste was Bryan sieht, nicht was der Server sendet

Jeder Test muss die Frage beantworten:
**"Wenn Bryan auf den Bildschirm schaut — sieht er die richtige Zahl?"**

Nicht: "Hat die API 200 zurückgegeben?"
Nicht: "Ist der Wert im JSON-Response vorhanden?"
Sondern: "Ist die ANGEZEIGTE Zahl korrekt, in der richtigen Einheit, im richtigen Format?"

---

## Schicht 1: Data Dictionary (SSOT für Einheiten)

Siehe `DATA_DICTIONARY.md` — eine einzige Tabelle die für JEDES Feld definiert:
- Name
- Einheit (Whole Seconds vs. Centiseconds)
- Format-Funktion für Anzeige (formatWhole vs. formatTime)
- Wo es herkommt (DB, Berechnung, User-Eingabe)
- Wo es angezeigt wird (welche Screens)

### Warum das die Wurzel ist:
Ohne Data Dictionary gibt es keine Definition von "richtig".
Jeder Entwickler (Mensch oder KI) muss in jedem Codepfad neu raten, ob ein Wert Sekunden oder Centisekunden ist.
Mit Data Dictionary wird jeder Mismatch sofort sichtbar:
"Laut Dictionary ist `improvement` in Centisekunden → `formatTime()` → aber Code zeigt `raw + 's'` → BUG."

### Test-Regel:
Für jedes Feld im Data Dictionary muss es mindestens einen Test geben, der:
1. Den Wert an der API-Grenze prüft (richtige Einheit)
2. Die Anzeige-Logik prüft (richtige Format-Funktion)

---

## Schicht 2: Transformations-Tests (Berechnung)

Jede Funktion die Werte transformiert wird isoliert getestet.
Eingabe in der dokumentierten Einheit → Ausgabe in der dokumentierten Einheit.

### Funktionen die getestet werden müssen:
- `formatTime(cs)` → "XX.XX"
- `formatWhole(s)` → "XX"
- `parseTime(input)` → centiseconds
- `parseWhole(input)` → whole seconds
- `ordinal(n)` → "1st", "2nd", etc.
- `getRelayPB(member, raceType)` → whole seconds
- `recalcRelayTeam(team, raceType, allTeams)` → aktualisierte target/delay/max
- Server: variance calc für Individual (finish_cs - delay_s*100 - pb_s*100)
- Server: variance calc für Relay (total_cs - start_s*100 - target_s*100)
- Server: improvement calc (pb_s*100 - net_cs)
- Server: ranking mit Gleichstand-Logik

### Test-Regel:
Jede Transformation bekommt einen Test mit KONKRETEN ZAHLEN aus Bryans Daten.
Beispiel: "Bryan hat PB=14s, Finish=17.00 (1700cs), Delay=4s → net=1300cs, var=-100cs, improvement=100cs (=1.00s)"

---

## Schicht 3: API-Vertrags-Tests (Backend)

Jeder API-Endpoint hat einen Vertrag: "Feld X wird in Einheit Y geliefert."
Der Test verifiziert diesen Vertrag mit konkreten Werten.

### Getestete Verträge:
- `PUT /api/heats/:id/lanes/:id/time` → net_time in CS, variance in CS, is_break korrekt
- `PUT /api/relay-teams/:id/time` → variance in CS (nach *100-Konvertierung)
- `GET /api/events/:id/breakers` → old_pb in CS (*100), new_time in CS, improvement in CS
- `GET /api/reports/breakers` → gleiche Einheiten wie /breakers
- `GET /api/events/:id/report` → breakers in CS, attendance vollständig, races mit Details
- `POST /api/races/:id/rank` → gleiche finish_time → gleicher place

### Test-Regel:
NICHT testen: "Hat der Response ein Feld namens 'variance'?"
SONDERN testen: "Ist variance=0 wenn total_time = (target+delay)*100?"

---

## Schicht 4: Display-Verifikations-Tests (Frontend)

Für jede User-sichtbare Zahl wird geprüft:
Wird die RICHTIGE Format-Funktion auf den RICHTIGEN Wert angewendet?

### Methode:
Entweder via DOM-Inspektion (Preview-Tool) oder via Code-Review-Checkliste:

| Screen | Feld | Quelle | Einheit | Erwartete Format-Funktion |
|--------|------|--------|---------|--------------------------|
| Results | PB | handicap_time | Sekunden | formatWhole |
| Results | Delay | start_delay | Sekunden | formatWhole |
| Results | Exp. Finish | pb + delay | Sekunden | formatWhole |
| Results | Finish | finish_time | CS | formatTime |
| Results | Net | net_time | CS | formatTime |
| Results | Variance | variance | CS | formatTime |
| Results Breakers | Old PB | handicap_time | Sekunden | formatWhole |
| Results Breakers | New Time | net_time | CS | formatTime |
| Results Breakers | Improved | pb*100 - net | CS | formatTime |
| Breaker Report | Old PB | API old_pb | CS | formatTime |
| Breaker Report | New Time | API new_time | CS | formatTime |
| Breaker Report | Improved | API improvement | CS | formatTime |
| Event Report | Old PB | API old_pb | CS | formatTime |
| Event Report | New Time | API new_time | CS | formatTime |
| Calendar Modal | Breaker times | API old_pb/new_time | CS | formatTime |
| Relay HB | Team Total (vor Zeit) | target_time | Sekunden | formatWhole |
| Relay HB | Team Total (nach Zeit) | total_time | CS | formatTime |
| Relay Results | Team Total | total_time | CS | formatTime |
| Relay Results | Variance | variance | CS | formatTime |

### Test-Regel:
Jede Zeile dieser Tabelle ist ein Test. Der Test prüft den DOM-Inhalt nach Eingabe konkreter Werte.
"Nach Eingabe von finish=1700cs für PB=14s Swimmer: Breaker-Zeile zeigt Old PB=14, New Time=13.00, Improved=-1.00"

---

## Schicht 5: User-Szenario-Tests (E2E aus Bryans Sicht)

Komplette Workflows die Bryan tatsächlich durchführt.
Jeder Test beschreibt: "Bryan tut X → Bryan sieht Y."

### Szenarien:
1. **Normaler Wettkampf-Durchlauf**: Event erstellen → Attendance → Heats → Zeiten eingeben → Finalize → Report
2. **Break-Szenario**: Swimmer schlägt PB → Breaker Report zeigt korrekte Verbesserung
3. **Gleichstand-Szenario**: Zwei Swimmer gleiche Zeit → gleicher Platz
4. **Relay komplett**: Teams generieren → Swimmer hinzufügen → Zeiten eingeben → Ranking → Variance korrekt
5. **Medley komplett**: Stroke-Zuweisung → Teams → Start=2 → nearest-to-target → Gleichstand
6. **Season-Abschluss**: Finalize → Complete → Calendar zeigt vollständige Details

### Test-Regel:
Diese Tests beginnen bei NULL (frische DB) und durchlaufen den GESAMTEN Workflow.
Kein Test darf Werte "annehmen" — jeder Wert wird gegen die konkrete Erwartung geprüft.

---

## Schicht 6: Propagations-Tests (Zustandskonsistenz)

Nach jeder MUTATION muss der GESAMTE abhängige Zustand korrekt sein.

### Getestete Mutationen:
- **Add Swimmer zu Relay**: target_time, start_delay, max_time ALLER Teams aktualisiert
- **Enter Finish Time**: net_time, variance, is_break korrekt; Auto-Place aktualisiert
- **Enter Relay Total**: variance korrekt (mit Einheiten-Konvertierung)
- **Rank Race**: Gleichstände korrekt behandelt
- **Finalize Event**: time_history korrekt; breakers mit richtigen Einheiten

### Test-Regel:
Für jede Mutation: ALLE abgeleiteten Werte prüfen, nicht nur den direkt geänderten.
"Nach `addSwimTwice(Ben, 14s)` → Team target steigt um 14, delay ändert sich, max ändert sich."

---

## Schicht 7: Regressions-Schutz (Edge Cases)

### Getestete Edge Cases:
- variance = 0 (exakt auf Target)
- variance = -100 (exakt an Break-Grenze)
- finish_time = null (kein Wert eingegeben)
- PB = null (Swimmer ohne PB)
- Alle Teams gleiche Variance (3-Wege-Gleichstand)
- Nur 1 Team im Relay
- Swimmer mit N im Medley
- target_time = 0 (kein valider PB)

### Test-Regel:
Jeder Edge Case ist ein expliziter Test. Keine "das sollte nicht vorkommen"-Annahmen.

---

## Implementierungsreihenfolge

1. **Data Dictionary schreiben** (Schicht 1) — das ist die Grundlage
2. **Transformations-Tests** (Schicht 2) — schnell, isoliert, keine Abhängigkeiten
3. **API-Vertrags-Tests** (Schicht 3) — erweitert bestehende reqa.py
4. **Display-Tests** (Schicht 4) — DOM-Prüfung via Preview-Tools
5. **User-Szenario-Tests** (Schicht 5) — erweitert reqa-v2.7.1.py
6. **Propagations-Tests** (Schicht 6) — neue Test-Datei
7. **Edge-Case-Tests** (Schicht 7) — integriert in Schicht 3+5

## Regel für zukünftige Änderungen

**Vor jedem Fix oder Feature:**
1. Data Dictionary prüfen — welche Felder sind betroffen?
2. Datenpfad verfolgen — DB → API → Frontend → Anzeige
3. Test ZUERST schreiben der die User-sichtbare Erwartung beschreibt
4. Fix implementieren
5. Test muss grün werden
6. ALLE bestehenden Tests müssen grün bleiben

---

## AKTUELLE GATE-MATRIX (v2.12.0, 2026-06-11 — Philosophie oben unverändert gültig)

Die Python-Suiten (reqa*.py) sind historisch (M1). Aktueller Stand: alle Gates sind Node-Skripte
unter `scripts/`, jede Suite startet ihren eigenen isolierten Server mit frischer DB unter /tmp.
Setup + Reihenfolge + Sollwerte: `../tests/README.md` (verbindlich) und
`REBUILD-GUIDE-v2.12.0.md` §C1. Kurzübersicht:

| Gate | Skript | Schicht | Soll |
|---|---|---|---|
| v2.12.0 Unit/API | `test-v2120-bryan-feedback.cjs` | L3+L7 (Reports 1–3, pb_change_log, Swimmer Card) | 24/0 |
| Pointscore-Unit | `test-m3-pointscore-unit.cjs` | L2+L3 (Punkteregeln, Aggregation, Idempotenz) | 15/0 |
| Slice2-Unit | `test-m3-slice2-reports-export.cjs` | L3 (Coverage/Breaks/Improvements/CSV/DB-Export) | 7/0 |
| Pointscore-Isolation | `e2e-m3-pointscore-isolation.cjs` | L6 (akzeptierte Flows byte-identisch mit/ohne Engine) | PASS |
| v2.12.0 Browser | `e2e-v2120-bryan-feedback.cjs` | L4+L5 (Select-All-Y, Tap Placing, Relay-Grid, 3 Reports, Event-Report) | 10/0, 0 Console-Errors |
| M2-55 / M2-100 | `e2e-m2-time-history.cjs` / `e2e-m2-user-interaction-100.cjs` | L4+L5 Regression (History/Workflows) | 55/0 • 98/2NA/0/0 |
| History-Graphs | `e2e-m3-history-graphs.cjs` | L4 (SVG-Graphen) | 19/1NA/0 |
| Slice2-Browser | `e2e-m3-slice2-reports-export.cjs` | L4 (Reports-UI, Downloads) | 13/0 |
| M3-120 (zuletzt) | `e2e-m3-pointscore-120.cjs` | L4+L5+Meta (validiert Frische der M2-Logs via /tmp/m3p-m2-*.log) | 118/2NA/0/0 |

Versionspin der M2/M3-Gates: `WWSC_E2E_EXPECTED_VERSION=<package.json-Version>`.
