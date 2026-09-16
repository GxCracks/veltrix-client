#!/usr/bin/env bash
set -euo pipefail
INDEX="$(cd "$(dirname "$0")/.." && pwd)/index.html"
grep -q 'id="download-platform-modal"' "$INDEX"
grep -q 'Install VELTRIX for Windows' "$INDEX"
grep -q 'macOS' "$INDEX"
grep -q 'Coming soon' "$INDEX"
grep -q 'releases/download/v0.8.0/VELTRIX-Setup-0.8.0.exe' "$INDEX"
! grep -q 'href="downloads/.*mac' "$INDEX"
echo 'DownloadPlatformContractTest: PASS'

if grep -q 'href="downloads/VELTRIX-Client-0.8.0-Windows.zip"' "$INDEX"; then echo 'Windows UI must not link ZIP'; exit 1; fi
