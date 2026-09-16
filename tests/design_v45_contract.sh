#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INDEX="$ROOT/index.html"
STYLE="$ROOT/style.css"

grep -q 'class="platform-card windows-card"' "$INDEX"
grep -q 'class="platform-card macos-card"' "$INDEX"
grep -q 'class="platform-card linux-card"' "$INDEX"
grep -q 'class="linux-tux"' "$INDEX"
grep -q -- '--violet:' "$STYLE"
grep -q -- '--orange:' "$STYLE"
grep -q '.windows-card' "$STYLE"
grep -q '.macos-card' "$STYLE"
grep -q '.linux-card' "$STYLE"
grep -q '.news-featured' "$STYLE"
grep -q '.release-command-main' "$STYLE"

echo "DesignV45ContractTest: PASS"
