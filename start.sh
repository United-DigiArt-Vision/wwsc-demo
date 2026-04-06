#!/bin/bash
# ============================================
# WWSC Swimming App — Offizielles Start-Script
# ============================================
# DIESES Script ist der EINZIGE Weg die App zu starten.
# Es stellt sicher dass:
# 1. Wir im richtigen Repo sind (~/wwsc-demo)
# 2. Die aktuelle Version angezeigt wird
# 3. Der Port frei ist
# 4. Die DB existiert (sonst seed)
# ============================================

set -e

REPO_DIR="$HOME/wwsc-demo"
PORT=3000

echo "🏊 WWSC Swimming App — Start"
echo "==============================="

# 1. Sicherstellen dass wir im richtigen Verzeichnis sind
cd "$REPO_DIR"
echo "📁 Repo: $REPO_DIR"

# 2. Branch + Commit + Version anzeigen
BRANCH=$(git branch --show-current)
COMMIT=$(git log --oneline -1)
VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "UNBEKANNT")
echo "🌿 Branch: $BRANCH"
echo "📌 Commit: $COMMIT"
echo "🏷️  Version: $VERSION"
echo "==============================="

# 3. Port freimachen
if /usr/sbin/lsof -i :$PORT -t >/dev/null 2>&1; then
    echo "⚠️  Port $PORT belegt — wird beendet..."
    kill $(/usr/sbin/lsof -i :$PORT -t) 2>/dev/null || true
    sleep 2
fi

# 4. DB check
if [ ! -f wwsc.db ]; then
    echo "🗄️  Keine DB gefunden — seede..."
    node seed.js
fi

# 5. Starten
echo ""
echo "🚀 Server startet auf http://0.0.0.0:$PORT"
echo "🏷️  VERSION: $VERSION"
echo ""
node src/server.js
