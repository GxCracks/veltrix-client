#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="https://gxcracks.github.io/veltrix-client/"
INSTALLER="https://github.com/GxCracks/veltrix-client/releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe"
SUPPORT="https://discord.gg/5WteV2B68C"

if [[ -e "$ROOT/CNAME" ]]; then
  echo "CNAME must be absent when using the GitHub Pages project URL"
  exit 1
fi

grep -q "$SITE" "$ROOT/README.md"
grep -q "$INSTALLER" "$ROOT/README.md"
grep -q 'Sitemap: https://gxcracks.github.io/veltrix-client/sitemap.xml' "$ROOT/robots.txt"
grep -q '<loc>https://gxcracks.github.io/veltrix-client/</loc>' "$ROOT/sitemap.xml"
grep -q 'VELTRIX 0.8.2 is available' "$ROOT/news.json"
# Keep the runtime JavaScript on the same tested installer as the production build.
grep -q "$INSTALLER" "$ROOT/script.js"
if grep -Eq 'releases/download/v0\.8\.[01]/VELTRIX-Setup-0\.8\.[01]\.exe' "$ROOT/script.js"; then
  echo "Stale VELTRIX 0.8.0/0.8.1 installer link remains in script.js"
  exit 1
fi

# Support must go directly to the official VELTRIX Discord, never back to GitHub or an internal placeholder page.
grep -q "$SUPPORT" "$ROOT/index.html"
if grep -q 'href="support.html"' "$ROOT/index.html"; then
  echo "Support still points to support.html instead of Discord"
  exit 1
fi

# Platform and community actions use local brand SVG assets instead of placeholder glyphs.
for icon in windows apple linux discord; do
  test -f "$ROOT/assets/brands/${icon}.svg" || { echo "Missing local brand icon: ${icon}.svg"; exit 1; }
  grep -q "assets/brands/${icon}.svg" "$ROOT/index.html" || { echo "Homepage does not reference ${icon}.svg"; exit 1; }
done

if grep -Eq '<b>[⊞●△◉]</b>|<span class="discord-mark">◉</span>' "$ROOT/index.html"; then
  echo "Placeholder platform/community glyph remains in homepage"
  exit 1
fi

if grep -R -q 'https://veltrixclient.de' "$ROOT/README.md" "$ROOT/robots.txt" "$ROOT/sitemap.xml" "$ROOT/news.json"; then
  echo "Old custom-domain URL remains in public configuration"
  exit 1
fi

python3 "$ROOT/scripts/build-site.py"

test ! -e "$ROOT/_site/CNAME"
grep -q '<link rel="canonical" href="https://gxcracks.github.io/veltrix-client/">' "$ROOT/_site/index.html"
grep -q 'https://gxcracks.github.io/veltrix-client/privacy.html' "$ROOT/_site/privacy.html"
grep -q "$INSTALLER" "$ROOT/_site/index.html"
grep -q "$INSTALLER" "$ROOT/_site/script.js"
grep -q "$SUPPORT" "$ROOT/_site/index.html"
grep -q 'VELTRIX Client 0.8.2' "$ROOT/_site/index.html"
grep -q "const base = '/veltrix-client'" "$ROOT/_site/404.html"
for icon in windows apple linux discord; do
  test -f "$ROOT/_site/assets/brands/${icon}.svg" || { echo "Built site missing ${icon}.svg"; exit 1; }
  grep -q "assets/brands/${icon}.svg" "$ROOT/_site/index.html" || { echo "Built homepage does not reference ${icon}.svg"; exit 1; }
done

if grep -R -q 'https://veltrixclient.de' "$ROOT/_site"; then
  echo "Old custom-domain URL remains in deployed site"
  exit 1
fi

echo 'GitHubPagesDomainContractTest: PASS'
