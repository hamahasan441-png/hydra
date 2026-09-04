#!/usr/bin/env bash
# HYDRA Omni Citadel 10.5.0-stark — one-shot local install
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

LIVE=0
for arg in "$@"; do
  case "$arg" in
    --live) LIVE=1 ;;
    -h|--help)
      echo "Usage: ./install.sh [--live]"
      echo "  --live   require XAI_API_KEY in .env.local"
      exit 0
      ;;
  esac
done

echo "==> HYDRA Omni Citadel 10.5.0-stark"
echo "==> cwd $ROOT"
echo "==> SeedGuard OFF · 40 classroom + magnet/stark fixtures · judge v10.5"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20+ is required. Install from https://nodejs.org and re-run."
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Node $NODE_MAJOR is too old. Use Node 20 or 22."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required."
  exit 1
fi

echo "==> node $(node -v)  npm $(npm -v)"
echo "==> installing node_modules"
npm install

if [ ! -f .env.local ] && [ ! -f .env ]; then
  cat > .env.local <<'EOF'
# Optional live hunt against grok-4.6
XAI_API_KEY=
EOF
  echo "==> wrote .env.local"
fi

if [ "$LIVE" = "1" ]; then
  KEY=""
  if [ -f .env.local ]; then
    KEY="$(grep -E '^XAI_API_KEY=' .env.local | cut -d= -f2- || true)"
  fi
  if [ -z "$KEY" ] && [ -f .env ]; then
    KEY="$(grep -E '^XAI_API_KEY=' .env | cut -d= -f2- || true)"
  fi
  if [ -z "$KEY" ]; then
    echo "LIVE mode: XAI_API_KEY is empty. Put a key in .env.local and re-run."
    exit 1
  fi
  echo "==> live key present"
fi

echo
echo "Install complete."
echo "  Dev UI:     npm run dev"
echo "  Tests:      npm test"
echo "  Typecheck:  npm run typecheck"
echo "Open http://127.0.0.1:8080"
echo "SeedGuard is OFF. Persona-only answers score red."
