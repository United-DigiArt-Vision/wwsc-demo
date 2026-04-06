# INTEGRATION TEST SPEC — WWSC Swimming App v2.6.2 (Bryan Feedback 2026-04-04)

## Scope
End-to-end Prüfung aller Bryan-Punkte vom 04.04.2026 aus User-Sicht.

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
