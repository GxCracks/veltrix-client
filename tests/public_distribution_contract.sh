#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUBLIC_ZIP="$ROOT/downloads/VELTRIX-Client-0.8.0-Windows.zip"

test -f "$PUBLIC_ZIP"

python3 - "$PUBLIC_ZIP" <<'PY'
import sys, zipfile
zp = sys.argv[1]
with zipfile.ZipFile(zp) as z:
    names = [n.lower() for n in z.namelist() if not n.endswith('/')]
    forbidden = [
        '/src/', '/docs/', '/tests/', '/installer/', '/launcher/',
        'build.gradle', 'settings.gradle', 'gradle.properties',
        'build-client-core', '.java', '.md'
    ]
    for name in names:
        for token in forbidden:
            if token in name:
                raise SystemExit(f"Forbidden public file: {name}")
    required = [
        'veltrix-client-0.8.0/veltrix-launcher-0.8.0.jar',
        'veltrix-client-0.8.0/start-veltrix.bat',
        'veltrix-client-0.8.0/readme.txt',
    ]
    for req in required:
        if req not in names:
            raise SystemExit(f"Missing public file: {req}")
print("Public package contents: PASS")
PY

grep -q 'releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe' "$ROOT/index.html"
if grep -q 'href="downloads/VELTRIX-Client-0.8.0-Windows.zip"' "$ROOT/index.html"; then
  echo "Homepage must not expose the ZIP as the primary Windows download"
  exit 1
fi
if grep -q 'VELTRIX-Client-0.8.0-portable.zip' "$ROOT/index.html"; then
  echo "Homepage still links the old development archive"
  exit 1
fi

echo "PublicDistributionContractTest: PASS"
