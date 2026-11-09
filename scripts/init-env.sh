#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
if [[ -f .env ]]; then
  echo ".env already exists; leaving it unchanged."
  exit 0
fi
cp .env.example .env
if command -v openssl >/dev/null 2>&1; then
  pepper="$(openssl rand -hex 32)"
  password="$(openssl rand -base64 24 | tr -d '\n')Aa1!"
  sed -i.bak -E "s|^TOKEN_PEPPER=.*|TOKEN_PEPPER=${pepper}|" .env
  sed -i.bak -E "s|^PB_SUPERUSER_PASSWORD=.*|PB_SUPERUSER_PASSWORD=${password}|" .env
  rm -f .env.bak
else
  echo "OpenSSL not found. Generate TOKEN_PEPPER manually with: openssl rand -hex 32"
fi
echo "Created .env with generated local secrets. Keep it private and back it up securely."
echo "PocketBase superuser: check PB_SUPERUSER_EMAIL and PB_SUPERUSER_PASSWORD in .env."
