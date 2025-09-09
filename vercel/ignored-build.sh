#!/usr/bin/env bash
set -e

echo "== Vercel Ignored Build Step =="

# Első deploy: építsünk
if ! git rev-parse --verify HEAD^ >/dev/null 2>&1; then
  echo "No previous commit – proceed with build"
  exit 1
fi

# Építsünk, ha ezekben történt változás:
git diff --quiet HEAD^ HEAD -- \
  ./app \
  ./components ./lib ./hooks ./styles \
  ./package.json ./pnpm-lock.yaml ./yarn.lock ./package-lock.json \
  ./next.config.js ./next.config.ts ./next.config.mjs ./next.config.cjs \
  ./tsconfig.json \
  || { echo "Changes detected in build-critical paths – proceed with build"; exit 1; }

echo "No relevant changes – skip build"
exit 0