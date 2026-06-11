> **HISTORISCH (Milestone-Snapshot — nicht mehr Verhaltens-SSOT).** Aktueller Stand: `docs/00-DOC-INDEX.md` → `SYSTEM-SPEC-v2.12.0.md` / `DATA_DICTIONARY.md` / `API-REFERENCE-v2.12.0.md` / `UI-SCREEN-SPEC-v2.12.0.md`.

# USE CASES — WWSC Swimming App v2.7.1

## Wer ist Bryan?
Bryan leitet den WWSC (Winter Weakies Swimming Club). Jeden Mittwoch kommen 8-23 Schwimmer.
Bryan sitzt am Pool mit einem Tablet/Laptop und:
- Markiert wer da ist
- Lässt die App Heats generieren
- Ruft die Startzeiten vor
- Tippt Finish-Zeiten ein
- Liest Platzierungen und Breakers vor
- Druckt den Bericht aus

## Bryans wöchentlicher Workflow

### Phase 1: Vorbereitung (vor dem Schwimmen)
Bryan öffnet die App, sieht das Dashboard, geht zum Times Sheet.

### Phase 2: Attendance (am Poolrand)
Schwimmer trudeln ein. Bryan markiert jeden als "present".
Manche kommen spät, manche sagen kurzfristig ab.

### Phase 3: Event-Konfiguration
Bryan wählt: Standard Event (Ordinary/Brace/Pogo) + optionalen Special Event.
Für Medley fragt er jeden Schwimmer: "Back, Breast, oder Free?"

### Phase 4: Heats generieren
Bryan drückt "Build Heats". Schaut ob die Zuordnung fair ist.
Wenn nicht: Shuffle. Wenn ok: Confirm.

### Phase 5: Schwimmen + Zeiten eingeben
Heat für Heat. Bryan ruft die Startzeiten vor, die Schwimmer starten,
Bryan tippt die Finish-Zeit vom Stoppuhr-Display ein (z.B. "17.01").

### Phase 6: Ergebnisse + Breakers
Nach jedem Heat sieht Bryan wer gewonnen hat, wer seinen PB gebrochen hat.
Am Ende: Finalize, drucken, vorlesen.

### Phase 7: Relay
Nach den Individual-Rennen kommen die Relays.
Teams werden generiert, Zeiten eingegeben, Ergebnisse berechnet.

### Phase 8: Abschluss
Event abschließen, Bericht ansehen, nächste Woche vorbereiten.

---

## Use Case Liste

### UC-01: Normaler Mittwoch — Ordinary Swim, 12 Schwimmer
- 12 von 23 sind da
- Standard: Ordinary Swim (25m + 50m + 25m Relay)
- Kein Special Event
- Alle haben PBs
- Ergebnis: 3 Heats à 4 Lanes, 3 Relay-Teams, Breakers, Finalize

### UC-02: Kleiner Abend — nur 3 Schwimmer (Minimum)
- Nur 3 sind da
- 1 Heat mit 3 Lanes
- 1 Relay-Team (oder keins, wenn < 4 für Teams)
- Alles muss trotzdem funktionieren

### UC-03: Voller Club — 23 Schwimmer (Maximum)
- Alle 23 da
- 6 Heats (4,4,4,4,4,3)
- Viele Relay-Teams
- Lange Ergebnisliste
- Breaker Report mit vielen Einträgen

### UC-04: Ungerade Anzahl — 5, 7, 9, 11 Schwimmer
- Heats mit ungleichen Größen
- Relay-Teams mit übrig bleibenden Schwimmern → "Swim Twice"
- Ungleiche Medley-Teams mit Leftover

### UC-05: Medley Relay — alle Y (Auto-Assign)
- Special Event: Medley Relay
- Alle Schwimmer markieren "Y"
- System verteilt automatisch Back/Breast/Free
- (Y)-Marker sichtbar

### UC-06: Medley Relay — explizite Strokes
- Jeder Schwimmer sagt explizit Back, Breast, oder Free
- System respektiert die Wahl
- Kein (Y)-Marker

### UC-07: Medley Relay — Mix aus Y + explizit
- Manche sagen "Back", manche sagen "Y"
- System füllt mit Y-Schwimmern auf
- Korrekte Marker

### UC-08: Medley Relay — Schwimmer sagt "No"
- Schwimmer markiert "N" → wird NICHT in Medley-Teams eingeteilt
- Schwimmer IST aber in Standard-Events (25m, 50m, 25m Relay)
- N-Schwimmer darf in Standard-Relay sein, aber NICHT in Medley

### UC-09: Brace Relay (25m Brace, 50m Brace)
- Paare statt Teams
- Ranking nach nearest-to-target
- Alle present Swimmer nehmen teil (inkl. N-markierte)

### UC-10: Pogo Relay
- Teams wie 25m Relay
- Alle present Swimmer nehmen teil

### UC-11: Special Event — 75m / Backstroke / Breaststroke / Butterfly
- Nur Y-Swimmer nehmen am Special teil
- N-Swimmer → nur Standard
- PBs korrekt aus der richtigen Spalte

### UC-12: Schwimmer bricht PB (Break)
- Finish-Zeit ergibt net_time < PB → BREAK
- Variance <= -100cs (= 1 Sekunde Verbesserung)
- Breakers Report zeigt: Old PB (Sekunden), New Time (cs), Improved (cs)
- Korrekte Formatierung überall

### UC-13: Schwimmer überschreitet PB deutlich (Exceeded)
- Finish-Zeit ergibt variance > +200cs (= >2 Sekunden langsamer)
- Exceeded Report zeigt Swimmer
- NICHT auf Relay-Seiten

### UC-14: Schwimmer genau auf PB (variance = 0)
- Perfekte Zeit → variance 0 → kein Break, kein Exceeded
- Korrekte Anzeige "+0.00"

### UC-15: Gleiche Finish-Zeit (Tie)
- 2 Swimmer: gleiche Zeit → gleicher Platz (1st, 1st, 3rd)
- 3 Swimmer: alle gleich → (1st, 1st, 1st, 4th)
- 4 Swimmer: alle gleich → (1st, 1st, 1st, 1st)

### UC-16: Relay — Swimmer hinzufügen ("Swim Twice")
- Team hat 3 Swimmer, braucht 4
- Bryan fügt einen Swimmer als 4. Leg hinzu
- Target, Start Delay, Max Time werden NEU berechnet
- Team Total zeigt den neuen Wert

### UC-17: Relay — Medley Variance + Gleichstand
- Medley: jedes Team Start = 2
- Ranking: nearest-to-target (abs(variance))
- Gleichstand: gleiche abs(variance) → gleicher Platz
- Korrekte Varianzanzeige in Centisekunden

### UC-18: Finalize → Unlock → Edit → Re-Finalize
- Bryan finalisiert, merkt einen Fehler
- Unlock → ändert eine Zeit → re-finalize
- Ergebnis bleibt konsistent

### UC-19: Complete Event → Event Report
- Nach Complete: separater Report
- Teilnehmer, Heats, Teams, Ergebnisse, Breakers
- Korrekt formatiert (nicht rohe Centisekunden)

### UC-20: Season Calendar — vergangene Events ansehen
- Mehrere Events im Kalender
- Klick → Details-Modal mit Teilnehmern + Ergebnissen + Breakers
- Korrekte Formatierung aller Werte

### UC-21: Season Calendar — Event archivieren + wiederherstellen
- Event löschen → geht ins Archiv
- Wiederherstellen → kommt zurück
- Daten bleiben erhalten

### UC-22: Neues Event starten (Weekly Reset)
- "Start New Event" → altes Event completed
- Neues Event mit Attendance für alle aktiven Swimmer
- Alte Daten bleiben im Calendar

### UC-23: Members verwalten — PB bearbeiten
- Bryan öffnet Members → Edit → ändert PB
- PB in ganzen Sekunden (kein Dezimal)
- Nächstes Event nutzt neuen PB

### UC-24: Members — CSV Import
- CSV mit Name + Zeiten
- Verschiedene Formate (mit/ohne Header, leere Felder, Dezimalzeiten)
- Fehlerhafte Zeilen werden gemeldet

### UC-25: Members — Deaktivieren/Löschen
- Deaktivierter Swimmer → nicht in Attendance
- Gelöschter Swimmer → Daten weg, aber alte Events erhalten

### UC-26: Swimmer ohne PB für eine Distanz
- Swimmer hat time_25m aber kein time_50m
- Bei 50m Heat: wird NICHT eingeteilt (kein PB → kein Handicap)
- Bei 25m Heat: wird eingeteilt

### UC-27: Tab-Navigation durch alle Sheets
- Times Sheet: Tab zwischen Entry-Selects
- Results: Tab zwischen Finish-Time-Eingaben
- Members: Tab durch Edit-Felder

### UC-28: Druck — Ergebnisse druckbar
- Results-Screen: Breakers Report druckbar
- Relay-Screen: druckbar
- Event Report: in neuem Fenster, druckbar

### UC-29: Mehrere Events → Consolidated Breakers
- 3+ Events im Season
- Breaker Report Screen zeigt alle Breakers gruppiert nach Datum
- Exceeded Report auch enthalten

### UC-30: Relay Results — kein Exceeded Report
- Auf Relay-Seite: KEIN Exceeded Block unten
- Nur auf Individual Results

### UC-31: Auto-Place Medal Styling
- 1st = Gold, 2nd = Silver, 3rd = Bronze
- Gesamte Zelle eingefärbt, nicht nur kleiner Kreis
- Bei Gleichstand: beide Gold

### UC-32: Expected Finish Spalte
- Results: Spalte "Exp. Finish" = PB + Delay
- Ganze Sekunden
- Konsistent zwischen Heat Builder und Results

### UC-33: Medley Stroke Counter
- Times Sheet im Medley-Modus zeigt Counter
- Y: X | Back: X | Breast: X | Free: X
- Hilft Bryan die Teams auszubalancieren

### UC-34: Event mit KEINEN Breaks und KEINEN Exceeded
- Alle Swimmer schwimmen genau auf PB ± 0.5s
- Breakers Report: leer
- Exceeded Report: leer
- Kein Crash, korrekte "Keine Ergebnisse" Anzeige

### UC-35: Relay mit verschiedenen PB-Verteilungen
- Teams mit sehr unterschiedlichen PBs
- Teams mit sehr ähnlichen PBs
- Start Delays variieren stark

---

## Zusammenfassung: 35 Use Cases

| Kategorie | Use Cases | Count |
|-----------|----------|-------|
| Normaler Workflow | UC-01 bis UC-04 | 4 |
| Medley Varianten | UC-05 bis UC-08 | 4 |
| Andere Relay-Typen | UC-09, UC-10 | 2 |
| Special Events | UC-11 | 1 |
| Ergebnis-Szenarien | UC-12 bis UC-15 | 4 |
| Relay-Operationen | UC-16, UC-17 | 2 |
| Lifecycle-Flows | UC-18 bis UC-22 | 5 |
| Members | UC-23 bis UC-26 | 4 |
| UI/Navigation | UC-27, UC-28 | 2 |
| Reports | UC-29 bis UC-32 | 4 |
| Edge Cases | UC-33 bis UC-35 | 3 |
