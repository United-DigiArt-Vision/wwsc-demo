# INTEGRATION TEST SPEC — WWSC Swimming App v2.7.1 (Updated 2026-04-06)

## Scope
End-to-end Prüfung aller Bryan-Punkte vom 04.04 und 06.04.2026 aus User-Sicht.

## LEKTION (v2.7.1): Vollständige Pfadabdeckung
Jeder Test MUSS den kompletten Datenpfad prüfen: API-Eingabe → DB-Speicherung → API-Abruf → Frontend-Anzeige.
Es reicht NICHT, nur die API zu testen. Die Frontend-Darstellung muss mit konkreten Werten verifiziert werden.

## IT-01 — Times Sheet / Members whole-seconds consistency
- Schritte:
  1. Members öffnen
  2. PB-Werte prüfen
  3. Times Sheet / Heat Builder öffnen
- Erwartung:
  - keine Hundertstel an Stellen, die Bryan als volle Sekunden fordert

## IT-02 — Tab Data Entry Flow
- Schritte:
  1. Times Sheet öffnen
  2. in erstes editierbares Feld klicken
  3. mehrfach Tab drücken
- Erwartung:
  - Fokus läuft logisch weiter
  - keine unnötigen Sprünge

## IT-03 — 25m Relay visual structure
- Schritte:
  1. 25m Relay Heat Builder/Results öffnen
- Erwartung:
  - keine Stroke-Spalte
  - Einzelzeiten sichtbar
  - Team Total sichtbar
  - Startzeit prominent sichtbar

## IT-04 — Medley team generation obeys entries
- Schritte:
  1. Medley Times Sheet mit Mix aus Y / Back / Breast / Free / N vorbereiten
  2. Teams generieren
- Erwartung:
  - N-Schwimmer erscheinen nicht in Teams
  - Y/Back/Breast/Free werden korrekt berücksichtigt
  - Y-Autozuweisungen tragen Marker

## IT-05 — Medley Add Swimmer pool
- Schritte:
  1. Medley Team öffnen
  2. Add Swimmer Dropdown öffnen
- Erwartung:
  - Liste enthält alle verfügbaren Medley-Schwimmer, nicht nur Team-Schwimmer

## IT-06 — Medley counter visibility
- Schritte:
  1. Medley im Times Sheet aktivieren
- Erwartung:
  - Counter für Y / Back / Breast / Free sichtbar

## IT-07 — Results expected finish
- Schritte:
  1. Individual Results öffnen
- Erwartung:
  - Spalte Expected Finish / PB+Delay sichtbar
  - Werte plausibel

## IT-08 — Auto placing styling
- Schritte:
  1. Results mit Platzierungen öffnen
- Erwartung:
  - 1st gold, 2nd silver, 3rd bronze
  - ganze Auto-Anzeige deutlich eingefärbt

## IT-09 — Relay results visibility
- Schritte:
  1. Relay Results öffnen
- Erwartung:
  - Ergebnisse/Platzierung klar rot und fett
  - kein Exceeded Report unten auf Relay-Seite

## IT-10 — Medley results ranking rules
- Schritte:
  1. Medley Results mit mindestens 3 Teams öffnen
  2. Team Totals so eingeben, dass gleiche und unterschiedliche Varianzen entstehen
- Erwartung:
  - jedes Team startet bei 2
  - nearest-to-target ranking korrekt
  - gleiche Abweichung = gleicher Platz

## IT-11 — Breaker report consolidation
- Schritte:
  1. Event finalisieren
  2. Breaker Report öffnen
- Erwartung:
  - Breakers und Exceeded Report beide enthalten
  - gleiches Format / gleiche Lesbarkeit

## IT-12 — Complete Event / Season report flow
- Schritte:
  1. Event finalisieren
  2. Complete Event ausführen
- Erwartung:
  - Event bleibt nicht "in progress"
  - kein Rücksprung in Timesheet als primärer Abschlussflow
  - separater Report mit Teilnehmern, Heats/Teams, Ergebnissen öffnet sich

## IT-13 — Relay Variance E2E (Bryan 06.04, KRITISCH)
- Schritte:
  1. Event mit 25m_relay erstellen, 9 Swimmer present
  2. Teams generieren, bestätigen
  3. Team Total eingeben (z.B. 7500cs für target=49s, delay=26s)
  4. Variance prüfen via API UND im Frontend
- Erwartung:
  - API: variance = total_time(cs) - start_delay(s)*100 - target_time(s)*100
  - Beispiel: 7500 - 2600 - 4900 = 0 → "+0.00"
  - Frontend zeigt formatTime(variance), NICHT rohe Zahl

## IT-14 — Breakers Report Einheiten E2E (Bryan 06.04, KRITISCH)
- Schritte:
  1. Event mit 25m erstellen, Heats generieren
  2. Finish-Zeit eingeben die einen Break erzeugt (z.B. PB=14s, Finish=17.00=1700cs → net=1300cs, var=-100cs)
  3. Results → Breakers Report prüfen
  4. Event finalisieren → Consolidated Breakers prüfen
  5. Breaker Report Screen prüfen
- Erwartung:
  - Old PB: "14" (formatWhole, ganze Sekunden)
  - New Time: "13.00" (formatTime, centiseconds)
  - Improved By: "-1.00" (formatTime, centiseconds)
  - NICHT: "--12.86" oder "1400s" oder andere Einheiten-Fehler

## IT-15 — Equal Finish = Equal Place (Bryan 06.04)
- Schritte:
  1. Heat mit 2+ Schwimmern erstellen
  2. Identische Finish-Zeit für 2 Schwimmer eingeben (z.B. beide 52.56 = 5256cs)
  3. Auto-Placing prüfen
- Erwartung:
  - Beide erhalten Platz 1
  - Nächster Platz ist 3 (nicht 2)

## IT-16 — Relay Swim Twice Recalculation (Bryan 06.04)
- Schritte:
  1. 25m Relay generieren (3er Teams, ungleich)
  2. "Add Swimmer" für ein Team mit ungeradem Member-Count
  3. Target/Start/Max nach dem Hinzufügen prüfen
- Erwartung:
  - target_time = Summe ALLER Leg-PBs (inkl. neuem Swimmer)
  - start_delay wird neu berechnet
  - Team Total zeigt neuen target_time

## IT-17 — Event Report Formatierung (Bryan 06.04)
- Schritte:
  1. Event finalisieren und abschließen
  2. Event Report (showSeasonReport) prüfen
- Erwartung:
  - Old PB: formatTime() → "14.00", NICHT "1400s"
  - New Time: formatTime() → "13.00", NICHT "1300s"
  - Improvement: formatTime() → "1.00", NICHT "100.0s"

## IT-18 — Season Calendar Event Details (Bryan 06.04)
- Schritte:
  1. Event abschließen
  2. Season Calendar → Klick auf Event
- Erwartung:
  - Modal zeigt Teilnehmerliste (alle attendees)
  - Modal zeigt Ergebnisse pro Race (nicht nur Breakers)
  - Breaker-Werte korrekt formatiert (formatTime, nicht raw + "s")
