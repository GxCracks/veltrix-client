#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

test "$(cat "$ROOT/CNAME" 2>/dev/null || true)" = "veltrixclient.de"
grep -q '185.199.108.153' "$ROOT/DOMAIN-SETUP.md"
grep -q '185.199.111.153' "$ROOT/DOMAIN-SETUP.md"
grep -q '2606:50c0:8000::153' "$ROOT/DOMAIN-SETUP.md"
grep -q '2606:50c0:8003::153' "$ROOT/DOMAIN-SETUP.md"
grep -q 'gxcracks.github.io' "$ROOT/DOMAIN-SETUP.md"
grep -q 'veltrixclient.de' "$ROOT/robots.txt"
grep -q 'https://veltrixclient.de/' "$ROOT/sitemap.xml"
grep -q 'python3 scripts/build-site.py' "$ROOT/.github/workflows/pages.yml"
grep -q 'path: _site' "$ROOT/.github/workflows/pages.yml"
grep -q 'Production:' "$ROOT/README.md"
grep -q 'https://veltrixclient.de' "$ROOT/README.md"

python3 "$ROOT/scripts/build-site.py"
grep -q 'https://veltrixclient.de/' "$ROOT/_site/index.html"
grep -q 'rel="canonical"' "$ROOT/_site/index.html"
grep -q 'https://veltrixclient.de/privacy.html' "$ROOT/_site/privacy.html"
test "$(cat "$ROOT/_site/CNAME")" = "veltrixclient.de"

if grep -RIn -E '(href|src)="/veltrix-client/|url\(/veltrix-client/' "$ROOT/_site/index.html" "$ROOT/_site/privacy.html" "$ROOT/_site/style.css" "$ROOT/_site/script.js"; then
  echo 'Repository-name base path remains in deployed runtime asset references'
  exit 1
fi

echo 'CustomDomainContractTest: PASS'
