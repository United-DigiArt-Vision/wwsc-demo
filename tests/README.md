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
