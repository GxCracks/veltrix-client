#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

for file in cosmetics.html cosmetics.js account.html account.js api.js veltrix-config.js veltrix-extras.css; do
  test -f "$ROOT/$file" || { echo "Missing $file"; exit 1; }
done

grep -q 'veltrix-intro' "$ROOT/script.js"
grep -q 'veltrix_intro_seen' "$ROOT/script.js"
grep -q 'cosmetics.html' "$ROOT/script.js"
grep -q 'Enter VELTRIX website' "$ROOT/script.js"
grep -q 'sessionStorage.setItem(INTRO_KEY' "$ROOT/script.js"
grep -q 'prefers-reduced-motion' "$ROOT/veltrix-extras.css"
grep -q 'VELTRIX COSMETICS' "$ROOT/cosmetics.html"
grep -q 'veltrix_dragon' "$ROOT/cosmetics.js"
grep -q 'COMING SOON' "$ROOT/cosmetics.html"
grep -q 'Search cosmetics' "$ROOT/cosmetics.html"
grep -q 'My Cosmetics' "$ROOT/account.html"
grep -q 'pollLoginStatus' "$ROOT/cosmetics.js"
grep -q '/complete' "$ROOT/cosmetics.js"
grep -q '/api/cosmetics/equip' "$ROOT/account.js"
grep -q '/api/cosmetics/unequip' "$ROOT/account.js"
grep -q '/api/web-session/logout' "$ROOT/account.js"

if grep -Eq 'BUY NOW[^<]*</button>|data-action="purchase"' "$ROOT/cosmetics.html"; then
  echo "Beta 1 must not expose an active checkout action"
  exit 1
fi

echo 'CosmeticsContractTest: PASS'
