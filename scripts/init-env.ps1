$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)
if (Test-Path ".env") {
  Write-Host ".env already exists; leaving it unchanged."
  return
}
Copy-Item ".env.example" ".env"
$pepperBytes = New-Object byte[] 32
$passwordBytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($pepperBytes)
$rng.GetBytes($passwordBytes)
$rng.Dispose()
$pepper = ([BitConverter]::ToString($pepperBytes)).Replace("-", "").ToLowerInvariant()
$password = [Convert]::ToBase64String($passwordBytes) + "Aa1!"
$content = Get-Content ".env" -Raw
$content = [regex]::Replace($content, "(?m)^TOKEN_PEPPER=.*$", "TOKEN_PEPPER=$pepper")
$content = [regex]::Replace($content, "(?m)^PB_SUPERUSER_PASSWORD=.*$", "PB_SUPERUSER_PASSWORD=$password")
[System.IO.File]::WriteAllText((Join-Path (Get-Location) ".env"), $content, [System.Text.UTF8Encoding]::new($false))
Write-Host "Created .env with generated local secrets. Keep it private and back it up securely." -ForegroundColor Green
Write-Host "PocketBase superuser: check PB_SUPERUSER_EMAIL and PB_SUPERUSER_PASSWORD in .env."
