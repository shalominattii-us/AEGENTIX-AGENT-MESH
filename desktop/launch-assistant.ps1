<#
.SYNOPSIS
Launches the Aegentix Desktop Assistant (Cortana-Level Desktop Overlay).

.DESCRIPTION
Checks for Electron runtime. If Electron is present, launches the frameless floating HUD with global hotkey (Ctrl+Shift+Space).
If Electron is not yet installed, gracefully falls back to Windows Edge App Mode (--app) for an immediate zero-install HUD.
#>

param(
    [switch]$BrowserMode
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$htmlPath = Join-Path $scriptDir "ui\index.html"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  AEGENTIX DESKTOP ASSISTANT // CORTANA-STYLE HUD" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Check if Electron is installed in desktop or global
$electronLocal = Join-Path $scriptDir "node_modules\.bin\electron.cmd"
$electronInstalled = (Test-Path $electronLocal) -or (Get-Command "electron" -ErrorAction SilentlyContinue)

if ($electronInstalled -and -not $BrowserMode) {
    Write-Host "[OK] Launching Aegentix Assistant via Electron Native Runtime..." -ForegroundColor Green
    Write-Host "  Hotkey: Ctrl+Shift+Space (or Alt+Space) to summon/hide." -ForegroundColor Yellow
    if (Test-Path $electronLocal) {
        & $electronLocal $scriptDir
    } else {
        electron $scriptDir
    }
} else {
    Write-Host "[INFO] Launching in Zero-Install Windows App Mode..." -ForegroundColor Yellow
    Write-Host "  Window: Frameless standalone HUD overlay." -ForegroundColor Gray
    
    $edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if (-not (Test-Path $edgePath)) {
        $edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    }

    if (Test-Path $edgePath) {
        $fileUri = "file:///" + ($htmlPath -replace '\\', '/')
        Start-Process -FilePath $edgePath -ArgumentList "--app=`"$fileUri`"", "--window-size=440,640", "--window-position=1400,380"
        Write-Host "[SUCCESS] Aegentix Desktop Assistant HUD launched." -ForegroundColor Green
    } else {
        Start-Process $htmlPath
    }
}
