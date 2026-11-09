$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)
& ./scripts/init-env.ps1
docker compose up -d --build pocketbase git-engine
Write-Host "Infrastructure started." -ForegroundColor Green
Write-Host 'Create the PocketBase superuser once:'
Write-Host "docker compose exec pocketbase sh -lc '/pb/pocketbase superuser create `$PB_SUPERUSER_EMAIL `$PB_SUPERUSER_PASSWORD'"
Write-Host "After creating the superuser, run: docker compose restart git-engine"
Write-Host "Then run: bun install; bun run dev"
