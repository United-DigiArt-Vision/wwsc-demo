# DESIGN SPEC — WWSC Swimming App (v2.8.0 / April 9)

## 1. Datenmodell & Architektur
- **Keine Schema-Änderung in der Datenbank nötig.** Die PBs werden bereits an Schwimmer-Objekten gespeichert. Wir filtern lediglich im UI/Backend die Darstellung so, dass Brace-Events auf die Standard "50m" und "25m" Zeiten zugreifen.

## 2. Formeln & Kalkulationen

### 2.1 Brace Relay Auto-Pairing (Odd Man Out)
**Situation:** `N` Schwimmer im Event, wobei `N % 2 !== 0`.
**Schritt 1:** Trenne den langsamsten (oder mittleren) Schwimmer ab. Nimm die restlichen `N-1` Schwimmer und bilde `(N-1)/2` Teams nach der "Fastest + Slowest" Methode.
**Schritt 2:** Berechne den "Target Average" (Durchschnitt der PBs) aller bisher gebildeten Teams.
**Schritt 3:** Nimm den übrig gebliebenen Schwimmer `U`.
**Schritt 4:** Iteriere durch alle bereits verplanten Schwimmer `S_i`.
  - Berechne potenzielles Team-Total: `T_i = PB(U) + PB(S_i)`.
  - Berechne Delta: `D_i = abs(T_i - Target Average)`.
**Schritt 5:** Wähle den Schwimmer `S_best` mit dem kleinsten `D_i`.
**Schritt 6:** Bilde das finale Team aus `U` und `S_best`. (Achtung: `S_best` muss in der Datenstruktur entsprechend kopiert/referenziert werden, sodass er in zwei Teams/Heats auftauchen kann).

## 3. Frontend-Design

### 3.1 Timesheet / Event Setup (R1)
- Dropdown-Optionen für "50m Brace" / "25m Brace" entkoppeln nicht die Distanzen. 
- Das System sucht für die PBs nur noch nach dem Key "50m" oder "25m".

### 3.2 Relay Heat Builder (R4)
- **Table Header:** Die Spalte `Split` wird im HTML (`<th>` und `<td>`) restlos entfernt, wenn es sich um die Heat Builder Ansicht handelt.
- Die Spalte `PB` wird prominent platziert (typischerweise direkt neben oder nach dem Namen).

### 3.3 Print Layout (R3)
- Einführung von `@media print` CSS in den relevanten Relay-Stylesheets.
- **Normalzustand:** `.relay-team-block` (oder ähnliche Klasse) hat `display: block; width: 100%;`.
- **Printzustand:** 
  - Die Container für Relays werden in ein Flexbox- oder CSS-Grid-Layout überführt: `display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));`.
  - Ausrichtung vertikal: Lane an Lane nebeneinander, genau wie im Excel.
  - Entfernung von überflüssigen Buttons (Edit, Delete, Move) per `display: none` im Print-Media-Query.

### 3.4 Bugfix: Stroke Rendering im Heat Builder (R5)
- **Fehlerursache (Vermutung):** In der UI-Rendering-Funktion für Relays (vermutlich `renderMedleyTeamsInHB` oder in der HTML-Generierung für Relays) wird beim Mappen der Strokes eventuell ein hartcodiertes Array oder eine fehlerhafte Extraktion verwendet, die ein "(Y)" stehen lässt.
- **Lösung:** Das Rendering der "Stroke"-Zelle (`<td>`) muss bereinigt werden. Es darf nur der tatsächliche Stroke-Name ausgegeben werden (bzw. das "Y" nur dann, wenn es ein valides Flag aus der Datenbank/dem Event-Setup ist — was hier nicht der Fall ist, da es ein Bug ist).

### 3.5 Echtzeit-Placing für Relays (R6)
- **Frontend-Logik:** Die Relay-Results-Ansicht muss an dieselbe Live-Berechnungs-Logik (`calculatePlaces` o.ä.) angebunden werden wie die regulären Heats.
- **Trigger:** Sobald das Custom Numpad mit "OK" geschlossen wird und eine Net Time für ein Team vorliegt, muss das Event gefeuert werden, das die Sortierung (nach Variance oder Net Time, je nach Event-Regeln) vornimmt und die Platzierungen (1, 2, 3...) in das DOM schreibt.
- **Tie-Handling:** Exakt wie in v2.7.3 etabliert, muss bei gleichen Werten das Placing als Tie (z. B. "1=" und "1=") in Echtzeit berechnet werden.

### 3.6 Spalten-Umbau und Target-Logik in Results (R7)
- **Umbenennung:** Der Header `<th>Target</th>` für die PB-Summe wird in `<th>Total</th>` geändert. Der Variablenname im Code (z. B. `team.target`) kann idealerweise in `team.total` refactored werden, um Verwirrung zu vermeiden, mindestens muss aber die UI-Ausgabe stimmen.
- **Neue Spalte:** Neues `<th>Target</th>` einfügen. Der berechnete Wert ist `team.total + team.startDelay`.
- **CSS-Klassen:** Die bestehenden Klassen für Medaillen (z. B. `.place-1`, `.place-2`, `.place-3` oder entsprechende Gold/Silber/Bronze-Hintergrundfarben) müssen von den regulären Heat-Results auf die Relay-Results (`<td>` für Place) übertragen und beim Live-Rendering (R6) dynamisch an das Element angehängt werden.

### 3.7 Layout Results-Tabelle Relays (R8)
- **Split Entfernung:** Wie im Heat Builder (R4) müssen die `<th>` und `<td>` für "Split" in der Results-Render-Logik entfernt werden.
- **Footer-Zeile (Roter Balken):** Die Zusammenfassungszeile muss CSS-technisch neu arrangiert werden (Flexbox oder angepasste `colspan`).
  - Label "Team Total" muss rechtsbündig (z.B. `text-align: right` oder Flex `justify-content: flex-end`) direkt neben der Spalte mit dem Ergebnis stehen.
  - Der Bereich für "Variance" muss in die letzte (äußerst rechte) Spalte verschoben werden.

### 3.8 Bugfix: Results Deadlock bei leeren Heats (R9)
- **Fehlerursache (Vermutung):** Auf der Results-Seite iteriert die Render-Logik (vermutlich in der Initialisierungs-Funktion oder beim Default-Tab-Setting) über die Liste der konfigurierten Events. Wenn das System versucht, den ersten Tab (oder den aktivierten Tab) zu rendern und dieser keine `event.heats` (undefined/null/leer) hat, wirft JavaScript einen Fehler. Dieser Error lässt die restliche Render-Schleife abbrechen, sodass auch die Navigation/die anderen Tabs nicht mehr gezeichnet werden.
- **Lösung:** 
  1. Beim Rendern der Results-Tabs und Tabellen muss zwingend ein Null-Check auf `heats` (bzw. Teams bei Relays) erfolgen.
  2. Fallback-UI pro Tab einbauen: Wenn keine Heats existieren, rendere einen div `Keine Heats generiert`.
  3. Die Initialisierung (welcher Tab ist beim Laden der Results-Seite aktiv?) sollte idealerweise das erste Event anwählen, das tatsächlich Heats hat, um den Flow zu verbessern.

### 3.9 Konsolidierung Report-Tabellen (R10)
- **Spalten-Mapping (SSOT):** Beide Reports nutzen ab sofort dieselben Header-Labels: `Swimmer`, `Event/Heat`, `Old PB`, `New Time`, `Variance`.
- **Daten-Mapping Exceeding:** Das Feld `Stroke` im Exceeding Report (das oft nur "25m" anzeigte) wird durch die Event/Heat-Referenz (z.B. "Heat 4") ersetzt, genau wie im Breaker Report. 
- **CSS-Architektur:** Es wird eine gemeinsame CSS-Klasse (z.B. `.report-table`) für beide Tabellen eingeführt, anstatt getrennte Styles für `#breaker-report` und `#exceeding-report` zu verwenden. `table-layout: fixed;` oder identische prozentuale Breiten auf den `<th>` Elementen sichern das exakte Alignment.

### 3.10 Bereinigung Consolidated Report (R11)
- **Results-View Cleanup:** Die Funktion, die den Results-View rendert, darf das div/die Tabelle für "All Breakers (Consolidated)" nicht mehr aufrufen oder generieren.
- **Scope-Prüfung:** Der "Consolidated" Report war vermutlich als event-übergreifende Ansicht gedacht. Auf der Ebene eines einzelnen Rennens (Results-Tab) macht er keinen Sinn, da die grüne Tabelle bereits alle Breaker des Rennens anzeigt. Er muss dort raus.

### 3.11 Event-spezifische Filterung in Results (R12)
- **Frontend-Logik:** Die Render-Funktion für die Reports auf der `Results`-Seite (z.B. `renderBreakerReport` oder ähnlich) muss den aktuell ausgewählten Event-Kontext (`currentEventId` / `activeTab`) als Parameter erhalten und das Schwimmer-Array (`results`, `breakers`) filtern, bevor die HTML-Tabellen unten gezeichnet werden.
- **Trennung der Scopes:** Die dedizierte "Breaker Report"-Ansicht (über das Menü links) rendert weiterhin das aggregierte (`global`) Array aller Events, da dies der Ort für die Gesamtauswertung ist.
- **Darstellung der Event-Info:** Wie in R10 beschlossen, zeigt die Spalte "Event/Heat" eindeutig "50m Freestyle - Heat 1" an, sodass das "Fehlen der Info" (Kunden-Finding) visuell und semantisch geschlossen wird.

### 3.12 Globale Breaker Report Symmetrie (R13)
- **Komponenten-Wiederverwendung:** Die HTML-Generierung oder das DOM-Rendering für die globalen Reports (auf der Seite `Breaker Report`) muss dieselben CSS-Klassen (`.report-table`) verwenden, die in R10 für die lokalen Results-Tabellen etabliert wurden.
- **Table-Layout:** Um die exakte optische Flucht sicherzustellen, empfiehlt sich CSS: `width: 100%; table-layout: fixed;`. Damit zwingt der Browser beiden Tabellen exakt dieselben Spaltenbreiten auf, unabhängig vom Inhalt (z.B. kurzer "25m" String vs. langer Schwimmername).
- **Header Alignment:** Die Header-Texte (und die Tabellen-Daten) müssen dieselbe Ausrichtung (z.B. `text-align: center` für Zeiten, `text-align: left` für Namen) haben.

### 3.13 Fix Event Details Modal im Calendar (R14)
- **Problem:** Die Generierung der "Races"-Zusammenfassung (wahrscheinlich in `renderEventDetails` im Calendar-Skript) iteriert aktuell nicht tief genug über `event.heats`. Sie zieht anscheinend nur `event.heats[0]` (oder ein flaches Array von Schwimmern aus dem ersten Heat).
- **Lösung:** 
  1. Die Schleife muss iterativ durch `event.heats` (oder entsprechende Relay-Gruppierungen) gehen und jeden Heat separat als Block ausgeben (z.B. `<div class="race-heat-summary"><h4>${event.name} - Heat ${index + 1}</h4>...</div>`).
  2. Die Formatierungslogik (`1st: Name (Zeit) 2nd: ...`) muss in einer Helferfunktion vereinheitlicht und zwingend für alle Race-Typen angewendet werden.
  3. Bei Ties (Gleichstand, wie im Screenshot "2nd: ... 2nd: ...") muss dies analog zum Live-Placing mit "2=" bzw. "2nd=" signalisiert werden.

### 3.14 Event Report Fixes & Calendar Link (R15)
- **Report Rendering:** Die Funktion `generateEventReport` (oder `eventReport.html` Template) muss auf Spalten-Mismatches (TH vs. TD) geprüft werden. Der riesige Leerraum zwischen "Name" und "Special Entry" im Screenshot (Participants Tabelle) lässt darauf schließen, dass entweder eine Tabellenspalte (z. B. "Age" oder "PB") im Header vergessen wurde oder die Daten-Zellen nicht befüllt sind. Alle Spalten (`<th>` vs `<td>`) müssen symmetrisch abgebildet werden.
- **Calendar Button:** In der Render-Funktion `renderEventDetails` (im Kalender) muss für alle Events mit `status === 'completed'` ein HTML-Element `<button class="btn btn-outline" onclick="openEventReport('${event.id}')">View Event Report</button>` (oder als href/Link-Element je nach Routing) eingefügt werden.

### 3.15 Pogo Relay Heat Builder Cleanup (R16)
- **Frontend-Logik (Heat Builder):** In der Funktion `renderPogoTeamsInHB` müssen die if/else-Blöcke oder das HTML-Template bereinigt werden. Der Footer-Teil, der den "Swim Twice" Button und das Dropdown zeichnet, darf bei Pogo *niemals* in den DOM geschrieben werden. Ebenso muss der Block für `<td colspan="...">Team Total</td>` bei Pogo komplett auskommentiert oder mit `display: none` versehen werden.
- **Pogo Generierungs-Logik:** Die Funktion `generatePogoTeams` muss überprüft werden. Ein Array von Schwimmern für Pogo muss zwingend in Chunks von exakt 4 Personen geteilt werden. (Sollte die Teilnehmerzahl nicht durch 4 teilbar sein, muss die Logik greifen, wie mit dem Rest umgegangen wird – z.B. Warnung an User oder automatisches Double-Swim-Pairing wie bei Brace, das muss aber transparent und zwingend 4er-Lanes ergeben).
- **Pogo Results-Ansicht:** Die Tabellen-Header (`<th>`) für Pogo Results werden fix in dieser Reihenfolge geschrieben: `PB`, `Start`, `Total`, `T1 (Tap)`, `T2 (Tap)`, `Result`, `Variance`.
