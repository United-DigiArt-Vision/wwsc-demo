# USER INTERACTION TEST PROTOCOL — WWSC v2.7.4

**Datum:** 2026-04-08
**Fokus:** Bryan-Feedback Brace Relay + Relay Team Count
**Version:** v2.7.4, Build: 2026-04-08T19:30:55.267Z
**Events:** EV-A (10 present, 25m Brace + 75m), EV-B (10/11/12 relay count), EV-C (Medley+Pogo regression)

---

## Ergebnis: 22 PASS / 0 FAIL

---

## P1: Brace Attendance Eligibility

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| P1-1 | 10 present (7Y + 3N) alle in Brace | 10 | 10 | PASS |
| P1-2 | N-Swimmers in Brace | 3 of 3 | 3 | PASS |
| P1-3 | N = Standard Events incl. Brace | N-Swimmers teilnehmen | Bestaetigt | PASS |

**Evidenz:** API: `total_in_brace = 10`, alle 3 N-Member-IDs in Brace-Teams gefunden.

---

## P2: Standard vs Special Event Semantik

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| P2-1 | 25m (Standard): alle 10 | 10 | 10 lanes | PASS |
| P2-2 | 75m (Special): nur Y (7) | 7 | 7 lanes | PASS |

**Evidenz:** API: 25m generate-heats → 10 lanes. 75m generate-heats → 7 lanes.

---

## P3: Brace Lane-Layout — alle 3 Screens

| # | Screen | Soll: Lane|Pair|PBs|Target|Start|Finish|Variance|Place | Ist | Status |
|---|--------|------|-----|--------|
| P3-HB | Heat Builder | Lane-basierte Tabelle | Lane\|Pair\|PBs\|Target\|Start Delay\|Team Total\|Variance\|Place | PASS |
| P3-REL | Relays Screen | Lane-basierte Tabelle | Lane\|Pair\|PBs\|Target\|Start\|Finish\|Variance\|Place | PASS |
| P3-RES | Results Screen | Lane-basierte Tabelle | Lane\|Pair\|PBs\|Target\|Start\|Finish\|Variance\|Place | PASS |

**Evidenz:** Screenshots Heat Builder + Relays + Results zeigen identisches kompaktes Layout. Keine Team-Karten.

---

## P4: Cross-Screen Consistency

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| P4-1 | Brace-Werte Relays = Results | Identische Pairs, PBs, Targets, Variances | Bestaetigt | PASS |

**Evidenz:** Relays vars=[+0.73,+0.73,+1.00,+1.50,+2.00], Results identisch.

---

## P5: Brace Start = 2

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| P5-1 | Alle 5 Brace Teams start=2 | 2 | [2,2,2,2,2] | PASS |
| P5-2 | Header zeigt "Start: 2s" | Sichtbar | "Start: 2s \| nearest-to-target wins" | PASS |

---

## P6: Brace — keine Breakers

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| P6-1 | Finalize: 0 Brace-Breakers | 0 | 0 (total: 8, brace: 0) | PASS |
| P6-2 | Kein "BREAK" Text auf Brace-Seite | Nicht vorhanden | Bestaetigt | PASS |

---

## P7: Brace Winner = lowest variance

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| P7-1 | Ranking nach abs(variance) | Niedrigste var = 1st | var=73→1st, 100→3rd, 150→4th, 200→5th | PASS |

---

## P8: Brace Equal Variance = Tie

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| P8-1 | 2 Teams mit var=73 → beide 1st | [1,1] | [1,1] | PASS |
| P8-2 | Naechster Platz springt auf 3 | 3 | 3 | PASS |

---

## P9: Relay Team Count

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| P9-1 | 10 Swimmers → 2 Teams | 2 | 2 | PASS |
| P9-2 | 11 Swimmers → 3 Teams | 3 | 3 | PASS |
| P9-3 | 12 Swimmers → 3 Teams | 3 | 3 | PASS |

---

## P10: Regression

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| P10-1 | Medley: 3 teams, start=2 | 3 / [2,2,2] | 3 / [2,2,2] | PASS |
| P10-2 | Pogo: 2 teams, start=2 | 2 / [2,2] | 2 / [2,2] | PASS |
| P10-3 | Finalize → Complete → Calendar | completed | completed, in Calendar | PASS |
| P10-4 | Console: 0 JS errors | 0 | 0 | PASS |

---

## Abschlussblock

### 1. Bewiesen bereit fuer Dino
- Brace Relay: Y+N beide drin (10/10)
- Brace Lane-Layout auf ALLEN 3 Screens (HB + Relays + Results)
- Brace Start=2 fuer alle Teams
- Brace keine Breakers (0 Brace-Breakers nach Finalize)
- Brace lowest variance wins (Ranking korrekt)
- Brace Ties: equal variance → equal place (1,1,3)
- Relay Team Count: <11→2, >=11→3 (Grenze 11 verifiziert)
- Standard vs Special korrekt (N = Standard incl. Brace, Y = auch Special)
- Cross-Screen-Konsistenz bewiesen (Relays = Results)
- Medley + Pogo + Finalize Regression PASS
- v2.7.4 mit no-cache Headers

### 2. Noch offen / fehlt
- 25m Break-Schwelle: -0.5s vs -1.0s (Bryan-Entscheidung)
- Point Score System

### 3. Nicht Teil dieser Lieferung
- Total Pointscore / Leaderboard
- Zeiten-Historie
- 10-Personen Relay
