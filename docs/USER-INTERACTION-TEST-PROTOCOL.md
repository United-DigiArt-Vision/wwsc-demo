# USER INTERACTION TEST PROTOCOL — Edge Cases & Permutationen
**Version:** v2.7.3 (nach Live-Place-Fix)
**Datum:** 2026-04-08
**Tester:** Claude Code (Browser-basiert via Preview)
**Spezifikation:** USER-INTERACTION-TEST-SPEC.md v2.0

---

## Szenario 1: Null-State (0 Schwimmer)

**Setup:** Event erstellt, 0 Members present.

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| S1-1 | Times Sheet laedt | Seite zeigt Attendance | Attendance: 0 | PASS |
| S1-2 | Attendance Count | 0 | 0 | PASS |
| S1-3 | Build Heats unterer Button | disabled bei < 3 | disabled=true | PASS |
| S1-4 | Min-Swimmers Warnung | "Need at least 3" sichtbar | Sichtbar | PASS |
| S1-5 | Heat Builder bei 0 Races | Freundliche Meldung, kein Crash | "No events selected. Go to Times Sheet." | PASS |
| S1-6 | Results bei 0 Heats | Freundliche Meldung, kein Crash | "No races with heats yet." | PASS |
| S1-7 | Build Heats oberer Button | Sollte disabled oder abgefangen | Nicht disabled, aber alert() bei Klick | PASS (funktional ok, UX verbesserbar) |

---

## Szenario 2: Asymmetrische Relays (11 Schwimmer)

**Setup:** 11 Members present. Races: 25m + 25m Relay.

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| S2-1 | Heat-Verteilung 11 Swimmer | 3 Heats [4,4,3] | [4,4,3] | PASS |
| S2-2 | Relay Teams | 3 Teams (asymmetrisch) | Team1: 3, Team2: 4, Team3: 4 | PASS |
| S2-3 | Target = Summe PBs | Team1: 13+16+18=47 | 47 | PASS |
| S2-4 | Target = Summe PBs | Team2: 14+16+18+21=69 | 69 | PASS |
| S2-5 | Target = Summe PBs | Team3: 14+16+19+21=70 | 70 | PASS |
| S2-6 | Variance Team1 | 7100-2500-4700=-100cs | -100cs | PASS |
| S2-7 | Variance Team2 | 7200-300-6900=0cs | 0cs | PASS |
| S2-8 | Variance Team3 | 7300-200-7000=100cs | 100cs | PASS |
| S2-9 | Ranking | Fastest total_time wins | [1,2,3] | PASS |
| S2-10 | UI: Place rot+fett | "1st" sichtbar | Sichtbar, Start: 25s, Target: 47 | PASS |

**Nachrechnung S2-6:** `total(7100) - delay(25)*100 - target(47)*100 = 7100 - 2500 - 4700 = -100` ✅

---

## Szenario 3: Extreme Gleichstaende (Ties)

**Setup:** 4 Members, 50m Individual.
**Aktion:** Lane 1 = break finish (45.00). Lane 2 = extreme (226.00). Lane 3+4 = tied (52.00).

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| S3-1 | DB-Places bei Tie | [1, 4, 2, 2] | [1, 4, 2, 2] | PASS |
| S3-2 | UI Live-Places bei Tie | Beide Tied-Swimmer = 2nd 🏆 | 2 🏆 + 2 🏆 (beide Silver) | PASS |
| S3-3 | Gold fuer 1st | Bryan = Gold | 1 🏆 (Gold) | PASS |
| S3-4 | 4th fuer langsamsten | Andrew = 4 (grau) | 4 (grau) | PASS |
| S3-5 | Kein 3rd (uebersprungen) | Platz 3 existiert nicht | Korrekt — 1,2,2,4 | PASS |

**BUG GEFUNDEN UND GEFIXT:** Die Live-Place-Berechnung in `results.js` vergab Plaetze per Index (1,2,3,4) ohne Tie-Handling. Fix: `livePlaces` nutzt jetzt dieselbe Logik wie der Server — gleiche `finish_time` = gleicher `place`.

---

## Szenario 4: Extreme Abweichungen

**Setup:** 50m, 4 Members. Lane 1: exakter Break-Threshold. Lane 2: 3 Minuten ueber PB.

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| S4-1 | Break Detection (exact -1.00s) | is_break=1 | is_break=1 | PASS |
| S4-2 | Nachrechnung Break | PB=32, D=14, F=45.00→Net=31.00→Var=-1.00 | net=3100cs, var=-100cs | PASS |
| S4-3 | Extreme Slow formatiert | 226.00s (3min+) als "226.00" | "226.00" sichtbar | PASS |
| S4-4 | Nachrechnung Extreme | PB=39, D=7, F=226.00→Net=219.00→Var=+180.00 | net=21900cs, var=18000cs | PASS |
| S4-5 | Break-Text sichtbar | "BREAK" in Break-Spalte | 1 Break-Zelle | PASS |
| S4-6 | Keine Format-Anomalien | Keine abgeschnittenen Zeiten | Alles korrekt dargestellt | PASS |

**Nachrechnung S4-2:** `finish(4500) - delay(14)*100 = 4500-1400 = 3100 = net`. `3100 - PB(32)*100 = 3100-3200 = -100 = variance` ✅
**Nachrechnung S4-4:** `finish(22600) - delay(7)*100 = 22600-700 = 21900 = net`. `21900 - PB(39)*100 = 21900-3900 = 18000 = variance = 180.00s` ✅

---

## Szenario 5: Cross-Screen Konsistenz (End-to-End)

**Setup:** Event aus S3/S4 finalized + completed. Breaker: Bryan Hesketh 50m.

| # | Testfall | Soll | Ist | Status |
|---|---------|------|-----|--------|
| S5-1 | Event Breakers API | 1 Breaker | 1 | PASS |
| S5-2 | Consolidated Breakers API | 1 (nur dieses Event) | 1 | PASS |
| S5-3 | Event Report API | 1 Breaker | 1 | PASS |
| S5-4 | Werte Event API | old=3200, new=3100, imp=100 | Korrekt | PASS |
| S5-5 | Werte Consolidated API | old=3200, new=3100, imp=100 | Korrekt | PASS |
| S5-6 | Werte Report API | old=3200, new=3100, imp=100 | Korrekt | PASS |
| S5-7 | Cross-Screen Match | Alle 3 identisch | **PASS** | PASS |
| S5-8 | Calendar Modal | "32.00 → 31.00 (⬇️ 1.00)" | Korrekt formatiert | PASS |
| S5-9 | Keine rohen Centiseconds | Kein "3200s" oder "0.32" | Raw=false, Formatted=true | PASS |
| S5-10 | Console Errors | 0 | 0 | PASS |

**Nachrechnung S5:** PB=32s=3200cs. Net=3100cs. Improvement=3200-3100=100cs=1.00s. Calendar: "32.00 → 31.00 (1.00)" ✅

---

## ZUSAMMENFASSUNG

| Szenario | Tests | PASS | FAIL | Bugs gefunden |
|----------|-------|------|------|---------------|
| S1: Null-State | 7 | 7 | 0 | 0 (UX-Hinweis: oberer Button nicht disabled) |
| S2: Asymmetrische Relays | 10 | 10 | 0 | 0 |
| S3: Extreme Gleichstaende | 5 | 5 | 0 | 1 Bug gefunden+gefixt (Live-Place Tie) |
| S4: Extreme Abweichungen | 6 | 6 | 0 | 0 |
| S5: Cross-Screen Konsistenz | 10 | 10 | 0 | 0 |
| **GESAMT** | **38** | **38** | **0** | **1 Bug gefixt** |

---

## Bug waehrend Test gefunden und gefixt

**Live-Place Tie-Handling in results.js:**
- **Problem:** `livePlaces` vergab Plaetze per Index (1,2,3,4) statt gleichen Platz bei gleicher Finish-Time.
- **Fix:** Tie-Logik in `livePlaces` Berechnung — gleiche `finish_time` = gleicher `place`, naechster Platz springt.
- **Verifiziert:** 3-way tie zeigt korrekt [1,4,2,2] mit passenden Medal-Colors.

---

## Endabnahme-Liste

### Fuer Bryan jetzt bereit:
- Alle Individual Races mit Handicap, Break-Detection, Medal-Styling, Tie-Handling
- 25m Relay mit Splits, asymmetrische Teams
- 25m/50m Brace, Medley Relay, Pogo (2 Timekeeper)
- Breakers/Exceeded Reports konsistent ueber alle Screens
- Season Calendar mit Event Details
- Extreme Zeiten korrekt formatiert (bis 226.00s+)
- Equal Place bei Ties (1,1,3 / 1,4,2,2 etc.)
- Null-State: kein Crash, freundliche Meldungen

### Noch offen:
- 25m Break-Schwelle: -0.5s vs -1.0s (Bryan muss entscheiden)
- Point Score System (fehlt komplett)

### Spaeter / nice-to-have:
- Oberer "Build Heats" Button bei < 3 Swimmers disabled machen
- Total Pointscore, Zeiten-Historie, 10-Personen Relay
