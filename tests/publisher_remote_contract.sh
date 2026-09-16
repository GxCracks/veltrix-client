#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PS="$ROOT/publish-github.ps1"

grep -q '\$remotes = @(git remote)' "$PS"
grep -q "git remote add origin" "$PS"
grep -q "git remote set-url origin" "$PS"
if grep -q 'git remote get-url origin 2>\$null' "$PS"; then
  echo 'Publisher still probes a missing origin with get-url under ErrorActionPreference=Stop'
  exit 1
fi
if test -d "$ROOT/.git"; then
  echo '.git directory must not ship in the website package'
  exit 1
fi

echo 'PublisherRemoteContractTest: PASS'
