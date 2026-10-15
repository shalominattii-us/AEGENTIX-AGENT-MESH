<#
.SYNOPSIS
    Agent Origin Node installer — Bastet Agent OS + Hermes + OmniRoute + OpenCode.
.DESCRIPTION
    Windows PowerShell 5.1+ / PowerShell 7+. Idempotent. Re-runnable.
    Requires Docker Desktop running, or falls back to WSL2 for host install.
.PARAMETER Probe
    Check registries and prerequisites only. No install.
.PARAMETER Status
    Show current container/service state.
.PARAMETER Stop
    Stop everything.
.PARAMETER Uninstall
    Remove container + volumes. Data volume preserved unless -Purge.
.PARAMETER Purge
    With -Uninstall: also delete the bastet-data volume.
.NOTES
    Bastet Docker image intentionally excludes Hermes CLI (interactive login).
    Host install script is used to get the full Hermes executor.
#>
[CmdletBinding()]
param(
    [switch]$Probe,
    [switch]$Status,
    [switch]$Stop,
    [switch]$Uninstall,
    [switch]$Purge
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# ─── Configuration ─────────────────────────────────────────────────────────
$Config = @{
    ContainerName   = 'bastet'
    Image           = 'yamantaka520/bastet-agent-os:latest'
    UiPort          = 8890
    DataVolume      = 'bastet-data'
    InstallScript   = 'https://raw.githubusercontent.com/yamantaka520/Bastet-Agent-OS/main/install.sh'
    RepoMount       = "$env:USERPROFILE\agent-origin\repos"
    LogFile         = "$env:USERPROFILE\agent-origin\install.log"
    HermesGateway   = 'http://host.docker.internal:8642/v1'
}

# ─── Output helpers ────────────────────────────────────────────────────────
function Write-Info  { param($m) Write-Host "[agent-origin] $m" -ForegroundColor Cyan }
function Write-Ok    { param($m) Write-Host "  [+] $m" -ForegroundColor Green }
function Write-Warn  { param($m) Write-Host "  [!] $m" -ForegroundColor Yellow }
function Write-Err   { param($m) Write-Host "  [x] $m" -ForegroundColor Red }
function Write-Log   { param($m) Add-Content -Path $Config.LogFile -Value "$(Get-Date -Format o) $m" -ErrorAction SilentlyContinue }

# ─── Prerequisite checks ───────────────────────────────────────────────────
function Test-Docker {
    try {
        $null = docker version --format '{{.Server.Version}}' 2>$null
        return $true
    } catch { return $false }
}

function Test-Wsl {
    try {
        $null = wsl --status 2>$null
        return $true
    } catch { return $false }
}

function Ensure-Directories {
    $dirs = @(
        "$env:USERPROFILE\agent-origin",
        $Config.RepoMount
    )
    foreach ($d in $dirs) {
        if (-not (Test-Path $d)) {
            New-Item -ItemType Directory -Path $d -Force | Out-Null
            Write-Ok "created $d"
        }
    }
}

# ─── Probe ─────────────────────────────────────────────────────────────────
function Invoke-Probe {
    Write-Info 'probing prerequisites'

    if (Test-Docker) {
        Write-Ok "Docker: $((docker version --format '{{.Server.Version}}'))"
    } else {
        Write-Warn 'Docker not reachable — Docker path will be skipped'
    }

    if (Test-Wsl) {
        Write-Ok 'WSL2 available — host install path possible'
    } else {
        Write-Warn 'WSL2 not available — Hermes host install will fail'
    }

    if (Get-Command curl.exe -ErrorAction SilentlyContinue) {
        Write-Ok 'curl.exe present'
    } else {
        Write-Warn 'curl.exe missing (Windows 10 1803+ ships it; check PATH)'
    }

    Write-Info 'image check (does not pull)'
    try {
        $manifest = docker manifest inspect $Config.Image 2>$null | ConvertFrom-Json
        Write-Ok "image manifest resolves: $($Config.Image)"
    } catch {
        Write-Warn "cannot resolve manifest for $($Config.Image)"
    }
}

# ─── Install ───────────────────────────────────────────────────────────────
function Install-BastetContainer {
    if (-not (Test-Docker)) {
        Write-Warn 'Docker unavailable — skipping container install'
        return $false
    }

    $existing = docker ps -a --filter "name=^$($Config.ContainerName)$" --format '{{.Names}}'
    if ($existing -eq $Config.ContainerName) {
        Write-Ok "container $($Config.ContainerName) already exists"
        $running = docker ps --filter "name=^$($Config.ContainerName)$" --format '{{.Names}}'
        if ($running -ne $Config.ContainerName) {
            docker start $Config.ContainerName | Out-Null
            Write-Ok 'started existing container'
        }
        return $true
    }

    Write-Info "pulling $($Config.Image)"
    docker pull $Config.Image | Out-Null
    Write-Ok 'image pulled'

    Write-Info 'starting container'
    $args = @(
        'run','-d',
        '--name', $Config.ContainerName,
        '-p', "$($Config.UiPort):$($Config.UiPort)",
        '-v', "$($Config.DataVolume):/data",
        '-v', "$($Config.RepoMount):/repos",
        $Config.Image
    )
    & docker @args | Out-Null
    Write-Ok "container started on port $($Config.UiPort)"
    return $true
}

function Get-BastetToken {
    if (-not (Test-Docker)) { return }
    try {
        $token = docker exec $Config.ContainerName cat /data/api_token 2>$null
        if ($token) {
            Write-Host ''
            Write-Host '  API token: ' -NoNewline
            Write-Host $token -ForegroundColor Green
            Write-Host "  Web UI:    http://localhost:$($Config.UiPort)/ui"
            Write-Host ''
        }
    } catch {
        Write-Warn 'could not read token — container may still be booting'
    }
}

function Install-HostExecutors {
    if (-not (Test-Wsl)) {
        Write-Warn 'WSL2 unavailable — skipping Hermes host install'
        return
    }

    Write-Info 'installing host executors (incl. Hermes) via WSL2'
    $cmd = "curl -fsSL $($Config.InstallScript) | bash"
    try {
        wsl -- bash -lc $cmd
        Write-Ok 'host install script completed'
    } catch {
        Write-Warn "host install failed: $($_.Exception.Message)"
        Write-Log "host install error: $_"
    }
}

function Show-Summary {
    Write-Host ''
    Write-Info 'final status'
    Write-Host ('  {0,-22} {1,-10} {2}' -f 'SERVICE','PORT','STATE')
    Write-Host ('  ' + ('-' * 50))

    if (Test-Docker) {
        $state = docker inspect -f '{{.State.Status}}' $Config.ContainerName 2>$null
        if (-not $state) { $state = 'absent' }
        $color = if ($state -eq 'running') { 'Green' } else { 'Yellow' }
        Write-Host ('  {0,-22} {1,-10} ' -f 'bastet', $Config.UiPort) -NoNewline
        Write-Host $state -ForegroundColor $color
    } else {
        Write-Warn 'Docker not available — nothing to report'
    }

    Write-Host ''
    Write-Info "logs: $($Config.LogFile)"
}

# ─── Status ────────────────────────────────────────────────────────────────
function Show-Status {
    if (-not (Test-Docker)) {
        Write-Warn 'Docker not reachable'
        return
    }

    Write-Host ('  {0,-22} {1,-10} {2}' -f 'SERVICE','PORT','STATE')
    Write-Host ('  ' + ('-' * 50))

    $exists = docker ps -a --filter "name=^$($Config.ContainerName)$" --format '{{.Names}}'
    if ($exists -eq $Config.ContainerName) {
        $state = docker inspect -f '{{.State.Status}}' $Config.ContainerName
        Write-Host ('  {0,-22} {1,-10} {2}' -f 'bastet', $Config.UiPort, $state)
    } else {
        Write-Host ('  {0,-22} {1,-10} {2}' -f 'bastet', $Config.UiPort, 'absent')
    }
}

# ─── Stop ──────────────────────────────────────────────────────────────────
function Stop-Everything {
    if (-not (Test-Docker)) { return }
    $running = docker ps --filter "name=^$($Config.ContainerName)$" --format '{{.Names}}'
    if ($running -eq $Config.ContainerName) {
        docker stop $Config.ContainerName | Out-Null
        Write-Ok 'stopped'
    } else {
        Write-Ok 'nothing running'
    }
}

# ─── Uninstall ─────────────────────────────────────────────────────────────
function Uninstall-All {
    Stop-Everything

    if (-not (Test-Docker)) { return }

    $exists = docker ps -a --filter "name=^$($Config.ContainerName)$" --format '{{.Names}}'
    if ($exists -eq $Config.ContainerName) {
        docker rm -f $Config.ContainerName | Out-Null
        Write-Ok 'container removed'
    }

    if ($Purge) {
        $vol = docker volume ls --filter "name=^$($Config.DataVolume)$" --format '{{.Name}}'
        if ($vol -eq $Config.DataVolume) {
            docker volume rm $Config.DataVolume | Out-Null
            Write-Ok "volume $($Config.DataVolume) purged"
        }
    } else {
        Write-Warn "volume $($Config.DataVolume) kept (use -Purge to delete)"
    }
}

# ─── Main ──────────────────────────────────────────────────────────────────
function Main {
    Ensure-Directories
    Write-Log "start: $($PSBoundParameters.Keys -join ', ')"

    if ($Probe)     { Invoke-Probe; return }
    if ($Status)    { Show-Status; return }
    if ($Stop)      { Stop-Everything; return }
    if ($Uninstall) { Uninstall-All; return }

    Invoke-Probe
    Write-Host ''

    $installed = Install-BastetContainer
    if ($installed) {
        Start-Sleep -Seconds 4
        Get-BastetToken
    }

    Install-HostExecutors
    Show-Summary
}

Main
