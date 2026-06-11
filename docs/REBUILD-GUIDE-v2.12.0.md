# REBUILD-GUIDE — WWSC Swimming App v2.12.0

**Status:** AKTUELL. Zielgruppe: ein Entwickler oder ein KI-Harness, der die App **ohne Vorwissen**
betreiben (A) oder **funktional identisch neu bauen** (B) soll.

---

## A) Diese Codebasis betreiben (Referenzbetrieb)

```bash
# Voraussetzungen: Node.js >= 18, macOS/Linux; für Browser-Tests: Google Chrome
npm install
npm rebuild better-sqlite3        # Pflicht bei Architektur-/Maschinenwechsel (native Binding)
npm run dev                       # http://localhost:3000 — leere DB wird angelegt + 23 Demo-Mitglieder geseedet
```

- DB-Pfad via `WWSC_DB_PATH` (Default `src/data/wwsc.db`); frische DB: Server stoppen, `rm -rf src/data/`.
- Deployment-Referenz: `render.yaml` (Render.com, Auto-Deploy von `main`, persistente Disk `/var/data`).
- Mehrwöchige Testdaten: `BASE_URL=http://127.0.0.1:3000 node scripts/seed-bryan-weekly-events.cjs`
  (idempotent, löscht nie; live nur mit `APPLY_LIVE=1` + Freigabe).

## B) Funktional identisch nachbauen (beliebiger Stack)

**Lese-Reihenfolge (alles unter `docs/`):**
1. `SYSTEM-SPEC-v2.12.0.md` — Domäne + ALLE Business-Regeln/Formeln (das „Was und Warum“)
2. `DATA_DICTIONARY.md` — Datenmodell, Einheiten, Berechnungs- und Propagationsregeln
3. `API-REFERENCE-v2.12.0.md` — Verhaltensvertrag der 73 Endpoints (bei UI-Neubau optional, bei
   1:1-Nachbau verbindlich, weil die Test-Suiten diesen Vertrag prüfen)
4. `UI-SCREEN-SPEC-v2.12.0.md` — Screens, Interaktionen, Zustände
5. `TEST_ARCHITECTURE.md` + `tests/README.md` — wie Verhalten bewiesen wird

**Nicht verhandelbare Invarianten (häufigste Nachbau-Fehler):**
- Zwei-Einheiten-System (s vs. cs) exakt wie im DATA_DICTIONARY — inklusive ×100-Konvertierungen.
- `+2 s`-Puffer in JEDER Max-Time-/Startformel (Heats UND Relays).
- Break-Schwellen: 25 m −50 cs, sonst −100 cs; `is_break` wird bei Zeiteingabe berechnet und ist SSOT.
- Platz-Präzedenz `COALESCE(manual_place, place)` überall (Pointscore, Reports, Kalender, Readout).
- Ranking-Regeln je Relay-Typ (Staffel = schnellste Zeit; Brace/Medley/Pogo = kleinste |Variance|;
  Gleichstand = gleicher Platz).
- Pointscore: Individual 5/4/3 + 2 je weiterem Finisher; Team 5/4/3 je Mitglied, sonst 0;
  idempotenter Write beim Finalize; Aggregation = einfache Addition; Monat/Saison = Kalender.
- PBs werden NIE automatisch geändert; manuelle PB-Änderungen werden geloggt (Breaker-Report).
- Finalize schreibt time_history NUR für Individual-Races; Re-Finalize ist idempotent;
  `season_start_*` set-if-null.
- Event-Lifecycle/„aktuelles Event“-Semantik und der Race-Reset bei Konfigurationsänderung.

**Referenzdaten:** `src/seed.js` (23 Mitglieder mit allen PBs) ist der kanonische Demodatensatz;
`scripts/seed-bryan-weekly-events.cjs` erzeugt deterministisch 7 abgeschlossene Wochen (inkl. Breaks
und manuellen PB-Updates) — ideal als Vergleichsfixture zwischen Original und Nachbau.

## C) Abnahme: Wann ist ein Nachbau „gleich“?

**C1 — Automatisierte Gates (bei 1:1-API/UI-Nachbau direkt wiederverwendbar):**
Die Suiten unter `scripts/` sind ausführbare Spezifikation; sie starten ihren eigenen Server
(`PORT`, `WWSC_DB_PATH` aufs Zielsystem zeigen lassen). Reihenfolge + Sollwerte:

| Suite | Befehl | Soll |
|---|---|---|
| v2.12.0 Unit/API | `node scripts/test-v2120-bryan-feedback.cjs` | 24/0 |
| Pointscore-Unit | `node scripts/test-m3-pointscore-unit.cjs` | 15/0 |
| Slice2-Unit | `node scripts/test-m3-slice2-reports-export.cjs` | 7/0 |
| Pointscore-Isolation | `node scripts/e2e-m3-pointscore-isolation.cjs` | PASS |
| v2.12.0 Browser | `node scripts/e2e-v2120-bryan-feedback.cjs` | 10/0, 0 Console-Errors |
| M2-55 / M2-100 | `WWSC_E2E_EXPECTED_VERSION=<ver> node scripts/e2e-m2-time-history.cjs 2>&1 \| tee /tmp/m3p-m2-55.log` (analog M2-100 → `/tmp/m3p-m2-100.log`) | 55/0 • 98/2NA/0/0 |
| History-Graphs | `…e2e-m3-history-graphs.cjs` | 19/1NA/0 |
| Slice2-Browser | `…e2e-m3-slice2-reports-export.cjs` | 13/0 |
| M3-120 (ZULETZT, prüft die /tmp-Logs auf aktuellen Commit) | `…e2e-m3-pointscore-120.cjs` | 118/2NA/0/0 |

Browser-Harness einmalig: `bash scripts/setup-m2-harness.sh` (puppeteer-core nach /tmp + Chrome-Pfad).
Bekannte Harness-Eigenheit: M2-100 kann nach fertig geschriebenem Evidence einen Server-Kindprozess
hinterlassen, der Pipe-Ketten blockiert — Orphan killen, Ergebnisse bleiben gültig (tests/README.md).

**C2 — Fachliche Äquivalenz-Stichprobe (stack-unabhängig, mit identischem Seed + identischen Eingaben):**
1. Event „ordinary + medley“, 18 Anwesende → Heats: Größenformel, Max/Delay-Werte identisch.
2. Zeiteingaben mit bekannten Deltas → identische Net/Variance/Break-Flags (25m-Schwelle!).
3. Relay/Brace/Medley/Pogo: identische Teams-Logik (Paarung, 2/3-Teams-Regel), Plätze nach Regelwerk.
4. Finalize 2×: time_history/pointscore identisch (Idempotenz); Punkte = 5/4/3/2 bzw. 5/4/3-Schema.
5. Reports 1–3 + Swimmer Card gegen `API-REFERENCE` (inkl. CSV-Header byte-gleich, 0-Punkte-Zeilen).
6. PB manuell senken/erhöhen/No-Op → Breaker-Report Count/Amount/Baseline-Kette wie spezifiziert.
7. Event-Report: Spalten Lane|Swimmer|PB|Start|Finish|Net|Variance|Break|Place, Manual-Platz gewinnt.
8. QUALITY_PLAYBOOK „letzte Frage“: kein Screen zeigt je falsche Zahl/Einheit/Format — Abnahmeprotokoll
   nach Vorlage ausfüllen (`docs/evidence/v2120-bryan-feedback/V2.12.0-ABNAHMEPROTOKOLL.md` als Muster).

## D) Projektprozess (für Weiterarbeit am Original)

`CLAUDE.md` (Versionierung/Cache-Bust/SSOT-Pflichten, Branch-Regeln) + Dropbox-Root
`QUALITY_PLAYBOOK.md` und `COLLABORATION_MODEL.md` (Rollen Dino/Balerion/Claude, messages/-Protokoll,
Handoff-Pflichten). Stand/Historie: `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, `PROGRESS.md`.
