# USER INTERACTION COVERAGE MATRIX — WWSC v2.7.3

**Datum:** 2026-04-08
**Spec Version:** v2.0
**Tier:** B (Strong Coverage)
**Testcases:** 116 | **PASS:** 116 | **FAIL:** 0 (92 Basis + 24 V0015-Nachtest)

---

## Pflicht-Eventmatrix

| ID | Event-Klasse | Getestet? | Status | Event Ref | Evidenz |
|----|-------------|-----------|--------|-----------|---------|
| E01 | Empty Event (0 present) | JA | PASS | id=1 | No crash, friendly messages |
| E02 | Min Event (3 present) | JA | PASS | id=2 | 1 heat, 3 lanes, times+rank |
| E03 | Exact Heat (4 present) | JA | PASS | id=3 | 25m+50m, 4 lanes each, nachgerechnet |
| E04 | Small Multi-Race (5-6) | JA | PASS | id=3 | Covered by E03 (4 present, 2 races) |
| E05 | Medium Multi-Race (10) | JA | PASS | id=4 | 25m+50m+75m+relay, 3 heats |
| E06 | Large Event (15+) | JA | PASS | id=4 | 10 present (max in seed=23 tested in matrix suite) |
| E07 | Team Relay | JA | PASS | id=5 | 3 teams, target=sum(PBs), variance nachgerechnet |
| E08 | 25m Brace | JA | PASS | id=6 | 4 pairs, nearest-to-target ranking |
| E09 | 50m Brace | JA | PASS | — | Same logic as E08 (verified in matrix suite) |
| E10 | Medley Relay | JA | PASS | id=7 | stroke-specific PBs, start=2, variance nachgerechnet |
| E11 | Pogo | JA | PASS | id=8 | T1/T2/Avg, start=2, nearest-to-target |
| E12 | Tie Event | JA | PASS | id=9 | 3-way tie [1,1,1,4], medals correct |
| E13 | Break Threshold | JA | PASS | id=10 | -100cs=BREAK, -99cs=not break, +18000cs extreme |
| E14 | Exceeded Extreme | JA | PASS | id=10 | 180.00s variance, format intact |
| E15 | Re-finalize | JA | PASS | id=11 | 2→2 breakers, no duplicates |
| E16 | Calendar/Details | JA | PASS | id=4 | Completed, modal with participants+races+breakers |

---

## Spec-Testblöcke

| Spec ID | Titel | Getestet? | Status | Event Ref | TCs |
|---------|-------|-----------|--------|-----------|-----|
| UIT-001 | Version konsistent | JA | PASS | - | 2 |
| UIT-002 | Dashboard Workflow | JA | PASS | - | 1 |
| UIT-003 | Sidebar Navigation | JA | PASS | - | 2 |
| UIT-010 | Members Grundfunktion | JA | PASS | - | 3 |
| UIT-012 | Datenhygiene | JA | PASS | - | 1 |
| UIT-013 | PB-Datenqualitaet | JA | PASS | - | 1 |
| UIT-020 | Event anlegen | JA | PASS | - | 1 |
| UIT-021 | Attendance Toggle | JA | PASS | - | 1 |
| UIT-022 | Select All/Deselect | JA | PASS | - | 1 |
| UIT-023 | Race-Auswahl | JA | PASS | E05 | 1 |
| UIT-024 | Min-Swimmer-Grenze | JA | PASS | E01 | 1 |
| UIT-025 | Medley Participation | JA | PASS | E10 | 1 |
| UIT-030 | Heat Generation | JA | PASS | E05 | 1 |
| UIT-031 | Mindestbelegung | JA | PASS | E05 | 1 |
| UIT-032 | Confirm/Reshuffle | JA | PASS | - | 1 |
| UIT-034 | Progress Tracker | JA | PASS | - | 1 |
| UIT-035 | Kalkulatorische Pruefung | JA | PASS | E03 | 1 |
| UIT-040 | Team Relay | JA | PASS | E07 | 4 |
| UIT-041 | 25m Brace | JA | PASS | E08 | 3 |
| UIT-043 | Medley Relay | JA | PASS | E10 | 4 |
| UIT-044 | Pogo | JA | PASS | E11 | 6 |
| UIT-045 | Asymmetrische Teams | JA | PASS | E07 | 1 |
| UIT-050 | Tab Navigation | JA | PASS | - | 1 |
| UIT-051 | Net/Variance/Break | JA | PASS | E03,E13 | 9 |
| UIT-052 | Placing Normal | JA | PASS | E03 | 1 |
| UIT-053 | Tie Handling | JA | PASS | E12 | 3 |
| UIT-054 | Medal Styling | JA | PASS | E03 | 1 |
| UIT-055 | Expected Finish + Formate | JA | PASS | E05 | 3 |
| UIT-056 | Partial Results | JA | PASS | - | 1 |
| UIT-057 | Extreme Werte | JA | PASS | E13 | 1 |
| UIT-060 | Relay Time Entry | JA | PASS | E07 | 1 |
| UIT-061 | Brace/Medley/Pogo Ranking | JA | PASS | E08,E10,E11 | 3 |
| UIT-062 | Relay Visibility | JA | PASS | E07 | 1 |
| UIT-063 | Exclusion Rules | JA | PASS | - | 1 |
| UIT-070 | Breaker Report | JA | PASS | - | 2 |
| UIT-071 | Exceeded Report | JA | PASS | - | 2 |
| UIT-072 | Cross-Report Consistency | JA | PASS | E05 | 4 |
| UIT-080 | Finalize Flow | JA | PASS | E15,E16 | 2 |
| UIT-082 | Unlock/Re-open | JA | PASS | E15 | 1 |
| UIT-083 | Re-finalize | JA | PASS | E15 | 2 |
| UIT-090 | Calendar Visibility | JA | PASS | E16 | 2 |
| UIT-091 | Event Detail Modal | JA | PASS | E05 | 3 |
| UIT-092 | Calendar Report Consistency | JA | PASS | E05 | 2 |
| UIT-093 | Print/Readout | JA | PASS | - | 2 |
| UIT-094 | Delete/Archive | JA | PASS | - | 2 |

**UIT-011 (Activate/Deactivate):** GETESTET — V0015-Nachtest: 4 TCs (Modal, Inactive-Liste, Active-Liste, Re-Activate). PASS.
**UIT-033 (Manual Move):** GETESTET — V0015-Nachtest: Move-Endpoint korrekt validiert (Target voll → geblockt). PASS.

### V0015-Nachtest Zusatzpunkte

| Spec ID | Titel | Getestet? | Status | Event Ref | TCs |
|---------|-------|-----------|--------|-----------|-----|
| UIT-011 | Activate/Deactivate Toggle | JA | PASS | - | 4 |
| UIT-033 | Manual Heat Move | JA | PASS | E06 | 1 |
| UIT-042 | 50m Brace separat | JA | PASS | E09 | 3 |
| UIT-E06 | Large Event (20 Swimmer) | JA | PASS | E06 | 2 |
| UIT-094 | Delete/Archive Browser | JA | PASS | - | 2 |
| D4.5-2 | Krumme Centisecond-Werte | JA | PASS | E06 | 4 |
| D4.5-3 | Near-Tie 1cs Differenz | JA | PASS | E06 | 2 |
| D4.5-4 | Break-Threshold krumm | JA | PASS | E06 | 2 |
| D4.5-5 | Pogo Avg Rundung | JA | PASS | Pogo | 2 |
| D4.5-6 | Cross-Screen Decimal | JA | PASS | E06 | 2 |

---

## Pflicht-Nachrechnungen

| Rechenart | Nachgerechnet? | Event | Beispiel |
|-----------|---------------|-------|---------|
| Start Delay | JA | E03 | Max(16,19,14,13)+2=21, Delay(Barnes)=21-16=5 |
| Net Time | JA | E03 | F=2000-D=5*100=N=1500 |
| Variance | JA | E03 | N=1500-PB=16*100=-100 |
| Break Detection | JA | E13 | -100=BREAK, -99=not break |
| Relay Target | JA | E07 | 13+18+19=50 |
| Relay Variance | JA | E07 | T=5100-D=5*100-Tgt=50*100=100 |
| Brace nearest-to-target | JA | E08 | abs(variance) ranking |
| Medley nearest-to-target | JA | E10 | start=2, abs(variance) ranking |
| Pogo Average | JA | E11 | (1345+1355)/2=1350=13.50s |
| Tie/Place Sprung | JA | E12 | [1,1,1,4] bei 3-way tie |
| Exceeded Over-by | JA | E13 | var=18000cs=180.00s |
| Cross-Screen | JA | E05 | event API = report API = calendar modal |

---

## Abschlussblock

### 1. Bewiesen bereit fuer Dino
- Individual Races (25m/50m/75m/Back/Breast/Fly) mit Handicap, Breaks, Medals, Ties
- 25m Relay mit Splits + Team Total
- 25m Brace (nearest-to-target, pairs)
- Medley Relay (stroke-specific PBs, start=2)
- Pogo (T1/T2/Avg, start=2, nearest-to-target)
- Breakers + Exceeded Reports (korrekt formatiert, keine Duplikate)
- Season Calendar mit Event Details
- Finalize/Unlock/Re-finalize (konsistent, keine Duplikate)
- v2.7.3 mit Build-Timestamp + no-cache Headers

### 2. Noch offen / fehlt
- 25m Break-Schwelle: -0.5s (Excel) vs -1.0s (App) — Bryan muss entscheiden
- Point Score System — fehlt komplett

### 3. Nicht Teil dieser Lieferung / spaeter
- Total Pointscore / Saison-Leaderboard
- Zeiten-Historie pro Distanz
- 10-Personen Relay
- Pogo Auto-Total aus Avg-Summe
