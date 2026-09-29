#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INDEX="$ROOT/index.html"
STYLE="$ROOT/style.css"
SCRIPT="$ROOT/script.js"
DISCORD='https://discord.gg/UvkevzwuWR'

fail(){ echo "NFLSiteContract: FAIL - $1"; exit 1; }

grep -qi 'NFL Item-Verleih' "$INDEX" || fail 'NFL title missing'
grep -qi 'OPSUCHT Minecraft Server' "$INDEX" || fail 'OPSUCHT context missing'
for id in start funktionen mitgliedschaften app discord; do
  grep -q "href=\"#$id\"" "$INDEX" || fail "nav target #$id missing"
done
grep -q "$DISCORD" "$INDEX" || fail 'Discord invite missing'
for term in 'Discord-Verifizierung' 'Inventar' 'Sets' 'One-Click' 'Rückgabe' 'Cooldown' 'Leihzeit' 'Bestand' 'Support'; do
  grep -qi "$term" "$INDEX" || fail "feature copy missing: $term"
done
for term in '4.000.000 \$' '4 Items' '90 Min' '20 Min' '6.500.000 \$' '6 Items' '120 Min' '10 Min' '10.000.000 \$' '8 Items' '180 Min' '5 Min'; do
  grep -q "$term" "$INDEX" || fail "membership value missing: $term"
done
grep -qi 'Windows 10/11' "$INDEX" || fail 'Windows platform text missing'
grep -qi 'Coming Soon' "$INDEX" || fail 'Coming Soon state missing'
if grep -qE 'VELTRIX|VELTRIX-Setup|cosmetics\.html|account\.html|discord\.gg/(nzP6Hq2n2M|5WteV2B68C)' "$INDEX"; then
  fail 'legacy Veltrix content remains'
fi
grep -q 'href="datenschutz/"' "$INDEX" || fail 'project-safe Datenschutz footer link missing'
grep -q 'href="nutzungsbedingungen/"' "$INDEX" || fail 'project-safe terms footer link missing'
grep -q '@media' "$STYLE" || fail 'mobile breakpoint missing'
if grep -qiE '(href|src)="http://|url\([^)]*http://' "$INDEX" "$STYLE" "$SCRIPT"; then
  fail 'mixed-content URL found'
fi
if grep -qiE '\.(zip|exe)(["?#]|$)|releases/download' "$INDEX" "$SCRIPT"; then
  fail 'app section exposes a ZIP/EXE or release URL'
fi
grep -qi 'NFL Item-Verleih' "$ROOT/404.html" || fail 'NFL 404 branding missing'
if grep -qiE '<script[^>]*>.*(location|window\.location)|location\.href|window\.location' "$ROOT/404.html"; then fail '404 page still auto-redirects'; fi
grep -Eq 'href="(\./|/veltrix-client/)"' "$ROOT/404.html" || fail '404 home link missing'
grep -q 'Sitemap: https://gxcracks.github.io/veltrix-client/sitemap.xml' "$ROOT/robots.txt" || fail 'robots sitemap pointer missing'
grep -q '<loc>https://gxcracks.github.io/veltrix-client/</loc>' "$ROOT/sitemap.xml" || fail 'homepage sitemap entry missing'
count=$(grep -o '<loc>' "$ROOT/sitemap.xml" | wc -l | tr -d ' ')
[[ "$count" == "1" ]] || fail 'sitemap must contain homepage only'
if grep -qE 'datenschutz|nutzungsbedingungen' "$ROOT/sitemap.xml"; then fail 'legal pages must not be indexed in sitemap'; fi
grep -qi 'NFL Item-Verleih' "$ROOT/README.md" || fail 'README is not NFL branded'
if grep -qE 'VELTRIX-Setup|releases/download' "$ROOT/README.md"; then fail 'README still advertises legacy installer'; fi
grep -qi 'name:.*NFL Item-Verleih' "$ROOT/.github/workflows/pages.yml" || fail 'Pages workflow display name is not NFL branded'
echo 'NFLSiteContract: PASS'
