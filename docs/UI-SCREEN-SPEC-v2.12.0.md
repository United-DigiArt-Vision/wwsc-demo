# UI-SCREEN-SPEZIFIKATION — WWSC Swimming App v2.12.0

**Status:** AKTUELL (abgeglichen mit `src/public/js/` @ v2.12.0).
Layout: feste Sidebar links (8 Einträge + Versionsanzeige aus `/api/version`), Content rechts;
Hash-Routing `#/screen`. Touch-first (Ziele ≥ 40 px), Numpad-Modal für alle Zeiteingaben,
`tooltip()` an erklärungsbedürftigen Stellen, Druck via `window.print()` + Print-CSS
(Sidebar/Buttons/`.print-hide` ausgeblendet, kompakte Tabellen). Fehler: `alert('Error: …')`;
destruktive Aktionen immer mit Bestätigungsdialog.

## 1. Dashboard (`dashboard`)

Workflow-Einstieg mit Zustands-Hero: kein Event → „Start New Event“-CTA; `setup` → nächster Schritt
(Anwesenheit/Heats) mit Hinweistext; finalized/completed → Statuskarte. Kacheln: Mitgliederzahl,
Anwesende, Races. Buttons navigieren zu Times Sheet/Heat Builder/Results.

## 2. Members (`members`)

- Tabelle: Name, Status-Tag, 6 PB-Spalten (ganze Sekunden, `formatWhole`), Aktionen.
- Filter Active/Inactive/All + Live-Suche (Fokus-/Cursor-Erhalt beim Re-Render).
- Aktionen je Zeile: **Edit** (Modal: Name, 6 PBs als ganze Sekunden, Status; Speichern → PUT — jede
  PB-Änderung wird serverseitig für den Breaker-Report geloggt), **📜 History** (M2-Modal: Datum, Stroke,
  Zeit, vorige PB, Break-Markierung), **📈 Graphs** (M3-Modal, SVG: Time-Trend pro Stroke mit 🏆-Chips +
  PB-Progression; leere/1-Punkt-Zustände abgefangen).
- Toolbar: **+ Add Member** (Modal wie Edit), **📁 Import CSV** (Spalten: Name + optionale Distanzen),
  Mitgliederzähler unten.

## 3. Times Sheet (`event-setup`)

- Ohne aktuelles Event: Datum wählen (Datepicker-Button) + „Create Event“.
- Mit Event: Datum-Button (ändern), **Build Heats** (primär, speichert Anwesenheit+Config+Races und
  springt zu Heat Builder/reset), dezent „Discard & Start New Event“ (= New Week).
- Dropdowns **Standard Distances** (Ordinary/25m Brace/50m Brace/Pogo) und **Special Event**
  (None/75m/Back/Breast/Fly/Medley) — Änderung schreibt Config+Races sofort (Reset der Rennen).
- Regel-Banner „Y = ALLE Events inkl. Special, N = nur Standard“; bei Medley zusätzlich Stroke-Zähler
  (Back/Breast/Free/Y/N).
- Anwesenheitstabelle: Nr., Name, 6 PB-Spalten, Entry-Spalte:
  ohne Special = Klick-Toggle ✓; mit Special = Select (—/Y/N bzw. +Back/Breast/Free bei Medley).
  **Select All setzt fehlende Entries auf Y** (v2.12.0); Deselect All leert. Footer: Anwesenden-Zähler;
  < 3 Anwesende blockiert Build Heats.

## 4. Heat Builder (`heat-builder`)

- **Progress-Tracker**: je Race ein Button (⬜/✅, Standard- und Special-Gruppe) = Race-Wechsel;
  „X/Y races confirmed“; alle bestätigt → grüne „Go to Results“-Karte.
- Individual-Race: **Generate Heats** (Vorschau, zufällig) → **Shuffle** / **Confirm Heats**;
  nach Confirm „Re-Shuffle“ (mit Warnung). Heat-Karten: Lane, Swimmer, PB, Max Time, **Start Delay**
  (+X, akzentuiert); leere Bahnen als „— empty —“.
- Relay-Race: **Generate Teams / Shuffle / Confirm Teams**, danach Re-Shuffle (Warnung: Zeiten gehen
  verloren). Team-Karten mit Leg, Swimmer, (Stroke bei Medley/Brace), PB; Header: Teamname+Platz,
  **Start: Xs** (Badge), Total/Target. Brace: kompakte Zeilen-Tabelle (eine Zeile pro Paar).
- Medley-Infokarte: Bedeutung von (Y), Start 2 s, Ranking smallest variance.
- **Manuelles Team-Management** (nur 25m Relay + Medley, vor Confirm): Ranking-Regel-Banner
  (complete/incomplete-Zähler, Sonderbanner bei 0 oder 1 vollständigen Teams), Karte
  **Unassigned swimmers** (Pills, bei Medley mit Entry-Tag), **➕ Add Team**, je Team Swimmer-Picker/
  Entfernen, **Swim Twice**-Zeile (Dropdown + Button). Vollständigkeit: Medley Back+Breast+Free; Relay 4 Legs.

## 5. Results (`results`)

- Kopf: Race-Selector (Optgroups „Standard/Special“, ✓ = Ergebnisse vorhanden), **🗣️ Readout**
  (Modal mit kopierbarem Text der Platzierungen), **🖨️ Print**.
- Vor Finalize: **💾 Save Rankings** (persistiert Auto-Plätze), **✅ Finalize Event** (Vollständigkeits-
  Report im Bestätigungsdialog: fehlende Zeiten je Race; danach Ergebnis-Report mit Breaker-Zählern).
  Nach Finalize: **🔓 Unlock for Edits**, **✅ Complete Event** (→ Event-Report-Popup + Season Calendar).
  Nach Complete: **📄 Event Report**-Button.
- Individual-Tabelle je Heat: Lane, Swimmer (groß), PB, Delay, **Exp. Finish** (PB+Delay), **Finish**
  (Tap-Zelle → Numpad; gesperrt nach Finalize), Net, Variance (grün wenn negativ), **Break** (BREAK/—),
  **Auto** (Gold/Silber/Bronze-Zelle + Zeilen-Tint), **Manual** (seit v2.12.1 direkte Tap-Zelle).
- **Manual-Zellen-Tap** (v2.12.1, je Heat, vor Finalize): leere Manual-Zelle antippen vergibt den
  nächsten freien Platz, erneut tippen entfernt; **↺ Clear places** leert den Heat. Kein separater
  Start-/Done-Modus; Finish-Zellen bleiben für Zeit-Eingabe aktiv.
- Inline-**Breakers Report** je Race (grüne Karte: Swimmer, Event/Heat, Old PB, New Time, −Variance)
  und **Exceeding Report** (> 2 s über PB, orange Karte, Hinweis „PBs NICHT auto-aktualisiert“).
- Relay-Typen inline: Team-Karten **im `.relay-teams-grid`** (v2.12.0: nebeneinander, Print 3-spaltig):
  25m Relay (Leg/Swimmer/PB, Team Total als rote Tap-Zeile), Medley (+Stroke mit (Y)-Marker,
  Variance/Place-Zeile, Ranking-Banner), Brace (kompakte Zeilen: Pair, PBs, Total, Target, ⏱️ Tap,
  Variance, Place + „How Place is decided“-Banner), Pogo (je Team: Swimmer, PB, Start, Exp.F, Total,
  Tgt, T1, T2, Result=Avg, Var; Team-Variance/Place-Zeile). „Calculate Results“-Button bis Ranking da.
- **Event-Report-Popup** (Complete/Button, druckbar): Teilnehmer (+Entry), je Race Heat-Tabellen
  `Lane|Swimmer|PB|Start|Finish|Net|Variance|Break|Place` (Break-Zeilen grün; Platz manual-first;
  Heat-Header mit expected finish) bzw. Teams (Start/Target/Total/Variance + Legs), Record Breakers.

## 6. Relays (`relays`)

Eigenständige Relay-Sicht (gleiches Verhalten wie HB-Relay + Zeiteingabe): Race-Selector (nur Relay-
Typen), Generate/Shuffle/Confirm bzw. Re-Shuffle, „Calculate Results“; Team-Karten im
`.relay-teams-grid` (v2.12.0) mit Tap-Zellen für Team Total (Brace: je Paar-Zeile; Pogo: T1/T2-Zellen).
Status-Banner „Teams Confirmed“ / „Results Calculated — X/Y ranked“. „← Back to Results“, Print.

## 7. Breaker Report (`breaker-report`)

Alle PB-Breaks aller Events (`/api/reports/breakers`), gruppiert nach Datum (neueste zuerst), je Gruppe
Tabelle Swimmer | Event/Stroke | Old PB | New Time | −Improvement (grünes R10-Format). Print. Leerer
Zustand: „No record breakers yet.“

## 8. Pointscore & Reports (`pointscore`)

- Regel-Transparenz-Banner (Quelle Excel, „working assumption“, print-hide).
- **Haupt-Tabs (v2.12.0): 1️⃣ Event Points (weekly) • 2️⃣ Total Pointscore • 3️⃣ Breakers** + Button
  **„▾ More reports“** (klappt Zweitreihe mit den bisherigen Tabs auf: Event History, Per-Event,
  Monthly Winners, Season Winners, Swimmer Card, Break Counts, Improvements, Completed Categories, DB & Graphs).
  Default-Tab = Report 1.
- **Report 1**: Event-Typ-Select (Labels via categoryDisplay) + Saison-Select + CSV + Print;
  Tabelle Swimmer | je Woche (Kurzdatum, title=ISO) | **Total** (blau); alle Mitglieder, leere Zelle = 0.
- **Report 2**: Saison-Select + CSV + Print; Rank | Swimmer | je Event-Typ | **TOTAL**;
  sortiert Total absteigend, Namen-Tiebreak.
- **Report 3**: Saison-Select + CSV + Print; Haupttabelle Swimmer | Stroke | Season Start | Current PB |
  **Breaker Count** | **Breaker Amount** (Mitglied gruppiert, 〃-Folgezeilen; grün > 0, grau 0/—)
  + Nebentabelle „Totals per swimmer“; Hinweis-Box solange keine manuellen PB-Änderungen existieren.
- Event History (unter More, v2.12.1): Tabelle Date | Status | Swimmers | Races | Details; Details öffnet
  den vorhandenen Event-Details-Dialog inkl. Time History.
- Swimmer Card (unter More): Select + Print; „<Name> — total N points“; Tabelle Date | Race | Points —
  **alle Teilnahmen inkl. 2 Entry-Points für nicht platzierte Teilnahmen** (v2.12.1).
- Übrige More-Tabs wie zuvor (Tabellen + CSV/Print; DB & Graphs: SQLite-Download, Time-History-CSV,
  Erklärungstexte zu Export und Graph-Quelle).

## 9. Season Calendar (`calendar`)

Liste aller Events `date <= heute` (Default ohne archivierte; Toggle „Show archived“), Karten mit Datum,
Status, Anwesenden-/Race-Zahl. Detailansicht je Event: Teilnehmer, je Race Top-3 je Heat
(**Platz manual-first**, v2.12.0) bzw. Team-Ergebnisse mit Variance + Mitgliedern, Breakers,
Time-History-Block (M2), **Event Report**-Button (öffnet dasselbe Popup wie Results), Archive/Restore.

## 10. Gemeinsame Komponenten

**Numpad** (Zeiteingabe, Ziffern + Punkt, leer = abbrechen), **Modal/confirmDialog**, **Datepicker**,
**Tooltip** (ⓘ), **Sidebar** (renderSidebar; aktiver Eintrag markiert). Cache-Busting: alle JS/CSS-Tags
mit `?v=<version>`; Server sendet zusätzlich no-cache-Header für js/css.
