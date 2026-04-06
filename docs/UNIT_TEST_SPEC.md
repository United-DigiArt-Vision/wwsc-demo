# UNIT TEST SPEC — WWSC Swimming App v2.6.2 (Bryan Feedback 2026-04-04)

## Ziel
Diese Unit-Test-Spezifikation deckt die Logik, Formatierung, Ranking-Regeln und Datenfilter ab, die direkt aus Bryans Rückmeldung vom 04.04.2026 abgeleitet wurden.

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
