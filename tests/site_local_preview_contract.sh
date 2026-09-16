#!/usr/bin/env bash
set -euo pipefail
INDEX="$(cd "$(dirname "$0")/.." && pwd)/index.html"

grep -q '<style id="inline-critical-css">' "$INDEX"
grep -q 'data:image/' "$INDEX"
grep -q 'window.location.protocol === "file:"' "$INDEX"
grep -q 'ZIP vollständig entpacken' "$INDEX"
grep -q '<script id="inline-app-script">' "$INDEX"

echo "LocalPreviewContractTest: PASS"
