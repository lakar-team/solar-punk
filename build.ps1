# build.ps1 — mirrors source to a local folder and builds there.
# Never run npm in the Google Drive project folder; this script is the safe path.

$projectDir = $PSScriptRoot
$buildDir   = "$env:LOCALAPPDATA\solar-punk-build"

Write-Host "==> Mirroring source to $buildDir ..."
robocopy $projectDir $buildDir /E /XD node_modules .next .git content /XF "*.log" /NFL /NDL /NJH /NJS | Out-Null

# Install or update dependencies only when package.json changed.
$pkgSrc  = Get-Item "$projectDir\package.json"
$pkgDst  = "$buildDir\package.json"
$nmExists = Test-Path "$buildDir\node_modules"

if (-not $nmExists) {
    Write-Host "==> node_modules missing — running npm install ..."
    Push-Location $buildDir
    npm install
    Pop-Location
    if ($LASTEXITCODE -ne 0) { Write-Host "npm install FAILED"; exit 1 }
} elseif ((Get-FileHash $pkgSrc.FullName).Hash -ne (Get-FileHash $pkgDst).Hash) {
    Write-Host "==> package.json changed — running npm install ..."
    Push-Location $buildDir
    npm install
    Pop-Location
    if ($LASTEXITCODE -ne 0) { Write-Host "npm install FAILED"; exit 1 }
} else {
    Write-Host "==> node_modules up to date, skipping install."
}

Write-Host "==> Building ..."
Push-Location $buildDir
npm run build
$exitCode = $LASTEXITCODE
Pop-Location

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "==> Build SUCCEEDED."
} else {
    Write-Host ""
    Write-Host "==> Build FAILED (exit $exitCode)."
    exit $exitCode
}
