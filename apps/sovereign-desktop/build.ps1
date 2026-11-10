param(
    [string]$Channel = 'stable',
    [string]$CertThumbprint = '',
    [string]$Version = '0.1.0'
)

$ErrorActionPreference = 'Stop'

Write-Host 'Building Sovereign Desktop MSIX...' -ForegroundColor Cyan

# Set paths
$ProjectRoot = '/apps/sovereign-desktop'
$UiPath = '/ui'
$BinPath = '/bin'
$OutPath = '/target/release/bundle/msix'
$FinalOut = '/dist'

# Create dist directory
if (-not (Test-Path $FinalOut)) {
    New-Item -ItemType Directory -Path $FinalOut | Out-Null
}

# 1. Build UI
Write-Host 'Building UI...' -ForegroundColor Yellow
Set-Location $UiPath
bun install
bun run build
if ($LASTEXITCODE -ne 0) { throw 'UI build failed' }

# 2. Build Rust (release)
Write-Host 'Building Rust...' -ForegroundColor Yellow
Set-Location $ProjectRoot
cargo build --release
if ($LASTEXITCODE -ne 0) { throw 'Rust build failed' }

# 3. Build sidecars
Write-Host 'Building sidecars...' -ForegroundColor Yellow
# git-engine
if (Test-Path '/../../services/git-engine') {
    Set-Location '/../../services/git-engine'
    bun install
    bun build --compile --minify --outfile '/git-engine.exe' src/index.ts
    if ($LASTEXITCODE -ne 0) { throw 'git-engine build failed' }
}

# arsy
if (Test-Path '/../../services/arsy') {
    Set-Location '/../../services/arsy'
    cargo build --release --bin arsy
    Copy-Item 'target/release/arsy.exe' '/arsy.exe' -Force
}

# legend
if (Test-Path '/../../services/legend') {
    Set-Location '/../../services/legend'
    cargo build --release --bin legend
    Copy-Item 'target/release/legend.exe' '/legend.exe' -Force
}

# pocketbase (download prebuilt)
$PbUrl = 'https://github.com/pocketbase/pocketbase/releases/download/v0.21.0/pocketbase_0.21.0_windows_amd64.zip'
$PbZip = '/pocketbase.zip'
Invoke-WebRequest -Uri $PbUrl -OutFile $PbZip
Expand-Archive -Path $PbZip -DestinationPath $BinPath -Force
Remove-Item $PbZip
Rename-Item '/pocketbase.exe' '/pocketbase.exe' -Force

# radius
if (Test-Path '/../../services/radius') {
    Set-Location '/../../services/radius'
    cargo build --release --bin radius
    Copy-Item 'target/release/radius.exe' '/radius.exe' -Force
}

# 4. Create MSIX package using makeappx
Write-Host 'Creating MSIX package...' -ForegroundColor Yellow
Set-Location $ProjectRoot

$AppxManifest = @'
<?xml version="1.0" encoding="utf-8"?>
<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
         xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
         xmlns:desktop="http://schemas.microsoft.com/appx/manifest/desktop/windows10"
         xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities">
  <Identity Name="Sovereign.Desktop" Version="$Version.0" Publisher="CN=Sovereign" ProcessorArchitecture="x64" />
  <Properties>
    <DisplayName>Sovereign Desktop</DisplayName>
    <PublisherDisplayName>Sovereign Team</PublisherDisplayName>
    <Description>Sovereign Desktop - Offline-first Windows control surface</Description>
    <Logo>Assets\StoreLogo.png</Logo>
  </Properties>
  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.17763.0" MaxVersionTested="10.0.22621.0" />
  </Dependencies>
  <Resources>
    <Resource Language="en-us" />
  </Resources>
  <Applications>
    <Application Id="SovereignDesktop" Executable="sovereign-desktop.exe" EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements DisplayName="Sovereign Desktop" Square150x150Logo="Assets\Square150x150Logo.png" Square44x44Logo="Assets\Square44x44Logo.png" Description="Sovereign Desktop" BackgroundColor="#0f172a">
        <uap:DefaultTile Wide310x150Logo="Assets\Wide310x150Logo.png" Square310x310Logo="Assets\Square310x310Logo.png" />
      </uap:VisualElements>
      <Extensions>
        <desktop:Extension Category="windows.fullTrustProcess" Executable="bin/git-engine.exe" EntryPoint="Windows.FullTrustApplication">
          <desktop:FullTrustProcess>
            <desktop:ParameterGroup GroupId="GitEngine" Parameters="--port 3200" />
          </desktop:FullTrustProcess>
        </desktop:Extension>
        <desktop:Extension Category="windows.fullTrustProcess" Executable="bin/arsy.exe" EntryPoint="Windows.FullTrustApplication">
          <desktop:FullTrustProcess>
            <desktop:ParameterGroup GroupId="Arsy" Parameters="--port 4000" />
          </desktop:FullTrustProcess>
        </desktop:Extension>
        <desktop:Extension Category="windows.fullTrustProcess" Executable="bin/legend.exe" EntryPoint="Windows.FullTrustApplication">
          <desktop:FullTrustProcess>
            <desktop:ParameterGroup GroupId="Legend" Parameters="--port 8092" />
          </desktop:FullTrustProcess>
        </desktop:Extension>
        <desktop:Extension Category="windows.fullTrustProcess" Executable="bin/pocketbase.exe" EntryPoint="Windows.FullTrustApplication">
          <desktop:FullTrustProcess>
            <desktop:ParameterGroup GroupId="PocketBase" Parameters="--port 8091" />
          </desktop:FullTrustProcess>
        </desktop:Extension>
        <desktop:Extension Category="windows.fullTrustProcess" Executable="bin/radius.exe" EntryPoint="Windows.FullTrustApplication">
          <desktop:FullTrustProcess>
            <desktop:ParameterGroup GroupId="Radius" Parameters="--port 1812" />
          </desktop:FullTrustProcess>
        </desktop:Extension>
      </Extensions>
    </Application>
  </Applications>
  <Capabilities>
    <Capability Name="internetClient" />
    <Capability Name="internetClientServer" />
    <Capability Name="privateNetworkClientServer" />
    <rescap:Capability Name="runFullTrust" />
  </Capabilities>
</Package>
'@

$ManifestPath = '/Package.appxmanifest'
$AppxManifest | Set-Content -Path $ManifestPath -Encoding UTF8

# Copy assets
$AssetsPath = '/Assets'
if (-not (Test-Path $AssetsPath)) {
    New-Item -ItemType Directory -Path $AssetsPath | Out-Null
}

# Prepare package directory
$PkgDir = '/pkg'
if (Test-Path $PkgDir) { Remove-Item $PkgDir -Recurse -Force }
New-Item -ItemType Directory -Path $PkgDir | Out-Null

# Copy files
Copy-Item '/target/release/sovereign-desktop.exe' '/' -Force
Copy-Item '/dist/*' '/' -Recurse -Force
Copy-Item '/*' '/bin/' -Recurse -Force
Copy-Item $ManifestPath '/' -Force
Copy-Item '/*' '/Assets/' -Recurse -Force

# Create MSIX
$MsixName = 'Sovereign.Desktop__x64.msix'
$MsixPath = '/'

& 'makeappx.exe' pack /d '' /p '' /l
if ($LASTEXITCODE -ne 0) { throw 'makeappx failed' }

# Sign MSIX
if ($CertThumbprint) {
    Write-Host 'Signing MSIX...' -ForegroundColor Yellow
    & 'signtool.exe' sign /fd SHA256 /a /sha1 $CertThumbprint /tr http://timestamp.digicert.com /td SHA256 ''
    if ($LASTEXITCODE -ne 0) { throw 'signtool failed' }
} else {
    Write-Host 'WARNING: No certificate thumbprint provided, MSIX not signed' -ForegroundColor Red
}

Write-Host 'MSIX created: $MsixPath' -ForegroundColor Green

# Generate Winget manifest
$WingetManifest = @'
PackageIdentifier: Sovereign.Desktop
PackageVersion: $Version
InstallerType: msix
Installers:
  - Architecture: x64
    InstallerUrl: https://github.com/sovereign/sovereign-desktop/releases/download/v$Version/$MsixName
    InstallerSha256: $(Get-FileHash -Algorithm SHA256 $MsixPath).Hash
    SignatureSha256: $(Get-FileHash -Algorithm SHA256 $MsixPath).Hash
    AppInstallerUrl: https://github.com/sovereign/sovereign-desktop/releases/latest/download/appinstaller.xml
'@

$WingetManifest | Set-Content -Path '/Sovereign.Desktop.yaml' -Encoding UTF8

Write-Host 'Build complete!' -ForegroundColor Cyan
Write-Host 'Output: $MsixPath' -ForegroundColor Cyan
Write-Host 'Winget manifest: $FinalOut/Sovereign.Desktop.yaml' -ForegroundColor Cyan
