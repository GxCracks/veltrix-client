#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="https://gxcracks.github.io/veltrix-client/"
INSTALLER="https://github.com/GxCracks/veltrix-client/releases/download/v0.8.1/VELTRIX-Setup-0.8.1.exe"

if [[ -e "$ROOT/CNAME" ]]; then
  echo "CNAME must be absent when using the GitHub Pages project URL"
  exit 1
fi

grep -q "$SITE" "$ROOT/README.md"
grep -q "$INSTALLER" "$ROOT/README.md"
grep -q 'Sitemap: https://gxcracks.github.io/veltrix-client/sitemap.xml' "$ROOT/robots.txt"
grep -q '<loc>https://gxcracks.github.io/veltrix-client/</loc>' "$ROOT/sitemap.xml"
grep -q 'VELTRIX 0.8.1 is available' "$ROOT/news.json"
grep -q 'releases/download/v0.8.1/VELTRIX-Setup-0.8.1.exe' "$ROOT/script.js"

if grep -R -q 'https://veltrixclient.de' "$ROOT/README.md" "$ROOT/robots.txt" "$ROOT/sitemap.xml" "$ROOT/news.json" "$ROOT/scripts/build-site.py"; then
  echo "Old custom-domain URL remains in public configuration"
  exit 1
fi

python3 "$ROOT/scripts/build-site.py"

test ! -e "$ROOT/_site/CNAME"
grep -q '<link rel="canonical" href="https://gxcracks.github.io/veltrix-client/">' "$ROOT/_site/index.html"
grep -q 'https://gxcracks.github.io/veltrix-client/privacy.html' "$ROOT/_site/privacy.html"
grep -q "$INSTALLER" "$ROOT/_site/index.html"
grep -q "$INSTALLER" "$ROOT/_site/script.js"
grep -q 'VELTRIX Client 0.8.1' "$ROOT/_site/index.html"
grep -q "const base = '/veltrix-client'" "$ROOT/_site/404.html"

if grep -R -q 'https://veltrixclient.de' "$ROOT/_site"; then
  echo "Old custom-domain URL remains in deployed site"
  exit 1
fi

echo 'GitHubPagesDomainContractTest: PASS'
