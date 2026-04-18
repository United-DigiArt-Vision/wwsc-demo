# PROGRESS — WWSC Swimming App v2.8.8

## 🎯 AKTUELLER STATUS
Phase: 14 — v2.8.8 live auf Render / wartet auf Bryan-Feedback
Schritt: Dropbox-SSOT `dev/v2.8.8-header-completeness-audit` wurde in das echte Repo `~/wwsc-demo` übernommen, auf `main` gebracht und für Render-Deploy ausgerollt. Live-Release-Basis dieser Version: `RecordedCommit = 497f78d` (substantiver v2.8.8 Delivery-Commit), Delivery-Branch-Tip vor dem Transfer: `e34335e`, Live-Branch jetzt `main`.
Blockiert: Nein

## ✅ ERLEDIGT (mit Dateireferenz)
- [x] Phase 0: Workspace & State Verifikation (`git fetch`, Hard Reset auf `origin/main` - Stand v2.7.4).
- [x] Phase 1: PRD → `REQUIREMENTS.md` (R1 bis R20 erfasst; R17-R20 aus Acceptance ergänzt).
- [x] Phase 2: Design Spec → `DESIGN-SPEC.md` / `docs/DESIGN_SPEC.md` (aktive + Legacy-Logiken dokumentiert; Widersprüche sichtbar gemacht).
- [x] Phase 3a: Test-Spec-Ausbau → `USER-INTERACTION-TEST-SPEC.md` (UI-TC-1 bis UI-TC-168 vorhanden).
- [x] Phase 4: Claude-Handoffs für R17/R20 und Konsolidierung erstellt (`messages/2026-04-10-*.md`).
- [x] Acceptance Finding: R17 live von Dino im Browser verifiziert — 25m Brace zeigt jetzt nur noch eine 25m-Variante.
- [x] Interim Delivery Note: Diese Verbesserung kommt in die nächste Bryan-Nachricht.
- [x] Phase 6.5: Pre-Delivery Browser Sweep (TC-69 bis TC-168) — 99 PASS / 0 FAIL / 1 DOC-AMBIGUITY.
- [x] Phase 6.5 gesamt (TC-01 bis TC-168): 160 PASS / 0 FAIL / 1 TEST-BUG / 1 DOC-AMBIGUITY.
- [x] Runtime wieder online gebracht über direkten Start mit `node src/server.js` im Pfad `temp/wwsc-v280-runtime`; Test-URL war wieder erreichbar.
- [x] Dino hat live bestätigt: Bei Pogo speichern T1/T2 für Teilnehmer 1 und 2 korrekt und getrennt.
- [x] Pogo Variance Anzeige-Bug isoliert (renderte Team-Variance statt Swimmer-Variance). Code in `results.js` korrigiert. Test-Server läuft wieder.
- [x] Mehrere weitere lokale Fix-Versuche durchgeführt: `Exp. Finish` Spalte ergänzt/verschoben, `Target` ergänzt, Numpad-Handler mehrfach nachgebessert.
- [x] Ergebnis dieser Runde: UI weiterhin instabil, daher Übergabe an Claude Code vorbereitet statt weitere unstrukturierte Patches.

## 📋 NÄCHSTER SCHRITT (sofort ausführbar)
Was: Auf Bryans Live-Rückmeldung zu `v2.8.8` warten und dann exakt auf dieser Release-Basis weiterarbeiten.
Datei lesen: `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, `STABLE.md`, `messages/2026-04-18-outgoing-to-bryan-v288-live.md`, `messages/2026-04-18-current-state-after-v288-live.md` sowie die nächste eingehende Bryan-Nachricht.
Kriterium fertig: Bryans nächste Rückmeldung ist dokumentiert, gegen `main` / `origin/main` / `v2.8.8` eingeordnet und der nächste Arbeitsblock wird auf exakt dieser dokumentierten Basis gestartet.

## ⚠️ OFFENE PUNKTE / BLOCKER
- **R20 (DOC-AMBIGUITY / TC-148):** Ranking-Logik für Special Races (Brace / Medley / Pogo) — App nutzt `fastest_total_time`, Legacy-Doku sagt `nearest-to-target`. Bryan-Bestätigung erforderlich.
- **R18:** Medley-Leftover für einzelnen gültigen Teilnehmer — Fachfrage an Bryan offen.
- **Pogo Edit Bug:** Bereits eingetragene T1/T2 Werte lassen sich weiterhin nicht zuverlässig erneut bearbeiten; Numpad-Fenster öffnet, reagiert aber nicht sauber auf Eingaben.
- **Pogo Table Layout Bug:** `Result` ist visuell / strukturell weiterhin nicht sauber dargestellt; mehrere Spaltenänderungen haben die Tabelle destabilisiert.
- **Neuer kritischer Pogo-Crash-Bug:** Dino meldet jetzt zum zweiten Mal, dass sich der Browser-Tab / die App unter Pogo während echter Eingabe komplett schließt. Neues klares Repro: 7 Schwimmer gewählt → nur 1 Pogo-Team mit 4 generiert → T1 Schwimmer 1 → T2 Schwimmer 1 → T1 Schwimmer 1 korrigiert → T1 Schwimmer 2 → T2 Schwimmer 2 → Klick auf OK → Tab schließt sich komplett.
- **Pogo Edit Flow:** Re-Edit von T1 hat diesmal funktioniert, aber der gesamte Flow ist weiterhin instabil wegen des Tab-Crashs.
- **Release-Gate:** Keine Bryan-Auslieferung, bevor diese Acceptance-Bugs sauber behoben und live verifiziert sind.
- **Neuer Dino-Testbefund (2026-04-17):** Auf der Results-Seite für `25m Brace Relay` wirkt die Eingabespalte für Result/Tap trotz Gruppierung weiterhin unklar bzw. "ohne richtigen Header". Das muss in der nächsten Claude-Runde als echte User-Readability-Aufgabe behandelt werden, nicht nur als Tabellenstruktur-Thema.
- **Neuer Dino-Testbefund (2026-04-17):** Die Platzierungslogik bei `25m Brace Relay` ist fachlich korrekt nach Bryan-Regel (`smallest absolute variance wins`), wirkt aber UX-seitig potenziell missverständlich, weil die schnellste `Tap`-Zeit nicht gewinnt. Die UI muss deutlicher kommunizieren, dass `Variance` — nicht rohe `Tap` — die Platzierung bestimmt.
- **Neuer Dino-Testbefund (2026-04-17):** Auf der Results-Seite für `Medley Relay` ist aktuell **keine sichtbare Variance-Darstellung** erkennbar. Das ist problematisch, weil Bryan ausdrücklich gesagt hat, dass bei `25m Brace`, `50m Brace`, `Pogo` **und `Medley Relay`** die kleinste Variance gewinnt. Wenn Variance die Ranking-Grundlage ist, muss sie im Medley-Results-UI auch sichtbar und nachvollziehbar sein — sonst ist die Platzierungslogik für den Nutzer nicht prüfbar.
- **Neuer Dino-Testbefund (2026-04-17):** Auch auf der Results-Seite für `Pogo` ist aktuell **keine sichtbare Variance-Darstellung** vorhanden. Da Bryan `Pogo` ebenfalls explizit unter die Regel "smallest variance wins" gefasst hat, muss Variance in der Pogo-Results-Ansicht sichtbar und verständlich dargestellt werden. Sonst bleibt die Platzierungsgrundlage für den Nutzer intransparent.
- **Architektur-Track (beschlossen):** Breakers / Exceedings / gemeinsame Report-Metriken müssen nach dieser Delivery in eine zentrale Datenlogik überführt werden. Das ist ausdrücklich beschlossen und darf nicht vergessen werden.

## 📊 FORTSCHRITT
Gesamt: 9/10 Schritte
Unit Tests: legacy vorhanden / nicht Fokus dieser Runde
Integration Tests: legacy vorhanden / teilweise überholt
UI Tests: 476 spezifiziert (Section A–M)
  - Section K (v2.8.6): 56 PASS / 0 FAIL / 0 OPEN
  - Section L (v2.8.7): 58 PASS / 0 FAIL / 0 OPEN
  - Section M (v2.8.8): 26 PASS / 0 FAIL / 0 OPEN
  - Ältere Sections: zuletzt ausführlich in v2.8.5 / v2.8.6 ausgeführt
Console Errors: 0 in v2.8.8 pre-fix+post-fix cycle (preview_console_logs level=error → "No console logs.")
