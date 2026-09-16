#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
fail(){ echo "FAIL: $1" >&2; exit 1; }
[[ -f index.html ]] || fail "index.html missing"
[[ -f privacy.html ]] || fail "privacy.html missing"
[[ -f style.css ]] || fail "style.css missing"
[[ -f script.js ]] || fail "script.js missing"
[[ -f assets/veltrix-logo.png ]] || fail "logo missing"
[[ -f .github/workflows/pages.yml ]] || fail "Pages workflow missing"
[[ -f PUBLISH-GITHUB.bat ]] || fail "publish helper missing"
[[ -f publish-github.ps1 ]] || fail "PowerShell publish helper missing"

[[ -f news.json ]] || fail "news.json missing"
[[ -f downloads/VELTRIX-Client-0.8.0-Windows.zip ]] || fail "Windows client download missing"
grep -qi "DOWNLOAD VELTRIX 0.8.0" index.html || fail "download CTA missing"
grep -qi "LATEST NEWS" index.html || fail "news section missing"
grep -qi "news.json" script.js || fail "news feed loader missing"
grep -qi "VELTRIX" index.html || fail "VELTRIX branding missing"
grep -qi "independent" index.html || fail "independent project disclaimer missing"
grep -qi "not affiliated" index.html || fail "affiliation disclaimer missing"
grep -qi "privacy" index.html || fail "privacy link missing"
if grep -qi 'id="authentication"' index.html; then fail "technical auth section must not be on homepage"; fi
grep -qi "Microsoft OAuth" privacy.html || fail "privacy auth disclosure missing"
grep -qi "no analytics\|does not use analytics" privacy.html || fail "analytics statement missing"
grep -qi "github pages" README.md || fail "publishing docs missing"
echo "SiteContract: PASS"
