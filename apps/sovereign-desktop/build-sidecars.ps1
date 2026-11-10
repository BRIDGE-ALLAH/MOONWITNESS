# build-sidecars.ps1 - Build all sidecar binaries for Sovereign Desktop
param(
    [string]$Configuration = "release"
)

$ErrorActionPreference = "Stop"

Write-Host "Building Sovereign Desktop sidecars..." -ForegroundColor Cyan

$RepoRoot = "Z:\repo\dx"
$SidecarBinPath = "$PSScriptRoot\bin"

# Ensure bin directory exists
if (-not (Test-Path $SidecarBinPath)) {
    New-Item -ItemType Directory -Path $SidecarBinPath | Out-Null
}

# 1. Build git-engine (Bun/TypeScript)
Write-Host "Building git-engine..." -ForegroundColor Yellow
if (Test-Path "$RepoRoot\services\git-engine") {
    Set-Location "$RepoRoot\services\git-engine"
    if (-not (Test-Path "node_modules")) { bun install }
    bun build --compile --minify --outfile "$SidecarBinPath\git-engine.exe" src/index.ts
    if ($LASTEXITCODE -ne 0) { throw "git-engine build failed" }
    Write-Host "git-engine built successfully" -ForegroundColor Green
} else {
    Write-Host "WARNING: git-engine not found at $RepoRoot\services\git-engine" -ForegroundColor Red
}

# 2. Build arsy (Bun/TypeScript)
Write-Host "Building arsy..." -ForegroundColor Yellow
if (Test-Path "$RepoRoot\services\arsy") {
    Set-Location "$RepoRoot\services\arsy"
    if (-not (Test-Path "node_modules")) { bun install }
    bun build --compile --minify --outfile "$SidecarBinPath\arsy.exe" src/index.ts
    if ($LASTEXITCODE -ne 0) { throw "arsy build failed" }
    Write-Host "arsy built successfully" -ForegroundColor Green
} else {
    Write-Host "WARNING: arsy not found at $RepoRoot\services\arsy" -ForegroundColor Red
}

# 3. Build legend (Rust)
Write-Host "Building legend..." -ForegroundColor Yellow
if (Test-Path "$RepoRoot\services\legend") {
    Set-Location "$RepoRoot\services\legend"
    cargo build --$Configuration --bin legend
    if ($LASTEXITCODE -ne 0) { throw "legend build failed" }
    Copy-Item "target\$Configuration\legend.exe" "$SidecarBinPath\legend.exe" -Force
    Write-Host "legend built successfully" -ForegroundColor Green
} else {
    Write-Host "WARNING: legend not found at $RepoRoot\services\legend" -ForegroundColor Red
}

# 4. Download pocketbase (prebuilt)
Write-Host "Downloading pocketbase..." -ForegroundColor Yellow
$PbVersion = "0.21.0"
$PbUrl = "https://github.com/pocketbase/pocketbase/releases/download/v$PbVersion/pocketbase_${PbVersion}_windows_amd64.zip"
$PbZip = "$SidecarBinPath\pocketbase.zip"
try {
    Invoke-WebRequest -Uri $PbUrl -OutFile $PbZip -UseBasicParsing
    Expand-Archive -Path $PbZip -DestinationPath $SidecarBinPath -Force
    Remove-Item $PbZip
    # Verify binary exists
    if (Test-Path "$SidecarBinPath\pocketbase.exe") {
        Write-Host "pocketbase downloaded successfully" -ForegroundColor Green
    } else {
        throw "pocketbase.exe not found after extraction"
    }
} catch {
    Write-Host "WARNING: Failed to download pocketbase: $_" -ForegroundColor Red
}

# 5. Build radius (Rust)
Write-Host "Building radius..." -ForegroundColor Yellow
if (Test-Path "$RepoRoot\services\radius") {
    Set-Location "$RepoRoot\services\radius"
    cargo build --$Configuration --bin radius
    if ($LASTEXITCODE -ne 0) { throw "radius build failed" }
    Copy-Item "target\$Configuration\radius.exe" "$SidecarBinPath\radius.exe" -Force
    Write-Host "radius built successfully" -ForegroundColor Green
} else {
    Write-Host "WARNING: radius not found at $RepoRoot\services\radius" -ForegroundColor Red
}

# Verify all binaries
Write-Host "`nVerifying sidecar binaries..." -ForegroundColor Cyan
$Binaries = @("git-engine.exe", "arsy.exe", "legend.exe", "pocketbase.exe", "radius.exe")
$AllOk = $true
foreach ($bin in $Binaries) {
    $path = "$SidecarBinPath\$bin"
    if (Test-Path $path) {
        $size = (Get-Item $path).Length
        Write-Host "  $bin - $size bytes" -ForegroundColor Green
        if ($size -lt 1000) {
            Write-Host "  WARNING: $bin seems too small ($size bytes), may be placeholder" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  $bin - MISSING" -ForegroundColor Red
        $AllOk = $false
    }
}

if ($AllOk) {
    Write-Host "`nAll sidecars built successfully!" -ForegroundColor Green
} else {
    Write-Host "`nSome sidecars missing!" -ForegroundColor Red
    exit 1
}

Write-Host "Sidecar build complete." -ForegroundColor Cyan

