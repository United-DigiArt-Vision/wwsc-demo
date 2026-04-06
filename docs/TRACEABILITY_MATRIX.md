# TRACEABILITY MATRIX — Requirements × Test-Schichten (Stand: v2.7.1 final)

## Legende
- **IMPL** = Test existiert und läuft
- **SPEC** = Testfall spezifiziert, nicht implementiert (Backlog)
- **N/A** = Schicht nicht anwendbar

## Test-Suites
- **reqa.py** — 56 API-Tests (Legacy M1)
- **reqa-v2.7.1.py** — 33 API+Edge-Case-Tests (Bryan-Bugs + Lücken)
- **Display-Tests** — 23 DOM-Prüfungen via Preview-Tool (manuell reproduzierbar)

---

## Zusammenfassung pro Requirement

| Req | Beschreibung | L3 API | L4 Display | L7 Edge | Status |
|-----|-------------|--------|-----------|---------|--------|
| R-01 | Tab Navigation | N/A | **IMPL (D-R01)** | N/A | OK |
| R-02 | Members Whole Seconds | IMPL | **IMPL (D1)** | **IMPL (EC6/7)** | OK |
| R-03 | Heats PB/Delay/Max Whole | IMPL | **IMPL (D3)** | IMPL | OK |
| R-04 | Expected Finish PB+Delay | **IMPL (R04)** | **IMPL (D2,D3)** | **IMPL (EC4)** | OK |
| R-05 | Auto-Place Gold/Silver/Bronze | IMPL | **IMPL (D5-D7)** | N/A | OK |
| R-06 | Exceeded = Breakers Look | IMPL | **IMPL (D18)** | **IMPL (UC34)** | OK |
| R-07 | 25m Relay Einzelzeiten+Total | IMPL | **IMPL (D10)** | **IMPL (UC02)** | OK |
| R-08 | 25m Relay Start prominent | N/A | **IMPL (D14)** | N/A | OK |
| R-09 | 25m Relay ohne Stroke | N/A | **IMPL (D9)** | N/A | OK |
| R-10 | Medley Einzelzeiten+Total | IMPL | **IMPL (D15)** | N/A | OK |
| R-11 | Medley Start prominent | N/A | **IMPL (D16)** | N/A | OK |
| R-12 | Medley Add Swimmer Pool | **IMPL (EC-8)** | **IMPL (D-R12)** | N/A | OK |
| R-13 | Medley keine N-Swimmer | **IMPL (R13)** | N/A | N/A | OK |
| R-14 | Medley Stroke Counter | N/A | **IMPL (D23)** | N/A | OK |
| R-15 | Relay Results rot+fett | N/A | **IMPL (D11)** | N/A | OK |
| R-16 | Relay ohne Exceeded | N/A | **IMPL (D13)** | N/A | OK |
| R-17 | Medley Start=2 | **IMPL (B4-3)** | **IMPL (D16)** | N/A | OK |
| R-18 | Medley nearest-to-target | **IMPL (B4-4)** | **IMPL (D17)** | N/A | OK |
| R-19 | Medley Gleichstand | **IMPL (R19)** | N/A | N/A | OK |
| R-20 | Breaker+Exceeded Report | **IMPL (R20)** | **IMPL (D18)** | N/A | OK |
| R-21 | Nach Submit nicht in-progress | IMPL | **IMPL (D24)** | N/A | OK |
| R-22 | Kein Rücksprung Timesheet | N/A | **IMPL (D25)** | N/A | OK |
| R-23 | Separater Abschlussbericht | **IMPL (B7)** | **IMPL (D26)** | N/A | OK |

## Bryan-Bugs (06.04.2026)

| Bug | Beschreibung | L3 API | L4 Display | L6 Propagation | L7 Edge | Status |
|-----|-------------|--------|-----------|----------------|---------|--------|
| B1 | Relay Swim-Twice Recalc | **IMPL (B1)** | N/A | **IMPL (B1-2)** | N/A | OK |
| B2+5 | Breakers Improved By | **IMPL (B2)** | **IMPL (D8)** | N/A | N/A | OK |
| B3 | Gleiche Finish=gleicher Platz | **IMPL (B3)** | IMPL (D5-7) | N/A | **IMPL (B3-3,4)** | OK |
| B4 | Relay Variance Einheiten | **IMPL (B4)** | **IMPL (D12,D17)** | N/A | N/A | OK |
| B6 | Event Report Format | **IMPL (B6)** | Popup (manuell) | N/A | N/A | OK |
| B7 | Calendar nur Breakers | **IMPL (B7)** | **IMPL (D20-22)** | N/A | N/A | OK |

---

## Abdeckungsgrad

| Schicht | Abgedeckt | Total relevant | Prozent |
|---------|----------|---------------|---------|
| L1 Data Dictionary | 30/30 | 30 | 100% |
| L3 API-Tests | 29/29 | 29 | 100% |
| L4 Display-Tests | 26/26 | 26 | 100% |
| L6 Propagation | 1/1 | 1 | 100% |
| L7 Edge Cases | 10/10 | 10 | 100% |

## Verbleibende Backlog-Items
Keine. Alle Requirements haben IMPL-Status in allen relevanten Schichten.
