# PRD — WWSC Swimming App (v2.8.0 / April 9)

## 🎯 Zusammenfassung
Anpassungen nach Kunden-Feedback (Bryan) zu v2.7.4.

## 📝 Requirements

### R1: Keine doppelten Distanzen im Timesheet / UI
**Kontext:** Aktuell können im System scheinbar sowohl "50m Freestyle" als auch "50m Brace" (oder "25m Freestyle" und "25m Brace") als getrennte Schwimmarten/PBs geführt werden.
**Anforderung:** Es gibt unabhängig vom Schwimmstil (Brace/Freestyle) im System konzeptionell nur eine einzige "50m" und eine einzige "25m" Distanz/Kategorie. 
**Akzeptanzkriterium:** 
- Im Timesheet (und überall im System, wo Stroke/Distanz eingestellt oder angezeigt wird) darf es keine Unterscheidung zwischen 50m Brace und 50m Freestyle geben. Es heißt einfach "50m" (bzw. "25m").
- Wenn ein Schwimmer eine 50m PB hat, gilt diese für das 50m Rennen, egal ob es ein Brace-Event oder ein normales Event ist.

### R2: Brace Relay Auto-Pairing bei ungerader Teilnehmerzahl (Finding 2)
**Kontext:** Beim "50m Brace Relay" (Zweierteams) kann es vorkommen, dass eine ungerade Anzahl an Schwimmern für das Event gemeldet ist. Aktuell (Screenshot) wird der übrige Schwimmer (z.B. Andrew Barnes) einfach allein in eine Lane gesetzt. Ein Brace Relay erfordert aber zwingend zwei Personen.
**Anforderung:** Wenn nach dem Pairing (Fastest + Slowest) ein Schwimmer übrig bleibt ("Odd Man Out"), darf dieser NICHT alleine gelistet werden. Das System muss ihm automatisch einen Partner zuweisen.
**Logik/Priorität für den Partner-Pick:**
1. Bevorzuge Schwimmer aus dem Pool der am Event teilnehmenden Personen.
2. Der Partner muss bereits in einem *anderen* Brace-Team zugewiesen sein (er schwimmt dann in diesem Event doppelt, z. B. in Heat 1 und Heat 2, oder auf zwei verschiedenen Lanes).
3. **NEUE FRAGE:** Wie genau wird dieser "Ersatz"-Partner ausgewählt? (z. B. "nimm einfach den, dessen PB am besten passt, um den Event-Target-Durchschnitt zu treffen" oder "nimm einen zufälligen"?) 
**Akzeptanzkriterium:**
- Wenn im Brace Relay die Anzahl der Schwimmer ungerade ist (z.B. 13 Teilnehmer), werden regulär N-1 (z.B. 12) gepairt nach der Fastest/Slowest Regel.
- Der übrig gebliebene Schwimmer (Odd Man Out) erhält einen Partner aus den bereits gepairten Schwimmern.
- **Logik für Partnerwahl:** Das System iteriert durch alle anderen am Event teilnehmenden Schwimmer und wählt denjenigen aus, bei dem die resultierende "Team PB" (Summe beider Schwimmer) am nächsten an den Durchschnitt der bisherigen Team-PBs herankommt. (Ziel: Das Team soll kompetitiv sein und nicht das langsamste oder schnellste Team werden).

### R3: Kompaktes Layout für Print (Speziell Team Relay)
**Kontext:** Aktuell werden die Relays (siehe Screenshot 1: 25m Team Relay) in breiten, untereinanderliegenden Blöcken (Team 1, Team 2) dargestellt. Das braucht zu viel Platz, wenn man die Seite drucken will.
**Anforderung:** Wenn der User drucken will (Print-Ansicht / Print-Modus), muss das Layout so verdichtet werden, dass es auf eine DIN A4 Seite (Hochformat oder Querformat) passt.
**Akzeptanzkriterium:**
- Orientierung am Excel-Vorbild von Bryan (Screenshot 2): Die Teams/Lanes werden in einer kompakten, spaltenbasierten Tabelle nebeneinander dargestellt, nicht in riesigen, breiten Blöcken untereinander.
- Pro Lane: Name des Schwimmers und seine PB-Zeit.
- Darunter kompakt: Total, Go Time (Start), Finish Time, Net Time und Race Placings (als ausfüllbare Felder oder bereits berechnet, falls es die Results sind).
- Dies betrifft primär den Ausdruck ("Print").
**Ergänzung zu R3 (Print Layout):**
- Die Anpassung betrifft **ausschließlich** die Druck-Ansicht (`@media print` CSS bzw. dedizierte Print-Funktion). Das normale Web-UI am Bildschirm bleibt unberührt.
- Dies gilt für **alles, was für den Ausdruck gedacht ist** (Heat Builder Print, Results Print, etc.).
- Das Layout ändert sich beim Drucken von der Block-Darstellung (untereinander) zur Spalten-Darstellung (nebeneinander, orientiert am Excel-Format).

### R4: Spalten-Anpassung im Relay Heat Builder (Finding 4)
**Kontext:** Im Heat Builder für Relays (Screenshot: 25m Team Relay) gibt es aktuell eine Spalte "Split". Diese macht an dieser Stelle (wo Teams nur zusammengebaut werden) keinen Sinn.
**Anforderung:**
1. Die Spalte "Split" muss komplett aus dem Relay Heat Builder entfernt werden.
2. Die Spalte "PB" (Personal Best) muss stattdessen klar und deutlich angezeigt werden (ist im Screenshot teilweise schon sichtbar, soll aber den Platz von Split einnehmen bzw. korrekt positioniert sein).
3. **Offener Punkt für Bryan:** Es sollen künftig noch weitere Spalten folgen, wofür Bryan eine Zeichnung anfertigen wollte. Dies wird als To-Do im Kunden-Follow-up vermerkt, blockiert aber nicht den aktuellen Release.

### R5: Fehlerhaftes "(Y)" bei Strokes im Heat Builder (Bugfix)
**Kontext:** Im Heat Builder (siehe Screenshot: Medley Relay, Team 4, Leg 1) wird bei einem Stroke fälschlicherweise der Zusatz "(Y)" angezeigt (z. B. "Back (Y)"). Laut Kunde wurde im Timesheet aber bei keinem Schwimmer ein "(Y)" ausgewählt.
**Anforderung:** Das Suffix "(Y)" darf nicht unbegründet beim Stroke auftauchen. 
**Akzeptanzkriterium:**
- Wenn im Timesheet kein "Y" gesetzt wurde, darf im Heat Builder unter "Stroke" auch absolut kein "(Y)" stehen.
- Die Rendering-Logik im Heat Builder für Relays muss korrigiert werden, sodass Strokes sauber (z.B. "Back", "Breast", "Free") angezeigt werden, ohne fehlerhafte Suffixe.

**Ergänzung zu R5 (Fehler-Provokation & Breites Denken):**
- Das Problem mit dem fehlerhaften "(Y)" darf nicht nur für den Medley Relay Heat Builder behoben werden.
- Die Mapping-Logik für "Stroke" und das "Y"-Flag muss systemweit (über alle Relay-Typen, Heat Builder, Results, Reports, Print) robuster gemacht werden.
- Die Tests müssen gezielt Situationen provozieren (gemischte Teams mit/ohne "Y", verschiedene Event-Typen), um sicherzustellen, dass dieser Mapping-Fehler nirgendwo anders leckt.

### R6: Echtzeit-Placing für alle Relays (Live Ranking)
**Kontext:** Auf der Results-Seite wird bei Relays (z.B. "25m Team Relay", Screenshot 6) das Placing (Ranking 1, 2, 3) aktuell erst berechnet und angezeigt, wenn man explizit den Button "Calculate Results" klickt. Bei Einzelrennen (Standard Events) passiert dies jedoch in Echtzeit bei jeder Eingabe.
**Anforderung:** Die Auto-Ranking-Funktionalität (Live-Placing) muss systemweit vereinheitlicht werden. Auch für Relay-Events muss das Placing in Echtzeit aktualisiert werden, sobald eine valide "Tap"-Eingabe (Net Time) für ein Team getätigt wird.
**Akzeptanzkriterium:**
- Wenn bei einem Relay auf der Results-Seite eine Zeit eingegeben wird, berechnet das System sofort das aktuelle Ranking der Teams.
- Das Eingabefeld für "Place" / "Rank" (falls manuell überschreibbar) oder die Anzeige muss sich sofort aktualisieren, ohne dass ein Button geklickt werden muss.
- Der "Calculate Results" Button kann bei Relays entfernt werden, wenn das Echtzeit-Placing vollständig etabliert ist, oder er bleibt als Fallback (das Design-Detail klären wir in der Spec).

### R7: Neues Spalten-Layout & Target-Formel in Results (Finding 7)
**Kontext:** In der Relay-Results-Tabelle (Screenshot 1: 50m Brace Relay) gibt es eine Unklarheit bei der Terminologie und ein fehlendes Zwischenergebnis für den "Target"-Wert.
**Anforderung:**
1. **Spalte umbenennen:** Die bisherige Spalte "Target" (welche faktisch die Summe der PBs darstellt) wird in "Total" umbenannt.
2. **Neue Spalte hinzufügen:** Eine neue Spalte namens "Target" wird rechts neben "Start" und links neben "Finish" eingefügt.
3. **Neue Target-Formel:** Der Wert in dieser neuen Spalte "Target" berechnet sich aus `Total + Start` (bzw. bei Handicap aus `Total + Delay`).
4. **Color Coding:** Das Echtzeit-Placing (aus R6) muss, wie bei den Einzelrennen, mit Gold/Silber/Bronze-Hinterlegungen (Color Coding) für die Plätze 1, 2 und 3 visuell hervorgehoben werden.
**Akzeptanzkriterium:**
- Spalten-Reihenfolge in Relay Results: PBs | Total (war Target) | Start | Target (neu, Formel: Total + Start) | Finish | Variance | Place.
- Trägt man Zeiten über das Numpad ein, wird sofort Platz 1 (Gold), Platz 2 (Silber) und Platz 3 (Bronze) in der Spalte "Place" eingefärbt.

### R8: Layout-Anpassungen in Relay Results (Finding 8)
**Kontext:** Auf der Results-Seite für Relays (Screenshot: 25m Team Relay) gibt es Darstellungsprobleme im Layout, die verwirrend sind.
**Anforderung:**
1. **Split-Spalte entfernen:** Auch auf der Results-Seite (nicht nur im Heat Builder wie in R4 beschlossen) muss die Spalte "Split" komplett aus der Schwimmer-Liste entfernt werden.
2. **Variance-Position:** Der Wert für die Variance (aktuell in der Mitte beim Label "Team Total") muss nach ganz rechts ans Ende verschoben werden, hinter den "Team Total"-Zahlenwert (z.B. in eine eigene Zelle oder rechtsbündig daneben).
3. **Team Total Text:** Das Textlabel "Team Total" muss direkt neben (bzw. näher an) den zugehörigen Zahlenwert rücken, damit der User den Bezug sofort erkennt, anstatt linksbündig / zentriert durch eine riesige Lücke getrennt zu sein.
**Akzeptanzkriterium:**
- Keine "Split"-Spalte in den Results (für Relays).
- Die Zusammenfassungszeile (roter Balken) hat das Label "Team Total" in unmittelbarer Nähe zur Endzeit (rechtsbündig).
- Die "Variance" wird als eigenständige Information ganz rechts am Zeilenende dargestellt (bzw. rechts von der Endzeit).

### R9: Deadlock-Bug bei unvollständigen Heats (Finding 9)
**Kontext:** Wenn im Heat Builder nicht für *alle* aktivierten Rennen Heats generiert wurden (z.B. "50m" wurde im Event Setup angehakt, aber im Heat Builder übersprungen), und der User navigiert zur Results-Seite, kommt es zu einem Deadlock.
**Fehlerbild:** 
1. Die Results-Seite bleibt komplett leer ("Keine Results").
2. Auch wenn der User über die Navigation-Tabs (oben) zu einem Rennen wechselt, für das Heats existieren (z.B. "25m Freestyle"), bleibt die Seite leer.
3. Der Bug blockiert die gesamte Results-UI, bis der User zurückgeht und zwingend auch für das vergessene "50m" Rennen die Heats generiert.
**Anforderung:** 
- Die Results-Seite darf nicht crashen oder sich aufhängen, wenn ein Event/Rennen keine Heats hat.
- Der Wechsel zwischen den Tabs in den Results muss robust funktionieren: Rennen *mit* Heats müssen ihre Tabellen anzeigen, Rennen *ohne* Heats zeigen eine saubere "No Heats generated yet" Meldung (ohne die anderen Tabs in Mitleidenschaft zu ziehen).
- Das Fehlen von Heats für ein Event darf niemals die Darstellung der Ergebnisse anderer Events blockieren.

### R10: Einheitliches Layout für Breaker & Exceeding Reports (Finding 10)
**Kontext:** Auf der Results-Seite am unteren Ende (sowie im separaten Tab "Breaker Report") werden die beiden Tabellen "Breakers Report" und "Swimmers Exceeding PB by >2 seconds" aktuell mit unterschiedlichen Spaltenbreiten, Spaltennamen und Abständen (Spaces) dargestellt. 
**Anforderung:** Beide Tabellen müssen visuell komplett einheitlich gestaltet sein (gleiches Format, gleiche Spaltenbreiten, gleiche Ausrichtung).
**Akzeptanzkriterium:**
- **Breakers Report:** Spalten: `Swimmer` | `Event/Heat` (bisher Heat) | `Old PB` (bisher PB) | `New Time` (bisher Actual) | `Variance` (bisher Improved By / Over by).
- **Exceeding Report:** Spalten: `Swimmer` | `Event/Heat` (Stroke muss durch Event/Heat ersetzt werden, z.B. "25m Freestyle - Heat 1") | `Old PB` | `New Time` | `Variance`.
- Die Spaltenbreiten (`width` oder Flex-Anteile) müssen in beiden Tabellen auf den Pixel genau identisch sein.
- Die Abstände (Paddings, Margins) müssen identisch sein.
- Dies gilt sowohl für die Ansicht am unteren Ende der Results-Seite als auch für die dedizierte Seite "Breaker Report" in der Sidebar.

### R11: Entfernen des "Consolidated" Breaker Reports (Finding 11)
**Kontext:** Unterhalb des "Breakers Report" (grün) und des "Exceeding Report" (orange) wird auf der Results-Seite eine dritte Tabelle namens "All Breakers (Consolidated)" angezeigt.
**Anforderung:** Die "All Breakers (Consolidated)" Tabelle ist an dieser Stelle (Results-Seite) überflüssig, redundant und verschwendet Platz. Sie muss komplett von der Results-Seite entfernt werden.
**Akzeptanzkriterium:**
- Auf der "Results"-Seite gibt es am unteren Ende nur noch exakt zwei Tabellen: Den regulären "Breakers Report" und den "Exceeding Report" (im einheitlichen Format gemäß R10).
- Der Bereich "All Breakers (Consolidated)" wird von der Results-Seite restlos entfernt.
- *(Sollte die Consolidated-Ansicht noch auf der separaten Sidebar-Seite "Breaker Report" benötigt werden, z.B. um über alle Rennen hinweg zu konsolidieren, bleibt sie DORT erhalten. Andernfalls wird sie ganz aus dem System entfernt – das klären wir in der Design-Spec nach Prüfung der Code-Architektur).*

### R12: Event-spezifische Filterung der Reports in der Results-Ansicht (Finding 12)
**Kontext:** Auf der Results-Seite (Screenshot: 50m Event ist aktiv) werden unten im Breaker- und Exceeding-Report fälschlicherweise Schwimmer aus anderen Rennen (z.B. "25m") angezeigt. Die globale Vermischung der Daten macht in einer event-spezifischen Ansicht keinen Sinn.
**Anforderung:** 
1. **Lokale Filterung:** Die Reports am unteren Ende der *Results-Seite* müssen strikt auf das aktuell angewählte Event (den aktiven Tab) gefiltert werden. Wer im "50m" Tab ist, darf unten nur 50m-Breaker/Exceeder sehen.
2. **Globale Ansicht:** Die dedizierte "Breaker Report" Seite (über die linke Sidebar erreichbar) bleibt die globale Übersicht über *alle* Events.
3. **Event-Information in der Tabelle:** Wie der Kunde anmerkte ("fehlt in der tabelle oben die infor dass es 50m ist"), war bisher unklar, woher die Daten kommen. Dies wird durch die Umsetzung von **R10** gelöst, da die Spalte künftig "Event/Heat" (z.B. "50m Freestyle - Heat 1") heißt und die Herkunft zweifelsfrei klärt.
**Akzeptanzkriterium:**
- Wechselt der User auf der Results-Seite den Tab (z.B. von 25m zu 50m), aktualisieren sich nicht nur die Heats, sondern auch die Breaker- und Exceeding-Tabellen am Seitenende und zeigen nur noch die Daten des aktiven Tabs an.

### R13: Visuelle Symmetrie im Globalen Breaker Report (Finding 13)
**Kontext:** Auf der globalen, dedizierten Menü-Seite "Breaker Report" (Screenshot) sehen die beiden Tabellen ("Breaker Report" oben, "Exceeding PB" unten) völlig unterschiedlich aus. Die untere Tabelle hat riesige Leeräume und andere Spaltenbreiten als die obere Tabelle. Zudem ist die Spaltenbenennung ("Stroke", "PB", "Actual") noch das alte Format.
**Anforderung:** Die visuelle Formatierung (Spaltenbreiten, Ausrichtung) muss exakt gleich sein. Es darf keinen optischen Bruch zwischen der oberen und der unteren Tabelle geben.
**Akzeptanzkriterium:**
- **Zwingende Übernahme von R10:** Die globalen Tabellen hier im Menüpunkt "Breaker Report" müssen exakt die gleichen Headers (`Swimmer`, `Event/Heat`, `Old PB`, `New Time`, `Variance`) und das gleiche `table-layout` verwenden, das wir in Finding 10 für die Results-Seite definiert haben.
- Die Spalten beider Tabellen müssen im Browser pixelgenau auf der exakt gleichen vertikalen Linie liegen (visuelle Flucht).
- Die enormen Weißräume (wie im unteren Teil des Screenshots beim "Stroke" 25m vs. Header) müssen beseitigt werden (einheitliches CSS-Grid oder Table-Layout).

### R14: Detaillierte Heat-Aufschlüsselung im Calendar Modal (Finding 14)
**Kontext:** Im Popup "Event Details" auf der Season Calendar Seite werden unter "Races" die Platzierungen zusammengefasst. Bei Rennen mit mehreren Heats (z.B. 4 Heats für 25m) steht dort aktuell nur "25m" und es wird nur ein einziger Datensatz (vermutlich Heat 1) angezeigt. Die anderen Heats fehlen. Zudem ist die Formatierung extrem inkonsistent (mal mit "1st, 2nd, 3rd", mal ohne, mal doppelte Platzierungen).
**Anforderung:** 
1. **Heat-Auflistung:** Die Ergebnisse unter "Races" müssen zwingend nach Heats aufgeschlüsselt werden. Wenn 25m aus 4 Heats bestand, müssen dort "25m - Heat 1", "25m - Heat 2", "25m - Heat 3", "25m - Heat 4" als eigene Blöcke mit ihren jeweiligen Siegern stehen.
2. **Systemweite Gültigkeit:** Dies gilt nicht nur für die Standardrennen, sondern muss systemweit für *alle* Race-Typen (Team Relay, Brace Relay, Medley, Pogo) sichergestellt werden, sofern Heats existieren.
3. **Format-Konsistenz:** Die Anzeige muss konsistent das Format "1st: [Name] (Zeit), 2nd: [Name] (Zeit), 3rd: [Name] (Zeit)" verwenden. (Auf dem Screenshot fehlt dies bei 50m und Medley Relay komplett).
**Akzeptanzkriterium:**
- Im Calendar Modal werden alle generierten und bewerteten Heats eines Rennens einzeln und eindeutig benannt aufgeführt.
- Kein Heat wird verschluckt.
- Die Platzierungen (1, 2, 3) sind konsistent über alle Rennarten formatiert.

### R15: Event Report Bugfixes und Calendar-Verknüpfung (Finding 15)
**Kontext:** Nach dem Abschluss eines Events ("Complete Event") öffnet sich der "Event Report" in einem neuen Tab. Auf dem Screenshot ist ersichtlich, dass bei der Participants-Tabelle (und potenziell weiteren Tabellen) Werte fehlen (z.B. gibt es eine riesige Lücke zwischen Name und Special Entry, was darauf hindeutet, dass dort Spalteninhalte wie z.B. das "Y"-Flag oder Altersgruppen verschluckt wurden). Zudem gibt es aktuell keine Möglichkeit, diesen Report nach dem Schließen des Tabs jemals wieder aufzurufen.
**Anforderung:** 
1. **Datenprüfung:** Das Rendering des Event Reports (die HTML-Tabelle) muss untersucht werden. Alle Spalten, die in der Kopfzeile definiert sind, müssen mit Daten gefüllt sein. Es dürfen keine "leeren Lücken" durch fehlendes Mapping entstehen.
2. **Calendar Button:** Im Season Calendar muss bei bereits abgeschlossenen ("completed") Events ein neuer Button oder Link hinzugefügt werden: "View Event Report" (oder ein Report-Icon). 
3. Dieser Button muss genau diesen generierten Event Report für das spezifische Event im Browser öffnen.
**Akzeptanzkriterium:**
- Der Event Report zeigt alle Daten lückenlos an.
- Im "Event Details" Modal des Season Calendars (für abgeschlossene Events) existiert ein klickbarer Button/Link, um den "Event Report" dieses Events (erneut) zu öffnen.

### R16: Pogo Relay Heat Builder Cleanup (Finding 16)
**Kontext:** Im Heat Builder für das "Pogo"-Event (Screenshot) tauchen Elemente aus anderen Relay-Typen auf, die für Pogo keinen Sinn ergeben (Swim Twice Button, Team Total in der Fußzeile). Pogo-Teams bestehen immer aus exakt 4 Personen, hier werden fälschlicherweise 5 angezeigt. Auch die Spalten in der Results-Ansicht müssen exakt definiert sein.
**Anforderung:** 
1. **Kein "Swim Twice":** Der Button "+ Swim Twice" (und das zugehörige Dropdown zur manuellen Auswahl eines weiteren Schwimmers) muss aus dem Pogo Heat Builder restlos entfernt werden.
2. **Kein "Team Total":** Die Fußzeile mit der Zusammenfassung "Team Total" muss im Pogo Heat Builder ausgeblendet/entfernt werden.
3. **Exakt 4 Schwimmer:** Ein Pogo-Team besteht zwingend immer aus exakt 4 Schwimmern. Der Generierungsalgorithmus darf keine 5er-Teams bauen.
4. **Results Spalten (Pogo Spezifisch):** In der Pogo Results-Tabelle müssen die Spalten zwingend diese Reihenfolge haben: `PB` | `Start` | `Total` | `T1 (Tap für Result 1)` | `T2 (Tap für Result 2)` | `Result (Average aus T1+T2)` | `Variance`.
**Akzeptanzkriterium:**
- Im Pogo Heat Builder gibt es keinen "Swim Twice" Button, kein freies Dropdown für weitere Schwimmer und keine "Team Total" Fußzeile.
- Es werden exakt 4 Schwimmer pro Pogo-Team generiert.
- Die Spalten im Pogo Results Tab sind exakt: PBs, Start, Total, T1, T2, Result (Average), Variance.

### R17: Distanz-Exklusivität für 25m und 50m (Acceptance Finding)
**Status:** 🟡 Teilweise umgesetzt / live geprüft / weiter systemweit beobachten
**Kontext:** Im aktuellen Build wurden gleichzeitig mehrere Varianten derselben Distanz angezeigt bzw. zugelassen (z. B. `25m Freestyle`, `25m Brace Relay`, `25m Team Relay`). Das widersprach Bryans fachlicher Logik.
**Präzisierte Fachregel nach Acceptance-Test:**
- **Ordinary Swim** ist die definierte Ausnahme und enthält bewusst:
  - `25m Freestyle`
  - `50m Freestyle`
  - `25m Team Relay`
- Für die **Sonderkonfigurationen** gilt Exklusivität innerhalb der betroffenen Distanz:
  - Wenn `25m Brace Relay` aktiv ist, dürfen `25m Freestyle` und `25m Team Relay` nicht gleichzeitig aktiv sein.
  - Wenn `50m Brace Relay` aktiv ist, darf `50m Freestyle` nicht gleichzeitig aktiv sein.
  - Wenn `Pogo` aktiv ist, darf `25m Team Relay` nicht gleichzeitig aktiv sein.
**Aktuelle umgesetzte Verbesserung (live von Dino geprüft):**
- Bei Auswahl von `25m Brace` wird jetzt nur noch eine 25m-Variante angezeigt; `25m Freestyle` wird nicht mehr parallel angezeigt.
- Diese Verbesserung soll in die nächste Bryan-Nachricht als umgesetzter Wunsch aufgenommen werden.
**Anforderung:**
- Die UI / Event-Auswahl / Build-Heats-Logik muss diese Exklusivität systemweit korrekt durchsetzen.
- Ordinary Swim bleibt als definierter Standardfall erlaubt.
- Heat Builder, Results, Calendar und Reports dürfen bei Sonderkonfigurationen keine konkurrierenden Distanzvarianten parallel zeigen.
**Akzeptanzkriterium:**
- `25m Brace` → sichtbar nur `25m Brace Relay` (plus fachlich erlaubte andere Distanzen), kein `25m Freestyle`, kein `25m Team Relay`.
- `50m Brace` → kein `50m Freestyle` parallel.
- `Pogo` → kein `25m Team Relay` parallel.
- `Ordinary Swim` → `25m Freestyle` + `50m Freestyle` + `25m Team Relay` bleiben korrekt sichtbar.
- Heat Builder, Results, Calendar und Reports folgen derselben Regel ohne stale Tabs / alte Race-Sets.

### R18: Medley-Restlogik / Leftover-Handling (Bryan-bestätigt v2.8.3)
**Status:** 🟢 Fachfrage geklärt — Swim-Twice-Flow implementiert in v2.8.3
**Bryan-Antwort (2026-04-15):** "In relation to medley relay can we have a system where we can select swimmers to swim twice if we have a left over swimmer?"
**Kontext:** Bei Medley-Szenarien mit nicht glatt durch 3 teilbarer Teilnehmerzahl blieben bisher 1–2 gültige Medley-Teilnehmer ohne Team übrig. Sie wurden still verworfen. Bryan wünscht stattdessen einen UI-Flow, bei dem der Nutzer einen bereits zugewiesenen Schwimmer zum zweimaligen Schwimmen auswählen kann, damit das Leftover-Team vervollständigt wird.
**Geklärter Stand:**
- `N`-Schwimmer sind weiterhin komplett aus Medley ausgeschlossen.
- `Y` / `Back` / `Breast` / `Free` sind eligible Medley-Teilnehmer.
- Leftovers (1 oder 2) werden jetzt in ein sichtbares partielles Team platziert, gekennzeichnet mit `needs_swim_twice_completion: true`.
- Das UI zeigt einen orangen Hinweis-Banner "⚠️ Leftover team — incomplete" mit den fehlenden Strokes.
- Ein Dropdown erlaubt die Auswahl eines beliebigen Medley-eligiblen Swimmers (inkl. solchen, die bereits in einem anderen Team sind) zum "➕ Swim Twice".
- Bestehende `hbAddSwimTwice()` Logik wird wiederverwendet — der ausgewählte Swimmer wird in den nächstfreien Medley-Leg (Back → Breast → Free) eingefügt.
- Wenn alle 3 Strokes gefüllt sind, verschwindet der Banner.
- Beim Confirm wird das Team in der DB gespeichert. Duplikate Member-IDs pro Team sind erlaubt (BF-5).
**Akzeptanzkriterium:**
- 3 Y-Swimmers → 1 Team, kein Leftover-Team.
- 4 Y-Swimmers → 1 Team (komplett) + 1 Leftover-Team (1 Swimmer, Banner sichtbar, 2 Strokes fehlen).
- 5 Y-Swimmers → 1 Team (komplett) + 1 Leftover-Team (2 Swimmers, Banner sichtbar, 1 Stroke fehlt).
- 6 Y-Swimmers → 2 komplette Teams, kein Leftover-Team.
- User kann im Leftover-Team über das Dropdown einen Swimmer aus einem anderen Team auswählen → der erscheint in beiden Teams.
- Banner verschwindet automatisch, sobald alle 3 Strokes besetzt sind.
- Nach Confirm: Teams werden korrekt in DB persistiert inkl. Swim-Twice-Duplikaten.

### R19: Live-Platzierungslogik muss für Nutzer nachvollziehbar sein (Acceptance Finding)
**Status:** 🟡 In Arbeit / mit R20 gekoppelt
**Kontext:** Dino hat im Acceptance-Test mehrfach Stellen gefunden, an denen die angezeigte Platzierung zwar technisch erklärbar wirkte, aber für einen Nutzer nicht nachvollziehbar genug war.
**Anforderung:**
- Die sichtbare Platzierung muss für Bryan ohne technische Hintergrundlogik plausibel lesbar sein.
- Änderungen an Teamzeiten müssen zu konsistenten, sofort sichtbaren und erklärbaren Platzierungsänderungen führen.
- Gleichstände müssen sichtbar und logisch konsistent dargestellt werden.
**Akzeptanzkriterium:**
- Keine überraschenden oder widersprüchlich wirkenden Ranking-Sprünge im UI.
- Dieselbe Logik wird in Heat Builder, Results und Folgescreens konsistent dargestellt.
- Alle verbleibenden fachlichen Unsicherheiten werden nicht versteckt, sondern dokumentiert.

### R20: Platzierungslogik für Special Races — Bryan-bestätigt v2.8.4
**Status:** 🟢 Fachlich geklärt — smallest absolute variance wins
**Bryan-Antwort (v2.8.4 follow-up):** Für die Special Races `25m Brace`, `50m Brace`, `Pogo` und `Medley Relay` gewinnt **the team with the smallest variance** (kleinste Abweichung vom Target). Standard 25m Team Relay behält unverändert "fastest total_time wins".
**Implementierung (v2.8.4):**
- Neue Helper-Funktion `rankRelayTeams(raceId, raceType)` in `src/server.js` mit `SPECIAL_VARIANCE_RACES = ['25m_brace','50m_brace','pogo','medley_relay']`.
- Score-Berechnung: Special Races nutzen `Math.abs(team.variance)`; Standard Relays nutzen `team.total_time`.
- Drei Call-Sites vereinheitlicht: `PUT /api/relay-teams/:teamId/time`, `recalcPogoTeamIfNeeded`, `POST /api/races/:raceId/rank-relay`.
- UI-Textanpassung: "fastest finish wins" → "smallest variance wins" in Results / Heat Builder / Relays Headers.
**Akzeptanzkriterium:**
- 25m Brace: Team mit kleinstem `|variance|` bekommt Platz 1.
- 50m Brace, Pogo, Medley: gleiche Logik.
- 25m Team Relay: unverändert fastest total_time wins.
- Gleichstände (gleiche absolute Varianz) teilen denselben Platz.
- Browser-verifiziert: Team 2 (var +100) = 1st, Team 3 (var -300) = 2nd, Team 1 (var +500) = 3rd.

### R21: Medley Swim-Twice Stroke editable + replaceable (v2.8.4 Bryan-followup)
**Status:** 🟢 Umgesetzt in v2.8.4
**Bryan-Rückmeldung:** Der bei Swim-Twice ausgewählte Schwimmer muss (a) dem fehlenden Stroke zugewiesen werden können — nicht seinem historischen Stroke — und (b) wieder entfernt oder geändert werden können, falls die Auswahl falsch war.
**Implementierung:**
- `hbAddSwimTwice`: Bevorzugt die **im Team fehlenden Strokes** (Back → Breast → Free Priorität) statt historischen Swimmer-Stroke. Neues Mitglied erhält `is_swim_twice: true`.
- Neues Stroke-Dropdown direkt in der Stroke-Zelle des Swim-Twice-Members (nur Medley, nur im HB, nur für Nicht-bestätigte Teams): `hbChangeSwimTwiceStroke(teamIndex, memberIndex, newStroke)`.
- Neuer "✕ Remove" Button pro Swim-Twice-Row: `hbRemoveSwimTwice(teamIndex, memberIndex)`.
- Detection: `m.is_swim_twice === true` ODER `duplicate innerhalb desselben Teams`. Originalzuweisungen in anderen Teams behalten ihre normale, unveränderliche Darstellung.
**Akzeptanzkriterium:**
- Stroke-Dropdown enthält Back / Breast / Free mit aktueller Auswahl selektiert.
- Stroke-Änderung aktualisiert Target/Total live.
- Remove entfernt den Swim-Twice-Row, Banner erscheint wieder mit neuen missing strokes.
- Original-Team-Zuweisungen werden nicht fälschlich als entfernbar markiert.

### R22: 25m Team Relay — explizite Swim-Twice-Auswahl (v2.8.4 Bryan-followup)
**Status:** 🟢 Umgesetzt in v2.8.4
**Bryan-Rückmeldung:** 25m Team Relay darf Teams nicht ohne explizite User-Auswahl automatisch durch Dopplung ausgleichen. Bei Ungleichheit muss ein expliziter Auswahl-Flow angeboten werden.
**Implementierung:**
- Server: bei `25m_relay` mit Team-Size < 4 wird `needs_swim_twice_completion: true` gesetzt.
- Frontend: oranger Banner "⚠️ Team is undersized" mit Anzahl fehlender Legs.
- Swim-Twice-Dropdown zeigt für 25m_relay alle anwesenden Event-Schwimmer (nicht nur das aktuelle Team).
**Akzeptanzkriterium:**
- 10 Swimmers → 2 Teams von 5+5 (keine Banner, da Teams gleich groß).
- 11 Swimmers → 3 Teams von 4+4+3, kleinstes Team zeigt Banner.
- 12 Swimmers → 3 Teams von 4+4+4 (keine Banner).
- Kein stillschweigendes Auto-Dupeln.

### R23: Print cleanup (v2.8.4 Bryan-followup)
**Status:** 🟢 Umgesetzt in v2.8.4
**Bryan-Rückmeldung:** Print-Views enthalten weiterhin überflüssigen Helper-Text wie "(Y) explanation" und "All 4 races ready".
**Implementierung:**
- Neue CSS-Klasse `.print-hide` mit `@media print { display:none !important }`.
- Angewandt auf: "What (Y) means" Card (HB), "All X races ready!" Card (HB), "X/Y races confirmed" Status-Zeile (HB), "Event Finalized" Banner (Results), "Event Completed" Banner (Results).
**Akzeptanzkriterium:**
- Print-Preview enthält keines dieser Helper-Elemente.
- Tabelleninhalt + kritische Kontextinfo (Team-Header, Race-Titel) bleibt erhalten.

### R24: Results Layout kompakt (v2.8.4 Bryan-followup)
**Status:** 🟢 Umgesetzt in v2.8.4
**Bryan-Rückmeldung:** Results-Tabelle bei Brace soll `Total` direkt bei `PB`, `Tap` direkt daneben, `Variance` direkt daneben zeigen.
**Implementierung:**
- Brace-Results-Tabelle: neue Spaltenreihenfolge **Lane | Pair | PBs | Total | Tap | Variance | Place**.
- Start und Target bleiben im Card-Header sichtbar (`Start: 2s | smallest variance wins`) statt als separate Spalten.
**Akzeptanzkriterium:**
- Die Reihenfolge Total → Tap → Variance ist visuell direkt nebeneinander.
- Print und Screen zeigen dieselbe Struktur, Print nutzt kleinere Font-Sizes gemäß R3.

---

## v2.8.5 Rework — Dino-live-Test-Findings nach v2.8.4

Die v2.8.4-Runde wurde live von Dino durchgespielt. Zwei Requirements waren trotz Code-Änderungen im Live-Flow nicht zufriedenstellend. Diese Runde schärft die Acceptance-Kriterien und korrigiert die Umsetzung so, dass sie im tatsächlichen UI-Flow funktioniert.

### R21-v2 (verschärft): Medley Duplicate-Swimmer Stroke Selection (v2.8.5)
**Status:** 🟢 User-flow-korrigiert in v2.8.5
**Dino-Live-Test-Befund (v2.8.4):** "Bryan already swam Free. The added Bryan still gets Free again. Dino could not actually change the stroke in the real flow."
**Verschärfte fachliche Regel:**
- Der User MUSS beim Hinzufügen eines Swim-Twice-Swimmers explizit sowohl den Swimmer ALS AUCH den Stroke auswählen, BEVOR die Zuweisung passiert.
- Es darf KEIN automatischer Default auf den Historic-Stroke des Swimmers geben — weder sichtbar noch versteckt.
- Das UI-Control für die Stroke-Auswahl MUSS für den User als interaktiv erkennbar sein (visible affordance), nicht als read-only Text.
- Fehlende Strokes des Teams MÜSSEN im Picker gekennzeichnet werden (z.B. Label-Suffix "(missing)") damit der User sofort erkennt, was gebraucht wird.
- Nach dem Add MUSS der Stroke weiterhin über ein Inline-Dropdown änderbar sein.
**UI-Affordance-Anforderung:**
- Swim-Twice-Row in Medley-Teams zeigt: Swimmer-Select → **`Swim as:` Label + Stroke-Select** → `+ Swim Twice` Button. In dieser Reihenfolge sichtbar.
- Missing-Strokes im Picker werden mit Label "(missing)" markiert und stehen an bevorzugter Position.
- Nach Add: Swim-Twice-Row zeigt bearbeitbares Dropdown + ✕ Remove Button.
**Acceptance (user-flow):**
- Scenario: Team 1 hat Bryan=Back, Ben=Breast, Andrew=Free. Team 2 (Leftover) hat David=Back. Missing in Team 2: Breast, Free.
- User im Swim-Twice-Dropdown: wählt Bryan, ändert Stroke-Picker auf "Breast", klickt "+ Swim Twice".
- **Expected:** Bryan erscheint in Team 2 als Leg 2 mit Stroke=Breast.
- **Fail-Pattern (v2.8.4):** Bryan erscheint mit Stroke=Back oder dem Auto-Default — das MUSS in v2.8.5 unmöglich sein.

### R24-v2 (verschärft): Brace Results Layout visually grouped (v2.8.5)
**Status:** 🟢 Visually-corrected in v2.8.5
**Dino-Live-Test-Befund (v2.8.4):** "The row still looks like a table hack instead of a clean readable summary."
**Verschärfte fachliche Regel:**
- Die Brace-Results-Zeile muss als echte Summary lesbar sein — nicht wie eine generische Tabellenzeile.
- Logische Gruppen müssen visuell unterscheidbar sein:
  1. **Plan** (was sollte passieren): PBs + Total
  2. **Actual** (was ist passiert): Tap-Eingabefeld
  3. **Delta** (wie weit weg): Variance
  4. **Result** (wer hat gewonnen): Place
- Diese Gruppen müssen durch:
  - unterschiedliche Background-Farben für Gruppen-Zellen
  - Gruppen-Header-Zeile oberhalb der Column-Header
  - Trennungs-Borders zwischen den Gruppen
  visuell getrennt sein.
- Die Tap-Zelle muss deutlich als interaktiv erkennbar sein (gelber Hintergrund, Border, "⏱️ Tap" Placeholder wenn leer).
**Acceptance:**
- Header-Zeile 1 zeigt die Gruppenlabel "Plan | Actual | Delta | Result".
- Header-Zeile 2 zeigt die echten Column-Header Lane | Pair | PBs | Total | Tap | Variance | Place.
- PBs + Total haben grauen Background (`#f5f5f5`), Tap hat gelben Background (`#fff8e1`), Variance hat farbkodierten Text.
- Browser-verifiziert mit echten Testdaten.

### R25: Printout-Audit über alle Print-Surfaces (v2.8.5)
**Status:** 🟢 Umgesetzt in v2.8.5
**Bryan-Rückmeldung:** "Check ALL printouts for excessive information" — nicht nur eine View.
**Fachliche Regel:**
- Jede Print-fähige Seite der App muss im @media-print-Modus NUR race-relevante Daten zeigen.
- Operational/Status/Helper/Prompt-Text MUSS im Print versteckt werden.
- Print-Surfaces der App sind:
  1. **Heat Builder** (`window.print()` in heat-builder.js) → individual heats OR relay teams
  2. **Results** (results.js) → individual races OR relay results (Brace/Pogo/Medley/25m Team)
  3. **Breaker Report** (breaker-report.js) → Breakers + Exceeders
  4. **Relays** (relays.js, legacy standalone relay screen)
  5. **Event Report** (separate HTML doc via `window.open` — bereits bereinigt)
**Hide-Liste (pro Surface):**
- Heat Builder: "What (Y) means" Card, "All N races ready" Card, "N/M races confirmed" Status, "Teams Confirmed / Results Calculated" Card, "Tap Generate Heats/Teams" Empty-State, Swim-Twice-Row (Select+Button), Leftover-Banner
- Results: "Event Finalized" Banner, "Event Completed" Banner, all `.btn` elements, Readout/Print buttons, form controls
- Breaker Report: `.btn` elements only (already clean)
- Relays: `.btn` elements only
**Technische Umsetzung:**
- Neue CSS-Klasse `.print-hide` mit `display:none !important` in `@media print`.
- Alle operational DOM-Nodes bekommen diese Klasse.
**Acceptance:**
- Printout jeder Surface enthält keines der oben gelisteten Helper-Elemente.
- Printout behält Tabellendaten + Team/Race-Header + Start-Delay-Info.

### R26: User-facing revalidation expectations (v2.8.5, Meta-Regel)
**Status:** 🟢 Meta-Regel etabliert in v2.8.5
**Kontext:** Die v2.8.4-Runde zeigte, dass Code-Änderungen + API-Checks nicht ausreichen um ein Requirement als "done" zu melden.
**Regel für künftige Runden:**
- Ein Fix gilt nur dann als abgeschlossen, wenn er durch echte End-User-Interaktion im gerenderten UI verifiziert wurde.
- Mindestens diese Evidenzschichten sind notwendig:
  1. Static code inspection (Baseline)
  2. Runtime smoke test
  3. User-interaction verification gegen konkrete Test-Cases
  4. Print verification (falls Print betroffen)
  5. Results/Ranking verification mit konkreten Szenario-Daten
- Nicht mehr ausreichend: "CSS rule exists", "API returns payload", "I believe the flow is correct".
- Erforderlich: konkrete Szenario-Execution mit Nachweis.

### R27: Manuelles Team-Management für team-basierte Races mit Add-Swimmer-Flow (neues Dino-Finding)
**Status:** 🟡 Neu / für nächste Implementierungsrunde
**Kontext:** In team-basierten Races ist die aktuelle Auto-Generierung zu starr. Wenn Teilnehmerzahlen nicht glatt aufgehen oder der User bewusst anders organisieren will, fehlt die notwendige Flexibilität. Insbesondere bei Flows, in denen das Produkt bereits vorsieht, dass Schwimmer manuell ergänzt/zugewiesen werden können, soll der User nicht nur bestehende Teams auffüllen, sondern auch zusätzliche Teams anlegen und versehentlich angelegte Teams wieder entfernen können.
**Fachliche Regel / Scope:**
- Diese Funktion gilt **nur** für team-basierte Races, bei denen manuelles Hinzufügen/Zuweisen von Schwimmern fachlich bereits erlaubt oder definiert ist.
- Wenn ein Race-Typ keinen manuellen Add-Swimmer-Flow unterstützt, darf dort auch **kein** `+ Add Team` erscheinen.
- `RecordedCommit`/Versioning-Regeln bleiben unberührt; dies ist eine reine Produkt-/UI-/Workflow-Erweiterung.
**Anforderung:**
1. In allen relevanten team-basierten Races gibt es im Heat Builder eine klar sichtbare Aktion **`+ Add Team`**.
2. Beim Klick wird ein neues Team erzeugt und sofort sichtbar im aktuellen Screen dargestellt.
3. Der User kann in ein neu angelegtes Team Schwimmer hinzufügen — nach derselben Bedienlogik wie bei bestehenden Teams, überall dort, wo manuelles Hinzufügen fachlich erlaubt ist.
4. Die UI muss klar zeigen:
   - welche Schwimmer bereits einem Team zugewiesen sind
   - welche Schwimmer noch **unassigned** sind
   - welche Teams **complete** bzw. **incomplete** sind
5. Manuell hinzugefügte Teams müssen wieder entfernbar sein (z. B. **`Remove Team`** / **`Delete Team`**), damit versehentlich angelegte Teams rückgängig gemacht werden können.
6. Beim Entfernen eines manuell angelegten Teams dürfen dessen Schwimmer nicht stillschweigend verschwinden; sie müssen sauber in den **unassigned**-Zustand zurückgeführt oder explizit auf freien Zustand zurückgesetzt werden.
7. Die UI muss pro Team einen klaren Gültigkeits-/Vollständigkeitsstatus zeigen, z. B.:
   - `complete`
   - `incomplete`
   - `needs 1 more swimmer`
   - `not rankable`
8. Wenn ein Race nur vollständige Teams werten/ranken darf, muss diese Regel sichtbar kommuniziert werden.
9. Results/Heat-Builder-UI darf bei nur einem einzigen gültigen Team nicht kommentarlos eine normale Wettbewerbssituation suggerieren; unassigned / leftover Teilnehmer oder nicht-rankbare Teams müssen transparent erkennbar sein.
**Akzeptanzkriterium:**
- Für jeden relevanten Race-Typ erscheint **`+ Add Team`** sichtbar, für nicht relevante Race-Typen nicht.
- Klick auf **`+ Add Team`** erzeugt ein neues leeres/unvollständiges Team ohne bestehende Teams zu beschädigen.
- User kann Schwimmer in dieses Team hinzufügen und erkennt sofort Assigned vs Unassigned.
- Ein versehentlich angelegtes leeres oder teilweise befülltes Team kann wieder entfernt werden.
- Beim Entfernen landen dessen Schwimmer sauber wieder im freien/unassigned Pool.
- Vollständige und unvollständige Teams sind visuell unterscheidbar.
- Wenn nur ein gültiges Team existiert oder Restteilnehmer übrig bleiben, kommuniziert die UI diesen Zustand explizit statt nur z. B. stumpf `1st` zu zeigen.
- Die Lösung wird browserseitig für alle betroffenen Race-Typen mit echten User-Flows verifiziert.

### R28: Vollständige und symmetrische Tabellen-Header in Results / team-basierten Races (neues Dino-Finding)
**Status:** 🟡 Neu / für nächste Implementierungsrunde
**Kontext:** Dino sieht in der aktuellen Live-UI weiterhin Tabellenbereiche, die für normale Nutzer wie fehlende oder schlecht zugeordnete Spaltentitel wirken. Besonders in `Brace Relay`-Results fehlt im linken Bereich visuell ein sauberer Ober-Header, wodurch einzelne Spalten wie `Lane` / `Pair` im Vergleich zu den restlichen Gruppen unausgewogen oder „untitled“ erscheinen. Das Problem ist nicht nur potenziell auf Brace beschränkt; Claude soll die aktuelle Version zuerst **aus User-Sicht prüfen**, dann die Korrektur implementieren und anschließend erneut **aus User-Sicht** verifizieren, ob die Header-Struktur in allen relevanten Races vollständig, symmetrisch und verständlich ist.
**Fachliche Regel / Scope:**
- Dies ist ein **UX-/Readability-Requirement**, kein Ranking- oder Berechnungs-Requirement.
- Claude muss zuerst die aktuelle UI im Browser durchklicken und echte User-Screens prüfen, bevor er eine Korrektur implementiert.
- Die Prüfung gilt mindestens für alle Race-Typen mit tabellarischer Results- oder Relay-Darstellung, insbesondere Brace, Medley, Pogo, 25m Team Relay und weitere vergleichbare Race-Tables.
- Wenn ein Race bereits korrekt ist, darf es nicht unnötig umgebaut werden; Ziel ist **vollständige Header-Klarheit**, nicht kosmetischer Aktionismus.
**Anforderung:**
1. Jede tabellarische Results-/Relay-Darstellung muss eine vollständige, visuell konsistente Header-Hierarchie haben.
2. Es darf keinen Tabellenbereich geben, der für normale Nutzer wie eine leere, vergessene oder unbeschriftete Header-Zone wirkt.
3. Wenn Gruppenheader verwendet werden (z. B. `Plan`, `Actual`, `Variance / Place`), müssen auch die übrigen Spalten entweder:
   - sauber in diese Hierarchie eingebunden sein, oder
   - eindeutig als eigenständige Header über beide Ebenen erkennbar sein.
4. Claude muss die **aktuelle fehlerhafte Wahrnehmung erst selbst im Browser verifizieren**, bevor er den Fix implementiert.
5. Danach muss Claude die betroffenen Tabellen so korrigieren, dass die Header-Struktur für einen normalen Nutzer ohne Erklärung plausibel lesbar ist.
6. Claude muss sich anschließend durch alle relevanten Race-Screens durchklicken und prüfen, ob irgendwo weitere fehlende/uneinheitliche Spaltentitel oder asymmetrische Header-Strukturen existieren; falls ja, müssen diese in derselben Runde mit korrigiert werden.
7. Am Ende muss eine vollständige V0006-konforme User-Interaction-Test-Runde nachweisen, dass die Header-Strukturen aus User-Sicht verständlich und vollständig sind.
**Akzeptanzkriterium:**
- Auf `Results — 25m Brace Relay` und `Results — 50m Brace Relay` gibt es keine visuell „kopfzeilenlosen" oder unausgewogenen Tabellenbereiche mehr.
- Linke Bereiche wie `Lane` / `Pair` wirken nicht mehr wie eine leere Oberzeile oder vergessene Header-Zone.
- Gruppierte Header sind symmetrisch und für normale Nutzer plausibel lesbar.
- Claude hat vor der Korrektur die alte UI tatsächlich im Browser verifiziert und diesen Befund dokumentiert.
- Claude hat nach der Korrektur die neue UI erneut im Browser verifiziert und dokumentiert.
- Claude hat relevante weitere Race-Typen durchgeklickt und fehlende/uneinheitliche Header bei Bedarf mitkorrigiert.
- Das finale Testprotokoll belegt die User-Sicht, nicht nur Code- oder DOM-Annahmen.
