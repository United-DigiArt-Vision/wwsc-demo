# DESIGN SPEC — WWSC Swimming App v2.6.2 (Bryan Feedback 2026-04-04)

## Input
- `REQUIREMENTS-V2.6.2-BRYAN-2026-04-04.md`
- Bryans annotierte Screenshots + Nachricht vom 04.04.2026
- Aktuelle Codebasis: `~/wwsc-demo`

## Ziel
Alle noch offenen Bryan-Punkte technisch so spezifizieren, dass sie ohne weitere Annahmen implementiert und danach testbar verifiziert werden können.

## 1. Whole-Seconds SSOT

### 1.1 Regel
Für die von Bryan gemeinten PB-/Delay-/Max-Time-Anzeigen gilt im UI eine Whole-Seconds-Darstellung.

### 1.2 SSOT
- Members PBs bleiben fachlich die Quelle für PB-basierte Heats/Expected values.
- UI-Darstellung dieser Werte erfolgt mit `formatWhole(...)` statt `formatTime(...)`, wo Bryan ganze Sekunden verlangt.
- Finish Time / Net Time / Variance dürfen weiterhin centisecond-basiert bleiben, wenn sie reale gemessene Ergebnisse darstellen.

### 1.3 Betroffene Screens
- Members
- Heat Builder
- Results (PB, Delay, Expected Finish)
- Relay/Medley Headers für Delay/Start/Target, soweit von Bryan betroffen

## 2. Results Table

### 2.1 Expected Finish Column
Neue Spalte: `Expected Finish`
Formel:
- `expected_finish = pb + delay`
- beide in whole seconds

Beispiel:
- PB 16
- Delay 5
- Expected Finish = 21

### 2.2 Auto Place Styling
Die gesamte Auto-Place-Zelle bekommt Medal-Styling:
- place=1 → gold background/text
- place=2 → silver background/text
- place=3 → bronze background/text
- sonst neutral

## 3. 25m Relay

### 3.1 Anzeige
- Keine Stroke-Spalte
- Split-/Individual-Zeiten pro Schwimmer sichtbar
- Team Total unten
- Start/Delay visuell hervorgehoben im Header

## 4. Medley Relay

### 4.1 Eligible Pool
Für Medley gelten nur:
- `Y`
- `Back`
- `Breast`
- `Free`

Nicht erlaubt:
- `N`
- leer

### 4.2 Add Swimmer
Dropdown-Pool = alle eligible swimmer aus `event_attendance` des aktiven Events.
Nicht nur aktuelle Team-Mitglieder.

### 4.3 Auto Marker
Wenn ein Schwimmer mit `Y` automatisch einem Stroke zugeordnet wurde:
- Anzeige des Strokes als `Back (Y)` / `Breast (Y)` / `Free (Y)`
- gilt im Heat Builder und Results

### 4.4 Stroke Counter im Timesheet
Im Medley-Modus zeigt Times Sheet:
- Anzahl `Y`
- Anzahl `Back`
- Anzahl `Breast`
- Anzahl `Free`

### 4.5 Medley Start Rule
Alle Medley Teams starten bei `2`.

Regel:
- `start_delay = 2` für jedes Medley-Team
- `target_time = sum(member PBs by stroke)`
- `variance = (total_time - start_delay) - target_time`

### 4.6 Medley Ranking
Sortierung:
- kleinste `abs(variance)` gewinnt
- gleiche `abs(variance)` = gleicher Platz

Beispiel:
- Team A variance +1 → Platz 1
- Team B variance -1 → Platz 1
- Team C variance +3 → Platz 3

## 5. Breaker / Exceeded Reports

### 5.1 Relay Results
Auf Relay Results kein separater Exceeded-Block unten.

### 5.2 Breaker Report
Breaker Report enthält zusätzlich Exceeded Report in gleicher visueller Struktur.

## 6. Season Completion Flow

### 6.1 Complete Event
Nach `Complete Event`:
- Event Status = `completed`
- UI darf nicht weiter wie `in progress` wirken
- primärer Abschlussflow ist nicht Timesheet

### 6.2 Event Report
Neuer separater Report mit:
- Teilnehmerliste
- Heats / Relay Teams
- Ergebnisse / Plätze / Totals

Implementierungsansatz:
- neuer Endpoint `/api/events/:eventId/report`
- Results-Screen öffnet Report nach Complete Event
- Report kann druckbar / separat geöffnet werden

## 7. Tab Navigation

### 7.1 Verhalten
- `Tab` fokussiert nächstes sichtbares Eingabefeld
- `Shift+Tab` zurück
- hidden/disabled werden übersprungen

### 7.2 Scope
Mindestens:
- Times Sheet
- Members
- Results relevante Eingaben
- Heat Builder relevante Eingaben

## 8. Implementierungsreihenfolge
1. Design-/Spec-Artefakte fertig
2. Whole-seconds Audit in Members / Results / Heats
3. Results Expected Finish + styling audit
4. Medley pool / add swimmer / no-filter / marker audit
5. Medley ranking/start rule audit
6. Season report / completion flow
7. Tab navigation finalisieren
8. Unit Test Protocol
9. Integration Test Protocol

## 9. Nicht-Annahmen
- Keine weitere fachliche Annahme über Bryans Scoring jenseits der expliziten Aussagen vom 04.04.2026.
- Falls ein Widerspruch zwischen bestehendem Code und dieser Spec auftaucht, gilt diese Spec bis Dino/Kunde etwas anderes sagen.
