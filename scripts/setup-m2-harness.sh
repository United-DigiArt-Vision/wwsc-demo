#!/usr/bin/env bash
# WWSC M2 Time History — test harness bootstrap.
#
# Prerequisites assumed:
#   - macOS with Google Chrome at /Applications/Google Chrome.app
#   - Node.js >= 18 on PATH
#   - npm cache writable (uses /tmp/wwsc-npm-cache to avoid host cache permission issues)
#
# What this script does:
#   1. Ensures puppeteer-core is available at /tmp/wwsc-screenshot-tool so the
#      runner can require it. (Override via WWSC_PUPPETEER_CORE env var.)
#   2. Rebuilds the better-sqlite3 native binding for the current architecture
#      if it is not loadable (typical symptom on Apple Silicon if the cached
#      build is x86_64).
#
# Idempotent: safe to re-run.
set -euo pipefail

HARNESS_DIR="${WWSC_HARNESS_DIR:-/tmp/wwsc-screenshot-tool}"
NPM_CACHE_DIR="${WWSC_NPM_CACHE:-/tmp/wwsc-npm-cache}"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> WWSC M2 harness setup"
echo "    Project root: $PROJECT_ROOT"
echo "    Harness dir:  $HARNESS_DIR"

# 1. puppeteer-core in the harness dir.
if [ -d "$HARNESS_DIR/node_modules/puppeteer-core" ]; then
  echo "    puppeteer-core already present at $HARNESS_DIR/node_modules/puppeteer-core"
else
  echo "    Installing puppeteer-core into $HARNESS_DIR (npm cache: $NPM_CACHE_DIR)"
  mkdir -p "$HARNESS_DIR"
  ( cd "$HARNESS_DIR" && npm init -y >/dev/null && npm install --no-audit --no-fund --cache "$NPM_CACHE_DIR" puppeteer-core >/dev/null )
  echo "    Installed puppeteer-core."
fi

# 2. better-sqlite3 native binding for current arch.
echo "==> Checking better-sqlite3 binding"
if ! ( cd "$PROJECT_ROOT" && node -e "require('better-sqlite3'); console.log('ok')" >/dev/null 2>&1 ); then
  echo "    better-sqlite3 not loadable — rebuilding for this architecture"
  ( cd "$PROJECT_ROOT" && npm rebuild better-sqlite3 )
else
  echo "    better-sqlite3 loads cleanly."
fi

echo "==> Harness ready."
echo "    Run: node scripts/e2e-m2-time-history.cjs"
