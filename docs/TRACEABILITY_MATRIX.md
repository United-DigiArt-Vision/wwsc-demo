# TRACEABILITY MATRIX — Requirements × Test-Schichten

## Legende
- **IMPL** = Test existiert und läuft (in reqa.py oder reqa-v2.7.1.py)
- **SPEC** = Testfall spezifiziert (in UNIT_TEST_SPEC oder INTEGRATION_TEST_SPEC), aber noch nicht implementiert
- **FEHL** = Weder spezifiziert noch implementiert — LÜCKE
- **N/A** = Schicht nicht anwendbar für dieses Requirement

---

## R-01 — Tab Navigation

| Schicht | Status | Testfall |
|---------|--------|----------|
| L1 Data Dict | N/A | Kein Datenfeld betroffen |
| L2 Transform | N/A | Keine Berechnung |
| L3 API | N/A | Rein Frontend |
| L4 Display | **SPEC** | UT-14: Tab→nächstes Feld, Shift+Tab zurück, hidden übersprungen |
| L5 User E2E | **SPEC** | IT-02: Times Sheet → Tab-Reihenfolge logisch |
| L6 Propagation | N/A | Keine Zustandsänderung |
| L7 Edge Cases | **FEHL** | Was passiert wenn ALLE Felder disabled sind? |

**Lücken:** L4+L5 nur spezifiziert, nicht implementiert. L7 fehlt komplett.

---

## R-02 — Members-Zeiten ganze Sekunden

| Schicht | Status | Testfall |
|---------|--------|----------|
| L1 Data Dict | **IMPL** | DATA_DICTIONARY: time_25m etc. = Whole Seconds |
| L2 Transform | **SPEC** | UT-01: formatWhole(16)→"16", parseWhole("16")→16 |
| L3 API | **IMPL** | reqa.py T4b: PB updated=14 (ganzzahlig) |
| L4 Display | **SPEC** | UT-01-3: Kein Dezimalwert im Members-Display |
| L5 User E2E | **SPEC** | IT-01: Members öffnen, PBs prüfen |
| L6 Propagation | **FEHL** | Nach PB-Edit: Heats mit altem PB → inkonsistent? |
| L7 Edge Cases | **FEHL** | PB=0? PB=null? Dezimaleingabe "16.5" → was passiert? |

**Lücken:** L2, L4, L5 nur Spec. L6 + L7 fehlen.

---

## R-03 — Heats ganze Sekunden (PB/Delay/Max)

| Schicht | Status | Testfall |
|---------|--------|----------|
| L1 Data Dict | **IMPL** | DD: handicap_time, start_delay, max_time = Seconds |
| L2 Transform | **IMPL** | reqa.py T20: start_delay = (max+2) - PB |
| L3 API | **IMPL** | reqa.py T19/T20: Heat-Generierung korrekt |
| L4 Display | **SPEC** | UT-02: PB/Delay/Max ohne Hundertstel |
| L5 User E2E | **SPEC** | IT-01: Heat Builder öffnen, Werte prüfen |
| L6 Propagation | N/A | Heats werden bei Generierung berechnet |
| L7 Edge Cases | **IMPL** | reqa.py T19a-j: Verschiedene Swimmer-Counts |

**Lücken:** L4 + L5 nur Spec.

---

## R-04 — Results Expected Finish (PB + Delay)

| Schicht | Status | Testfall |
|---------|--------|----------|
| L1 Data Dict | **IMPL** | DD: Expected Finish = handicap_time + start_delay (Sek) |
| L2 Transform | **SPEC** | UT-03: pb=16, delay=5 → exp=21 |
| L3 API | **FEHL** | Kein API-Test der Exp. Finish prüft |
| L4 Display | **SPEC** | UT-03-3: Anzeige ohne Hundertstel, Spalte heißt "Exp. Finish" |
| L5 User E2E | **SPEC** | IT-07: Results → Spalte sichtbar, Werte plausibel |
| L6 Propagation | N/A | Wird aus PB+Delay berechnet |
| L7 Edge Cases | **FEHL** | PB=null → Exp. Finish = "—"? Delay=0 → Exp=PB? |

**Lücken:** L2-L5 nur Spec. L3 + L7 fehlen.

---

## R-05 — Auto-Placing Gold/Silver/Bronze

| Schicht | Status | Testfall |
|---------|--------|----------|
| L1 Data Dict | N/A | Styling, kein Datenfeld |
| L2 Transform | **SPEC** | UT-04: place=1→gold, 2→silver, 3→bronze |
| L3 API | **IMPL** | reqa-v2.7.1 B3: Ranking korrekt |
| L4 Display | **SPEC** | UT-04: Farb-Mapping |
| L5 User E2E | **SPEC** | IT-08: Visuelle Prüfung |
| L6 Propagation | N/A | |
| L7 Edge Cases | **IMPL** | reqa-v2.7.1 B3: Gleichstand → gleicher Platz |

**Lücken:** L2, L4, L5 nur Spec.

---

## R-06 — Exceeded Report gleicher Look wie Breakers

| Schicht | Status | Testfall |
|---------|--------|----------|
| L1 Data Dict | **IMPL** | DD: Exceeded = variance > 200cs |
| L2 Transform | N/A | |
| L3 API | **FEHL** | Kein Test der Exceeded-API-Response prüft |
| L4 Display | **SPEC** | UT-12-2: Breaker Report enthält Exceeded |
| L5 User E2E | **SPEC** | IT-11: Gleiches Format/Lesbarkeit |
| L6 Propagation | N/A | |
| L7 Edge Cases | **FEHL** | 0 Exceeded? Exceeded + Break gleichzeitig? |

**Lücken:** L3 + L7 fehlen. L4 + L5 nur Spec.

---

## R-07 — 25m Relay Einzelzeiten + Team Total

| Schicht | Status | Testfall |
|---------|--------|----------|
| L1 Data Dict | **IMPL** | DD: split_time=CS, target_time=S |
| L2 Transform | N/A | |
| L3 API | **IMPL** | reqa-v2.7.1 B4: Relay-Teams korrekt |
| L4 Display | **SPEC** | IT-03: Einzelzeiten sichtbar, Team Total sichtbar |
| L5 User E2E | **SPEC** | IT-03: 25m Relay öffnen |
| L6 Propagation | **IMPL** | reqa-v2.7.1 B1: Add Swimmer → recalc |
| L7 Edge Cases | **FEHL** | Team mit nur 1 Swimmer? split_time=null? |

**Lücken:** L4 + L5 nur Spec. L7 fehlt.

---

## R-08 — 25m Relay Startzeit prominent

| Schicht | Status | Testfall |
|---------|--------|----------|
| L4 Display | **SPEC** | IT-03: Startzeit prominent sichtbar |
| L5 User E2E | **SPEC** | IT-03 |

**Lücken:** Nur Spec, kein automatisierter Test.

---

## R-09 — 25m Relay ohne Stroke-Spalte

| Schicht | Status | Testfall |
|---------|--------|----------|
| L4 Display | **FEHL** | Kein Test der prüft: Stroke-Header NICHT vorhanden |
| L5 User E2E | **SPEC** | IT-03: keine Stroke-Spalte |

**Lücken:** L4 fehlt. L5 nur Spec.

---

## R-10 — Medley Einzelzeiten + Team Total

| Schicht | Status | Testfall |
|---------|--------|----------|
| L3 API | **IMPL** | reqa-v2.7.1 B4: Medley Teams korrekt |
| L4 Display | **SPEC** | IT-04: Einzelzeiten sichtbar |

**Lücken:** L4 nur Spec.

---

## R-11 — Medley Startzeit prominent

| Schicht | Status | Testfall |
|---------|--------|----------|
| L4 Display | **FEHL** | Kein Test |

**Lücken:** Komplett ungetestet.

---

## R-12 — Medley Add Swimmer Pool = alle eligible

| Schicht | Status | Testfall |
|---------|--------|----------|
| L2 Transform | **SPEC** | UT-05: Eligibility Filter |
| L3 API | **FEHL** | Kein API-Test der Add-Swimmer-Pool prüft |
| L4 Display | **SPEC** | IT-05: Dropdown enthält alle eligible |
| L5 User E2E | **SPEC** | IT-05 |

**Lücken:** L2-L5 nur Spec. L3 fehlt.

---

## R-13 — Medley keine "No"-Schwimmer

| Schicht | Status | Testfall |
|---------|--------|----------|
| L2 Transform | **SPEC** | UT-05-5/6: N→nicht eligible, leer→nicht eligible |
| L3 API | **FEHL** | Kein API-Test der prüft: N-Swimmer nicht in Teams |
| L5 User E2E | **SPEC** | IT-04 |

**Lücken:** L2-L5 nur Spec. L3 fehlt.

---

## R-14 — Medley Stroke Counter

| Schicht | Status | Testfall |
|---------|--------|----------|
| L2 Transform | **SPEC** | UT-07: Counter zählt korrekt |
| L4 Display | **SPEC** | IT-06: Counter sichtbar |

**Lücken:** Nur Spec.

---

## R-15 — Relay Results rot und fett

| Schicht | Status | Testfall |
|---------|--------|----------|
| L4 Display | **FEHL** | Kein automatisierter Test der CSS prüft |

**Lücken:** Visuelles Styling schwer automatisiert testbar. Manuell verifiziert via Screenshot.

---

## R-16 — Relay Sheet ohne Exceeding Report

| Schicht | Status | Testfall |
|---------|--------|----------|
| L4 Display | **SPEC** | UT-12-1: Relay sheet rendert keinen Exceeded Block |

**Lücken:** Nur Spec.

---

## R-17 — Medley jedes Team startet bei 2

| Schicht | Status | Testfall |
|---------|--------|----------|
| L2 Transform | **SPEC** | UT-08: start_delay=2 für alle Medley Teams |
| L3 API | **IMPL** | reqa-v2.7.1 B4-3: Medley start_delay=2 |
| L4 Display | **SPEC** | IT-10: jedes Team startet bei 2 |

**Lücken:** L2 + L4 nur Spec.

---

## R-18 — Medley Ranking nearest-to-target

| Schicht | Status | Testfall |
|---------|--------|----------|
| L2 Transform | **SPEC** | UT-09: abs(variance) entscheidet |
| L3 API | **IMPL** | reqa-v2.7.1 B4-4: variance=0 bei perfect time |
| L5 User E2E | **SPEC** | IT-10 |

**Lücken:** L2 + L5 nur Spec.

---

## R-19 — Medley Gleichstand = gleicher Platz

| Schicht | Status | Testfall |
|---------|--------|----------|
| L2 Transform | **SPEC** | UT-10: gleiche abs(var) → gleicher Platz |
| L3 API | **FEHL** | Kein Medley-spezifischer Gleichstand-Test |

**Lücken:** L2 nur Spec. L3 fehlt für Medley (nur Individual in B3 getestet).

---

## R-20 — Breaker Report enthält Exceeded

| Schicht | Status | Testfall |
|---------|--------|----------|
| L3 API | **FEHL** | Kein API-Test der /reports/exceeded prüft |
| L4 Display | **SPEC** | UT-12-2 |

**Lücken:** L3 fehlt. L4 nur Spec.

---

## R-21 — Nach Submit nicht "in progress"

| Schicht | Status | Testfall |
|---------|--------|----------|
| L3 API | **IMPL** | reqa.py T25f: Old event status=completed |
| L4 Display | **SPEC** | IT-12: UI zeigt nicht "in progress" |

**Lücken:** L4 nur Spec.

---

## R-22 — Kein Rücksprung zu Timesheet

| Schicht | Status | Testfall |
|---------|--------|----------|
| L4 Display | **FEHL** | Kein Test der prüft wohin navigiert wird nach Complete |
| L5 User E2E | **SPEC** | IT-12 |

**Lücken:** L4 fehlt. L5 nur Spec.

---

## R-23 — Separater Abschlussbericht

| Schicht | Status | Testfall |
|---------|--------|----------|
| L3 API | **IMPL** | reqa-v2.7.1 B7: Report hat attendance+races+results |
| L4 Display | **SPEC** | IT-12: Report öffnet sich |
| L5 User E2E | **SPEC** | IT-17: Werte korrekt formatiert |

**Lücken:** L4 + L5 nur Spec.

---

## Bryan-Bugs (06.04.2026) — Zusätzlich zu PRD

## B1 — Relay Swim Twice Recalculate

| Schicht | Status | Testfall |
|---------|--------|----------|
| L2 Transform | **IMPL** | recalcRelayTeam() im Code |
| L3 API | **IMPL** | reqa-v2.7.1 B1-1 |
| L6 Propagation | **FEHL** | Kein Test der ALLE Felder nach Add prüft (target, delay, max) |

**Lücken:** L6 fehlt — genau der Punkt der Bryans Bug war.

---

## B2+5 — Breakers Improved By falsch

| Schicht | Status | Testfall |
|---------|--------|----------|
| L1 Data Dict | **IMPL** | DD: improvement = pb*100 - net_time |
| L2 Transform | **SPEC** | UT-16: Konvertierung dokumentiert |
| L3 API | **IMPL** | reqa-v2.7.1 B2-4/5/6 |
| L4 Display | **FEHL** | Kein DOM-Test der prüft: "Improved By zeigt -1.00" |

**Lücken:** L4 fehlt.

---

## B3 — Gleiche Finish = gleicher Platz

| Schicht | Status | Testfall |
|---------|--------|----------|
| L3 API | **IMPL** | reqa-v2.7.1 B3-1/B3-2 |
| L4 Display | **FEHL** | Kein DOM-Test für Auto-Place Anzeige bei Gleichstand |
| L7 Edge Cases | **FEHL** | 3-Wege-Gleichstand? 4-Wege? |

**Lücken:** L4 + L7 fehlen.

---

## B4 — Relay Variance Einheiten

| Schicht | Status | Testfall |
|---------|--------|----------|
| L1 Data Dict | **IMPL** | DD: variance = total_cs - start_s*100 - target_s*100 |
| L3 API | **IMPL** | reqa-v2.7.1 B4-1 bis B4-4 |
| L4 Display | **FEHL** | Kein DOM-Test der Variance-Anzeige prüft |

**Lücken:** L4 fehlt.

---

## B6 — Event Report rohe Centiseconds

| Schicht | Status | Testfall |
|---------|--------|----------|
| L3 API | **IMPL** | reqa-v2.7.1 B6-1/2 |
| L4 Display | **FEHL** | Popup-Window — nicht DOM-testbar mit Preview |

**Lücken:** L4 technisch schwierig (window.open).

---

## B7 — Season Calendar nur Breakers

| Schicht | Status | Testfall |
|---------|--------|----------|
| L3 API | **IMPL** | reqa-v2.7.1 B7-1/2/3 |
| L4 Display | **FEHL** | Kein DOM-Test des Modals |

**Lücken:** L4 fehlt.

---

## ZUSAMMENFASSUNG DER LÜCKEN

### Kritisch (kann Bugs verursachen die Bryan sofort sieht):

| # | Requirement | Fehlende Schicht | Beschreibung |
|---|------------|-----------------|--------------|
| 1 | R-13 | L3 API | Kein Test: N-Swimmer nicht in Medley-Teams |
| 2 | R-19 | L3 API | Kein Medley-Gleichstand-Test |
| 3 | R-20 | L3 API | Kein Test: /reports/exceeded Endpoint |
| 4 | B1 | L6 Propagation | Kein Test: target/delay/max NACH Add Swimmer |
| 5 | Alle | L4 Display | Keine DOM-Tests für angezeigte Werte |

### Wichtig (Spec existiert, aber kein implementierter Test):

| # | Requirements | Fehlende Schicht |
|---|-------------|-----------------|
| 6 | R-01, R-14 | L4+L5 | Tab-Navigation, Stroke Counter |
| 7 | R-02, R-03, R-04 | L2 | Formatierungs-Unittests |
| 8 | R-05, R-09, R-12 | L4 | Display-Verifikation |
| 9 | R-22 | L4+L5 | Navigation nach Complete |

### Fehlende Edge Cases (L7):

| # | Requirement | Edge Case |
|---|------------|-----------|
| 10 | R-02 | PB=0, PB=null, Dezimaleingabe |
| 11 | R-07 | Team mit nur 1 Swimmer |
| 12 | B3 | 3-Wege-Gleichstand, 4-Wege |
| 13 | R-04 | PB=null → Expected Finish |
| 14 | R-06 | 0 Exceeded Swimmers |
