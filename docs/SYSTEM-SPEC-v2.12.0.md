# SYSTEM-SPEZIFIKATION — WWSC Swimming App v2.12.0

**Status:** AKTUELL (SSOT für Produktverhalten, Stand v2.12.0, 2026-06-11).
**Zweck:** Dieses Dokument beschreibt die komplette fachliche Logik so, dass ein beliebiger Entwickler
oder ein KI-Harness die App ohne Zugriff auf den Quellcode funktional identisch nachbauen kann.
Ergänzend: `DATA_DICTIONARY.md` (Felder/Einheiten), `API-REFERENCE-v2.12.0.md` (Endpoints),
`UI-SCREEN-SPEC-v2.12.0.md` (Screens), `REBUILD-GUIDE-v2.12.0.md` (Nachbau + Abnahme).
Regel-Herkunft: Bryans Excel (`bryan-excel-original.xlsm`) + datierte Kundenentscheidungen (Abschnitt 14).

---

## 1. Domäne und Produktidee

Der WWSC ist ein Schwimmverein (~23 aktive Mitglieder), der **wöchentlich ein Handicap-Schwimm-Event**
veranstaltet. Handicap-Prinzip: Jeder Schwimmer hat pro Distanz/Stil eine persönliche Bestzeit (PB).
Langsamere Schwimmer starten FRÜHER (bzw. schnellere mit Verzögerung), so dass idealerweise alle
gleichzeitig anschlagen. Gewertet wird nicht "wer ist absolut am schnellsten", sondern wer relativ zu
seiner PB schwimmt (Variance) bzw. wer im Handicap-Rennen zuerst anschlägt.

Ein Administrator (Bryan) bedient die App allein, am Beckenrand, auf Tablet/Laptop:
Anwesenheit markieren → Heats generieren → Startzeiten vorlesen → Zielzeiten eintippen →
Platzierungen/Breaks vorlesen → Event abschließen → Reports drucken. Keine Benutzerverwaltung, keine Auth.

PBs werden bewusst **NIE automatisch aktualisiert** — der Admin pflegt sie manuell im Members-Screen
(diese manuellen Änderungen sind seit v2.12.0 die Datenbasis des Breaker-Reports, Abschnitt 11.3).

## 2. Zeiteinheiten (fundamentale Invariante)

Zwei Einheitensysteme, beide als Integer gespeichert:

| System | Einheit | Felder | Anzeige |
|---|---|---|---|
| Handicap | **ganze Sekunden** | PB (`member.time_*`, `handicap_time`), `start_delay`, `max_time`, `target_time`, `season_start_*`, `pb_change_log.old/new_value` | `formatWhole()` → `"16"` |
| Stoppuhr | **Centisekunden** | `finish_time`, `net_time`, `variance`, `total_time` (Relay), `split_time`, `time_history.time` | `formatTime()` → `"13.45"` |

**Jede Rechnung, die beide Systeme mischt, konvertiert Sekunden ×100 nach Centisekunden.**
Eingabe-Parsing: PBs nur ganze Sekunden (`parseWhole`), Stoppuhrzeiten `"13.45" → 1345` (`parseTime`).
Negative Variance = schneller als PB.

## 3. Datenmodell

Vollständig in `DATA_DICTIONARY.md`. Tabellen-Überblick (SQLite, WAL, FK an):
`member` (6 Stroke-PBs + 6 `season_start_*`-Spalten, `is_active`), `event` (status, `standard_event`,
`special_event`, `archived`), `event_race` (race_type pro Event), `attendance` (present,
`special_event_entry`), `heat` + `heat_lane` (Bahnen mit Zeiten/Plätzen), `relay_team` +
`relay_team_member` (Teams mit Legs/Strokes/Splits), `time_history` (Archiv pro Finalize),
`pointscore_entry` (Punkte pro Race×Member), `pb_change_log` (manuelle PB-Änderungen, v2.12.0).

## 4. Race-Typen

| `race_type` | Art | Teilnahme | PB-Quelle |
|---|---|---|---|
| `25m`, `50m`, `75m`, `backstroke`, `breaststroke`, `butterfly` | Individual | s. Eligibility 6.1 | `member.time_<stroke>` |
| `25m_relay` | Team-Staffel (4 Legs) | ALLE Anwesenden | `time_25m` |
| `25m_brace`, `50m_brace` | Paar-Staffel (2 Legs) | ALLE Anwesenden | `time_25m` / `time_50m` |
| `medley_relay` | 3er-Staffel Back+Breast+Free | nur Entry Y/Back/Breast/Free | Stroke-PB (Free → `time_25m`) |
| `pogo` | 4er-Team, 2 Zeitnehmer | alle mit `time_25m` | `time_25m` |

Anzeige-Labels: `RACE_LABELS` (z. B. `25m_relay` → "25m Team Relay"); Reports nutzen `categoryLabel()`
(z. B. `25m_brace` → "25m brace"). Kanonische Sortierung: 25m, 50m, 75m, back, breast, fly, 25m_relay,
medley_relay, 25m_brace, 50m_brace, pogo.

## 5. Wöchentlicher Event-Lebenszyklus

**Status-Maschine:** `setup` → (`locked` optional) → `finalized` → `completed`; orthogonal `archived` 0/1.
„Aktuelles Event“ = neuestes Event mit `status != 'completed'` (es gibt höchstens eins; UI erzwingt das).

1. **Anlegen** (Datum) → Attendance-Zeilen für alle aktiven Mitglieder mit `present=0`.
2. **Konfigurieren:** `standard_event` ∈ {ordinary_swim, 25m_brace, 50m_brace, pogo} und
   `special_event` ∈ {null, 75m, backstroke, breaststroke, butterfly, medley_relay}.
   **Race-Ableitung (exakt):**
   - ordinary_swim → `25m, 50m, 25m_relay`
   - 25m_brace → `25m_brace, 50m, 25m_relay` (Brace ERSETZT die 25m-Individual-Distanz)
   - 50m_brace → `25m, 50m_brace, 25m_relay`
   - pogo → `25m, 50m, pogo` (Pogo ERSETZT die Standard-Staffel)
   - dazu ggf. der Special-Event-Typ. Duplikate entfernt.
   Änderung der Race-Liste LÖSCHT alle Heats/Teams/Pointscore des Events (Reset der Rennen).
3. **Anwesenheit:** `present` 0/1 + `special_event_entry`:
   `'Y'` = nimmt an ALLEM teil (inkl. Special; bei Medley = Stroke-Auto-Zuteilung),
   `'N'` = nur Standard-Events, `'Back'|'Breast'|'Free'` = Medley-Stroke-Wunsch, `null` = nicht gefragt.
   **Default seit v2.12.0: „Select All“ und nachträgliche Special-Wahl setzen fehlende Entries auf `'Y'`**;
   explizite N/Stroke-Wahlen bleiben. Speichern verlangt ≥ 3 Anwesende.
4. **Heats/Teams bauen** (Abschnitt 6/7) → 5. **Zeiten erfassen + platzieren** (8) →
   6. **Finalize** (9) → 7. **Complete** (9.3). `unlock` setzt zurück auf `setup`.
   „New Week/Reset“: Backup, alle offenen Events → `completed`, neues Setup-Event mit heutigem Datum.

## 6. Individual-Heats

**6.1 Eligibility:** anwesend + aktiv + PB für die Distanz vorhanden; bei Special-Races
(75m/Strokes/Medley) zusätzlich `special_event_entry NOT NULL AND != 'N'`.

**6.2 Heat-Verteilung:** 4 Bahnen/Heat, min. 3 Schwimmer gesamt. Anzahl Heats = `ceil(n/4)`;
Größen möglichst gleich: `base = floor(n/heats)`, die ersten `n mod heats` Heats bekommen +1
(23 → 4,4,4,4,4,3). Zuordnung zufällig (Fisher-Yates). **Ausnahme 50m:** übernimmt die
25m-Heat-Reihenfolge desselben Events (gleiche Gruppen, kein Shuffle), fehlende Schwimmer hinten.

**6.3 Handicap:** pro Heat `max_time = max(PB der Bahnen) + 2` (Sekunden; +2 s Puffer aus Bryans
Excel-VBA). `start_delay = max_time − PB`. Schwimmer mit höchster PB startet sofort (Delay 0).
Heats bestätigen persistiert; Re-Shuffle erlaubt bis Finalize. Schwimmer zwischen Heats verschieben
(max 4 pro Ziel-Heat) berechnet Delays beider Heats neu.

## 7. Relay-Teams

Gemeinsam: `target_time = Σ Mitglieder-PBs` (s); Team-Gesamtzeit-Eingabe in cs;
`net = total_time − start_delay×100`; `variance = net − target_time×100`.
Live-Ranking nach jeder Zeiteingabe + explizites „Calculate Results“.

| Typ | Teambildung | Start | Ranking |
|---|---|---|---|
| `25m_relay` | alle Anwesenden; **≥ 11 → 3 Teams, sonst 2**; Snake-Verteilung nach PB (balanciert); Shuffle rotiert/spiegelt sichtbar | gestaffelt: `maxTeamPB+2 − teamPB` | **schnellste `total_time`** |
| Brace (2er) | nach PB sortiert, **schnellster + langsamster** gepaart; ungerade: Odd-Man-Out bekommt den Partner, der die Team-PB-Summe dem Durchschnitt am nächsten bringt (Partner schwimmt 2×) | fix 2 s | **kleinste \|variance\|** |
| `medley_relay` | nur Y/Back/Breast/Free; Pass 1: Wunsch-Strokes, Pass 2: Y-Wildcards füllen offene Strokes; 3er-Teams; Rest = Partial-Team mit „Swim Twice“-Vervollständigung | fix 2 s | **kleinste \|variance\|**, Gleichstand = gleicher Platz |
| `pogo` | 4er-Teams (floor(n/4)), Snake | fix 2 s | **kleinste \|variance\|**; pro Schwimmer T1/T2, Wert = `round((T1+T2)/2)`, Team-`total_time` = Σ kompletter Durchschnitte (auto-recalc bei jeder Split-Eingabe) |

Manuelles Team-Management (nur `25m_relay` + `medley_relay`): leeres Team hinzufügen, Schwimmer aus
„Unassigned“-Pool zuweisen, Swim-Twice; Teams ohne Mitglieder werden beim Speichern verworfen und
neu durchnummeriert. Vollständigkeit: medley = Back+Breast+Free besetzt; 25m_relay = 4 Legs;
nur vollständige Teams sind rankbar (Banner kommunizieren 0/1-complete-Sonderfälle).
Speichern eines Teamsatzes ersetzt alle Teams des Rennens. Teamnamen „Team 1..N“.

## 8. Ergebnisse (Individual)

- **Finish-Eingabe** (Numpad, cs): `net = finish − delay×100`, `variance = net − PB×100`,
  `is_break` sofort serverseitig (8.2). Eingabe einer Zeit überschreibt; Bahnen ohne Zeit bleiben offen.
- **Live-Platz** pro Heat: Sortierung nach `finish_time`; Gleichstand = gleicher Platz (1,1,3).
  „Save Rankings“ persistiert nach demselben Muster in `heat_lane.place`.
- **Manueller Platz** (`manual_place` 1–4): Dropdown ODER **Quick Tap Placing** (v2.12.0): Modus pro Heat,
  Antippen in Zieleinlauf-Reihenfolge vergibt den jeweils kleinsten freien Platz, erneutes Tippen entfernt,
  „Clear places“ leert den Heat. **Präzedenz überall: `COALESCE(manual_place, place)`** —
  Pointscore, Results, Readout, Event-Report, Season Calendar.
- **8.2 Break-Regel:** `is_break = variance ≤ Schwelle`; Schwelle **25m: −50 cs (≥ 0,5 s schneller)**,
  alle anderen Strokes: **−100 cs (≥ 1,0 s)**. Zusätzlich `net_time > 0` für Breaker-Anzeigen.
- **Exceeding Report:** `variance > +200 cs` (> 2 s langsamer) → Hinweisliste „PB ggf. erhöhen“
  (pro Race auf dem Results-Screen, global via `/api/reports/exceeded`).
- Relay-Typen erscheinen im selben Results-Screen mit Inline-Team-Darstellung (7).

## 9. Finalize / Complete / Archiv

**9.1 Finalize** (Transaktion): löscht `time_history` des Events (Re-Finalize-Idempotenz), dann pro
Individual-Race (NUR Stroke-Races; Relays schreiben keine History) und pro Bahn mit `finish_time`:
`time_history`-Zeile (member, event, stroke, `time` = net, `is_break` aus heat_lane = SSOT,
`previous_best` = aktuelle PB). Setzt `member.season_start_<stroke>` = previous_best, **nur falls noch null**
(= PB-Stand beim Saison-Ersteinsatz). Danach Pointscore-Write (10.2, idempotent) im selben Commit;
Status → `finalized`. PBs werden NICHT geändert.

**9.2 Unlock:** Status → `setup` (Korrekturen möglich, Re-Finalize erlaubt).

**9.3 Complete:** Status → `completed`; Event verschwindet aus „aktuell“, erscheint im Season Calendar.
**Event-Report** (Popup/Druck, v2.12.0): Teilnehmerliste (mit Entry), pro Race: Heat-Tabellen
`Lane | Swimmer | PB | Start | Finish | Net | Variance | Break | Place` (Break-Zeilen grün, Platz =
manual-first) bzw. Team-Blöcke mit `Start/Target/Total/Variance` + Legs; am Ende „Record Breakers“.

**9.4 Archiv:** `archived=1` (Soft-Delete, reversibel); archivierte Events sind aus Kalender-Default,
Pointscore-Aggregaten und Reports ausgeschlossen (Detailansicht weiterhin abrufbar).

## 10. Pointscore (Engine)

**10.1 Regeln (zentral konfiguriert, Quelle: Bryans Excel + Bestätigung 2026-06-05):**

| Kategorie | race_types | Punkte |
|---|---|---|
| Individual | 25m, 50m, 75m, back, breast, fly | Platz 1/2/3 → **5/4/3**; jeder weitere FINISHER → **2**; ohne Zeit → keine Zeile |
| Relay/Team | 25m_relay, medley_relay, 25m/50m_brace, pogo | Teamplatz 1/2/3 → **5/4/3 für JEDES Teammitglied**; sonst 0 (keine Finisher-Punkte) |

Unbekannter race_type → defensiv als Individual. Platz-Basis: Individual `COALESCE(manual_place, place)`
pro Bahn (nur mit `finish_time`); Relay `relay_team.place` (nur mit `total_time`).

**10.2 Persistenz:** beim Finalize; idempotent (DELETE der Event-Races-Einträge, dann INSERT);
pro (event_race, member) AGGREGIERT (Swim-Twice: ein Schwimmer in mehreren Teams/Heats desselben
Rennens bekommt die Summe in einer Zeile). Isolations-Garantie: Engine liest nur akzeptierte
Ergebnisdaten und schreibt ausschließlich `pointscore_entry` (per `WWSC_POINTSCORE_DISABLED=1` beweisbar).

**10.3 Aggregation:** „Jedes Event behält seinen eigenen Pointscore.“ Monat (`YYYY-MM`) und Saison
(Kalenderjahr, working default) = **einfache Addition** über finalized/completed, nicht-archivierte Events.

## 11. Die 3 Haupt-Reports (v2.12.0, „as per the spreadsheet“)

**11.1 Report 1 — Event Points weekly** (`/api/pointscore/by-race-type/:raceType?year=`):
Event-Typ wählen → Zeilen = ALLE Mitglieder (aktive ∪ Punkteinhaber, alphabetisch), Spalten = Wochen
(= Events des Jahres, die dieses Race enthalten, aufsteigend), Zellen = Punkte (leer = 0), letzte Spalte Total.

**11.2 Report 2 — Total Pointscore** (`/api/pointscore/total?year=`): eine Seite; Zeilen = alle Mitglieder
**sortiert Total absteigend** (Rank-Spalte; Annahme, Bryan gefragt), Spalten = alle Event-Typen der Saison
(kanonische Reihenfolge), Zellen = Saisonsumme je Typ, letzte Spalte TOTAL. Invariante:
Zeilensumme == Saison-Standing des Mitglieds.

**11.3 Report 3 — Breakers** (`/api/reports/breakers-summary?year=`): „uses the manually changed times“.
Jede manuelle PB-Änderung im Members-Screen wird in `pb_change_log` protokolliert (alte/neue Sekunden,
Zeitstempel; No-Op-Saves loggen nicht). Pro Mitglied × Stroke (nur Strokes mit PB oder Log):
**Count** = Anzahl Reduktionen (`new < old`) im Jahr — Erhöhungen zählen NIE;
**Amount** = Baseline − aktuelle PB, Baseline = `season_start_<stroke>` ?? ältester geloggter `old_value`
?? aktuelle PB (Amount kann negativ sein, wenn PB über Saisonstart erhöht wurde).
Plus Totals je Mitglied. Solange keine manuellen Änderungen existieren: erklärende Hinweis-Box.
(Die automatische Break-Erkennung pro Event bleibt separat: „Break Counts“ aus `time_history.is_break`.)

**11.4 Weitere Reports** (unter „More reports“, alle CSV-fähig): Per-Event-Pointscore, Monthly/Season
Winners, **Swimmer Card** (v2.12.0: JEDE Teilnahme — Individual-Bahnen mit Finish ∪ Relay-Teams mit
Zeit — mit 0 Punkten wo keine vergeben; Summe == Pointscore-Summe), Break Counts (overall/by event),
Improvements (Σ `previous_best×100 − time`, nur wenn schneller), Completed Categories (Coverage je
race_type über completed Events), Breaker Report (alle Breaks, gruppiert nach Datum), Exceeded,
Member-Graphen (SVG: Time-Trend + PB-Progression aus `time_history`), DB-Export (SQLite-Backup-API,
Dateiname mit Version+Datum), Time-History/Members-CSV.

## 12. Persistenz, Backups, Deployment

SQLite (better-sqlite3, WAL, FK an), Schema-Anlage + additive Migrationen beim Start (`CREATE TABLE/
ALTER ADD COLUMN IF NOT EXISTS`-Muster), Demo-Seed nur bei leerer member-Tabelle. Backups:
`createBackup()` (Zeitstempel-Datei, max. 20) automatisch bei Reset/New-Week + `POST /api/backup`.
Render: Auto-Deploy von `main`, `WWSC_DB_PATH=/var/data/wwsc.db` auf 1-GB-Disk. Statische Files mit
`Cache-Control: no-cache` für js/css + `?v=X.Y.Z`-Cache-Busting in `index.html` (Pflicht bei jedem Bump).

## 13. Fehlerverhalten & UI-Konventionen

API-Fehler einheitlich `{ "error": "..." }` mit 4xx/5xx; Frontend zeigt `alert('Error: …')`.
Bestätigungs-Dialoge vor destruktiven Aktionen (Re-Shuffle, Finalize, Reset …). 0 Console-Errors ist
Abnahmekriterium. Touch-Ziele ≥ 40 px, Numpad für Zeiteingaben, Tab-Navigation zwischen Eingabefeldern,
Druck-Stylesheet (Sidebar/Buttons aus, kompakte Tabellen, Relay-Grid 3-spaltig). Sidebar-Screens:
Dashboard, Members, Times Sheet, Heat Builder, Results, Breaker Report, Pointscore, Season Calendar;
Hash-Routing `#/screen`. Versionsanzeige in der Sidebar aus `/api/version`.

## 14. Datierte Kundenentscheidungen (Auszug, SSOT für „warum“)

| Datum | Entscheidung |
|---|---|
| 2026-04-04ff | Ganze Sekunden für PB/Delay/Target; Medley Start 2 s, nearest-to-target, Gleichstand = gleicher Platz; Event-Report nach Complete |
| 2026-04-21 | Brace-Wochen behalten die Standard-25m-Staffel; Shuffle muss sichtbar anders verteilen |
| v2.7.4 | 25m-Relay: ≥ 11 Schwimmer → 3 Teams; Brace/Pogo/Medley Start fix 2 s |
| 2026-05 (v2.8.12) | Break-Schwelle 25m = 0,5 s (sonst 1,0 s) |
| 2026-06-05 | Relay/Team-Pointscore **5/4/3** nach Teamplatz |
| 2026-06-10 | Select-All-Default Y; Tap Placing; Relay einseitig 3-spaltig; GENAU 3 Hauptreports; Breaker-Report aus manuell geänderten Zeiten; Swimmer Card zeigt 0-Punkte-Teilnahmen; Event-Report mit Start/Break |

Offene Working Assumptions: Saisongrenze = Kalenderjahr; Punkteformeln bis Bryans „Constitution“
bestätigt (Banner in der UI); Report-2-Sortierung (Bryan gefragt 2026-06-10).
