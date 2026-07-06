# Ω SOVEREIGN WORKSTATION LAUNCHER — AEG-576414
# Auto-starts immersive dashboard on boot/login
# Run once as admin to register startup task, or run manually each session

$ErrorActionPreference = "Stop"
$dashPath = "C:\Sovereign\AE-Hub\dashboard\workstation.html"

function Test-Browser($name) {
    $paths = @(
        "C:\Program Files\Google\Chrome\Application\$name.exe",
        "C:\Program Files (x86)\Google\Chrome\Application\$name.exe",
        "C:\Program Files\Microsoft\Edge\Application\$name.exe",
        "C:\Program Files (x86)\Microsoft\Edge\Application\$name.exe"
    )
    foreach ($p in $paths) {
        if (Test-Path $p) { return $p }
    }
    return $null
}

function Start-Workstation {
    Write-Host "[Ω] LAUNCHING SOVEREIGN WORKSTATION..." -ForegroundColor Cyan
    
    # Find browser
    $chrome = Test-Browser "chrome"
    $edge = Test-Browser "msedge"
    $browser = if ($chrome) { $chrome } elseif ($edge) { $edge } else { $null }
    
    if (-not $browser) {
        Write-Host "[Ω] No Chrome/Edge found — opening default browser" -ForegroundColor Yellow
        Start-Process $dashPath
        return
    }
    
    Write-Host "[Ω] Browser: $browser" -ForegroundColor Cyan
    
    # Launch kiosk mode
    $args = @(
        "--kiosk",
        "--incognito",
        "--disable-features=TranslateUI",
        "--no-first-run",
        "--noerrdialogs",
        "--disable-infobars",
        "--start-fullscreen",
        $dashPath
    )
    
    Start-Process -FilePath $browser -ArgumentList $args
    Write-Host "[ΩΩ] WORKSTATION ACTIVE — Press ESC to exit fullscreen" -ForegroundColor Green
    
    # Monitor and restart if crashed
    while ($true) {
        Start-Sleep 30
        $proc = Get-Process -Name "chrome","msedge" -ErrorAction SilentlyContinue | 
            Where-Object { $_.MainWindowTitle -like "*SOVEREIGN*" -or $_.CommandLine -like "*workstation.html*" }
        if (-not $proc) {
            Write-Host "[Ω] Browser lost — restarting..." -ForegroundColor Yellow
            Start-Process -FilePath $browser -ArgumentList $args
        }
    }
}

function Register-Startup {
    # Add to user's startup folder
    $startup = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
    $shortcut = "$startup\Sovereign Workstation.lnk"
    
    $WshShell = New-Object -ComObject WScript.Shell
    $lnk = $WshShell.CreateShortcut($shortcut)
    $lnk.TargetPath = "powershell.exe"
    $lnk.Arguments = "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"C:\Sovereign\AE-Hub\core\launch_workstation.ps1`""
    $lnk.WorkingDirectory = "C:\Sovereign\AE-Hub\core"
    $lnk.IconLocation = "C:\Sovereign\AE-Hub\core\AEGENTIS_BRAIN.py,0"
    $lnk.Save()
    
    Write-Host "[ΩΩ] Registered startup: $shortcut" -ForegroundColor Green
}

# Main
if ($args -contains "-register") {
    Register-Startup
} else {
    Start-Workstation
}
