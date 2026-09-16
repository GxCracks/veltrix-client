#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INDEX="$ROOT/index.html"

grep -q 'data-platform="windows"' "$INDEX"
grep -q 'data-platform="macos"' "$INDEX"
grep -q 'data-platform="linux"' "$INDEX"
grep -q 'Linux · Coming soon' "$INDEX"
grep -q '<span>CLIENT</span>' "$INDEX"
grep -q '<strong>VELTRIX Client</strong>' "$INDEX"

if grep -q '>Package<' "$INDEX"; then
  echo "Package card must be removed"
  exit 1
fi

if grep -q 'Portable ZIP' "$INDEX"; then
  echo "Portable ZIP must not be visible on homepage"
  exit 1
fi

echo "ReleaseV44ContractTest: PASS"
