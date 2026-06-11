# DATA DICTIONARY — WWSC Swimming App v2.12.0

**Status:** AKTUELL (SSOT für Felder, Einheiten, Formeln; abgeglichen mit `src/db.js` + `src/server.js` @ v2.12.0).
Schema: SQLite, WAL, `foreign_keys=ON`; Anlage + additive Migrationen beim Serverstart (idempotent).
(Ersetzt den v2.7.1-Stand; wichtigste Korrektur: Break-Schwelle ist seit v2.8.12 stroke-abhängig.)

## Zwei-Einheiten-System (fundamentale Invariante)

| System | Einheit | Speicherung | Beispiel | Anzeige | Parsing |
|--------|---------|-------------|----------|---------|---------|
| **Handicap** | ganze Sekunden (s) | Integer | 14 = 14 s | `formatWhole()` → "14" | `parseWhole()` |
| **Stopwatch** | Centisekunden (cs) | Integer | 1345 = 13,45 s | `formatTime()` → "13.45" | `parseTime()` ("13.45"→1345, "13"→1300) |

**REGEL: Jede Berechnung, die beide Systeme mischt, konvertiert Sekunden ×100 → cs.** Negative Variance = schneller als Soll.

---

## member

| Feld | Typ/Einheit | Bedeutung |
|---|---|---|
| `id` | INTEGER PK | |
| `name` | TEXT NOT NULL | Anzeigename |
| `is_active` | INTEGER 0/1 (Def. 1) | Inaktive: nicht in neuen Events/Attendance/Report-Roster |
| `joined_date` | TEXT ISO-Datum | gesetzt bei Anlage/Import |
| `time_25m`, `time_50m`, `time_75m`, `time_backstroke`, `time_breaststroke`, `time_butterfly` | INTEGER **s**, nullable | PBs; **nur manuell gepflegt** (nie auto-update); Quelle für Handicaps. Anzeige `formatWhole()` auf Members/Times Sheet/HB/Results |
| `season_start_25m` … `season_start_butterfly` | INTEGER **s**, nullable | PB-Stand beim ERSTEN Finalize der Saison je Stroke (set-if-null beim Finalize); Basis Breaker-Amount (Report 3) |

## event

| Feld | Typ | Bedeutung |
|---|---|---|
| `id`, `date` (TEXT ISO), `created_at` (TEXT ISO) | | Listen filtern `date <= heute` |
| `status` | TEXT | `setup` → (`locked`) → `finalized` → `completed`; „aktuelles Event“ = neuestes mit status ≠ completed |
| `standard_event` | TEXT (Def. `ordinary_swim`) | ordinary_swim \| 25m_brace \| 50m_brace \| pogo |
| `special_event` | TEXT nullable | 75m \| backstroke \| breaststroke \| butterfly \| medley_relay |
| `archived` | INTEGER 0/1 | Soft-Delete; archiviert = raus aus Kalender-Default, Pointscore-Aggregaten, Reports |

Race-Ableitung aus Konfiguration: siehe SYSTEM-SPEC §5.2 (Brace ersetzt die jeweilige Individual-Distanz, Pogo ersetzt die Standard-Staffel).

## event_race

| Feld | Typ | Bedeutung |
|---|---|---|
| `id`, `event_id` FK | | |
| `race_type` | TEXT | 25m, 50m, 75m, backstroke, breaststroke, butterfly, 25m_relay, medley_relay, 25m_brace, 50m_brace, pogo |
| `status` | TEXT | `pending` → `heats_generated` (nach Confirm Heats/Teams) |

Races-Neuschreiben (PUT /races) löscht kaskadiert: relay_team_member, relay_team, pointscore_entry, heat_lane, heat.

## attendance (UNIQUE event_id+member_id)

| Feld | Typ | Bedeutung |
|---|---|---|
| `event_id`, `member_id` FK | | bei Event-Anlage für alle aktiven Mitglieder mit present=0 erzeugt |
| `present` | INTEGER 0/1 | Speichern verlangt ≥ 3 Anwesende |
| `special_event_entry` | TEXT nullable | `'Y'` = alles inkl. Special (Medley: Auto-Stroke) • `'N'` = nur Standard • `'Back'/'Breast'/'Free'` = Medley-Wunsch • null = ungefragt. **UI-Default seit v2.12.0: Y** (Select All / nachträgliche Special-Wahl; explizite Wahlen bleiben erhalten) |

## heat / heat_lane

heat: `id`, `event_race_id` FK, `heat_number` (1..n, 4 Bahnen, Verteilung SYSTEM-SPEC §6.2; 50m übernimmt 25m-Gruppierung).

| heat_lane-Feld | Einheit | Formel/Quelle | Anzeige |
|---|---|---|---|
| `lane_number` | 1–4 | | |
| `member_id` FK (Join: `name`, PBs) | | | |
| `handicap_time` | **s** | Kopie der member-PB der Distanz beim Heat-Bau | "PB", `formatWhole` |
| `start_delay` | **s** | `max_time − handicap_time`; `max_time = max(PB im Heat) + 2` | "Delay"/"Start" |
| `finish_time` | **cs** | Stoppuhr-Eingabe (Numpad) | "Finish", `formatTime` |
| `net_time` | **cs** | `finish_time − start_delay×100` | "Net" |
| `variance` | **cs** | `net_time − handicap_time×100` | "+/−X.XX", grün < 0 |
| `is_break` | 0/1 | **`variance ≤ −50` für 25m, `variance ≤ −100` für alle anderen Strokes** (v2.8.12); gesetzt bei Zeiteingabe = **SSOT** für alle Break-Anzeigen; Breaker-Listen filtern zusätzlich `net_time > 0` | "BREAK" |
| `place` | INTEGER nullable | „Save Rankings“: je Heat nach finish_time; Gleichstand = gleicher Platz (1,1,3); ohne Zeit → null | Auto-Platz (Gold/Silber/Bronze) |
| `manual_place` | INTEGER 1–4 nullable | Operator-Override (Dropdown oder Tap Placing v2.12.0). **Präzedenz überall: `COALESCE(manual_place, place)`** — Pointscore, Results, Readout, Event-Report, Season Calendar | roter Badge |
| `finish_time_2` | cs | reserviert (ungenutzt; Pogo nutzt relay_team_member.split_time_2) | |

Expected Finish (nur Anzeige): `handicap_time + start_delay` = max_time (s).

## relay_team / relay_team_member

| relay_team-Feld | Einheit | Bedeutung |
|---|---|---|
| `event_race_id` FK, `team_number`, `team_name` | | „Team 1..N“; beim Speichern: leere Teams verworfen, Rest renummeriert |
| `target_time` | **s** | Σ Mitglieder-PBs (PB-Quelle je Typ s. unten) |
| `start_delay` | **s** | 25m_relay: `max(teamPB aller Teams)+2 − teamPB` • Brace/Medley/Pogo: fix 2 |
| `max_time` | **s** | 25m_relay: max(teamPB)+2 • sonst teamPB+2 |
| `total_time` | **cs** | Team-Zielzeit (Numpad); Pogo: auto = Σ `round((T1+T2)/2)` je komplettem Schwimmer |
| `variance` | **cs** | `(total_time − start_delay×100) − target_time×100` |
| `place` | INTEGER nullable | 25m_relay: total_time asc • Brace/Medley/Pogo: \|variance\| asc; Gleichstand = gleicher Platz; ohne total_time → null. Live-Ranking nach jeder Zeiteingabe |

Anzeige Team Total: VOR Zeiteingabe `target_time` (s, formatWhole), NACH Eingabe `total_time` (cs, formatTime).

relay_team_member: `relay_team_id` FK, `member_id` FK (**Duplikate erlaubt = Swim Twice**), `leg_order`,
`stroke` (Medley: Back/Breast/Free; sonst 'Free'), `split_time` **cs** (Pogo T1), `split_time_2` **cs** (Pogo T2).
PB-Quelle (`getRelayPB`): 25m_relay/25m_brace/pogo → time_25m; 50m_brace → time_50m; medley → Stroke-PB (Free → time_25m).

## time_history (geschrieben NUR beim Finalize; nur Individual-/Stroke-Races)

| Feld | Einheit | Bedeutung |
|---|---|---|
| `member_id`, `event_id` FK, `stroke` | | stroke = race_type des Individual-Rennens |
| `time` | **cs** | geschwommene Netto-Zeit (= heat_lane.net_time) |
| `previous_best` | **s** | member-PB zum Finalize-Zeitpunkt |
| `is_break` | 0/1 | übernommen aus heat_lane (SSOT) |

Re-Finalize: Event-Zeilen werden gelöscht und neu geschrieben (idempotent). Quelle für: Event-/Member-History,
Graphen, Break Counts, Improvements, Time-History-CSV.

**Einheiten-Falle Breaker-Anzeigen:** API-Responses (`/breakers`, `/reports/breakers`, `/report`) liefern
`old_pb = previous_best×100` (cs), `new_time = time` (cs), `improvement = old_pb − new_time` (cs) → alles `formatTime()`.
Der Inline-Breaker-Block in Results rechnet dasselbe direkt aus heat_lane (`handicap_time×100 − net_time`) — beide Wege müssen identische Werte ergeben.

## pointscore_entry (UNIQUE event_race_id+member_id)

| Feld | Bedeutung |
|---|---|
| `event_race_id` FK, `member_id` FK, `points` INTEGER | Punkte pro Rennen×Schwimmer; beim Finalize idempotent geschrieben (DELETE+INSERT je Event); Swim-Twice in EINER Zeile aggregiert. Regeln: Individual Platz 1/2/3 → 5/4/3 nach `COALESCE(manual_place, place)`, weitere Finisher → 2, keine Zeit → keine Zeile; Relay-Typen Teamplatz 1/2/3 → 5/4/3 je Mitglied, sonst 0 (SYSTEM-SPEC §10) |

## pb_change_log (NEU v2.12.0 — Datenbasis Breaker-Report „manually changed times“)

| Feld | Einheit | Bedeutung |
|---|---|---|
| `member_id` FK, `stroke` | | stroke ∈ {25m, 50m, 75m, backstroke, breaststroke, butterfly} |
| `old_value`, `new_value` | **s**, nullable | PB vor/nach manueller Änderung (PUT /api/members/:id, transaktional mit dem Update); geloggt wenn alt ≠ neu (inkl. null↔Wert); No-Op-Saves loggen nicht |
| `changed_at` | TEXT ISO | Jahresfilter des Reports |

Abgeleitet (Report 3): **Count** = Zeilen mit `new < old` (beide non-null) im Jahr — Erhöhungen zählen nie;
**Amount** = Baseline − aktuelle PB; Baseline = `season_start_<stroke>` ?? ältester `old_value` im Log ?? aktuelle PB (Amount kann negativ sein).

## Propagationsregeln (abhängige Werte nach Änderungen)

1. Schwimmer zu Relay-Team hinzufügen/entfernen (Swim Twice, Manual Team Mgmt): `target_time` = Σ PBs neu; Medley/Brace/Pogo `start_delay` bleibt 2; 25m_relay: `max_time` über ALLE Teams neu + alle `start_delay` neu.
2. Schwimmer zwischen Heats verschieben: Quell- und Ziel-Heat `max_time`/`start_delay` neu, Bahnen renummeriert.
3. Zeiteingabe (Lane/Team/Pogo-Split): net/variance/is_break bzw. Team-total/variance sofort + Live-(Relay-)Ranking.
4. Races-Konfiguration ändern: kompletter Reset der Heats/Teams/Pointscore des Events.
5. Re-Finalize: time_history + pointscore_entry des Events vollständig neu.

## Indizes

attendance(event_id), attendance(member_id), heat_lane(heat_id), heat(event_race_id),
event_race(event_id), pointscore_entry(member_id), time_history(member_id), pb_change_log(member_id).

## Seed & Alt-Migration

Leere member-Tabelle → Seed mit 23 realen Club-Mitgliedern inkl. aller 6 PBs (s) — `src/seed.js` ist der
Referenzdatensatz für Tests/Demo. Alt-Migration: PB-Werte > 200 werden als Alt-Centisekunden erkannt und /100 gerundet (einmalig).
