$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)
New-Item -ItemType Directory -Force -Path "backups" | Out-Null
$stamp = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
$archive = Join-Path (Get-Location) "backups/local-git-hq-$stamp.zip"
$stopped = $false
try {
  docker compose stop git-engine pocketbase
  $stopped = $true
  Compress-Archive -Path "data/pocketbase", "data/git" -DestinationPath $archive -CompressionLevel Optimal
  Write-Host "Backup created: $archive" -ForegroundColor Green
  Write-Host "Keep the matching .env/TOKEN_PEPPER in a separate secure location."
} finally {
  if ($stopped) { docker compose start pocketbase git-engine | Out-Null }
}
