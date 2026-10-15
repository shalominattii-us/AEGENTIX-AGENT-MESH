<#
.SYNOPSIS
    Install Bastet Agent OS - the verified control plane.
.DESCRIPTION
    Apache-2.0. Docker-based. WebUI on :8890.
    State lives in /data volume. Credentials go in Admin -> Credentials.
.PARAMETER Probe
    Check prerequisites only.
.PARAMETER Status
    Show container state.
.PARAMETER Stop
    Stop the container.
.PARAMETER Uninstall
    Remove container. Keeps data volume unless -Purge.
.PARAMETER Purge
    With -Uninstall, also delete bastet-data volume.
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

$Config = @{
    ContainerName = 'bastet'
    Image         = 'yamantaka520/bastet-agent-os:latest'
    UiPort        = 8890
    DataVolume    = 'bastet-data'
    RepoMount     = "$env:USERPROFILE\agent-origin\repos"
    LogFile       = "$env:USERPROFILE\agent-origin\bastet-install.log"
}

function Write-Info { param($m) Write-Host "[bastet] $m" -ForegroundColor Cyan }
function Write-Ok   { param($m) Write-Host "  [+] $m" -ForegroundColor Green }
function Write-Warn { param($m) Write-Host "  [!] $m" -ForegroundColor Yellow }
function Write-Err  { param($m) Write-Host "  [x] $m" -ForegroundColor Red }

function Test-Docker {
    try {
        $null = docker version --format '{{.Server.Version}}' 2>$null
        return $true
    } catch { return $false }
}

function Ensure-Dirs {
    foreach ($d in @("$env:USERPROFILE\agent-origin", $Config.RepoMount)) {
        if (-not (Test-Path $d)) {
            New-Item -ItemType Directory -Path $d -Force | Out-Null
            Write-Ok "created $d"
        }
    }
}

function Invoke-Probe {
    Write-Info 'probing prerequisites'
    if (Test-Docker) {
        $ver = docker version --format '{{.Server.Version}}'
        Write-Ok "Docker: $ver"
    } else {
        Write-Err 'Docker not reachable - install/start Docker Desktop'
        return $false
    }

    Write-Info 'checking image manifest'
    try {
        $null = docker manifest inspect $Config.Image 2>$null
        Write-Ok "image resolves: $($Config.Image)"
    } catch {
        Write-Warn "cannot resolve $($Config.Image)"
    }
    return $true
}

function Install-Bastet {
    if (-not (Test-Docker)) {
        Write-Err 'Docker unavailable - cannot install Bastet'
        return $false
    }

    $exists = docker ps -a --filter "name=^$($Config.ContainerName)$" --format '{{.Names}}'
    if ($exists -eq $Config.ContainerName) {
        Write-Ok "container already exists"
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
    Write-Ok "container started on :$($Config.UiPort)"
    return $true
}

function Get-Token {
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
        Write-Warn 'token not ready yet - wait a few seconds and check docker logs'
    }
}

function Show-Status {
    if (-not (Test-Docker)) { Write-Err 'Docker not reachable'; return }
    $state = docker inspect -f '{{.State.Status}}' $Config.ContainerName 2>$null
    if (-not $state) { $state = 'absent' }
    Write-Host ('  {0,-20} {1,-8} {2}' -f 'SERVICE','PORT','STATE')
    Write-Host ('  ' + ('-' * 40))
    Write-Host ('  {0,-20} {1,-8} {2}' -f 'bastet', $Config.UiPort, $state)
}

function Stop-Bastet {
    if (-not (Test-Docker)) { return }
    $running = docker ps --filter "name=^$($Config.ContainerName)$" --format '{{.Names}}'
    if ($running -eq $Config.ContainerName) {
        docker stop $Config.ContainerName | Out-Null
        Write-Ok 'stopped'
    } else { Write-Ok 'not running' }
}

function Uninstall-Bastet {
    Stop-Bastet
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

# --- Main ---
Ensure-Dirs

if ($Probe)     { Invoke-Probe; return }
if ($Status)    { Show-Status; return }
if ($Stop)      { Stop-Bastet; return }
if ($Uninstall) { Uninstall-Bastet; return }

if (Invoke-Probe) {
    if (Install-Bastet) {
        Start-Sleep -Seconds 5
        Get-Token
    }
}
