# USER INTERACTION TEST SPEC — WWSC Swimming App v2.8.0

**Tier:** Strong-Coverage (Pre-Acceptance)
**Ausführender:** Claude Code (Agentic UI Tester)

## Test-Dimensionen

1. **Stroke/Distanz Zusammenführung (R1):**
   - Setup eines "50m Brace" Events → PB wird als "50m" angezeigt/gelesen.
   - Zeiten-Eingabe im Timesheet.
2. **Brace Relay Auto-Pairing (R2):**
   - Event mit 12 Personen (Even).
   - Event mit 13 Personen (Odd) → Verifizierung des Ersatz-Partners.
3. **Heat Builder UI (R4):**
   - Sichtbarkeit von PB.
   - Unsichtbarkeit von Split.
4. **Print Layout (R3):**
   - CSS Verification (Print Emulator Modus).

## Variationsmatrix

| Event-Konfiguration | Teilnehmer | Ziel |
|---------------------|------------|------|
| 50m Freestyle       | 12         | Baseline PB Prüfung |
| 50m Brace Relay     | 12         | Baseline Pairing (Fastest+Slowest) |
| 50m Brace Relay     | 13         | Odd-Man-Out Logik greift korrekt |
| 25m Team Relay      | 12         | Heat Builder Spalten-Prüfung (Split weg, PB da) |

## Testcases (Agentic UI Assertions)

### UI-TC-01: Timesheet 50m Zusammenlegung (R1)
- [ ] 1. Navigiere zum Event Setup.
- [ ] 2. Erstelle Event "50m Brace".
- [ ] 3. Gehe zu Timesheet.
- [ ] 4. Asserte: UI zeigt Schwimmer-PBs für "50m" an (nicht leer, falls Freestyle-Zeit existiert).
- [ ] 5. Trage neue Zeit ein. Asserte: Wird als "50m" PB für diesen Schwimmer gespeichert.

### UI-TC-02: Brace Relay Auto-Pairing (R2)
- [ ] 1. Wähle 13 Schwimmer für "50m Brace Relay".
- [ ] 2. Generiere Heats.
- [ ] 3. Asserte: Es gibt keine Lane mit nur 1 Schwimmer.
- [ ] 4. Asserte: Es gibt 7 Teams (14 Slots gesamt).
- [ ] 5. Asserte: Ein Schwimmer taucht exakt in 2 Teams auf.
- [ ] 6. Berechne manuell den Durchschnitt der ersten 6 Teams.
- [ ] 7. Berechne manuell das Total des 7. Teams.
- [ ] 8. Asserte: Das 7. Team weicht minimal vom Durchschnitt ab (Verifikation der Logik).

### UI-TC-03: Heat Builder Spalten (R4)
- [ ] 1. Öffne Heat Builder für das 25m Team Relay.
- [ ] 2. Asserte: Spalte "Split" ist im HTML nicht vorhanden/sichtbar.
- [ ] 3. Asserte: Spalte "PB" ist im HTML vorhanden und zeigt korrekte Werte.

### UI-TC-04: Print Layout CSS (R3)
- [ ] 1. Öffne Heat Builder für 25m Team Relay.
- [ ] 2. Emuliere Print-Media in den DevTools / prüfe CSS-Regeln.
- [ ] 3. Asserte: `.relay-team-block` (oder äquivalent) hat ein Grid/Flex-Layout, das Teams nebeneinander anordnet.
- [ ] 4. Asserte: Interaktive Buttons (Delete, Move) haben `display: none` im `@media print`.

## Deliverables
Claude Code muss nach Abschluss folgende Dokumente liefern:
1. `USER-INTERACTION-TEST-PROTOCOL.md` (Die tatsächlichen Testergebnisse PASS/FAIL)
2. `USER-INTERACTION-COVERAGE-MATRIX.md` (Zuordnung der Tests zu den Anforderungen)

### UI-TC-05: Exhaustive Y-Flag Mapping Provokation (R5)
- [ ] 1. **Setup:** Wähle im Timesheet einen Schwimmer *mit* explizitem "Y"-Flag und drei Schwimmer *ohne* "Y"-Flag aus.
- [ ] 2. **Provokation 1 (Medley Relay):** Generiere Heats. Prüfe den Heat Builder. Asserte: Nur der EINE Schwimmer hat das "(Y)" in der Spalte "Stroke". Die anderen drei Schwimmer im Team haben definitiv kein "(Y)".
- [ ] 3. **Provokation 2 (Team Relay):** Erstelle ein 25m Team Relay mit demselben Team. Prüfe den Heat Builder. Asserte: Auch hier gibt es kein "Y-Leak" (kein Überschwappen des Flags auf Schwimmer, die es nicht haben).
- [ ] 4. **Provokation 3 (Results & Reports):** Schließe die Events ab (Finalize). Prüfe die Results-Tabelle und die Event-Reports. Asserte: Das "(Y)" Mapping ist durchgehend konsistent – es taucht nirgendwo unbegründet auf, und wo es sein muss, ist es exakt beim richtigen Schwimmer.
- [ ] 5. **Provokation 4 (Print Layout):** Wechsle in den Print-Modus beider Relays. Asserte: Das "(Y)" ist im kompakteren Spalten-Layout korrekt gemappt und springt nicht auf Nachbar-Spalten über.

### UI-TC-06: Echtzeit-Placing Relay (R6)
- [ ] 1. Gehe in die Results-Ansicht für das "25m Team Relay" (mind. 3 Teams vorhanden).
- [ ] 2. Trage per Tap-Feld eine Zeit für Team 1 ein. Asserte: Team 1 bekommt sofort Place "1" angezeigt.
- [ ] 3. Trage eine *bessere* (geringere Variance) Zeit für Team 2 ein. Asserte: Team 2 bekommt sofort Place "1", Team 1 rutscht in Echtzeit auf "2".
- [ ] 4. Trage eine *identische* Zeit (gleiche Variance) für Team 3 ein. Asserte: Das Live-Tie-Handling greift (z. B. "1=" für Team 2 und Team 3).

### UI-TC-07: Bryans Realdaten-Szenario (Verifikation R6 Live-Placing & Mathematik)
- [ ] 1. **Setup:** Erstelle ein "50m Brace Relay" Event (Start: 2s, fastest finish wins (R20)) mit den exakten PBs aus Bryans Screenshot:
      - Lane 1: Bryan H. (32) + Glenne M. (49) -> Target 81
      - Lane 2: Ben C. (33) + Diane F. (48) -> Target 81
      - Lane 3: James M. (33) + Karen M. (46) -> Target 79
- [ ] 2. **Dateneingabe:** Öffne die Results-Seite für dieses Event. Trage die exakten Finish-Zeiten ein:
      - Lane 1 Finish: 81.99
      - Lane 2 Finish: 80.99
      - Lane 3 Finish: 79.01
- [ ] 3. **Mathematik-Assertion:** Asserte, dass die berechnete Variance exakt den Vorgaben entspricht (Net Time = Finish - Start; Variance = Net Time - Target):
      - Lane 1 Variance: `-1.01`
      - Lane 2 Variance: `-2.01`
      - Lane 3 Variance: `-1.99`
- [ ] 4. **Live-Placing Assertion (R6):** Asserte, dass *ohne Klick auf Calculate Results* sofort folgende Platzierungen ("Place") zugewiesen werden (Logik: "fastest finish wins (R20)" = fastest total_time wins):
      - Lane 1 (abs 1.01) -> Place `1`
      - Lane 3 (abs 1.99) -> Place `2`
      - Lane 2 (abs 2.01) -> Place `3`

### UI-TC-08: Exhaustive Live-Placing Provokation (R6 - Adversarial Testing)
**Ziel:** Verifizieren, dass das neue Echtzeit-Placing-Feature für Relays nicht nur für das Brace Relay (Nearest-to-target) funktioniert, sondern systemweit stabil ist und die verschiedenen Rating-Systeme korrekt respektiert, wenn Live-Eingaben passieren.

- [ ] 1. **Provokation 1 (Team Relay - Fastest Wins):** Erstelle ein "25m Team Relay" mit drei beliebigen Teams.
      - *Logik-Check:* Team Relay wertet nach absoluter Net Time (Fastest Wins), NICHT nach Variance.
      - Trage Finish-Zeiten ein, sodass Team C am schnellsten, Team A in der Mitte und Team B am langsamsten ist.
      - Asserte: Das Live-Placing sortiert sofort: C=1, A=2, B=3 (auf Basis Net Time).
- [ ] 2. **Provokation 2 (Medley Relay - Nearest-to-target Wins):** Erstelle ein "50m Medley Relay".
      - *Logik-Check:* Nearest-to-target Wins (fastest total_time wins).
      - Trage Finish-Zeiten ein.
      - Asserte: Das Live-Placing nutzt exakt die Variance-Logik in Echtzeit.
- [ ] 3. **Provokation 3 (Pogo Relay - Exakte Vorhersage):** Erstelle ein "25m Pogo".
      - *Logik-Check:* Pogo hat ein festes Average/Target System.
      - Trage Finish-Zeiten (T1 und T2) ein.
      - Asserte: Sobald beide Zeiten vorliegen und die Avg Time berechnet ist, greift das Live-Placing sofort (niedrigste Differenz zum Target gewinnt).
- [ ] 4. **Provokation 4 (Überschreiben & Tie-Handling):** Kehre zum Brace Relay aus `UI-TC-07` zurück. 
      - Überschreibe die Finish-Zeit von Lane 2, sodass die Variance exakt `-1.01` ergibt (wie Lane 1).
      - Asserte: Das System updatet das Live-Ranking sofort zu einem Tie: Lane 1=1=, Lane 2=1=, Lane 3=3.
      - Lösche die Finish-Zeit von Lane 2 wieder (Feld leer).
      - Asserte: Das System entfernt das Placing von Lane 2 sofort und Lane 3 rückt wieder auf Platz 2 vor.

### UI-TC-09: Results Spalten & Color Coding (R7)
- [ ] 1. **Setup:** Öffne die Results für das "50m Brace Relay" aus UI-TC-07.
- [ ] 2. **Spalten-Prüfung:** Asserte die exakte Reihenfolge der Tabellen-Header: PBs, Total, Start, Target, Finish, Variance, Place.
- [ ] 3. **Formel-Prüfung:** Nimm Lane 1 (PBs 32+49=81). Asserte: "Total" ist 81. "Start" ist 2. "Target" ist 83 (81+2).
- [ ] 4. **Color-Coding:** Trage drei Finish-Zeiten ein. Asserte: Die Zelle für Platz 1 hat die CSS-Klasse/Farbe für Gold, Platz 2 für Silber, Platz 3 für Bronze.
- [ ] 5. **Live Color-Switch:** Überschreibe die Zeit von Platz 3, sodass er zu Platz 1 wird. Asserte: Das Gold-Styling wandert sofort auf die neue Lane 3, und die alte Lane 1 wird (je nach neuer Position) Silber oder Bronze.

### UI-TC-10: Results Layout & Spalten Bereinigung (R8)
- [ ] 1. **Setup:** Öffne die Results-Seite für das "25m Team Relay".
- [ ] 2. **Split prüfen:** Asserte, dass im HTML der Schwimmer-Tabelle keine Spalte "Split" mehr existiert.
- [ ] 3. **Total prüfen:** Asserte, dass der Text "Team Total" direkt neben dem numerischen Wert der Endzeit steht (visuelle Gruppierung, kein extremer Abstand mehr).
- [ ] 4. **Variance prüfen:** Asserte, dass der Wert für die Variance ganz rechts (am Ende der Zusammenfassungszeile) positioniert ist.

### UI-TC-11: Results Deadlock Provokation (R9 - Adversarial Flow)
- [ ] 1. **Setup:** Wähle im Dashboard für das Event drei Rennen aus: "25m Freestyle", "50m Freestyle", "25m Team Relay".
- [ ] 2. Gehe zum Heat Builder. Generiere die Heats für "25m Freestyle".
- [ ] 3. **Lasse "50m Freestyle" absichtlich komplett leer (keine Heats generiert).**
- [ ] 4. Gehe direkt zur Results-Seite.
- [ ] 5. Asserte: Die Seite crasht nicht (kein Deadlock/weißer Screen).
- [ ] 6. Asserte: Wenn man auf den Tab "25m Freestyle" klickt, werden die Results-Eingabefelder für 25m korrekt geladen und sind bedienbar.
- [ ] 7. Asserte: Wenn man auf den Tab "50m Freestyle" klickt, stürzt das System nicht ab, sondern zeigt eine "No Heats generated" Meldung.
- [ ] 8. Asserte: Ein Hin- und Herwechseln zwischen generierten und ungenerierten Tabs funktioniert reibungslos.

### UI-TC-12: Report Format Alignment (R10)
- [ ] 1. **Setup:** Trage in einem Event Zeiten ein, die sowohl Breaker (Variance < -1.0) als auch Exceeder (Variance > +2.0) produzieren.
- [ ] 2. Scrolle ans untere Ende der Results-Seite.
- [ ] 3. Asserte Header: Beide Tabellen haben exakt dieselben Spaltenüberschriften: `Swimmer`, `Event/Heat`, `Old PB`, `New Time`, `Variance`.
- [ ] 4. Asserte Daten: Die zweite Spalte im Exceeding Report zeigt den Heat (z. B. "Heat 4") und nicht mehr nur den Stroke ("25m").
- [ ] 5. Asserte UI: Im DOM haben die korrespondierenden Spalten (z. B. Spalte 4 "New Time") in beiden Tabellen exakt dieselbe Breite.
- [ ] 6. Wechsle auf die Seite "Breaker Report" (Sidebar).
- [ ] 7. Asserte: Auch hier greift das identische, neue Format für beide Tabellen.

### UI-TC-13: Entfernen des Consolidated Reports (R11)
- [ ] 1. **Setup:** Trage Zeiten ein, die Breaker erzeugen.
- [ ] 2. Scrolle ans untere Ende der Results-Seite.
- [ ] 3. Asserte: Es existiert eine Tabelle für "Breakers Report".
- [ ] 4. Asserte: Es existiert eine Tabelle für "Exceeding Report" (falls zutreffend).
- [ ] 5. Asserte Negativ: Es gibt **keine** Tabelle mit dem Titel "All Breakers (Consolidated)" oder ähnlich. Der View endet nach dem Exceeding Report.

### UI-TC-14: Event-spezifische Filterung der Reports (R12)
- [ ] 1. **Setup:** Erzeuge Breaker und Exceeder in "25m Freestyle" und "50m Freestyle" mit unterschiedlichen Schwimmern.
- [ ] 2. Gehe auf die Results-Seite in den Tab "50m Freestyle".
- [ ] 3. Scrolle nach unten zu den Breaker- und Exceeding-Reports.
- [ ] 4. Asserte: Es werden **ausschließlich** die Breaker/Exceeder aus dem Event "50m Freestyle" angezeigt. Die Namen aus dem 25m-Rennen dürfen hier nicht auftauchen.
- [ ] 5. Asserte: Die Spalte "Event/Heat" (gemäß R10) zeigt z. B. "50m Freestyle - Heat 1" und nicht mehr nur den unklaren Stroke "50m" oder "25m" an.
- [ ] 6. Wechsle auf den Tab "25m Freestyle".
- [ ] 7. Asserte: Die Tabellen am unteren Ende aktualisieren sich und zeigen **ausschließlich** die 25m-Breaker/Exceeder an.
- [ ] 8. Wechsle in der Sidebar links auf "Breaker Report" (Gesamtübersicht).
- [ ] 9. Asserte: Hier werden alle Breaker/Exceeder aus **beiden** Rennen aggregiert angezeigt.

### UI-TC-15: Symmetrie im Globalen Breaker Report (R13)
- [ ] 1. Gehe in der linken Sidebar auf die dedizierte Seite "Breaker Report".
- [ ] 2. Asserte Spaltennamen: Beide Tabellen haben exakt die Header: `Swimmer`, `Event/Heat`, `Old PB`, `New Time`, `Variance`.
- [ ] 3. Asserte Spaltenbreiten (Symmetrie): Die HTML/CSS-Renderings beider Tabellen nutzen `table-layout: fixed;` (oder ein ähnliches, strikt symmetrisches Layout). Die Header-Breiten der oberen Tabelle stimmen auf den Pixel mit den Header-Breiten der unteren Tabelle überein.
- [ ] 4. Asserte Fluchtlinien: Das Layout reißt vertikal nicht aus (wie im alten Screenshot bei "Stroke"), sondern bildet durchgehende vertikale Linien über beide Tabellen hinweg.

### UI-TC-16: Calendar Event Details Modal (R14)
- [ ] 1. **Setup:** Erstelle ein Event am heutigen Tag mit "25m Freestyle" (3 Heats, voll befüllt und bewertet), "50m Freestyle" (1 Heat) und "Medley Relay" (2 Heats).
- [ ] 2. Navigiere zur Seite "Season Calendar".
- [ ] 3. Klicke auf das erstellte Event, um das Popup "Event Details" zu öffnen.
- [ ] 4. Asserte (25m): Unter "Races" stehen drei separate Blöcke: "25m Freestyle - Heat 1", "25m Freestyle - Heat 2" und "25m Freestyle - Heat 3".
- [ ] 5. Asserte (Format): In jedem dieser Blöcke tauchen die Endzeiten der Top 3 konsistent mit dem Prefix "1st:", "2nd:", "3rd:" auf.
- [ ] 6. Asserte (Medley): Auch beim Medley Relay sind beide Heats ("Medley Relay - Heat 1", "Medley Relay - Heat 2") gelistet, und die Formatierung der Plätze ist identisch zu den Freestyle-Rennen.
- [ ] 7. **Tie Provokation:** Überschreibe im Timesheet bei 50m Platz 2 und Platz 3, sodass sie einen echten Gleichstand (Tie) haben. Lade den Calendar neu. Asserte: Das Modal zeigt den Gleichstand als z.B. "2nd=" an (keine redundanten "2nd" ohne "3rd" Indikator, die nur verwirren).

### UI-TC-17: Event Report Verification & Calendar Link (R15)
- [ ] 1. **Setup:** Erstelle ein Event, weise im Timesheet "Y" Flags, Special Entries ("Back", "Breast") und PBs zu. Generiere Heats, trage Zeiten ein und klicke "Complete Event".
- [ ] 2. **Report Öffnen (Auto):** Der Report öffnet sich in einem neuen Tab.
- [ ] 3. **Report-Struktur Asserte:** Prüfe die Tabelle "Participants" im Report. Die Anzahl der `<th>` (Kopfzeilen-Spalten) stimmt exakt mit der Anzahl der `<td>` (Daten-Zellen) in jeder Zeile überein. Es gibt keine riesigen leeren Zelt-Zusammenfassungen (wie im Screenshot zwischen Name und Special Entry).
- [ ] 4. **Werte-Check:** Asserte: PBs und "Y" Flags werden (falls dafür Spalten definiert sind) korrekt in den Event Report gerendert.
- [ ] 5. Schließe den Report-Tab.
- [ ] 6. Gehe in den "Season Calendar" und klicke auf das eben abgeschlossene Event.
- [ ] 7. **Calendar Link Asserte:** Im Event Details Modal taucht ein Button/Link namens "View Event Report" (oder ähnlich) auf.
- [ ] 8. Klicke diesen Button. Asserte: Der exakt gleiche Event Report für dieses Event öffnet sich erneut fehlerfrei in einem neuen Tab.

### UI-TC-18: Pogo Relay Heat Builder Cleanup (R16)
- [ ] 1. **Setup:** Wähle 14 Schwimmer im Timesheet für das "Pogo" Event.
- [ ] 2. Generiere Heats und wechsle in den Heat Builder (Tab "Pogo").
- [ ] 3. Asserte (Swim Twice): Der "+ Swim Twice" Button und das Auswahldropdown für freie Schwimmerauswahl existieren in keiner Lane.
- [ ] 4. Asserte (Team Total): Der Fußzeilen-Text "Team Total" (und sein Zahlenwert) ist im Pogo-Heat-Builder nicht vorhanden.
- [ ] 5. Asserte (4-Schwimmer-Zwang): Die generierten Teams bestehen aus exakt 4 Schwimmern. (Falls bei 14 Schwimmern der Rest automatisch mit Doppel-Schwimmern aufgefüllt wird, um 4er-Teams zu bilden, ist das OK, aber eine Lane/Team darf niemals 5 oder nur 3 Schwimmer anzeigen).
- [ ] 6. Wechsle in die Results-Ansicht für "Pogo".
- [ ] 7. Asserte (Spalten): Die Header haben exakt folgende Reihenfolge: `PB`, `Start`, `Total`, `T1 (Tap)`, `T2 (Tap)`, `Result`, `Variance`.

## Acceptance Expansion — R17 to R20 exhaustive matrix

### UI-TC-19 to UI-TC-68 — Special Races Comprehensive Validation (50 new cases)

#### R17 — Distance Exclusivity Matrix
- [ ] UI-TC-19: Select 25m Freestyle path → verify 25m Brace hidden/blocked
- [ ] UI-TC-20: Select 25m Brace path → verify 25m Freestyle hidden/blocked
- [ ] UI-TC-21: Select 25m Team Relay path → verify other 25m variants hidden/blocked
- [ ] UI-TC-22: Select 50m Freestyle path → verify 50m Brace hidden/blocked
- [ ] UI-TC-23: Select 50m Brace path → verify 50m Freestyle hidden/blocked
- [ ] UI-TC-24: Switch from one 25m variant to another → verify stale 25m tabs/results do not persist
- [ ] UI-TC-25: Switch from one 50m variant to another → verify stale 50m tabs/results do not persist
- [ ] UI-TC-26: Verify Heat Builder never shows two 25m variants together
- [ ] UI-TC-27: Verify Results never shows two 25m variants together
- [ ] UI-TC-28: Verify Calendar/Event Details never show two 25m variants together
- [ ] UI-TC-29: Verify Reports never mix conflicting 25m variants together as active races
- [ ] UI-TC-30: Repeat same checks for 50m across Heat Builder, Results, Calendar, Reports

#### R18 — Incomplete Team / Leftover Handling
- [ ] UI-TC-31: Medley with exactly 3 eligible swimmers → 1 valid team
- [ ] UI-TC-32: Medley with 4 eligible swimmers → no invalid second team
- [ ] UI-TC-33: Medley with 5 eligible swimmers → no invalid leftover team
- [ ] UI-TC-34: Medley with 6 eligible swimmers → 2 valid teams
- [ ] UI-TC-35: Medley with 7 eligible swimmers → leftover handling visible and valid
- [ ] UI-TC-36: Medley with 8 eligible swimmers → no invalid partial team
- [ ] UI-TC-37: Medley with 9 eligible swimmers → 3 valid teams
- [ ] UI-TC-38: Medley with 10 eligible swimmers → leftover handling valid
- [ ] UI-TC-39: Medley with 11 eligible swimmers → leftover handling valid
- [ ] UI-TC-40: Medley with 12 eligible swimmers → 4 valid teams
- [ ] UI-TC-41: Medley with 13 eligible + 1 N → N excluded, leftover eligible handled clearly
- [ ] UI-TC-42: Verify no 1-swimmer team is rendered
- [ ] UI-TC-43: Verify no 2-swimmer invalid medley team is rendered if race requires complete team structure
- [ ] UI-TC-44: Verify UI makes unassigned/unused swimmer state explicit if such a case exists
- [ ] UI-TC-45: Verify Results/Calendar do not silently act as if excluded leftovers never existed when they should be visible

#### R19/R20 — Unified Place Logic Across Special Races
- [ ] UI-TC-46: 25m Brace — verify fastest effective performance gets 1st
- [ ] UI-TC-47: 25m Brace — verify second-fastest effective performance gets 2nd
- [ ] UI-TC-48: 25m Brace — verify tie handling is understandable and consistent
- [ ] UI-TC-49: 25m Brace — verify no confusing ranking jumps
- [ ] UI-TC-50: 50m Brace — verify fastest effective performance gets 1st
- [ ] UI-TC-51: 50m Brace — verify second-fastest effective performance gets 2nd
- [ ] UI-TC-52: 50m Brace — verify tie handling is understandable and consistent
- [ ] UI-TC-53: 50m Brace — verify no confusing ranking jumps
- [ ] UI-TC-54: Medley — verify fastest effective performance gets 1st
- [ ] UI-TC-55: Medley — verify second-fastest effective performance gets 2nd
- [ ] UI-TC-56: Medley — verify tie handling is understandable and consistent
- [ ] UI-TC-57: Medley — verify no confusing ranking jumps
- [ ] UI-TC-58: Pogo — verify fastest effective performance gets 1st
- [ ] UI-TC-59: Pogo — verify second-fastest effective performance gets 2nd
- [ ] UI-TC-60: Pogo — verify tie handling is understandable and consistent
- [ ] UI-TC-61: Pogo — verify no confusing ranking jumps
- [ ] UI-TC-62: Cross-race consistency — same conceptual ranking behavior across Brace, Medley, Pogo
- [ ] UI-TC-63: Handicap sensitivity — better effective performance after handicap wins even if raw finish looks slower
- [ ] UI-TC-64: Near-tie scenario — ordering remains understandable
- [ ] UI-TC-65: Exact tie scenario — equal ranking rendered consistently
- [ ] UI-TC-66: Overwrite an entered time → places recalculate consistently
- [ ] UI-TC-67: Delete an entered time → places recalculate consistently
- [ ] UI-TC-68: Verify Results, Breaker reports, Calendar summaries all reflect the updated ranking logic consistently where applicable

## Acceptance Expansion II — UI-TC-69 to UI-TC-168 (100-case pre-delivery sweep)

### Goal
Mandatory pre-delivery browser validation for current version before release candidate handoff.
This sweep exists because prior proxy/API-based PASS claims were not reliable enough. These cases must be executed as genuine browser/user-interaction tests.

### A. Race Configuration & Exclusivity (UI-TC-69 to UI-TC-88)
- [ ] UI-TC-69: Ordinary Swim shows 25m Freestyle + 50m Freestyle + 25m Team Relay
- [ ] UI-TC-70: Ordinary Swim does NOT show 25m Brace Relay
- [ ] UI-TC-71: Ordinary Swim does NOT show 50m Brace Relay
- [ ] UI-TC-72: Ordinary Swim does NOT show Pogo unless selected
- [ ] UI-TC-73: 25m Brace shows 25m Brace Relay + 50m Freestyle
- [ ] UI-TC-74: 25m Brace does NOT show 25m Freestyle
- [ ] UI-TC-75: 25m Brace does NOT show 25m Team Relay
- [ ] UI-TC-76: 50m Brace shows 25m Freestyle + 50m Brace Relay
- [ ] UI-TC-77: 50m Brace does NOT show 50m Freestyle
- [ ] UI-TC-78: Pogo shows 25m Freestyle + 50m Freestyle + Pogo
- [ ] UI-TC-79: Pogo does NOT show 25m Team Relay
- [ ] UI-TC-80: Add Butterfly special to Ordinary → all standard tabs remain + Butterfly appears
- [ ] UI-TC-81: Add Butterfly special to 25m Brace → 25m Brace + 50m + Butterfly only
- [ ] UI-TC-82: Add Butterfly special to 50m Brace → 25m + 50m Brace + Butterfly only
- [ ] UI-TC-83: Add Butterfly special to Pogo → 25m + 50m + Pogo + Butterfly only
- [ ] UI-TC-84: Switch Ordinary → 25m Brace → verify stale 25m tabs removed immediately
- [ ] UI-TC-85: Switch 25m Brace → 50m Brace → verify stale 50m tab removed immediately
- [ ] UI-TC-86: Switch 50m Brace → Pogo → verify stale relay tabs removed immediately
- [ ] UI-TC-87: Switch Pogo → Ordinary → verify standard relay returns correctly
- [ ] UI-TC-88: Browser refresh preserves correct tab set for current config

### B. Heat Builder Core Flows (UI-TC-89 to UI-TC-108)
- [ ] UI-TC-89: Ordinary Swim heat generation with minimum valid attendance
- [ ] UI-TC-90: Ordinary Swim heat generation with 12 swimmers
- [ ] UI-TC-91: 25m Brace heat generation with valid brace pairings
- [ ] UI-TC-92: 50m Brace heat generation with valid brace pairings
- [ ] UI-TC-93: Pogo heat generation creates expected relay rows
- [ ] UI-TC-94: Medley heat generation creates only valid complete teams
- [ ] UI-TC-95: Heat Builder empty state message visible before generation
- [ ] UI-TC-96: Generate Heats button works after config change
- [ ] UI-TC-97: Confirm Heats appears only when appropriate
- [ ] UI-TC-98: Confirming one race updates confirmation counter correctly
- [ ] UI-TC-99: Confirming all races unlocks clean progression to Results
- [ ] UI-TC-100: Return to Event Setup and change config resets stale generated heats
- [ ] UI-TC-101: 25m individual table shows PB / Max / Delay columns correctly
- [ ] UI-TC-102: Relay table shows Pair/Team / Target / Start / Total / Variance / Place columns correctly
- [ ] UI-TC-103: Relay table does not show obsolete Split column in generation state
- [ ] UI-TC-104: Team headers render place badges only when place exists
- [ ] UI-TC-105: Medal/place styling appears only after ranking exists
- [ ] UI-TC-106: Generate twice does not duplicate teams/heats visually
- [ ] UI-TC-107: Navigation away and back preserves current generated state correctly
- [ ] UI-TC-108: Heat Builder reset route actually clears stale cached builder state

### C. Results Screen Live Ranking & Recalculation (UI-TC-109 to UI-TC-128)
- [ ] UI-TC-109: Individual race live placing updates after first time entry
- [ ] UI-TC-110: Individual race live placing updates after second time entry
- [ ] UI-TC-111: Individual race tie on finish_time gives equal place
- [ ] UI-TC-112: Relay race updates place after first team time entry
- [ ] UI-TC-113: Relay race updates place after multiple team entries
- [ ] UI-TC-114: Relay race recalculates after overwriting a faster time with slower one
- [ ] UI-TC-115: Relay race recalculates after overwriting a slower time with faster one
- [ ] UI-TC-116: Relay race recalculates after deleting a time
- [ ] UI-TC-117: Relay ranking ignores teams without times
- [ ] UI-TC-118: Results summary text shows correct ranked-count / missing-count
- [ ] UI-TC-119: Brace Results header text matches current active rule text
- [ ] UI-TC-120: Medley Results header text matches current active rule text
- [ ] UI-TC-121: Pogo Results header text matches current active rule text
- [ ] UI-TC-122: Results tab order matches active race order
- [ ] UI-TC-123: Results page does not show stale race tabs from previous config
- [ ] UI-TC-124: Save Rankings persists current place display
- [ ] UI-TC-125: Reload Results page retains persisted places
- [ ] UI-TC-126: Manual place overrides remain separate from auto-place where designed
- [ ] UI-TC-127: Resetting / editing event config removes invalid stale persisted places
- [ ] UI-TC-128: Calendar top-3 summary reflects latest saved places

### D. Special Race Ranking Matrix (UI-TC-129 to UI-TC-148)
- [ ] UI-TC-129: 25m Brace ranking behavior matches current app rule consistently across 4 teams
- [ ] UI-TC-130: 25m Brace equal total_time produces equal place
- [ ] UI-TC-131: 25m Brace near-tie recalculates correctly when one team improves by 0.01
- [ ] UI-TC-132: 25m Brace variance display updates correctly after time entry
- [ ] UI-TC-133: 50m Brace ranking behavior matches current app rule consistently across 4 teams
- [ ] UI-TC-134: 50m Brace equal total_time produces equal place
- [ ] UI-TC-135: 50m Brace near-tie recalculates correctly when one team improves by 0.01
- [ ] UI-TC-136: 50m Brace variance display updates correctly after time entry
- [ ] UI-TC-137: Medley ranking behavior matches current app rule consistently across 3 teams
- [ ] UI-TC-138: Medley equal total_time produces equal place
- [ ] UI-TC-139: Medley near-tie recalculates correctly when one team improves by 0.01
- [ ] UI-TC-140: Medley variance display updates correctly after time entry
- [ ] UI-TC-141: Pogo ranking behavior matches current app rule consistently across 3 teams
- [ ] UI-TC-142: Pogo equal total_time produces equal place
- [ ] UI-TC-143: Pogo near-tie recalculates correctly when one team improves by 0.01
- [ ] UI-TC-144: Pogo variance display updates correctly after time entry
- [ ] UI-TC-145: Cross-check Brace visual place vs sorted Team Total values
- [ ] UI-TC-146: Cross-check Medley visual place vs sorted Team Total values
- [ ] UI-TC-147: Cross-check Pogo visual place vs sorted Team Total values
- [ ] UI-TC-148: Record any remaining ambiguity versus legacy nearest-to-target docs explicitly in protocol notes

### E. Incomplete Team / Leftover / Edge Cases (UI-TC-149 to UI-TC-158)
- [ ] UI-TC-149: Medley with 3 eligible swimmers creates exactly 1 valid team
- [ ] UI-TC-150: Medley with 4 eligible swimmers creates no invalid extra team
- [ ] UI-TC-151: Medley with 5 eligible swimmers creates no invalid leftover team
- [ ] UI-TC-152: Medley with 7 eligible swimmers handles leftovers without phantom team rows
- [ ] UI-TC-153: Medley with 10 eligible swimmers handles leftovers without broken UI
- [ ] UI-TC-154: Brace with odd swimmer count creates no broken pair row
- [ ] UI-TC-155: Pogo with missing participant scenario does not create malformed team row
- [ ] UI-TC-156: N-flagged swimmer excluded from special-race team generation where applicable
- [ ] UI-TC-157: Y-flagged swimmer included where applicable without leakage to N swimmers
- [ ] UI-TC-158: Medley with 1-2 leftover swimmers renders a partial team WITH leftover banner (v2.8.3 — supersedes older "never render" rule per Bryan's swim-twice confirmation)

### F. Cross-Screen Consistency & Reports (UI-TC-159 to UI-TC-168)
- [ ] UI-TC-159: Heat Builder active races == Results active races
- [ ] UI-TC-160: Heat Builder active races == Season Calendar race list
- [ ] UI-TC-161: Results saved places == Season Calendar displayed top places
- [ ] UI-TC-162: Breaker Report reflects current saved race results without stale rows
- [ ] UI-TC-163: Dashboard progression status reflects actual event state
- [ ] UI-TC-164: Navigation through Dashboard → Heat Builder → Results → Calendar retains coherence
- [ ] UI-TC-165: Browser refresh on Results page retains correct active race set
- [ ] UI-TC-166: Browser refresh on Calendar page retains correct historical snapshot
- [ ] UI-TC-167: No stale tab set survives config change + generation + refresh cycle
- [ ] UI-TC-168: Final pre-delivery smoke run across Ordinary, 25m Brace, 50m Brace, Pogo, Medley passes without contradiction

### G. R18 v2.8.3: Medley Leftover Swim-Twice Flow (UI-TC-169 to UI-TC-176)
- [ ] UI-TC-169: 3 Y-swimmers → exactly 1 complete team, no leftover banner visible
- [ ] UI-TC-170: 4 Y-swimmers → 1 complete team + 1 leftover team with orange "⚠️ Leftover team — incomplete" banner
- [ ] UI-TC-171: 4 Y-swimmers → leftover team banner lists exactly 2 missing strokes (e.g. "Breast, Free")
- [ ] UI-TC-172: 5 Y-swimmers → 1 complete team + 1 leftover team, banner lists exactly 1 missing stroke
- [ ] UI-TC-173: Leftover team shows "➕ Swim Twice" button (not "Add Swimmer") while it is still incomplete
- [ ] UI-TC-174: Clicking Swim Twice with a selected eligible swimmer adds them to the next open medley stroke, banner updates to show remaining missing strokes
- [ ] UI-TC-175: When all 3 strokes are filled in a leftover team, the banner disappears automatically
- [ ] UI-TC-176: After Confirm Teams, a swimmer who swam twice appears in both teams in the persisted data (`relay_team_member` duplicate member_id per BF-5)
