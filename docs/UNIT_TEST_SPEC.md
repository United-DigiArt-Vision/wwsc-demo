> **HISTORISCH (Milestone-Snapshot — nicht mehr Verhaltens-SSOT).** Aktueller Stand: `docs/00-DOC-INDEX.md` → `SYSTEM-SPEC-v2.12.0.md` / `DATA_DICTIONARY.md` / `API-REFERENCE-v2.12.0.md` / `UI-SCREEN-SPEC-v2.12.0.md`.

# UNIT TEST SPEC — WWSC Swimming App v2.7.1 (Updated 2026-04-06)

## Ziel
Diese Unit-Test-Spezifikation deckt die Logik, Formatierung, Ranking-Regeln und Datenfilter ab, die direkt aus Bryans Rückmeldungen vom 04.04 und 06.04.2026 abgeleitet wurden.

## LEKTION (v2.7.1): Einheiten-Konsistenz als Pflichtprüfung
Das System hat zwei Zeitsysteme: WHOLE SECONDS (PB, Delay, Max, Target) und CENTISECONDS (Finish, Net, Variance, Split, Total).
Jede Berechnung und jede Anzeige, die Werte aus beiden Systemen mischt, MUSS konvertieren (*100 oder /100).
Tests müssen ALLE Codepfade prüfen — Backend-API UND Frontend-Rendering — nicht nur einen davon.

## UT-01 — Ganze Sekunden: Members
Design Ref: R-02

- UT-01-1: Input 16 → Anzeige 16
- UT-01-2: Input 39 → Anzeige 39
- UT-01-3: Kein Dezimalwert im Members-Display
- UT-01-4: Numpad / Edit-Flow erlaubt keine Hundertstel für diese Felder

## UT-02 — Ganze Sekunden: Heats
Design Ref: R-03

- UT-02-1: PB aus Members wird ohne Hundertstel gerendert
- UT-02-2: Delay wird ohne Hundertstel gerendert
- UT-02-3: Max-Time wird ohne Hundertstel gerendert

## UT-03 — Expected Finish in Results
Design Ref: R-04

- UT-03-1: expected_finish = pb + delay
- UT-03-2: Beispiel pb=16, delay=5 → expected_finish=21
- UT-03-3: Anzeige ohne Hundertstel

## UT-04 — Auto Place Styling Mapping
Design Ref: R-05

- UT-04-1: place=1 → gold style
- UT-04-2: place=2 → silver style
- UT-04-3: place=3 → bronze style
- UT-04-4: place>3 → kein Medal-Style

## UT-05 — Medley Eligibility Filter
Design Ref: R-12, R-13

- UT-05-1: entry=Y → eligible
- UT-05-2: entry=Back → eligible
- UT-05-3: entry=Breast → eligible
- UT-05-4: entry=Free → eligible
- UT-05-5: entry=N → nicht eligible
- UT-05-6: entry='' → nicht eligible
- UT-05-7: Add-Swimmer-Liste enthält nur eligible swimmers

## UT-06 — Medley Auto Assignment Marker
Design Ref: R-12/R-13 Kontext

- UT-06-1: special_event_entry=Y + auto assigned → Stroke-Anzeige enthält (Y)
- UT-06-2: expliziter Stroke (Back/Breast/Free) → kein (Y)

## UT-07 — Medley Stroke Counter
Design Ref: R-14

- UT-07-1: Counter Y zählt nur present+Y
- UT-07-2: Counter Back zählt nur present+Back
- UT-07-3: Counter Breast zählt nur present+Breast
- UT-07-4: Counter Free zählt nur present+Free
- UT-07-5: N oder leer werden nicht mitgezählt

## UT-08 — Medley Start Rule
Design Ref: R-17

- UT-08-1: jedes Team start_delay = 2
- UT-08-2: Regel gilt für alle Medley Teams unabhängig von Team PB

## UT-09 — Medley Ranking nearest-to-target
Design Ref: R-18

- UT-09-1: variance +1 gewinnt gegen +3
- UT-09-2: variance -1 gewinnt gegen +2
- UT-09-3: abs(variance) entscheidet, nicht Vorzeichen allein
- UT-09-4: variance 0 ist bestes Ergebnis

## UT-10 — Medley Equal Placement
Design Ref: R-19

- UT-10-1: zwei Teams mit gleicher abs(variance) → gleicher Platz
- UT-10-2: Rankingfolge 1,1,3 bei Gleichstand auf Platz 1

## UT-11 — Relay Result Visibility Flags
Design Ref: R-15

- UT-11-1: Relay place output nutzt rot
- UT-11-2: Relay place output nutzt bold

## UT-12 — Exceeded Report Placement
Design Ref: R-16, R-20

- UT-12-1: Relay sheet rendert keinen Exceeded Report Block
- UT-12-2: Breaker Report enthält Exceeded Report Daten

## UT-13 — Season Report Data Assembly
Design Ref: R-21, R-22, R-23

- UT-13-1: Report enthält attendance list
- UT-13-2: Report enthält heats bzw. relay teams
- UT-13-3: Report enthält results / totals / places soweit vorhanden
- UT-13-4: Complete Event setzt Status auf completed

## UT-14 — Tab Navigation Ordering
Design Ref: R-01

- UT-14-1: Tab springt zum nächsten sichtbaren Eingabefeld
- UT-14-2: Shift+Tab springt zurück
- UT-14-3: Hidden/disabled Felder werden übersprungen

## UT-15 — Einheiten-Konsistenz: Relay Variance (Bryan 06.04)
Design Ref: Relay Variance Berechnung

- UT-15-1: Relay total_time ist CENTISECONDS (via Numpad/parseTime)
- UT-15-2: start_delay ist WHOLE SECONDS (aus DB)
- UT-15-3: target_time ist WHOLE SECONDS (Summe der PBs)
- UT-15-4: net_time = total_time(cs) - start_delay(s) * 100
- UT-15-5: variance = net_time(cs) - target_time(s) * 100
- UT-15-6: Beispiel: target=49s, delay=26s, total=7500cs → net=7500-2600=4900, var=4900-4900=0
- UT-15-7: Anzeige variance mit formatTime() (centiseconds)

## UT-16 — Einheiten-Konsistenz: Breakers Inline Report (Bryan 06.04)
Design Ref: Results Breakers Section

- UT-16-1: handicap_time (PB) ist WHOLE SECONDS
- UT-16-2: net_time ist CENTISECONDS
- UT-16-3: improvement = handicap_time(s) * 100 - net_time(cs) — MUSS konvertieren
- UT-16-4: Beispiel: PB=14s, net=1300cs → improvement = 1400-1300 = 100cs → formatTime(100) = "1.00"
- UT-16-5: Anzeige Old PB mit formatWhole() (ganze Sekunden)
- UT-16-6: Anzeige New Time mit formatTime() (centiseconds)
- UT-16-7: Anzeige Improved mit formatTime() (centiseconds)

## UT-17 — Einheiten-Konsistenz: Event Report Breakers (Bryan 06.04)
Design Ref: showSeasonReport()

- UT-17-1: API liefert old_pb in CENTISECONDS (already converted *100 by server)
- UT-17-2: API liefert new_time in CENTISECONDS
- UT-17-3: API liefert improvement in CENTISECONDS
- UT-17-4: Anzeige old_pb mit formatTime() — NICHT roher Wert + "s"
- UT-17-5: Anzeige new_time mit formatTime()
- UT-17-6: Anzeige improvement mit formatTime()

## UT-18 — Einheiten-Konsistenz: Season Calendar Event Details (Bryan 06.04)
Design Ref: viewEventDetails()

- UT-18-1: Breaker old_pb Anzeige mit formatTime() — NICHT roher Wert + "s"
- UT-18-2: Breaker new_time mit formatTime()
- UT-18-3: Breaker improvement mit formatTime()

## UT-19 — Individual Results: Equal Finish = Equal Place (Bryan 06.04)
Design Ref: Auto-Placing Logik

- UT-19-1: Zwei Swimmer mit identischer finish_time → gleicher Auto-Place
- UT-19-2: Beispiel: 52.56 und 52.56 → beide 1st
- UT-19-3: Nächster Platz springt (1,1,3 — nicht 1,2,3)

## UT-20 — Relay Swim Twice: Recalculation (Bryan 06.04)
Design Ref: Relay Add Swimmer

- UT-20-1: Nach "Add Swimmer" wird target_time neu berechnet (PBs aller Legs)
- UT-20-2: start_delay wird neu berechnet basierend auf neuem target
- UT-20-3: max_time wird neu berechnet
- UT-20-4: Team Total zeigt neuen target_time korrekt an

## UT-21 — Relay Team Total Display Einheiten (Bryan 06.04)
Design Ref: Heat Builder Relay Total

- UT-21-1: Vor Zeiteingabe: Team Total = target_time → formatWhole() (ganze Sekunden)
- UT-21-2: Nach Zeiteingabe: Team Total = total_time → formatTime() (centiseconds)
- UT-21-3: NICHT mischen: formatWhole auf centisecond-Wert ist falsch
