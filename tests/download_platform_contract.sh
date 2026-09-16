#!/usr/bin/env bash
set -euo pipefail
INDEX="$(cd "$(dirname "$0")/.." && pwd)/index.html"
grep -q 'id="download-platform-modal"' "$INDEX"
grep -q 'Download for Windows' "$INDEX"
grep -q 'macOS' "$INDEX"
grep -q 'Coming soon' "$INDEX"
grep -q 'VELTRIX-Client-0.8.0-Windows.zip' "$INDEX"
! grep -q 'href="downloads/.*mac' "$INDEX"
echo 'DownloadPlatformContractTest: PASS'
