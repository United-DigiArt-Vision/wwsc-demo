# WWSC USER INTERACTION TEST SPEC

> **Projekt:** WWSC Swimming App
> **Version:** v2.0
> **Erstellt:** 2026-04-07
> **Aktualisiert:** 2026-04-08
> **Zweck:** Permutationsbasierte browsergestützte End-to-End User-Interaction-Abnahme vor Dinos finalem Acceptance Test
> **Pflicht fuer:** Claude Code / jeden externen Coding-Agenten, der WWSC weiterentwickelt oder testet

---

## Ziel

Diese Spezifikation definiert eine **echte User-Journey-Abnahme im Browser**.
Sie existiert, weil API-Tests, Matrix-Tests und Code-Checks allein nicht reichen. Die App muss sich aus Sicht eines echten Users korrekt verhalten.

**Kernregel:**
Der Tester klickt sich durch die App wie ein echter Benutzer — langsam, gruendlich, ohne Token-Spar-Reflex. Jede Zahl, jede Platzierung, jede Berechnung, jede Sichtbarkeit, jeder State-Übergang und jede Report-Darstellung wird gegen Soll-Verhalten geprueft.

**Diese Testphase kommt NACH Integration-/Flow-Tests und VOR Dinos finalem Acceptance Test.**

---

## Warum diese v2.0 existiert

Die alte Fassung war als Richtung gut, aber zu grob.
Sie nannte Event-Typen und Phasen, aber zerlegte sie nicht fein genug in echte Testcases und Permutationen.

**Neue Regel in v2.0:**
Eine gute User-Interaction-Test-Spec besteht NICHT aus ein paar grossen Themenblöcken, sondern aus:
1. **Test-Dimensionen**
2. **Coverage-Tiers**
3. **Pflicht-Variationsmatrix**
4. **expliziten Testcases pro UI-Bereich**
5. **klarer Coverage-Matrix gegen die Spec**

---

## Harte Regeln

1. **Browser only.** Diese Spezifikation wird im Browser durchgefuehrt, nicht nur ueber API/DB.
2. **User perspective first.** Geprueft wird, was der User sieht, versteht und bedienen kann.
3. **Keine Eile.** Nicht auf Token sparen, nicht abkuerzen, nicht nur happy path.
4. **Jede Abweichung protokollieren.** Mit Schritt, erwartetem und tatsaechlichem Ergebnis.
5. **Jeder Screen.** Nicht nur Kernfunktionen — ALLE Screens und Report-Varianten.
6. **Permutationen sind Pflicht.** Ein Testfall pro Feature reicht NICHT.
7. **Kalkulatorische Verifikation.** Relevante Zahlen muessen aktiv nachgerechnet werden.
8. **Kein "looks fine".** Nur `PASS`, wenn explizit geprueft.
9. **Coverage Matrix Pflicht.** Kein Abschluss ohne sichtbare Matrix gegen diese Spec.
10. **NOT TESTED ist erlaubt, Verheimlichen nicht.** Wenn etwas nicht getestet wurde, muss es explizit so markiert werden.

---

## Deliverables des Testers

Der Tester liefert am Ende:

1. `USER-INTERACTION-TEST-PROTOCOL.md`
2. `USER-INTERACTION-COVERAGE-MATRIX.md`
3. klare Listen:
   - **PASS**
   - **FAIL**
   - **OPEN / NOT TESTED**
4. Abschlussblock:
   - **Bewiesen bereit fuer Dino**
   - **Noch offen / fehlt**
   - **Nicht Teil dieser Lieferung / spaeter**

---

## Test-Dimensionen (die Kombinatorik-Basis)

Diese Dimensionen sind die Grundlage der Testabdeckung. Eine starke UI-Testabnahme kombiniert sie bewusst.

### D1 — Teilnehmerzahl
- D1-1: 0 Teilnehmer
- D1-2: 1–2 Teilnehmer
- D1-3: 3 Teilnehmer (Minimum zum Weiterkommen)
- D1-4: 4 Teilnehmer (genauer Heat)
- D1-5: 5–6 Teilnehmer
- D1-6: 7–8 Teilnehmer
- D1-7: 9–12 Teilnehmer
- D1-8: 15+ Teilnehmer

### D2 — Race-Konfiguration
- D2-1: 25m only
- D2-2: 25m + 50m
- D2-3: 25m + 50m + Special Event
- D2-4: 25m Team Relay
- D2-5: 25m Brace
- D2-6: 50m Brace
- D2-7: Medley Relay
- D2-8: Pogo
- D2-9: 75m / Stroke Event (Back / Breast / Fly)

### D3 — Datenqualität / PB-Lage
- D3-1: Alle PBs vorhanden
- D3-2: Einzelne PBs fehlen
- D3-3: stroke-specific PB-Mismatch
- D3-4: Inactive Swimmer vorhanden
- D3-5: kein Test-/Dummy-Datenmüll

### D4 — Ergebnis-Muster
- D4-1: Normales Ranking
- D4-2: 2-way tie
- D4-3: 3-way tie
- D4-4: 4-way tie / Platzsprünge
- D4-5: Break knapp unter Schwelle
- D4-6: exakt auf Schwelle
- D4-7: knapp ueber Schwelle
- D4-8: extreme langsame Zeit
- D4-9: gleiche absolute Variance bei Relay
- D4-10: Partial Result / unvollstaendige Eingaben

### D4.5 — Praezisions-/Format-Dimensionen (WWSC-spezifisch)
- D4.5-1: whole-second Darstellung
- D4.5-2: echte Centisecond-Werte mit nicht-runden Decimals (z. B. 23.52)
- D4.5-3: near-tie mit Centisecond-Differenz (z. B. 23.52 vs 23.53)
- D4.5-4: threshold-nahe Faelle mit nicht-runden Werten
- D4.5-5: Rundungsrelevante Avg-/Derived-Werte
- D4.5-6: Cross-screen Decimal-/Format-Konsistenz

### D5 — Workflow-/State-Lage
- D5-1: Setup
- D5-2: Heats generiert
- D5-3: Heats confirmed
- D5-4: Partial Results
- D5-5: Finalized
- D5-6: Unlock / Re-open
- D5-7: Re-finalized
- D5-8: mehrere Events hintereinander

### D6 — Darstellung / Projektionsflaeche
- D6-1: Members
- D6-2: Times Sheet
- D6-3: Heat Builder
- D6-4: Results
- D6-5: Relay Results / Team Cards
- D6-6: Breaker Report
- D6-7: Exceeded Report
- D6-8: Calendar
- D6-9: Event Details Modal
- D6-10: Print / Readout
- D6-11: Sidebar / Guided Workflow / Navigation

---

## Coverage-Tiers

### Tier A — Minimal-Coverage
Ziel: kein peinlicher Happy-Path-only-Test.

Pflicht:
- alle Hauptscreens mindestens einmal
- jeder Relay-Typ mindestens einmal
- mindestens ein Tie-Fall
- mindestens ein Break-Fall
- mindestens ein Exceeded-Fall
- mindestens ein Finalize-Flow

### Tier B — Strong-Coverage
Ziel: gute reale QA vor Dino.

Pflicht:
- mindestens **12 unterschiedliche Event-Konstellationen**
- jede zentrale Formel sichtbar nachgerechnet
- jede kritische Race-Variante mindestens mit 2 unterschiedlichen Konstellationen
- Cross-screen consistency fuer Breaker/Exceeded/Calendar
- Re-finalize / Re-open getestet
- Null-State + Min-State + grosse Teilnehmerzahl getestet

### Tier C — Exhaustive-Critical-Coverage
Ziel: maximale Abdeckung fuer kritische Auslieferung.

Pflicht:
- alle kritischen Dimensionen mindestens einmal kombiniert
- jeder kritische Race-Typ mit mehreren Ergebnis-Mustern
- mehrere Datenqualitaetslagen
- alle State-Uebergaenge sichtbar getestet
- print/readout + report projections + navigation consistency

**Fuer WWSC vor Dino gilt mindestens Tier B.**

---

## Pflicht-Eventmatrix (mindestens durchzufuehren)

Mindestens diese **16 Event-/Konfigurationsklassen** muessen real im Browser getestet werden.

| ID | Event-Klasse | Hauptdimensionen | Zweck |
|----|--------------|------------------|-------|
| E01 | Empty Event | D1-1, D5-1 | Null-State / kein Crash |
| E02 | Min Event | D1-3, D2-1 | Mindestschwelle / Build-Heats-Grenze |
| E03 | Exact Heat | D1-4, D2-2 | sauberer 4er Heat |
| E04 | Small Multi-Race | D1-5, D2-2 | mehrere Individual Races |
| E05 | Medium Multi-Race | D1-7, D2-3 | echte Multi-Race User-Journey |
| E06 | Large Event | D1-8, D2-3 | Performance / Übersicht / Verteilung |
| E07 | Team Relay | D2-4, D4-1 | Team-Splits + Ranking |
| E08 | 25m Brace | D2-5, D4-9 | nearest-to-target |
| E09 | 50m Brace | D2-6, D4-9 | nearest-to-target |
| E10 | Medley Relay | D2-7, D3-3 | stroke-specific PBs |
| E11 | Pogo | D2-8, D4-1 | T1/T2/Avg |
| E12 | Tie Event Individual | D4-2/3/4 | placing + medals |
| E13 | Break Threshold | D4-5/6/7 | breaker threshold exakt |
| E14 | Exceeded Extreme | D4-8 | Format / extreme slow |
| E15 | Re-finalize Event | D5-5/6/7 | no duplicates / consistency |
| E16 | Calendar / Details Event | D6-8/9/10 | finalize → calendar → report |
| E17 | Precision / Decimal Event | D4.5-2/3/4/5/6 | echte Decimal-/Centisecond-Haertung |

---

## Pflicht-Testblöcke pro Screen

# Block 1 — App-Identitaet / Version / Navigation

### UIT-001 — Version konsistent
Pruefen:
- `package.json`
- sichtbare UI-Version
- `/api/version`
- evtl. Build-Hover / Cache-Bust

**Erwartung:** Alle Versionen konsistent.

### UIT-002 — Guided Workflow / Dashboard
Pruefen:
- Zustand ohne Event
- Zustand mit Event in Setup
- Zustand mit bestaetigten Heats
- Zustand mit finalisiertem Event

**Erwartung:** CTA passt zum App-State.

### UIT-003 — Sidebar Navigation
Pruefen:
- aktive Markierung
- Race-Links
- Individual vs Relay Separation
- Navigation fuehrt auf richtigen Screen / richtigen Kontext

---

# Block 2 — Members Screen

### UIT-010 — Members Grundfunktion
- Liste laedt
- Sortierung
- Suche / Filter
- Aktiv/Inactive Verhalten

### UIT-011 — Aktivieren / Deaktivieren
- Toggle funktioniert
- Counts aendern sich korrekt
- inactive erscheinen nicht im produktiven Flow

### UIT-012 — Datenhygiene
- keine Test-/Dummy-/CSV-Artefakte
- keine unvollstaendigen Datensaetze, die echte Flows vergiften

### UIT-013 — PB-Datenqualitaet
- fehlende PBs werden sichtbar / sauber behandelt
- keine stillen Falschannahmen

---

# Block 3 — Times Sheet / Event Setup

### UIT-020 — Event anlegen
- Datum setzen
- Status sichtbar
- neues Event sauber erzeugt

### UIT-021 — Attendance Toggle
- einzelne Swimmer present / absent
- counts stimmen
- multiple toggles stabil

### UIT-022 — Select All / Deselect All
- bulk interactions korrekt
- counts + UI sofort aktualisiert

### UIT-023 — Race-Auswahl Standard + Special
- zulässige Kombinationen
- Spezialrennen an/aus
- keine Inkonsistenz im Folge-Flow

### UIT-024 — Min-Swimmer-Grenze
- 0, 1, 2, 3 Teilnehmer
- Build Heats nur dort moeglich, wo spezifiziert

### UIT-025 — Medley / optional participation controls
- Y/N / Stroke assignment
- nur berechtigte Swimmer gehen in Medley/Pogo/Relay-Logik

---

# Block 4 — Heat Builder

### UIT-030 — Individual Heat Generation
- 25m
- 50m
- mehrere Teilnehmerklassen
- Heat-Verteilung plausibel

### UIT-031 — Mindestbelegung / Redistribution
- 3er Grenzfall
- 5/6/7/11/15+ Teilnehmer

### UIT-032 — Confirm / Reshuffle / Re-shuffle after confirm
- Preview → Confirm
- Reshuffle aendert Verteilung
- Re-shuffle nach Confirm loescht Resultate nur dort, wo spezifiziert

### UIT-033 — Manual Move / Heat Editing
- Swimmer zwischen Heats bewegen
- keine Inkonsistenzen / keine verlorenen Daten

### UIT-034 — Progress Tracker
- Status pro Race korrekt
- Go-to-Results nur wenn alles ready

### UIT-035 — Kalkulatorische Heat-Pruefung
Nachrechnen von:
- Max Time / Start Delay
- PB-Summen / Team Target
- sichtbare Whole-Second / Time-Format-Regeln

---

# Block 5 — Relay Builder / Relay Team Logic

### UIT-040 — Team Relay
- Teams generieren
- Splits sichtbar
- PB / Start / Total plausibel
- Ranking fastest total wins

### UIT-041 — 25m Brace
- Team-Paarung plausibel
- target = summe relevanter PBs
- ranking = nearest to target
- gleiche abs variance = gleicher Platz

### UIT-042 — 50m Brace
- wie UIT-041, aber 50m Datenbasis

### UIT-043 — Medley Relay
- stroke-specific PBs
- nur passende Schwimmer
- Start=2 wenn spezifiziert
- ranking korrekt

### UIT-044 — Pogo
- T1 sichtbar
- T2 sichtbar
- Avg korrekt
- Avg-Rundung korrekt
- Target / Team Total / Ranking korrekt

### UIT-045 — Asymmetrische Teams
- ungerade Teamzahlen
- 3er/4er Team Mix
- targets aus tatsaechlichen Teilnehmern

---

# Block 6 — Results Screen (Individual)

### UIT-050 — Zeiteneingabe
- normale Eingabe
- schnelle Eingabe
- Tab / Navigation wenn vorhanden
- ungültige Eingaben sauber abgefangen

### UIT-051 — Net / Variance / Break
- konkrete Nachrechnungen fuer mehrere Schwimmer
- whole seconds vs centiseconds korrekt formatiert

### UIT-052 — Placing Normalfall
- normale Platzierung 1/2/3/4

### UIT-053 — Tie Handling
- 2-way tie
- 3-way tie
- 4-way tie / Platzsprung
- UI und gespeicherter State konsistent

### UIT-054 — Medal Styling
- Gold / Silber / Bronze / Gleichstände korrekt

### UIT-055 — Expected Finish / Total / Delay Darstellung
- sichtbare Zusatzspalten konsistent und nachvollziehbar

### UIT-056 — Partial Results
- fehlende Zeiten
- finalize mit Warnung
- kein Crash

### UIT-057 — Extreme Werte
- sehr langsame Zeiten
- Formatierung intakt
- keine abgeschnittenen / rohen internen Werte

### UIT-058 — Decimal-/Centisecond-Präzision Individual
- echte nicht-runde Finish-Werte (z. B. 23.52, 47.38, 19.87)
- keine ausschließliche Abdeckung über .00 / .50
- sichtbare Formatkonsistenz in Results

### UIT-059 — Near-Tie / Threshold Precision
- near-tie mit minimaler Centisecond-Differenz
- threshold-nahe Break-Faelle mit nicht-runden Werten
- korrektes Ranking / Break-Verhalten ohne Rundungsfehler

---

# Block 7 — Relay Results / Team Cards

### UIT-060 — Relay Time Entry
- Splits eingeben
- Team Total sichtbar
- Rankings aktualisieren sich korrekt

### UIT-061 — Brace / Medley / Pogo Ranking
- nearest-to-target
- equal variance = equal place
- target/variance Nachrechnung

### UIT-062 — Visibility / Readability
- wichtige Werte rot/fett/weiss wo spezifiziert
- auf Touchscreen gut erkennbar

### UIT-063 — Exclusion Rules
- bestimmte Reports/Views enthalten Relays nur dort, wo spezifiziert
- keine falschen Eintraege im Exceeded Report

### UIT-064 — Decimal-/Avg-/Rundungsprüfung Relay
- Relay/Pogo/Avg nicht nur mit glatten Werten
- Rundung und Anzeige explizit pruefen
- Derived values bleiben ueber UI konsistent

---

# Block 8 — Reports

### UIT-070 — Breaker Report
- inline results
- consolidated breakers
- event report
- gleiche Daten = gleiche Werte

### UIT-071 — Exceeded Report
- whole-seconds PB
- actual time richtig formatiert
- over-by korrekt
- keine Artefakte wie `0.14` statt `14.00`

### UIT-072 — Cross-Report Consistency
- gleiche Faelle ueber 3+ Ansichten vergleichen
- gleiche Zahlen, gleiche Formate, keine Duplikate

### UIT-073 — Report Scope
- was erscheint / nicht erscheint
- Relay-Ausnahmen korrekt

### UIT-074 — Decimal Cross-Screen Consistency
- dieselben nicht-runden Decimal-/Centisecond-Werte ueber mehrere Ansichten vergleichen
- Results vs Breaker Report vs Exceeded Report vs Calendar / Event Modal
- keine abgeschnittenen, falsch skalierten oder unterschiedlich gerundeten Werte

---

# Block 9 — Finalize / Unlock / Re-finalize

### UIT-080 — Finalize Flow
- finalize mit kompletten Daten
- finalize mit partial data
- lock state danach korrekt

### UIT-081 — Input Locking nach Finalize
- keine weiteren Bearbeitungen an Stellen, die gesperrt sein muessen

### UIT-082 — Unlock / Re-open
- Event wieder oeffnen
- Aenderungen moeglich
- keine korrupten Zwischenzustaende

### UIT-083 — Re-finalize
- keine doppelten Breaker
- keine doppelten Report-Eintraege
- alte Werte korrekt ersetzt

---

# Block 10 — Calendar / Event Details / Readout

### UIT-090 — Calendar Visibility
- finalisierte Events sichtbar
- richtige Reihenfolge / Inhalte

### UIT-091 — Event Detail Modal
- Teilnehmer
- Races
- Breakers
- Result Summary
- Werte plausibel

### UIT-092 — Calendar Report Consistency
- dieselben Daten wie in Reports / Results

### UIT-093 — Print / Readout
- oeffnet korrekt
- Inhalte plausibel
- nutzbar fuer echten Club-Betrieb

### UIT-094 — Delete / Archive / Follow-up Behavior
- nur wenn vorhanden
- Verhalten danach konsistent
- keine Geistereintraege im Calendar

---

## Pflicht-Nachrechnungen

Mindestens diese Rechenarten muessen im Protokoll mehrfach sichtbar nachgerechnet werden:
- Start Delay
- Net Time
- Variance
- Break Detection
- Relay Target
- Relay Team Total
- Brace nearest-to-target
- Medley nearest-to-target
- Pogo Average (T1/T2/Avg)
- Tie / Place Sprunglogik
- Exceeded Over-by
- Calendar / Report Cross-Screen Werte

---

## Mindestanzahl an dokumentierten Testcases

### Untergrenze fuer WWSC Tier B
Die Protokollierung darf NICHT bei 30-40 groben Sammeltests stehen bleiben.

**Mindestziel fuer eine ernsthafte WWSC UI-Abnahme:**
- **80+ dokumentierte Testcases**
- aufgeteilt ueber alle oben genannten Blöcke
- mit echter Event- und Race-Variation

### Ziel fuer starke Abnahme
- **100–140 dokumentierte Testcases**
- inkl. Re-tests nach Fixes
- inkl. Coverage Matrix

**Wichtig:**
Ein "Szenario" ist KEIN einzelner Testcase.
Beispiel: `Pogo` ist ein Testcluster und zerfaellt typischerweise in mehrere Testcases (T1, T2, Avg, Ranking, Tie, Format, Cross-screen etc.).

---

## Protokollformat pro Testcase

```markdown
### UIT-[ID] — [Titel]
**Block:** [z. B. Results / Calendar / Medley]
**Event Ref:** [E01-E16 oder eigene Event-ID]
**Dimensionen:** [D1-x, D2-x, D3-x, D4-x, D5-x, D6-x]
**Preconditions:** ...
**Schritte:**
1. ...
2. ...
3. ...

**Erwartetes Ergebnis:**
- ...

**Tatsaechliches Ergebnis:**
- ...

**Kalkulatorische Pruefung:**
- Input: ...
- Erwartete Rechnung: ...
- Sichtbares Ergebnis: ...

**Status:** PASS / FAIL / OPEN / NOT TESTED
**Evidenz:** Screenshot / DOM / sichtbarer Wert / API-Abgleich
**Re-Test nach Fix?** ja/nein
```

---

## Coverage-Matrix-Format (Pflicht)

```markdown
| Spec ID | Titel | Getestet? | Status | Event Ref | Evidenz |
|--------|-------|-----------|--------|-----------|---------|
| UIT-001 | Version konsistent | JA | PASS | E03 | ... |
| UIT-044 | Pogo Avg korrekt | JA | PASS | E11 | ... |
| UIT-083 | Re-finalize ohne Duplikate | NEIN | NOT TESTED | — | — |
```

---

## Abschlussblock des Testers

Am Ende MUSS der Tester diese 3 Listen liefern:

### 1. Bewiesen bereit fuer Dino
Nur Dinge, die wirklich usersichtseitig durchgeprueft wurden.

### 2. Noch offen / fehlt
Alles, was nicht getestet oder nicht ausreichend belegt ist.

### 3. Nicht Teil dieser Lieferung / spaeter
Klare Scope-Abgrenzung.

---

## Regeln fuer Balerion bei der Auswertung

Wenn Claude Code oder ein anderer Agent dieses Protokoll liefert, gilt:
- Balerion prueft die Arbeit nach **V0015**.
- Zahlen in Zusammenfassungen gelten erst als wahr, wenn sie mit dem Protokoll konsistent sind.
- Eine Behauptung wie `52 PASS` ohne deckungsgleiche Coverage Matrix ist **nicht ausreichend**.
- Ein Edge-Case-Protokoll ersetzt **nicht** die Full-Coverage-Abnahme.

---

## Endziel

Dino soll vor seinem finalen Acceptance Test nicht nur "ein gutes Gefuehl" haben,
sondern eine **harte, permutationsbasierte, browserbasierte QA-Abnahme** mit sichtbarer Coverage.
