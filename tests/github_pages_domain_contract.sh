#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="https://gxcracks.github.io/veltrix-client/"
INSTALLER="https://github.com/GxCracks/veltrix-client/releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe"
SUPPORT="https://discord.gg/nzP6Hq2n2M"
OLD_SUPPORT="https://discord.gg/5WteV2B68C"
BRAND="assets/veltrix-brand.svg"
MARK="assets/veltrix-mark.svg"

bash "$ROOT/tests/design_v50_contract.sh"
bash "$ROOT/tests/site_contract.sh"
bash "$ROOT/tests/public_distribution_contract.sh"

if [[ -e "$ROOT/CNAME" ]]; then
  echo "CNAME must be absent when using the GitHub Pages project URL"
  exit 1
fi

grep -q "$SITE" "$ROOT/README.md"
grep -q "$INSTALLER" "$ROOT/README.md"
grep -q 'Sitemap: https://gxcracks.github.io/veltrix-client/sitemap.xml' "$ROOT/robots.txt"
grep -q '<loc>https://gxcracks.github.io/veltrix-client/</loc>' "$ROOT/sitemap.xml"
grep -q 'VELTRIX 0.8.2 is available' "$ROOT/news.json"
grep -q "$INSTALLER" "$ROOT/script.js"
if grep -Eq 'releases/download/v0\.8\.[01]/VELTRIX-Setup-0\.8\.[01]\.exe' "$ROOT/script.js"; then
  echo "Stale VELTRIX 0.8.0/0.8.1 installer link remains in script.js"
  exit 1
fi

# Branding assets must exist locally. JavaScript must not swap the logo at runtime.
test -f "$ROOT/$BRAND" || { echo "VELTRIX brand logo missing"; exit 1; }
test -f "$ROOT/$MARK" || { echo "VELTRIX brand mark missing"; exit 1; }
if grep -q "newLogoUrl\|setAttribute('src', newLogoUrl)" "$ROOT/script.js"; then
  echo "Legacy JavaScript logo swapping remains"
  exit 1
fi

# Support must go directly to the official VELTRIX Discord.
grep -q "$SUPPORT" "$ROOT/index.html"
if grep -q "$OLD_SUPPORT" "$ROOT/index.html"; then
  echo "Old VELTRIX Discord invite remains in homepage"
  exit 1
fi
if grep -q 'href="support.html"' "$ROOT/index.html"; then
  echo "Support still points to support.html instead of Discord"
  exit 1
fi

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
if grep -q "$OLD_SUPPORT" "$ROOT/_site/index.html"; then
  echo "Old VELTRIX Discord invite remains in built homepage"
  exit 1
fi
grep -q 'BETA / EARLY ACCESS — v0.8.2' "$ROOT/_site/index.html"
grep -q 'id="platforms"' "$ROOT/_site/index.html"
grep -q 'id="roadmap"' "$ROOT/_site/index.html"
grep -q 'id="community"' "$ROOT/_site/index.html"
grep -q "const base = '/veltrix-client'" "$ROOT/_site/404.html"

# Final Pages output must use the new direct brand assets and cache-busted CSS/JS.
test -f "$ROOT/_site/$BRAND" || { echo "Built site missing VELTRIX brand logo"; exit 1; }
test -f "$ROOT/_site/$MARK" || { echo "Built site missing VELTRIX brand mark"; exit 1; }
grep -q 'src="assets/veltrix-brand.svg"' "$ROOT/_site/index.html" || { echo "Built homepage does not use VELTRIX brand logo"; exit 1; }
grep -q 'href="assets/veltrix-mark.svg"' "$ROOT/_site/index.html" || { echo "Built homepage does not use VELTRIX brand mark"; exit 1; }
grep -q 'style.css?v=13' "$ROOT/_site/index.html"
grep -q 'script.js?v=13' "$ROOT/_site/index.html"
if grep -q "newLogoUrl\|setAttribute('src', newLogoUrl)" "$ROOT/_site/script.js"; then
  echo "Built JavaScript still swaps the logo at runtime"
  exit 1
fi

for icon in windows apple linux discord; do
  test -f "$ROOT/_site/assets/brands/${icon}.svg" || { echo "Built site missing ${icon}.svg"; exit 1; }
  grep -q "assets/brands/${icon}.svg" "$ROOT/_site/index.html" || { echo "Built homepage does not reference ${icon}.svg"; exit 1; }
done

if grep -R -q 'https://veltrixclient.de' "$ROOT/_site"; then
  echo "Old custom-domain URL remains in deployed site"
  exit 1
fi

echo 'GitHubPagesDomainContractTest: PASS'
