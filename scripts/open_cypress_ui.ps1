param(
    [string]$HostName = "localhost",
    [int]$Port = 8000,
    [int]$WaitSeconds = 20
)

$ErrorActionPreference = "Stop"

# Run migrations and seed (re-use your seed logic)
Write-Host "Running Django migrations..."
& python manage.py migrate --noinput

Write-Host "Seeding test data..."
# You can re-use the same seed block you used in run_cypress.ps1, or call a management command if you created one.
# For brevity assume your run_cypress already seeds; otherwise copy the seed python here.

# Start server in background
Write-Host ("Starting Django dev server on {0}:{1} ..." -f $HostName, $Port)
$serverProc = Start-Process -FilePath python -ArgumentList "manage.py", "runserver", ("{0}:{1}" -f $HostName, $Port) -NoNewWindow -PassThru

# Wait for server readiness
$deadline = (Get-Date).AddSeconds($WaitSeconds)
$ready = $false
while ((Get-Date) -lt $deadline) {
    try {
        Invoke-WebRequest -Uri ("http://{0}:{1}/" -f $HostName, $Port) -UseBasicParsing -TimeoutSec 2 | Out-Null
        $ready = $true; break
    } catch {
        Start-Sleep -Seconds 1
    }
}
if (-not $ready) {
    Write-Error "Server not ready in $WaitSeconds seconds. Exiting."
    if ($serverProc -and $serverProc.Id) { Stop-Process -Id $serverProc.Id -Force }
    exit 1
}

Write-Host "Opening Cypress Test Runner (interactive)..."
# Resolve local npx if present
$npxLocal = Join-Path $PWD "node_modules\.bin\npx"
if (Test-Path $npxLocal) {
    $npxCmd = $npxLocal
} else {
    $npxCmd = "npx"
}

# Launch Cypress UI
Start-Process -FilePath $npxCmd -ArgumentList "cypress", "open" -NoNewWindow