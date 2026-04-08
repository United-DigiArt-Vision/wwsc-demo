# USER INTERACTION TEST SPECIFICATION (v2.0)
**Projekt:** WWSC Swimming App
**Fokus:** Edge Cases, Permutationen, UI-States
**Ziel:** Browser-basierte QA, die nicht nur den Happy Path abdeckt, sondern systematisch die Ränder der Applikation prüft.

## Generelle Anweisungen für den Tester (Claude Code)
1. **Zwingend im Browser durchführen.** Die App muss lokal gestartet werden.
2. **Rechne nach!** Jede angezeigte Zeit (Net, Variance, Average, Target) MUSS von dir im Protokoll händisch nachgerechnet und bestätigt werden.
3. **Dokumentiere Abweichungen exakt.** Wenn etwas kaputt geht, halte den genauen State fest.
4. **Erstelle ein neues Protokoll:** `USER-INTERACTION-TEST-PROTOCOL.md` am Ende überschreiben.

---

## Test-Szenarien (Permutationen)

### Szenario 1: Der Null-State (Empty Event)
**Setup:** Neues Event starten. **0 (Null)** Members auf "Present" setzen.
**Tests:**
- [ ] Times Sheet: Sind alle relevanten Felder leer oder auf 0?
- [ ] Heat Builder: Kann man Rennen mit 0 Leuten starten? (Sollte eine Warnung geben oder leere Heats).
- [ ] Results: Was passiert, wenn man ein Rennen ohne Teilnehmer ansieht? Crasht die Seite?
- [ ] Finalize: Kann man ein leeres Event abschließen? Was steht dann im Calendar?

### Szenario 2: Asymmetrische Relays (Die "Ungerade" Zahl)
**Setup:** **11** Members auf "Present" setzen. Ein "25m Relay" hinzufügen.
**Tests:**
- [ ] Heat Builder: Wie verteilt das System 11 Schwimmer? (Sollte z.B. zwei 4er-Teams und ein 3er-Team bilden).
- [ ] Results (Relay): Geht die Target-Time Berechnung korrekt auf, wenn Teams unterschiedlich groß sind? (Summe der PBs der tatsächlichen Teilnehmer).
- [ ] Nachrechnen: Wähle ein asymmetrisches Team, setze eine Finish Time, rechne Variance händisch aus.

### Szenario 3: Der extreme Gleichstand (Tie)
**Setup:** **4** Members in einem "25m Individual" Heat.
**Aktion:** Trage für Schwimmer A, B und C exakt dieselbe Net-Time ein (indem du die Finish Time so setzt, dass Net Time identisch ist). Schwimmer D ist langsamer.
**Tests:**
- [ ] Placing: Werden A, B, C alle als "1st" gerankt? Bekommt D den "4th" Place?
- [ ] Medal Styling: Haben alle drei Erstplatzierten die Gold-Farbe?

### Szenario 4: Extreme Abweichungen
**Setup:** Normales "50m Individual".
**Aktion:**
- Schwimmer A: Setze eine Finish-Time, die zu einer Net-Time führt, die genau auf dem Threshold (-1.00s) liegt.
- Schwimmer B: Setze eine Finish-Time, die 3 Minuten über der PB liegt.
**Tests:**
- [ ] Break Detection: Wird Schwimmer A als "BREAK" markiert?
- [ ] Formatierung: Wie formatiert die Tabelle die extrem langsame Zeit von Schwimmer B? (Minuten-Formatierung intakt?).

### Szenario 5: Cross-Screen Konsistenz (End-to-End)
**Aktion:** Event aus Szenario 4 "Finalize" klicken.
**Tests:**
- [ ] Calendar Modal: Vergleiche die Breaker-Liste im Modal exakt mit dem Breaker Report und dem Inline-Result aus Szenario 4.
- [ ] Werte-Prüfung: Sind Old PB, New PB und Variance exakt gleich formatiert? Keine Rundungsfehler oder unformatierten Centisekunden?

---

Erwartetes Ergebnis: Ein vollständiges Protokoll, das explizit auf diese Szenarien eingeht und PASS/FAIL bewertet.
