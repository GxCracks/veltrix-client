#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/_site"
DISCORD='https://discord.gg/UvkevzwuWR'
fail(){ echo "GitHubPagesNFLContract: FAIL - $1"; exit 1; }

bash "$ROOT/tests/nfl_site_contract.sh"
bash "$ROOT/tests/nfl_legal_contract.sh"
SENTINEL="$ROOT/datenschutz/should-not-publish.txt"
trap 'rm -f "$SENTINEL"' EXIT
printf 'private test sentinel\n' > "$SENTINEL"
python3 "$ROOT/scripts/build-site.py"
test ! -e "$OUT/datenschutz/should-not-publish.txt" || fail "build copied a non-allowlisted legal-directory file"
rm -f "$SENTINEL"
trap - EXIT

for file in index.html style.css script.js 404.html robots.txt sitemap.xml .nojekyll assets/nfl-mark.svg datenschutz/index.html nutzungsbedingungen/index.html; do
  test -f "$OUT/$file" || fail "built site missing $file"
done
for legacy in privacy.html cosmetics.html cosmetics.js account.html account.js api.js news.json veltrix-config.js veltrix-extras.css; do
  test ! -e "$OUT/$legacy" || fail "legacy public file shipped: $legacy"
done
if grep -RnE 'VELTRIX|VELTRIX-Setup|discord\.gg/(nzP6Hq2n2M|5WteV2B68C)|DISCORD_BOT_TOKEN|DISCORD_CLIENT_SECRET|SESSION_SECRET|client_secret|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY' "$OUT"; then
  fail 'legacy brand/support or secret marker found in build'
fi
if grep -RniE '(href|src)="http://|url\([^)]*http://' "$OUT"; then fail 'mixed-content URL found in build'; fi
if grep -RniE 'releases/download|\.(zip|exe)(["?#]|$)' "$OUT/index.html" "$OUT/script.js"; then fail 'download/release link found while app is Coming Soon'; fi
grep -q "$DISCORD" "$OUT/index.html" || fail 'Discord missing from homepage build'
grep -q "$DISCORD" "$OUT/datenschutz/index.html" || fail 'Discord missing from privacy build'
grep -q "$DISCORD" "$OUT/nutzungsbedingungen/index.html" || fail 'Discord missing from terms build'
grep -q 'href="datenschutz/"' "$OUT/index.html" || fail 'project-relative privacy link missing'
grep -q 'href="nutzungsbedingungen/"' "$OUT/index.html" || fail 'project-relative terms link missing'
if grep -REq 'href="/(datenschutz|nutzungsbedingungen|assets|style\.css|script\.js)' "$OUT"; then fail 'site-root internal link would escape project base'; fi
echo 'GitHubPagesNFLContract: PASS'
