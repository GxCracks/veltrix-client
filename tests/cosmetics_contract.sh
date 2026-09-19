#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

for file in cosmetics.html cosmetics.js account.html account.js api.js; do
  test -f "$ROOT/$file" || { echo "Missing $file"; exit 1; }
done

grep -q 'id="veltrix-intro"' "$ROOT/index.html"
grep -q 'veltrix_intro_seen' "$ROOT/script.js"
grep -q 'href="cosmetics.html"' "$ROOT/index.html"
grep -q 'VELTRIX COSMETICS' "$ROOT/cosmetics.html"
grep -q 'veltrix_dragon' "$ROOT/cosmetics.js"
grep -q 'COMING SOON' "$ROOT/cosmetics.html"
grep -q 'Search cosmetics' "$ROOT/cosmetics.html"
grep -q 'My Cosmetics' "$ROOT/account.html"

if grep -Eq 'BUY NOW[^<]*</button>|data-action="purchase"' "$ROOT/cosmetics.html"; then
  echo "Beta 1 must not expose an active checkout action"
  exit 1
fi

echo 'CosmeticsContractTest: PASS'
