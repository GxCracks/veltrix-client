#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PRIV="$ROOT/datenschutz/index.html"
TERMS="$ROOT/nutzungsbedingungen/index.html"
DISCORD='https://discord.gg/UvkevzwuWR'
fail(){ echo "NFLLegalContract: FAIL - $1"; exit 1; }

for file in "$PRIV" "$TERMS"; do
  test -f "$file" || fail "missing $file"
  grep -qi 'NFL Item-Verleih' "$file" || fail "NFL brand missing in $file"
  grep -q 'name="robots" content="noindex,nofollow,noarchive"' "$file" || fail "noindex directive missing in $file"
  grep -q "$DISCORD" "$file" || fail "Discord support link missing in $file"
  grep -q 'href="../"' "$file" || fail "project-relative home link missing in $file"
  if grep -qE 'VELTRIX|VELTRIX-Setup|discord\.gg/(nzP6Hq2n2M|5WteV2B68C)' "$file"; then fail "legacy content in $file"; fi
  if grep -qiE '(href|src)="http://' "$file"; then fail "mixed-content URL in $file"; fi
done

for term in 'Discord OAuth' 'Discord-ID' 'Benutzername' 'Avatar' 'Servermitgliedschaft' 'Rollenprüfung' 'Minecraft-Name' 'Mitgliedschaft' 'Ausleih' 'Sets' 'Regel' 'Sitzungsdaten' 'Discord-Passwörter'; do
  grep -qi "$term" "$PRIV" || fail "privacy topic missing: $term"
done
for term in 'OPSUCHT' 'Mitglied' 'Leih' 'Rückgabe' 'Cooldown' 'Missbrauch' 'Sperr' 'Discord-Verifizierung' 'Verlust' 'Regel' 'Support'; do
  grep -qi "$term" "$TERMS" || fail "terms topic missing: $term"
done
grep -q '4.000.000 \$' "$TERMS" || fail 'member price missing'
grep -q '6.500.000 \$' "$TERMS" || fail 'member+ price missing'
grep -q '10.000.000 \$' "$TERMS" || fail 'VIP price missing'
echo 'NFLLegalContract: PASS'
