#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
mkdir -p backups
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
ARCHIVE="backups/local-git-hq-${STAMP}.tar.gz"

restart_services() {
  docker compose start pocketbase git-engine >/dev/null 2>&1 || true
}
trap restart_services EXIT

echo "Stopping PocketBase and Git Engine for a consistent filesystem backup..."
docker compose stop git-engine pocketbase

tar -czf "$ARCHIVE" data/pocketbase data/git

echo "Backup created: $ARCHIVE"
echo "Keep the matching .env/TOKEN_PEPPER in a separate secure location."
