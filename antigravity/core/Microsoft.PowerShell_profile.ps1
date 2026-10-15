# ============================================================
# AEGENTIX CYBERDECK - COMPLETE AGENTIC PROFILE
# ============================================================

# Workspace
if ($pwd.Path -eq $HOME -and (Test-Path "C:\Aegentix")) { Set-Location "C:\Aegentix" }
$env:LANG = "en_US.UTF-8"
$env:TZ = "America/Denver"

# Load orchestrator & governance if present
$scriptList = @(
    "C:\Aegentix\orchestrator\workflow-engine.ps1",
    "C:\Aegentix\orchestrator\task-scheduler.ps1",
    "C:\Aegentix\orchestrator\event-broker.ps1",
    "C:\Aegentix\governance\audit-logger.ps1",
    "C:\Aegentix\governance\permission-manager.ps1",
    "C:\Aegentix\governance\risk-assessor.ps1",
    "C:\Aegentix\control\command-router.ps1",
    "C:\Aegentix\management\system-configurator.ps1",
    "C:\Aegentix\aegentix-liquid-mesh.ps1"
)

foreach ($script in $scriptList) {
    if (Test-Path $script) { . $script }
}

# Agentic AI command
function ai {
    param([Parameter(ValueFromRemainingArguments=$true)][string[]]$QueryArgs)
    & "C:\Aegentix\cyberdeck\cyberdeck.ps1" ($QueryArgs -join " ")
}

# Status command
function cyber-status {
    Write-Host "`n=== Aegentix Agentic Cyberdeck Status ===" -ForegroundColor Cyan
    $electron = Get-Process electron -ErrorAction SilentlyContinue
    $node = Get-Process node -ErrorAction SilentlyContinue
    Write-Host "  Desktop Assistant: $(if ($electron) { '✅ Running' } else { '⚪ Standby (pnpm start)' })" -ForegroundColor Yellow
    Write-Host "  Reasoning Engine : ✅ Active (Kilo Gateway / Free Tier)" -ForegroundColor Green
    Write-Host "  Node.js Runtimes : $(if ($node) { "✅ Running ($($node.Count) processes)" } else { '⚪ Idle' })" -ForegroundColor Yellow
    Write-Host "  Telemetry Oracle : WMON VWMP `$1.482 | 12.8% APR | 29 Exchanges" -ForegroundColor Green
    Write-Host "  Location         : $(Get-Location)" -ForegroundColor Gray
    Write-Host "  System Time      : $(Get-Date)" -ForegroundColor Gray
    Write-Host ""
}

# Logs command
function cyber-logs {
    param([string]$Type = "assistant")
    $logFile = switch ($Type) {
        "assistant" { "C:\Users\eagle\antigravity\Aegentix-Super-Agent-Wallet\desktop\agent.log" }
        default { "C:\Aegentix\logs\$Type.log" }
    }
    if (Test-Path $logFile) { Get-Content $logFile -Tail 20 }
    else { Write-Host "No log file found at $logFile" -ForegroundColor Yellow }
}

# Specialized Agent shortcuts (Agentic)
function agent-coding { param([Parameter(ValueFromRemainingArguments=$true)][string[]]$args) & "C:\Aegentix\cyberdeck\cyberdeck.ps1" "[Coding Specialist] $($args -join ' ')" }
function agent-infra { param([Parameter(ValueFromRemainingArguments=$true)][string[]]$args) & "C:\Aegentix\cyberdeck\cyberdeck.ps1" "[Infrastructure Specialist] $($args -join ' ')" }
function agent-research { param([Parameter(ValueFromRemainingArguments=$true)][string[]]$args) & "C:\Aegentix\cyberdeck\cyberdeck.ps1" "[Research Specialist] $($args -join ' ')" }
function agent-security { param([Parameter(ValueFromRemainingArguments=$true)][string[]]$args) & "C:\Aegentix\cyberdeck\cyberdeck.ps1" "[Security Specialist] $($args -join ' ')" }
function agent-test { param([Parameter(ValueFromRemainingArguments=$true)][string[]]$args) & "C:\Aegentix\cyberdeck\cyberdeck.ps1" "[QA Specialist] $($args -join ' ')" }

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🦞 AEGENTIX LIQUID CYBERDECK & SKYDIVE MESH - READY     ║" -ForegroundColor Cyan
Write-Host "║  Commands: ai <prompt> | cyberdeck | cyber-status | agents   ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Set-Alias -Name cyberdeck -Value "C:\Aegentix\cyberdeck\cyberdeck.ps1" -Scope Global -Force
Set-Alias -Name directive-send -Value "C:\Aegentix\cyberdeck\directive-send.ps1" -Scope Global -Force
Set-Alias -Name directive-stream -Value "C:\Aegentix\cyberdeck\directive-stream.ps1" -Scope Global -Force
Set-Alias -Name directive-ping -Value "C:\Aegentix\cyberdeck\directive-ping.ps1" -Scope Global -Force
Set-Alias -Name directive-broadcast -Value "C:\Aegentix\cyberdeck\directive-broadcast.ps1" -Scope Global -Force
Set-Alias -Name directive-invoke -Value "C:\Aegentix\cyberdeck\directive-invoke.ps1" -Scope Global -Force
Set-Alias -Name directive-transmittance -Value "C:\Aegentix\cyberdeck\directive-transmittance.ps1" -Scope Global -Force
Set-Alias -Name directive-mint -Value "C:\Aegentix\cyberdeck\directive-mint.ps1" -Scope Global -Force

function claude-mem { & "bun" "C:\AEGENTIX-WORKSPACE\github-repos\AEGENTIX-DEVTOOLS\sources\claude-mem\plugin\scripts\worker-service.cjs" $args }
