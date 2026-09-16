#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
fail(){ echo "FAIL: $1"; exit 1; }
grep -q 'id="why-veltrix"' index.html || fail "Why VELTRIX section missing"
grep -q 'class="news-featured"' index.html || fail "Featured news layout missing"
grep -q 'DOWNLOAD VELTRIX 0.8.0' index.html || fail "Primary download CTA missing"
if grep -q 'id="authentication"' index.html; then fail "Authentication section must not be on homepage"; fi
if grep -q 'Microsoft OAuth → Xbox Live → XSTS' index.html; then fail "Detailed auth chain must not be on homepage"; fi
grep -q 'news.json' script.js || fail "Dynamic news feed missing"
test -f downloads/VELTRIX-Client-0.8.0-Windows.zip || fail "Portable download missing"
echo "site_v4_contract: PASS"
