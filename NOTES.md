## Session Handoff — 2026-04-11 spätabends

### Exakter Stand beim Pausieren
- Arbeitsbasis: `v2.8.0`
- Aktueller Code-Commit im Dropbox-Projekt: `b11e24d`
- Test-Runtime lief zuletzt lokal unter: `~/.openclaw/workspace/temp/wwsc-v280-runtime`
- Server konnte nach vielen Fehlstarts wieder online gebracht werden, indem er direkt mit `node src/server.js` gestartet wurde.
- Dino konnte danach live testen.

### Was live bestätigt wurde
- Pogo Results: Für Teilnehmer 1 und 2 konnten `T1` und `T2` eingegeben werden.
- Diese Werte wurden korrekt und getrennt gespeichert.
- Damit ist der ursprüngliche Pogo-Hotfix zumindest teilweise live bestätigt.

### Neuer Befund aus Dinos Acceptance Test
1. **Beim dritten Teilnehmer (Pogo, Eingabe T1) hat sich der Tab / die App geschlossen.**
   - Das ist noch NICHT sauber klassifiziert.
   - Wir dürfen daraus aktuell NICHT ableiten, ob es ein echter JS-/UI-Bug, ein Mobile-Browser-Absturz, ein OS-Tab-Kill oder ein Bedien-/Gestenproblem war.
   - Wichtig: Der Server lief weiter. Der Absturz war also NICHT eindeutig ein Server-Crash.

2. **Variance-Anzeige in Pogo wirkt falsch:**
   - Dino meldet, dass überall `-0,38` angezeigt wird.
   - Aktueller Verdacht: In `src/public/js/screens/results.js` wird pro Zeile dieselbe `team.variance` gerendert, statt einer schwimmerbezogenen Kennzahl.
   - Das kann fachlich korrekt als Team-Wert gemeint sein, ist dann aber UX-seitig irreführend; oder es ist ein echter Anzeige-Bug. Beides ist offen.

### Update 2026-04-12 mittags — Aktueller Stand vor Claude-Code-Eskalation
- Variance wurde lokal von Team-Variance auf individuelle Swimmer-Variance umgestellt.
- `Exp. Finish` wurde ergänzt und verschoben; `Target` wurde ergänzt.
- Mehrere lokale Fix-Versuche am Pogo-Numpad durchgeführt.
- **Trotzdem weiterhin offen:**
  1. Bereits eingetragene T1/T2-Werte lassen sich nachträglich nicht zuverlässig editieren (Numpad öffnet, reagiert aber nicht sauber).
  2. Pogo-Tabellenlayout ist weiterhin visuell inkonsistent; insbesondere `Result` ist aus Dinos Sicht nicht sauber dargestellt.
- Entscheidung: Keine weiteren Ad-hoc-Patches. Saubere Übergabe an Claude Code mit klarer Aufgabenbeschreibung.

### Update 2026-04-12 nachmittags — Neuer kritischer Pogo-Crash aus echtem Dino-Test
Dino hat einen neuen schweren Acceptance-Bug gemeldet, der über die bisherigen Numpad-/Layout-Probleme hinausgeht:

#### Repro laut Dino
1. 7 Schwimmer auswählen
2. Nur Pogo-Team generieren
3. Es wird 1 Team mit 4 Teilnehmern erstellt
4. T1 für Schwimmer 1 eingeben
5. T2 für Schwimmer 1 eingeben
6. T1 für Schwimmer 1 nachkorrigieren (diesmal funktionierte das)
7. T1 für Schwimmer 2 eingeben
8. T2 für Schwimmer 2 eingeben
9. Auf OK klicken
10. **Der komplette Browser-Tab / die App schließt sich wieder von selbst**

#### Bedeutung
- Das ist jetzt der zweite berichtete Tab-/App-Close unter Pogo.
- Es ist kein kleiner UX-Fehler mehr, sondern ein kritischer echter Acceptance-Blocker.
- Dieser Bug MUSS als eigener Crash-/Flow-Bug behandelt und sauber isoliert werden.

#### Wichtig
- Pogo Re-Edit hat diesmal teilweise funktioniert.
- Der zentrale neue Fokus ist daher: **Warum schließt sich der Tab / die App bei diesem konkreten Eingabeflow?**
- Keine Bryan-Auslieferung, bevor das sauber geklärt ist.

### Update 2026-04-12 abends — Architekturproblem bei Breaker/Exceeding Reports erkannt
Dino hat erneut einen wichtigen Inkonsistenzpunkt offengelegt: Die Breaker Report Seite und verwandte Reports/Views sind fachlich und visuell noch nicht sauber zentralisiert.

#### Erkenntnis
Das Problem ist nicht nur ein einzelner Sortierfehler. Es ist ein Architekturproblem:
- Breaker Report Seite
- Results Seite
- Exceeding Report
- ggf. weitere Report-/Results-Views
verwenden dieselben fachlichen Kennzahlen (Variance, Breakers, Thresholds, Reihenfolgen), aber die Logik und Darstellung ist noch nicht zentral genug.

#### Konsequenz
Wir brauchen eine saubere zentrale Datenverwaltung für diese Report-Werte:
- zentrale Berechnung
- zentrale Feldnamen
- zentrale Sortierlogik
- Views rendern nur noch

#### Zielbild
Eine zentrale Report-Datenquelle / Aggregationslogik für Breakers / Exceedings / ähnliche Metriken, aus der mehrere Screens konsistent lesen:
- Results
- Breaker Report
- Exceeding Report
- ggf. Readout / Export später

#### Entscheidung (beschlossen am 2026-04-12)
Dino und Balerion haben entschieden:
- Breakers / Exceedings / gemeinsame Report-Metriken werden künftig zentral verwaltet
- Sortierlogik, Feldnamen, Semantik und Berechnung dürfen nicht mehr in mehreren Views redundant gepflegt werden
- Views sollen diese Daten nur noch rendern
- Ziel ist, Inkonsistenzen systemisch zu verhindern statt sie nur nachträglich zu patchen

#### Nicht vergessen
Das ist keine lose Idee, sondern eine beschlossene Architekturentscheidung für WWSC.
Bei der nächsten strukturellen WWSC-Runde MUSS dieser Refactor aktiv eingeplant und umgesetzt werden.

### Klare No-Go-Regel
- **Kein Deploy**
- **keine Bryan-Auslieferung**
- **keine PASS-Behauptung für Pogo Results**
solange der neue Acceptance-Befund (Tab-Absturz + Variance-Frage) nicht sauber aufgeklärt ist.

## Bryan Follow-Up (v2.8.0 Release)
Wenn wir die Version 2.8.0 an Bryan ausliefern, muss die Nachricht an ihn zwingend folgende zwei Punkte enthalten:

1. **Die offene Skizze anfordern (zu R4):**
   "Du hattest noch erwähnt, dass du eine Skizze machen wolltest für die weiteren Spalten, die du gerne im Relay Heat Builder hättest (als Ersatz für die entfernte Split-Spalte). Schick mir die gerne rüber, sobald du sie hast, dann bauen wir das im nächsten Schritt ein."

2. **Stylus/Pencil Handschrifterkennung:**
   "Zu deiner Frage mit der Handschrift/Stylus-Eingabe in den Tap-Feldern: Wir haben das technisch geprüft. Es ist eine fantastische Idee für den Einsatz am Pool. Wir müssten das System so umbauen, dass es erkennt, ob du den Finger (öffnet Numpad) oder einen Stift (aktiviert Tablet-Handschrifterkennung) benutzt. Da das tief in die Event-Logik eingreift und bei verschiedenen Tablets unterschiedlich reagieren kann, kann ich es aktuell noch nicht 100% versprechen. Aber wir haben es auf dem Radar und werden experimentieren, ob wir das stabil für dich umgesetzt bekommen!"

3. **Bryan-Rückfrage zu Medley Restschwimmern (neu 10.04.2026):**
   In der nächsten Nachricht an Bryan muss eine fachliche Rückfrage rein:
   - Aktuelle Logik: `N`-Schwimmer sind korrekt aus Medley ausgeschlossen. Wenn nach Bildung vollständiger Medley-Teams ein gültiger Special-Swimmer übrig bleibt, wird er aktuell nicht als unvollständiges Team gerendert.
   - Offene Frage an Bryan: Wie soll mit diesem übrig gebliebenen, aber gültigen Medley-Teilnehmer umgegangen werden? (sichtbar als unassigned, manuell zuordnen, anders verteilen oder bewusst draußen lassen?)
