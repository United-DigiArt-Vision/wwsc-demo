# QUALITY PLAYBOOK — Balerion/Claude Projektstandard

**Version:** 1.0 (erstellt 2026-04-06, Projekt WWSC Swimming App)
**Gilt für:** Alle zukünftigen Projekte von Dino/Balerion mit Claude Code
**Regel:** Dieses Dokument wird bei JEDEM Projekt als erstes gelesen und vollständig befolgt.

---

## Warum dieses Dokument existiert

In Projekt WWSC v2.7.0 wurden 7 Bugs an den Kunden geliefert, obwohl 56 Tests grün waren.
Die Ursache: Tests prüften was der Server sendet, nicht was der User sieht.
Der Entwickler (Claude) sagte mehrfach "fertig" und "100%", obwohl Lücken bestanden.
Dino musste dieselbe Frage 5x stellen, bis wirklich alle Lücken geschlossen waren.

**Dieses Dokument stellt sicher, dass das nie wieder passiert.**

---

## TEIL 1: DIE 5 FEHLER DIE NIE WIEDER PASSIEREN DÜRFEN

### Fehler 1: "Punkt-Fix statt System-Fix"
**Was passiert ist:** Ein Einheiten-Bug wurde an EINER Stelle im Server gefixt. Derselbe Bug existierte an 6 weiteren Stellen im Frontend.
**Regel:** Bei JEDEM Bug-Fix: Suche ALLE Stellen im Code die dasselbe Muster verwenden. Nutze `grep`/`Grep` systematisch. Fixe ALLE Stellen, nicht nur die erste.

### Fehler 2: "API-Test statt User-sichtbarer Test"
**Was passiert ist:** Die API gab korrekte Daten zurück (z.B. `improvement: 100`). Aber das Frontend zeigte `"100s"` statt `"1.00"`.
**Regel:** Jeder Test muss die Frage beantworten: "Was sieht der User auf dem Bildschirm?" — nicht "Was steht im JSON-Response?"

### Fehler 3: "Fertig sagen ohne Beweis"
**Was passiert ist:** Claude sagte "alle Bugs gefixt" nach 1 von 7 Bugs.
**Regel:** NIEMALS "fertig" sagen ohne:
1. Jeden Fix mit konkretem Test bewiesen
2. Lückenanalyse durchgeführt (Traceability Matrix)
3. ALLE Lücken geschlossen (0 FEHL, 0 SPEC, 0 Backlog)
4. Beweis-Durchlauf aller Tests gezeigt

### Fehler 4: "Happy Path statt breite Abdeckung"
**Was passiert ist:** Tests liefen mit 12 Schwimmern, Ordinary Swim, keine Sonderfälle. In der Praxis nutzt Bryan 3-23 Schwimmer, 9 verschiedene Rennkombinationen, 8 Medley-Muster.
**Regel:** Jede Funktion wird mit ALLEN relevanten Varianten getestet: verschiedene Eingabemengen, verschiedene Konfigurationen, gerade/ungerade Zahlen, Minimum/Maximum, leere Daten, Grenzwerte.

### Fehler 5: "Eine Dimension statt alle Dimensionen"
**Was passiert ist:** Swimmer-Anzahlen wurden getestet, aber nicht kombiniert mit verschiedenen Renntypen, Medley-Patterns, Tie-Szenarien etc.
**Regel:** Tests decken ALLE Dimensionen ab:
- Datenmengen (klein/mittel/groß/gerade/ungerade)
- Konfigurationen (jede mögliche Einstellung)
- Berechnungen (Einheiten, Formeln, Grenzwerte)
- Darstellung (Format, Styling, Abwesenheit von Elementen)
- Workflows (Normal, Abbruch, Wiederholung, Reihenfolge)
- Edge Cases (null, 0, Gleichstand, Maximum)

---

## TEIL 2: PFLICHT-VORGEHENSWEISE FÜR JEDES PROJEKT

### Schritt 1: Specs lesen und verstehen
Vor dem ersten Codieren:
- ALLE Anforderungsdokumente lesen (PRD, Design Spec, etc.)
- ALLE bestehenden Tests lesen
- ALLE bestehenden Code-Dateien überfliegen
- Ein Data Dictionary erstellen: Jedes Datenfeld mit Einheit, Format, Herkunft, Anzeige-Screens

### Schritt 2: Use Cases aus User-Sicht definieren
Nicht aus der Technik denken, sondern:
- Wer ist der User? Was ist sein Workflow?
- Was tut er Schritt für Schritt, jede Woche?
- Was könnte er eingeben? (Normal, Extrem, Fehlerhaft)
- Was erwartet er zu sehen?
- Welche Kombinationen sind möglich?
- Was passiert bei Grenzwerten, leeren Daten, Gleichständen?

Ergebnis: USE_CASES.md mit nummerierter Liste aller Szenarien.

### Schritt 3: Traceability Matrix erstellen
Jedes Requirement × Jede Testschicht:
- L1: Data Dictionary (Einheiten-Definition vorhanden?)
- L3: API-Tests (Backend-Logik korrekt?)
- L4: Display-Tests (User sieht richtige Werte?)
- L6: Propagation (Folgwerte nach Mutation korrekt?)
- L7: Edge Cases (Grenzwerte getestet?)

Status pro Zelle: IMPL / FEHL
**Ziel: 0 FEHL in der gesamten Matrix.**

### Schritt 4: Tests ZUERST schreiben
Vor dem Fix/Feature:
1. Test schreiben der die User-Erwartung beschreibt
2. Test muss FAIL (weil der Fix noch nicht existiert)
3. Fix implementieren
4. Test muss PASS
5. ALLE bestehenden Tests müssen weiterhin PASS

### Schritt 5: Systematischer Code-Audit nach jedem Fix
Nach JEDEM Code-Fix:
1. `grep` nach dem gleichen Muster in ALLEN Dateien (Backend + Frontend)
2. Gibt es andere Stellen die denselben Bug haben könnten?
3. Wenn ja → auch dort fixen
4. Datenpfad verfolgen: DB → API → Frontend → Anzeige
5. An JEDER Station des Pfads prüfen: Einheit korrekt? Format korrekt?

### Schritt 6: Breite Testabdeckung über alle Dimensionen
Nicht nur "funktioniert der Fix?" sondern:

**Dimension 1: Datenmengen**
- Minimum (z.B. 1, 3)
- Kleine Gruppe (4-6)
- Mittlere Gruppe (7-12)
- Große Gruppe (20+)
- Gerade und ungerade Zahlen
- Primzahlen (3, 5, 7, 11, 13, 17, 19, 23)

**Dimension 2: Konfigurationen**
- Jede mögliche Dropdown-Einstellung
- Jede Kombination von Standard + Special Event
- Jede mögliche Entry-Verteilung (Y/N/explizit/leer)

**Dimension 3: Berechnungen**
- Exakte Grenzen (variance = -100, = +200, = 0)
- Knapp über Grenze (variance = -99, = +201)
- Knapp unter Grenze (variance = -101, = +199)
- Einheiten-Konsistenz an jeder Berechnungsstelle

**Dimension 4: Darstellung (was der User sieht)**
- Jedes Feld: richtige Format-Funktion?
- Styling vorhanden? (Farben, Fettdruck)
- Elemente die NICHT da sein sollen: wirklich abwesend?
- Spaltennamen korrekt?

**Dimension 5: Workflows**
- Normaler Durchlauf A→B→C→D
- Abbruch mittendrin und Neustart
- Rückwärts-Navigation (Unlock, Re-Edit)
- Mehrfache Wiederholung (2 Events, 3 Events)

**Dimension 6: Edge Cases**
- null-Werte
- Leere Eingaben
- Wert = 0
- Gleichstände (2/3/4-fach)
- Fehlende Daten (kein PB, kein Finish)

### Schritt 7: Selbst-Audit mit Beweis
BEVOR "fertig" gesagt wird:
1. Traceability Matrix prüfen: Gibt es IRGENDWO noch FEHL?
2. Use Case Liste durchgehen: Ist JEDER Use Case durch einen Test abgedeckt?
3. ALLE Test-Suiten laufen lassen und vollständige Ausgabe zeigen
4. Display-Tests laufen lassen und Ergebnisse zeigen
5. Console auf Fehler prüfen

**Erst wenn ALLES grün ist und die Matrix 0 FEHL zeigt: "Fertig" sagen.**

### Schritt 8: Abschlussbericht mit Beweis-Zahlen
Der Abschlussbericht enthält:
- Tabelle: Jede Test-Suite mit PASS/FAIL Zahlen
- Tabelle: Jedes Requirement mit Teststatus
- Tabelle: Jede Dimension mit Abdeckungsgrad
- Konkrete Testausgabe (nicht "Trust me", sondern echte Logzeilen)

---

## TEIL 3: CHECKLISTE (bei jedem Projekt durchgehen)

### Vor dem Codieren
- [ ] Alle Specs gelesen?
- [ ] Data Dictionary erstellt?
- [ ] Use Cases aus User-Sicht definiert?
- [ ] Traceability Matrix angelegt?

### Während dem Codieren
- [ ] Bei jedem Fix: alle Code-Stellen mit gleichem Muster gesucht?
- [ ] Datenpfad verfolgt: DB → API → Frontend → Display?
- [ ] Test für den Fix geschrieben?

### Vor "Fertig"
- [ ] Traceability Matrix: 0 FEHL?
- [ ] Jeder Use Case durch Test abgedeckt?
- [ ] Alle Dimensionen getestet (Mengen, Konfigurationen, Berechnungen, Display, Workflows, Edge Cases)?
- [ ] ALLE Test-Suiten laufen gelassen?
- [ ] Display-Tests laufen gelassen?
- [ ] Console auf Fehler geprüft?
- [ ] Beweis-Zahlen dokumentiert?
- [ ] Kunde würde auf KEINEM Screen eine falsche Zahl sehen?

### Die letzte Frage
**"Wenn Bryan jetzt jeden Button drückt, jede Zahl eingibt, jede Einstellung ändert, jedes Ergebnis abliest — wird er auf seinem Bildschirm JEMALS eine falsche Zahl, ein falsches Format, ein fehlendes Element, oder einen Fehler sehen?"**

Wenn die Antwort nicht "Nein, definitiv nicht, und hier ist der Beweis" ist → noch nicht fertig.

---

## TEIL 4: ARTEFAKTE DIE JEDES PROJEKT HABEN MUSS

| Dokument | Zweck |
|----------|-------|
| `DATA_DICTIONARY.md` | SSOT für jedes Feld: Einheit, Format, Herkunft |
| `USE_CASES.md` | Alle Szenarien aus User-Sicht |
| `TEST_ARCHITECTURE.md` | Testschichten und Prinzipien |
| `TRACEABILITY_MATRIX.md` | Requirement × Testschicht, 0 FEHL |
| `tests/integration/` | API-Tests (Logik, Einheiten, Edge Cases) |
| `tests/integration/*-matrix.py` | Kombinatorische Tests (alle Dimensionen) |
| `tests/integration/*-usecases.py` | User-Workflow-Tests |
| `tests/display/` | DOM/Display-Tests (was der User sieht) |

---

## TEIL 5: ANTI-PATTERNS (NIEMALS tun)

1. **NIEMALS** "fertig" sagen nach dem Fixen von 1 Bug, wenn 7 gemeldet wurden
2. **NIEMALS** nur die API testen ohne die Frontend-Anzeige zu prüfen
3. **NIEMALS** nur mit einer Konfiguration testen (z.B. nur 12 Swimmer)
4. **NIEMALS** einen Einheiten-Bug an einer Stelle fixen ohne alle anderen Stellen zu prüfen
5. **NIEMALS** "100%" behaupten wenn die eigene Matrix noch FEHL-Einträge hat
6. **NIEMALS** Tests schreiben die nur den Happy Path abdecken
7. **NIEMALS** Token sparen auf Kosten der Testabdeckung
8. **NIEMALS** eine Dimension vergessen (Mengen, Konfig, Berechnung, Display, Workflow, Edge)
9. **NIEMALS** "ist ein Test-Bug, kein Code-Bug" sagen ohne es bewiesen zu haben
10. **NIEMALS** dem Kunden etwas liefern das nicht durch alle 6 Dimensionen getestet wurde
