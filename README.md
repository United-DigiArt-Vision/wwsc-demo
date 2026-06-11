# WWSC Swimming App

Event-Management-System für den Western Warriors Swimming Club (Kunde: Bryan Hesketh).
Verwaltet wöchentliche Handicap-Schwimm-Events: Anwesenheit, Heat-Generierung mit Startverzögerungen,
Zeiterfassung, Relays (Team/Brace/Medley/Pogo), PB-Breaks, Pointscore und Reports.

**Aktuelle Version:** siehe `package.json` (SSOT) bzw. `GET /api/version` • **Live-Demo:** https://wwsc-demo.onrender.com

## Schnellstart

```bash
npm install                 # bei Architekturwechsel zusätzlich: npm rebuild better-sqlite3
npm run dev                 # = node src/server.js → http://localhost:3000
```

Beim ersten Start wird eine leere SQLite-DB angelegt und mit 23 Demo-Mitgliedern geseedet (`src/seed.js`).
Frische DB erzwingen: Server stoppen, `rm -rf src/data/`, neu starten.

## Stack

- **Backend:** Node.js ≥ 18, Express 4, better-sqlite3 (synchron, WAL)
- **Frontend:** Vanilla JS + jQuery-freies DOM, eine `index.html`, Screens unter `src/public/js/screens/`
- **Kein Build-Schritt, kein Framework, keine Auth** (Single-Admin-App am Beckenrand)
- **Hosting:** Render.com (`render.yaml`), Auto-Deploy von `main`, persistente Disk `/var/data`

## Umgebungsvariablen

| Variable | Default | Zweck |
|---|---|---|
| `PORT` | 3000 | HTTP-Port |
| `WWSC_DB_PATH` | `src/data/wwsc.db` | SQLite-Pfad (Render: `/var/data/wwsc.db`) |
| `WWSC_DATA_DIR` / `WWSC_BACKUP_DIR` | abgeleitet | Daten-/Backup-Verzeichnis (Backups: letzte 20) |
| `WWSC_POINTSCORE_DISABLED` | – | `1` = Pointscore-Schreibpfad aus (nur Isolations-Tests) |
| `WWSC_E2E_EXPECTED_VERSION` | 2.9.0 | Versions-Pin der M2/M3-Browser-Gates |

## Dokumentation (Einstieg: `docs/00-DOC-INDEX.md`)

| Dokument | Inhalt |
|---|---|
| `docs/SYSTEM-SPEC-v2.12.0.md` | **Master-Spezifikation**: Domäne, alle Business-Regeln/Formeln, Workflows |
| `docs/DATA_DICTIONARY.md` | Datenmodell: alle Tabellen/Felder mit Einheiten + Berechnungsformeln |
| `docs/API-REFERENCE-v2.12.0.md` | Alle HTTP-Endpoints mit Semantik, Einheiten, Seiteneffekten |
| `docs/UI-SCREEN-SPEC-v2.12.0.md` | Jeder Screen: Elemente, Interaktionen, Zustände |
| `docs/REBUILD-GUIDE-v2.12.0.md` | App aus den Docs nachbauen + Abnahme-/Äquivalenzkriterien |
| `tests/README.md` | Alle Test-Suiten reproduzierbar ausführen (jedes System) |
| `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, `PROGRESS.md` | Projektstand-SSOT + Historie |

## Tests (Kurzfassung — Details in `tests/README.md`)

```bash
node scripts/test-v2120-bryan-feedback.cjs      # neueste Unit/API-Suite (24 Checks)
npm test                                        # Pointscore-Unit (15)
bash scripts/setup-m2-harness.sh                # einmalig: Browser-Harness
node scripts/e2e-v2120-bryan-feedback.cjs       # neueste Browser-Suite (10)
```

Jede Suite startet ihren eigenen Server mit frischer DB unter `/tmp` — nichts berührt die Entwicklungs-DB.

## Arbeitsregeln für Entwickler/Agenten

Verbindlich: `CLAUDE.md` (Versionierung, Cache-Busting, SSOT-Pflichten) und das
`QUALITY_PLAYBOOK.md` im Dropbox-Root (Testpflichten, Abnahmeprotokoll). Kurzfassung:
jede Code-Änderung = Version-Bump + `?v=`-Cache-Bust in `index.html` + CHANGELOG/CURRENT_STATE-Update;
Feature-Branches, nie direkt auf `main`; nie "fertig" ohne grüne Gates + Beweis.
