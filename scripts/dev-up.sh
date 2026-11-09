#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
bash ./scripts/init-env.sh
docker compose up -d --build pocketbase git-engine
cat <<'EOF'
Infrastructure started.
Create the PocketBase superuser once, using the values in .env:
  docker compose exec pocketbase sh -lc '/pb/pocketbase superuser create "$PB_SUPERUSER_EMAIL" "$PB_SUPERUSER_PASSWORD"'
Then run:
  bun install && bun run dev
EOF
