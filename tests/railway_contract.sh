#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

for file in Dockerfile railway.toml backend/.env.example; do
  test -f "$ROOT/$file" || { echo "Missing Railway deployment file: $file"; exit 1; }
done

grep -q 'FROM node:22' "$ROOT/Dockerfile" || { echo 'Dockerfile must use Node 22'; exit 1; }
grep -q 'COPY backend/package' "$ROOT/Dockerfile" || { echo 'Dockerfile must install backend dependencies'; exit 1; }
grep -q 'npm run build' "$ROOT/Dockerfile" || { echo 'Dockerfile must build TypeScript'; exit 1; }
grep -q 'npm run migrate' "$ROOT/Dockerfile" || { echo 'Dockerfile must run database migrations'; exit 1; }
grep -q 'npm start' "$ROOT/Dockerfile" || { echo 'Dockerfile must start the API'; exit 1; }
grep -q 'healthcheckPath = "/api/health"' "$ROOT/railway.toml" || { echo 'Railway health check missing'; exit 1; }
grep -q 'builder = "DOCKERFILE"' "$ROOT/railway.toml" || { echo 'Railway must use Dockerfile builder'; exit 1; }
grep -q 'NODE_ENV=production' "$ROOT/backend/.env.example" || { echo 'Production env example missing'; exit 1; }
grep -q 'CORS_ORIGIN=https://gxcracks.github.io' "$ROOT/backend/.env.example" || { echo 'GitHub Pages CORS origin missing'; exit 1; }

echo 'RailwayContractTest: PASS'
