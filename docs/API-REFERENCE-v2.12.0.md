# API-REFERENZ — WWSC Swimming App v2.12.0

**Status:** AKTUELL (SSOT, generiert aus `src/server.js` @ v2.12.0). 75 Endpoints (62 Routen + 13 CSV-Varianten).
Konventionen: JSON; Fehler immer `{ "error": string }` (400 Validierung, 403 locked, 404 fehlend,
500 intern). Einheiten: s = ganze Sekunden, cs = Centisekunden (siehe `DATA_DICTIONARY.md`).
CSV-Endpoints liefern `text/csv` mit `Content-Disposition`-Dateinamen inkl. App-Version.

## System

| Methode Pfad | Zweck / Verhalten |
|---|---|
| GET `/api/version` | `{version (package.json), build (Serverstart-ISO)}` |
| GET `/api/dashboard` | `{currentEvent, totalMembers, presentCount, racesCount}` |
| POST `/api/backup` | SQLite-Backup-Datei erstellen → `{ok, path}` (max. 20 rotierend) |
| GET `/api/export/db` | SQLite-Snapshot-Download (Backup-API, Datei `wwsc-sqlite-db-v<ver>-<stamp>.db`, danach serverseitig gelöscht) |

## Members

| Methode Pfad | Zweck / Verhalten |
|---|---|
| GET `/api/members?filter=all|active|inactive` | Liste, sortiert nach Name. PBs in s |
| GET `/api/members/csv` | Roster-CSV (id, name, is_active, joined_date, 6 PB-Spalten `pb_*_s`) |
| GET `/api/members/:id` | Einzelner Member (404 wenn fehlt) |
| POST `/api/members` | `{name!, time_25m?, …}` → `{id}`; joined_date = heute |
| PUT `/api/members/:id` | Voll-Update (name, is_active, 6 PBs). **Loggt jede Stroke-Änderung in `pb_change_log`** (alt≠neu; No-Op loggt nicht) — transaktional. 404 wenn fehlt |
| PATCH `/api/members/:id/toggle-active` | Aktiv-Flag kippen → `{ok, is_active}` |
| DELETE `/api/members/:id` | Hard-Delete inkl. attendance, time_history, heat_lane, relay_team_member, **pb_change_log, pointscore_entry** (v2.12.0 FK-Fix) |
| POST `/api/members/import` | multipart `file` (CSV: Name + optional 25m/50m/75m/backstroke/breaststroke/butterfly, Dezimalzeiten werden auf s gerundet) → `{imported, errors[]}` |

## Events & Lifecycle

| Methode Pfad | Zweck / Verhalten |
|---|---|
| GET `/api/events?archived=1` | Events mit `date <= heute`, DESC; default ohne archivierte; inkl. `present_count`, `race_count` |
| GET `/api/events/current` | Neuestes Event `status != 'completed'`, sonst `null` |
| GET `/api/events/:id` | Event oder `null` |
| POST `/api/events` | `{date!}` → legt Event (`setup`) + Attendance-Zeilen (alle aktiven, present=0) an |
| PUT `/api/events/:eventId/date` | Datum ändern |
| PUT `/api/events/:id/lock` / `/unlock` | Status `locked` ↔ `setup` (locked blockiert Attendance/Races-Writes) |
| POST `/api/events/reset` • POST `/api/events/new-week` | Backup → alle offenen Events `completed` → neues Setup-Event (heute) + Attendance → `{ok, backup, newEventId}` (zwei gleichwirkende Endpoints) |
| POST `/api/events/:eventId/finalize` | Transaktion: time_history neu schreiben (nur Stroke-Races, Bahnen mit Zeit; is_break-SSOT; previous_best=PB), `season_start_*` set-if-null, Pointscore-Write, Status `finalized` → `{ok, breakers_count}` |
| POST `/api/events/:eventId/complete` | Status `completed` |
| PUT `/api/events/:eventId/archive` / `/restore` | `archived` 1/0 |
| GET `/api/events/:eventId/report` | Konsolidierter Event-Report: `{event, attendance[present, name, special_event_entry], races[(heats+lanes voll) | (teams+members)], breakers[{member_name, stroke, old_pb cs, new_time cs, improvement cs}]}` |

## Konfiguration & Anwesenheit

| Methode Pfad | Zweck / Verhalten |
|---|---|
| GET/PUT `/api/events/:eventId/config` | `{standard_event, special_event}` (Defaults ordinary_swim/null) |
| GET `/api/events/:eventId/attendance` | Attendance ⨝ member (nur aktive): present, special_event_entry, 6 PBs |
| PUT `/api/events/:eventId/attendance` | `{attendees:[{member_id, present, special_event_entry}]}`; validiert ≥ 3 present; 403 wenn locked |
| GET `/api/events/:eventId/races` | event_race-Zeilen + heat_count |
| PUT `/api/events/:eventId/races` | `{race_types[]}` ersetzt Races; **löscht** Heats/Lanes/Teams/Pointscore des Events (FK-sicher); ≥ 1 Typ |

## Heats (Individual)

| Methode Pfad | Zweck / Verhalten |
|---|---|
| GET `/api/races/:raceId/generate-heats` | Vorschau (nicht persistiert): Eligibility (present+aktiv+PB; Special: Entry ≠ N/null), Verteilung 4er-Heats, 50m folgt 25m-Gruppierung, `max_time=maxPB+2`, `start_delay=max−PB` → `{heats[], warning?}` |
| POST `/api/races/:raceId/confirm-heats` | `{heats}` persistieren (ersetzt), Race-Status `heats_generated` |
| GET `/api/races/:raceId/heats` | Gespeicherte Heats + Lanes (+ berechnetes max_time) |
| PUT `/api/races/:raceId/heats/move-swimmer` | `{member_id, from_heat, to_heat}`; Ziel < 4; nummeriert Quelle neu; **Delays beider Heats neu** |
| PUT `/api/heats/:heatId/lanes/:laneId/time` | `{finish_time cs ≥ 0}` → speichert finish/net/variance/is_break (`net=finish−delay×100`, `var=net−PB×100`, Break-Schwelle 25m −50 cs sonst −100 cs) |
| PATCH `/api/heat-lanes/:id/place` | `{manual_place: 1–4|null}` |
| POST `/api/races/:raceId/rank` | Persistiert Plätze je Heat nach finish_time; Gleichstand = gleicher Platz; ohne Zeit → null |

## Relays

| Methode Pfad | Zweck / Verhalten |
|---|---|
| POST `/api/races/:raceId/generate-relay-teams` | `{forceReshuffle?}` → Teams-Vorschau nach Typ-Regeln (SYSTEM-SPEC 7): 25m_relay 2/3 Teams Snake; Brace Paare fastest+slowest + Odd-Man-Out; Medley Stroke-Zuteilung + Partial-Team; Pogo 4er. Setzt target/start/max (Staffel gestaffelt; Brace/Medley/Pogo Start 2 s) |
| POST `/api/races/:raceId/save-relay-teams` | `{teams}` persistieren (ersetzt); leere Teams verworfen + renummeriert; Race-Status `heats_generated` |
| GET `/api/races/:raceId/relay-teams` | Teams + Members (⨝ member-PBs, attendance-Entry; `auto` = Medley-Y) |
| PUT `/api/relay-teams/:teamId/time` | `{total_time cs}` → net/variance (`net=total−start×100`, `var=net−target×100`) + **Live-Ranking** (Staffel: total_time asc; Brace/Medley/Pogo: \|variance\| asc; Gleichstand gleicher Platz; ohne Zeit place=null) |
| PUT `/api/relay-teams/:teamId/member/:memberId/split` (+`/split2`) | Pogo-T1/T2 (cs); recalculiert Pogo-Team: Wert/Schwimmer = round((T1+T2)/2), total = Σ kompletter Paare, Ranking |
| POST `/api/races/:raceId/rank-relay` | Ranking explizit (Regel je Typ wie oben) |

## Results / History / Breaks

| Methode Pfad | Zweck / Verhalten |
|---|---|
| GET `/api/events/:eventId/results` | Alle Races mit Heats+Lanes (⨝ member-PBs) — Datengrundlage Results-Screen |
| GET `/api/events/:eventId/breakers` | Breaks des Events aus time_history (old_pb = previous_best×100, improvement) |
| GET `/api/reports/breakers` | Alle Breaks (alle Events), sortiert Datum DESC, Variance DESC |
| GET `/api/events/:eventId/slow-swimmers` | Exceeding: Bahnen `variance > 200 cs` |
| GET `/api/reports/exceeded` | Exceeding global über finalized/completed Events |
| GET `/api/events/:eventId/time-history` | History-Zeilen des Events (+ member_name, event_date) |
| GET `/api/members/:memberId/time-history` | Pro Schwimmer, Datum DESC (Quelle der Graphen); 400/404-Validierung |
| GET `/api/time-history/csv` | Komplettexport (event_date, swimmer, stroke, time cs, previous_best s, is_break) |

## Pointscore & Reports (lesend; Schreiben nur via Finalize)

| Methode Pfad | Zweck / Verhalten |
|---|---|
| GET `/api/pointscore/rules` | Regel-Transparenz: Quelle, Version, Kategorien/Punkte, Aggregationstext |
| GET `/api/events/:eventId/pointscore` (+`/csv`) | Event-Pointscore: rows (member×race_type×points) + totals (DESC) |
| GET `/api/pointscore/month/:ym` (+`/csv`) | Monats-Standings (einfache Addition; finalized/completed, nicht archiviert) |
| GET `/api/pointscore/season/:year` (+`/csv`) | Saison-Standings (Kalenderjahr, working default) |
| GET `/api/pointscore/months` | Liste `YYYY-MM` mit Punkten (DESC) |
| GET `/api/members/:memberId/pointscore` | **Swimmer Card v2.12.0**: contributions = ALLE Teilnahmen (Individual mit Finish ∪ Relay-Team mit Zeit, completed-Events) mit Punkten (0 wo keine); total = Σ |
| GET `/api/pointscore/by-race-type/:raceType?year=` (+`/csv`) | **Report 1**: weeks[] (Events des Jahres mit diesem Race), members[] = alle Aktiven ∪ Scorer mit points{event_id} + total; availableRaceTypes/Years |
| GET `/api/pointscore/total?year=` (+`/csv`) | **Report 2**: raceTypes[] (kanonisch) + members[] mit byType{} + total |
| GET `/api/reports/breakers-summary?year=` (+`/csv`) | **Report 3**: rows je Member×Stroke {season_start, current_pb, times_lowered (nur Reduktionen aus pb_change_log), amount_lowered = Baseline−current (Baseline: season_start ?? ältester Log-old ?? current)} + totals je Member |
| GET `/api/reports/event-coverage` (+`/csv`) | Completed-Kategorien: rows je Event×race_type (result_count = distinct Finisher bzw. Relay-Member, team_count) + summary je Typ |
| GET `/api/reports/break-counts` (+`/csv`) | Break-Zählung aus time_history.is_break: overall + by_event |
| GET `/api/reports/improvements` (+`/csv`) | Σ Verbesserung (previous_best×100 − time, nur > 0): overall + by_event, cs |

**Jahres-Default** für Report 1–3: neuestes Jahr mit completed Events, sonst aktuelles Jahr.
**CSV-Header (exakt):** R1 `swimmer,<dates…>,total` • R2 `swimmer,<Kategorie-Labels…>,total` •
R3 `swimmer,stroke,season_start_s,current_pb_s,times_lowered,amount_lowered_s`.
