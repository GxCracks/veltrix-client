#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INDEX="$ROOT/index.html"
STYLE="$ROOT/style.css"
SCRIPT="$ROOT/script.js"

for id in why-veltrix launcher-showcase platforms compatibility roadmap news download community; do
  grep -q "id=\"$id\"" "$INDEX" || { echo "Missing redesign section: $id"; exit 1; }
done

grep -q 'ONE CLIENT' "$INDEX"
grep -q 'MANY VERSIONS' "$INDEX"
grep -q 'BETA / EARLY ACCESS — v0.8.2' "$INDEX"
grep -q 'Beta available' "$INDEX"
grep -q 'macOS' "$INDEX"
grep -q 'Linux' "$INDEX"
grep -q 'Coming Soon' "$INDEX"
grep -q 'Available' "$INDEX"
grep -q 'Testing' "$INDEX"
grep -q 'Planned' "$INDEX"
grep -q 'https://discord.gg/5WteV2B68C' "$INDEX"
grep -q 'releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe' "$INDEX"

grep -q 'class="header-download"' "$INDEX"
grep -q 'class="hero-primary"' "$INDEX"
grep -q 'class="hero-trust"' "$INDEX"
grep -q 'href="#platforms"' "$INDEX"
grep -q 'href="#roadmap"' "$INDEX"
grep -q 'href="#community"' "$INDEX"

grep -q 'Performance' "$INDEX"
grep -q 'Multi-Version Support' "$INDEX"
grep -q 'Modern Launcher' "$INDEX"
grep -q 'Microsoft Login' "$INDEX"
grep -q 'Mods & Customization' "$INDEX"
grep -q 'Community Driven' "$INDEX"
grep -q 'assets/launcher-live.svg' "$INDEX"
grep -q 'Windows Beta' "$INDEX"
grep -q 'Minecraft Java Edition' "$INDEX"
grep -q 'Fabric' "$INDEX"

grep -q 'id="news-grid"' "$INDEX"
grep -Eq 'class="[^"]*download-panel([ "\t]|$)' "$INDEX"
grep -Eq 'class="[^"]*community-panel([ "\t]|$)' "$INDEX"
grep -q 'Support' "$INDEX"
grep -q 'Bug Reports' "$INDEX"
grep -q 'Updates' "$INDEX"
grep -q 'Community' "$INDEX"
grep -qi 'not affiliated' "$INDEX"

for icon in windows apple linux discord; do
  test -f "$ROOT/assets/brands/${icon}.svg" || { echo "Missing local brand icon: ${icon}.svg"; exit 1; }
  grep -q "assets/brands/${icon}.svg" "$INDEX" || { echo "Homepage does not reference ${icon}.svg"; exit 1; }
done

# Coming-soon platform controls must not be downloadable links.
if grep -Eq '<a[^>]+(macOS|Linux)[^>]*>.*Coming Soon|<a[^>]+>[^<]*(macOS|Linux)[^<]*Coming Soon' "$INDEX"; then
  echo "Coming Soon platform rendered as active link"
  exit 1
fi

for selector in '.section-heading' '.why-grid' '.showcase-grid' '.platform-grid' '.roadmap-grid' '.download-panel' '.community-panel'; do
  grep -Fq "$selector" "$STYLE" || { echo "Missing redesign style: $selector"; exit 1; }
done

grep -q '@media (max-width:' "$STYLE"
grep -q 'prefers-reduced-motion' "$STYLE"
grep -q 'focus-visible' "$STYLE"

grep -q "const windowsInstallerUrl = 'https://github.com/GxCracks/veltrix-client/releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe'" "$SCRIPT"
grep -q "document.getElementById('news-grid')" "$SCRIPT"
grep -q "News temporarily unavailable" "$SCRIPT"
grep -q "prefers-reduced-motion" "$SCRIPT"

echo 'DesignV50ContractTest: PASS'
