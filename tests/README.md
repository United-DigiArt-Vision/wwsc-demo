# Tests — WWSC Swimming App v2.7.1

## Voraussetzungen
- Node.js >= 18
- Python 3.x
- Frische Datenbank (keine alte `src/data/wwsc.db`)

## Setup auf einem neuen System

```bash
cd code/

# 1. Dependencies installieren (native Module werden für DEIN System compiled)
npm install

# 2. Falls node_modules schon existieren aber von einem anderen System:
npm rebuild better-sqlite3

# 3. Alte Datenbank löschen (Tests brauchen frischen Seed)
rm -rf src/data/

# 4. Server starten
node src/server.js
# Erwartete Ausgabe: "WWSC Swimming App running at http://0.0.0.0:3000"
```

## Test-Suiten ausführen

**WICHTIG:** Jede Suite braucht eine FRISCHE Datenbank. Zwischen den Suiten:
```bash
# Server stoppen (Ctrl+C)
rm -rf src/data/
node src/server.js
# Warten bis "running" erscheint, dann in neuem Terminal:
```

### Suite 1: Legacy API Tests
```bash
python3 tests/integration/reqa.py
```
Erwartet: 56 PASS / 1 FAIL (T25d = bekannter Test-Timing-Bug)

### Suite 2: Bryan-Bug Tests + Edge Cases
```bash
python3 tests/integration/reqa-v2.7.1.py
```
Erwartet: 38 PASS / 0 FAIL

### Suite 3: Kombinatorische Matrix (6 Dimensionen)
```bash
python3 tests/integration/reqa-v2.7.1-matrix.py
```
Erwartet: 93 PASS / 0 FAIL

### Suite 4: Use Case Tests (35 User-Szenarien)
```bash
python3 tests/integration/reqa-v2.7.1-usecases.py
```
Erwartet: 58 PASS / 0 FAIL

### Suite 5: Display-Tests (DOM-Prüfung)
**Umgebung:** Browser mit DOM-Kontext (NICHT Node.js)

```bash
# 1. Server starten + Testdaten anlegen:
python3 tests/display/setup-display-data.py

# 2. Im Browser http://localhost:3000 öffnen

# 3. Browser-Console öffnen (F12 → Console)

# 4. Inhalt von tests/display/run-display-tests.js kopieren und in die Console einfügen

# 5. Ergebnis wird in der Console angezeigt
```
Erwartet: 26 PASS / 0 FAIL

**Alternative:** Mit Puppeteer/Playwright (falls verfügbar):
```bash
# Nicht implementiert — Display-Tests sind aktuell nur via Browser-Console ausführbar
```

## Bekannte Einschränkungen
- `node_modules/` enthält native Binaries die architekturspezifisch sind (x86 vs arm64). IMMER `npm install` auf dem Zielsystem ausführen.
- Display-Tests brauchen einen echten Browser-DOM. Sie können NICHT mit `node` ausgeführt werden.
- T25d (Backup file path) ist ein bekannter Test-Timing-Bug — kein Produktfehler.

## v2.12.0 — Bryan-Feedback-Suiten (2026-06-10)

Voraussetzungen wie oben (Node >= 18, `npm install`, ggf. `npm rebuild better-sqlite3`).
Alle Suiten starten ihren EIGENEN isolierten Server mit frischer DB unter /tmp — kein manuelles Server-Setup nötig.

### Unit/API (kein Browser)
```bash
node scripts/test-v2120-bryan-feedback.cjs        # 24 Checks: 3 Hauptreports, pb_change_log, Swimmer-Card, CSVs
node scripts/test-m3-pointscore-unit.cjs          # 15 Checks (Regression)
node scripts/test-m3-slice2-reports-export.cjs    # 7 Checks (Regression; Version wird aus package.json gelesen)
node scripts/e2e-m3-pointscore-isolation.cjs      # Isolation PASS (Regression)
```

### Browser (puppeteer-core + Chrome, einmalig: `bash scripts/setup-m2-harness.sh`)
```bash
node scripts/e2e-v2120-bryan-feedback.cjs                                  # 10 Checks v2.12.0 UI
WWSC_E2E_EXPECTED_VERSION=2.12.0 node scripts/e2e-m2-time-history.cjs 2>&1 | tee /tmp/m3p-m2-55.log         # M2-55
WWSC_E2E_EXPECTED_VERSION=2.12.0 node scripts/e2e-m2-user-interaction-100.cjs 2>&1 | tee /tmp/m3p-m2-100.log # M2-100
WWSC_E2E_EXPECTED_VERSION=2.12.0 node scripts/e2e-m3-history-graphs.cjs    # Graph-Gate
WWSC_E2E_EXPECTED_VERSION=2.12.0 node scripts/e2e-m3-pointscore-120.cjs    # M3-120 — ALS LETZTES (prüft Frische der M2-Logs gegen HEAD)
```
WICHTIG: M3-120 (UIT-M3-111/112) liest die M2-Konsolen-Logs aus `/tmp/m3p-m2-55.log` und `/tmp/m3p-m2-100.log` und verlangt darin die `# Baseline ... commit=<HEAD>`-Zeile — deshalb die `tee`-Aufrufe oben, alles am selben Commit.
Bekannte Harness-Eigenheit (macOS): die M2-100-Suite kann ihren gespawnten Server als Orphan hinterlassen, der die stdout-Pipe offen hält (Suite-Evidence ist zu dem Zeitpunkt bereits vollständig geschrieben). Falls eine Pipe-Kette danach "hängt": verwaiste `node src/server.js`-Prozesse (PPID tot) killen — Ergebnisse bleiben gültig.

### Wochen-Seeder (Testdaten für Bryan, 7 Wochen Apr–Mai 2026)
```bash
# Lokal gegen eigenen Server:
BASE_URL=http://127.0.0.1:3000 node scripts/seed-bryan-weekly-events.cjs
# Live NUR mit Dino-Freigabe:
BASE_URL=https://wwsc-demo.onrender.com APPLY_LIVE=1 node scripts/seed-bryan-weekly-events.cjs
```
Verhalten: überspringt vorhandene Datums-Events, löscht nie, bricht ab wenn ein unfertiges Event existiert.
