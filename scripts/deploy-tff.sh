#!/bin/bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT_DIR="$SCRIPT_DIR/.."
BUILD_DIR="$ROOT_DIR/../public-test"
TARGET_DIR="$ROOT_DIR/../tff-public"

cd "$ROOT_DIR"
npm run build

rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
cp -R "$BUILD_DIR/". "$TARGET_DIR/"

echo "TFF static build synced to $TARGET_DIR"
echo "Remember to run the companion API separately for submissions storage."
