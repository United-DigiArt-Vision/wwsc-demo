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
