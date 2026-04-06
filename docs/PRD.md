# REQUIREMENTS — WWSC Swimming App v2.6.2 (Bryan Feedback 2026-04-04)

## Kontext
- Kunde: Bryan Hesketh
- Datum der Rückmeldung: 04.04.2026 morgens früh (Upwork)
- Bezug: Feedback auf Stand v2.5.0 / laufende v2.6.x Nachbesserungen
- Stimmung: Frustriert, mehrere Punkte wurden mehrfach angemerkt und aus seiner Sicht nicht korrekt umgesetzt
- Ziel: M1-Blocker vollständig beseitigen, exakt entsprechend Bryans Rückmeldung

## Quellen
1. Bryan-Textnachricht vom 04.04.2026
2. 9 annotierte Screenshots von Bryan
3. Konsolidierung in `BRYAN-FEEDBACK-V2.6.md`
4. Klarstellung von Dino am 04.04.2026: keine Annahmen, vollständige Doku vor weiterer Implementierung

## Produktziel dieser Runde
Die App muss Bryans Daten- und Arbeitslogik exakt abbilden, damit:
- Daten schnell per Tastatur eingegeben werden können
- Zeiten überall konsistent als ganze Sekunden behandelt werden, wo Bryan das erwartet
- Relay-/Medley-Darstellung klar und sofort verständlich ist
- Season-Workflow mit sauberem Abschlussbericht endet

## Requirements

### Navigation & Data Entry

#### R-01 — Tab Navigation auf allen Sheets
Die Tab-Taste muss auf allen relevanten Sheets zum nächsten verfügbaren Eingabefeld springen, um schnelle Dateneingabe zu ermöglichen.

Akzeptanzkriterien:
- Tab springt vorwärts zum nächsten sinnvollen Eingabefeld
- Shift+Tab springt rückwärts
- Gilt mindestens für Times Sheet, Members, Results und relevante Relay-Eingaben
- Kein unerwartetes Springen in irrelevante Buttons, sofern echte Eingabefelder vorhanden sind

### Members / Seconds Logic

#### R-02 — Members-Zeiten sind ganze Sekunden
Alle im Members Sheet gepflegten PB-Zeiten, die Bryan hier meint, werden als ganze Sekunden erfasst, bearbeitet und angezeigt.

Akzeptanzkriterien:
- Keine Hundertstel-Darstellung im Members Sheet für diese PBs
- Erhöhung/Verringerung nur in ganzen Sekunden
- Persistenz bleibt konsistent

#### R-03 — Heats nutzen ganze Sekunden für PB/Delay/Max-Time
Im Heat Builder müssen PB, Delay und Max-Time entsprechend den Members-Werten als ganze Sekunden erscheinen.

Akzeptanzkriterien:
- PB ohne Hundertstel
- Delay ohne Hundertstel
- Max-Time ohne Hundertstel
- Keine inkonsistente Anzeige zwischen Members und Heats

### Results

#### R-04 — Results zeigen Expected Finish (PB + Delay)
In Results muss eine zusätzliche Spalte sichtbar sein, die die erwartete Ziel-/Gesamtzeit aus PB + Delay zeigt.

Akzeptanzkriterien:
- Spalte ist klar beschriftet
- Wert berechnet sich aus PB + Delay
- PB und Delay basieren auf ganzen Sekunden
- Anzeige konsistent mit Heat Builder

#### R-05 — Auto-Placing visuell deutlich hervorheben
Automatische Platzierungen müssen sofort erkennbar sein.

Akzeptanzkriterien:
- 1st = Gold
- 2nd = Silver
- 3rd = Bronze
- Nicht nur kleine Kreise; die gesamte Auto-Place-Anzeige muss deutlich farblich hervorgehoben sein

#### R-06 — Exceeded Report im Look des Breakers Report
Der Swimmers Exceeding Report muss im selben visuellen Format wie der Breakers Report dargestellt werden.

Akzeptanzkriterien:
- Gleiche Tabellen-/Kartenlogik
- Gleiche Lesbarkeit und visuelle Gewichtung

### 25m Relay

#### R-07 — 25m Relay zeigt individuelle Schwimmerzeiten und Team Total
Für 25m Relay muss pro Team jede Einzelzeit sichtbar sein und darunter das Team Total.

Akzeptanzkriterien:
- Einzelzeiten pro Leg/Swimmer sichtbar
- Team Total unten sichtbar

#### R-08 — 25m Relay Startzeit prominent
Die Start-/Delay-Information des Teams muss visuell hervorgehoben sein.

#### R-09 — 25m Relay ohne Stroke-Spalte
Da 25m Relay immer Freestyle ist, wird keine Stroke-Spalte angezeigt.

### Medley Relay

#### R-10 — Medley zeigt individuelle Schwimmerzeiten und Team Total
Für Medley Relay muss pro Team jede Einzelzeit sichtbar sein und darunter das Team Total.

#### R-11 — Medley Startzeit prominent
Die Startzeit/Startlogik muss im Medley Relay deutlich sichtbar sein.

#### R-12 — Medley Add Swimmer listet alle verfügbaren Medley-Schwimmer
Wenn ein Schwimmer ergänzt wird, muss die Auswahl aus allen für Medley verfügbaren Schwimmern erfolgen, nicht nur aus dem aktuellen Team.

Akzeptanzkriterien:
- Auswahl enthält alle aktuell für Medley verfügbaren Schwimmer
- Keine Beschränkung auf Team-Mitglieder

#### R-13 — Medley darf keine "No"-Schwimmer zuweisen
Schwimmer mit Auswahl `N` / `No` im Times Sheet dürfen im Medley Relay nicht automatisch in Teams landen.

#### R-14 — Medley Stroke Counter im Timesheet
Im Times Sheet muss sichtbar sein, wie viele Schwimmer aktuell auf Y / Back / Breast / Free stehen, damit Teams ausgeglichen werden können.

### Relay Results / Medley Results

#### R-15 — Relay Results deutlich hervorheben
Relay-Ergebnisse müssen im Sheet sofort erkennbar sein.

Akzeptanzkriterien:
- Platzierung oder Ergebnisanzeige ist rot und fett oder gleichwertig stark hervorgehoben

#### R-16 — Relay Sheet ohne Exceeding Report
Auf Relay-Results-Seiten darf der Swimmers Exceeding Report nicht zusätzlich unten erscheinen.

#### R-17 — Medley: jedes Team startet bei 2
Für Medley Results gilt die feste Startlogik: jedes Team startet bei 2.

#### R-18 — Medley Ranking = nearest to target time
Medley wird nach geringster Abweichung zur Zielzeit gerankt.

#### R-19 — Medley Gleichstand = gleicher Platz
Bei identischer Abweichung erhalten Teams denselben Platz (z. B. equal 1st).

### Breaker Report

#### R-20 — Breaker Report enthält auch Exceeded Report
Der Breaker Report muss zusätzlich den Exceeded Report enthalten.

### Season Calendar / Event Completion

#### R-21 — Nach Submit nicht weiter "in progress"
Nach vollständigem Abschluss darf das Event nicht weiterhin wie „in progress“ wirken.

#### R-22 — Kein Rücksprung zur Timesheet-Ansicht nach Submit
Nach Abschluss soll der Flow nicht einfach zurück auf Timesheet springen.

#### R-23 — Separater Abschlussbericht
Nach Submit/Complete muss ein separater Report verfügbar sein mit:
- allen Teilnehmern
- allen Heats/Teams
- allen Ergebnissen

## Offene Produkt-/Anforderungsfragen
Aktuell keine weiteren offenen Bryan-Fragen im Scope dieser 3 gelieferten Rückmeldungsteile. Falls bei der Umsetzung neue Unklarheiten auftauchen, wird gestoppt und Dino gefragt.
