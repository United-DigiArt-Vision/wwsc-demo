# Swimming App — Claude Code Projektkontext

## Quality Playbook (PFLICHT)
**Lies und befolge ZUERST:** `../../../QUALITY_PLAYBOOK.md`
Gilt für alle Projekte. Enthält die verbindliche Vorgehensweise für Tests, Qualitätssicherung und Auslieferung.

## Projektübersicht
Die WWSC Swimming App ist ein Event-Management-System für Schwimmvereine zur Verwaltung von Wettkämpfen, Mitgliedern und Handicap-Berechnungen. Das System automatisiert die Erstellung von Heats, die Zeiterfassung (Relays) und die Ergebnisberechnung basierend auf Personal Best (PB) Zeiten.
Kunde: Bryan Hesketh. Status: v2.7.0 live auf Render, wartet auf Kundenfeedback.

## Technologie-Stack
- **Backend:** Node.js (Express.js)
- **Frontend:** Vanilla JavaScript / jQuery / CSS (Kein Framework wie React/Vue)
- **Datenbank:** SQLite3 (via better-sqlite3)
- **Hosting:** Render.com
- **Deployment:** Automatisch via GitHub main-Branch

## Architektur
Siehe `docs/DESIGN_SPEC.md` für die vollständige Architektur.
- **Server:** Zentraler Express-Server in `src/server.js`.
- **Datenlayer:** SQLite-Abstraktion in `src/db.js`.
- **Frontend:** Modularisierte Screens in `src/public/js/screens/`.
- **Zustand:** Client-seitiges State-Management via DOM/JS-Objekte, Persistenz in SQLite.

## Spezifikationen
Alle Spezifikationen befinden sich in `docs/`:
- **PRD**: `docs/PRD.md` — Funktionale Anforderungen und Akzeptanzkriterien.
- **Design**: `docs/DESIGN_SPEC.md` — Architektur, Komponenten, Datenmodelle.
- **Unit Tests**: `docs/UNIT_TEST_SPEC.md` — Testfälle pro Komponente.
- **Integration Tests**: `docs/INTEGRATION_TEST_SPEC.md` — E2E-Szenarien.

## Entwicklungsregeln
1. **Spec-First**: Vor jeder Codeänderung die relevante Spec in `docs/` lesen.
2. **Versioning (V0014)**: Der ERSTE Commit auf einem neuen Branch MUSS ein Version-Bump in `package.json` sein.
3. **Branching**: Nie direkt auf `main` arbeiten. Feature-Branches nutzen.
4. **Cache-Busting**: Bei Änderungen an CSS/JS in `src/public/` muss die Version in `src/public/index.html` (`?v=2.7.x`) angepasst werden.
5. **Zeitformate**: PBs, Delays, Max Times sind GANZE SEKUNDEN. Finish, Net, Variance sind CENTISEKUNDEN.
6. **Sprache**: Code/Kommentare Englisch. Kommunikation Deutsch.

## Befehle
```bash
# Dependencies installieren
npm install

# App lokal starten (Port 3002 standard)
npm run dev

# Unit Tests (in Vorbereitung)
npm test

# Integration Tests (Python ReQA)
./tests/integration/reqa-test.sh
```

## Workflow: Kundenfeedback verarbeiten
1. Feedback analysieren (siehe `docs/PRD.md`).
2. Specs prüfen & ggf. erweitern.
3. Fix/Feature implementieren.
4. Integration Tests in `tests/integration/` ausführen.
5. Dokumentation (`PROGRESS.md`, `STABLE.md`) aktualisieren.

## Commit-Konventionen
Conventional Commits nutzen:
- `fix: ...`
- `feat: ...`
- `docs: ...`
- `chore: version bump to vX.Y.Z`

## Bekannte Einschränkungen
- Frontend nutzt kein modernes Framework (reines DOM-Manipulation).
- SQLite ist synchron angebunden (better-sqlite3).
- Relays (25m vs Medley) haben unterschiedliche Spalten-Logiken.

## Kontaktpunkte
- **Kunde**: Bryan Hesketh (via Upwork)
- **Entwickler**: Dino / United DigiArt Vision

## Versioning & Changelog (SSOT) - PFLICHT
**Semantic Version SSOT:** `package.json`
**Code-State SSOT:** `version/CURRENT_STATE.md`
**History SSOT:** `version/CHANGELOG.md`

1. **Zwingend bei jeder Code-Änderung:** Du MUSST `version/CURRENT_STATE.md` mit dem neuen Commit Hash, Branch-Kontext, Datum und deinem Namen aktualisieren.
2. **Historie:** Du MUSST deine Änderungen in `version/CHANGELOG.md` loggen (Datum, Name, Commit Hash, was wurde geändert).
3. **Version-Bump-Regel:** Wenn du einen neuen Feature-Branch startest, MUSS dein ERSTER Commit der Version-Bump in `package.json` sein.
4. **Cache-Busting & Version Sync:** Wenn du die Version bumpst, MUSST du `package.json` UND den `?v=X.Y.Z` Query String auf allen `<script>` und `<link>` Tags in `src/public/index.html` aktualisieren.
5. **Release-Anker synchron halten:** Wenn ein Release / eine Lieferung vorbereitet wird, prüfe Konsistenz zwischen `package.json`, `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, `STABLE.md`, `/api/version` und Git Tag.
6. **CHANGELOG Pflichtfelder:** Jeder CHANGELOG-Eintrag MUSS enthalten: Date, Timestamp (`YYYY-MM-DD HH:MM:SS`), App Version (from `package.json`), Branch, Commit, Editor, Changes.
7. **CURRENT_STATE Pflichtfelder:** `version/CURRENT_STATE.md` MUSS enthalten: Date und Timestamp (`YYYY-MM-DD HH:MM:SS`) zusätzlich zu Commit/Branch/Version.
8. **Konsistenzpflicht:** `version/CURRENT_STATE.md` und der neueste Eintrag in `version/CHANGELOG.md` MÜSSEN denselben aktuellen Commit, dieselbe App-Version und denselben Branch widerspiegeln.
9. **Abschluss:** Melde NIEMALS "Fertig", "gefixt", "committed", "ready for testing" oder irgendetwas Vergleichbares, bevor `version/CHANGELOG.md` und `version/CURRENT_STATE.md` aktualisiert wurden UND der finale SSOT-Abschluss-Commit erstellt wurde. Deine Arbeit wird abgelehnt, wenn `git rev-parse HEAD` nicht mit `version/CURRENT_STATE.md` übereinstimmt oder CHANGELOG/CURRENT_STATE inkonsistent sind.
