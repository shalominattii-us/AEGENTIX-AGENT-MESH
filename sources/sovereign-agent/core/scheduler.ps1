# === SOVEREIGN SCHEDULER v1.0 ===
# Creates Task Scheduler entries for all automation scripts
# Run once as admin. No .ps1 execution needed — direct paste.

$ErrorActionPreference = "Stop"
$python = (Get-Command python).Source
$core = "C:\Sovereign\AE-Hub\core"
$log = "C:\Sovereign\AE-Hub\logs"

function Remove-OldTask($name) {
    $t = Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue
    if ($t) {
        Unregister-ScheduledTask -TaskName $name -Confirm:$false
        Write-Host "[REMOVED] old task: $name" -ForegroundColor Yellow
    }
}

function New-SovereignTask($name, $script, $trigger) {
    $action = New-ScheduledTaskAction -Execute $python -Argument "$core\$script"
    $principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType S4U -RunLevel Highest
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    Register-ScheduledTask -TaskName $name -Action $action -Principal $principal -Trigger $trigger -Settings $settings -Force | Out-Null
    Write-Host "[CREATED] $name -> $script" -ForegroundColor Green
}

# Ensure log dir
New-Item -ItemType Directory -Path $log -Force | Out-Null

# GOVERNOR — every minute (persistent monitor)
Remove-OldTask "Sovereign_Governor"
$trigGov = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 1) -RepetitionDuration (New-TimeSpan -Days 9999)
New-SovereignTask "Sovereign_Governor" "GOVERNOR.py" $trigGov

# explorer_heal — at boot + every 30 min
Remove-OldTask "Sovereign_ExplorerHeal"
$trigEx1 = New-ScheduledTaskTrigger -AtLogOn
$trigEx2 = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(5) -RepetitionInterval (New-TimeSpan -Minutes 30) -RepetitionDuration (New-TimeSpan -Days 9999)
New-SovereignTask "Sovereign_ExplorerHeal" "explorer_heal.py" ($trigEx1, $trigEx2)

# memory_opt — every 15 min
Remove-OldTask "Sovereign_MemoryOpt"
$trigMem = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(2) -RepetitionInterval (New-TimeSpan -Minutes 15) -RepetitionDuration (New-TimeSpan -Days 9999)
New-SovereignTask "Sovereign_MemoryOpt" "memory_opt.py" $trigMem

# log_rotate — daily at 03:00
Remove-OldTask "Sovereign_LogRotate"
$trigLog = New-ScheduledTaskTrigger -Daily -At "03:00"
New-SovereignTask "Sovereign_LogRotate" "log_rotate.py" $trigLog

# bundlemit — every 4 hours
Remove-OldTask "Sovereign_Bundlemit"
$trigBun = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(10) -RepetitionInterval (New-TimeSpan -Hours 4) -RepetitionDuration (New-TimeSpan -Days 9999)
New-SovereignTask "Sovereign_Bundlemit" "bundlemit.py" $trigBun

Write-Host "`n[OK] ALL TASKS SCHEDULED. Verify with: Get-ScheduledTask | Where-Object { `$_.TaskName -like 'Sovereign_*' }" -ForegroundColor Cyan
