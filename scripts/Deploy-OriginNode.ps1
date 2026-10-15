<#
.SYNOPSIS
    Origin Node deploy: Bastet Agent OS (verified) + candidate probe for the rest.
.DESCRIPTION
    Docker-based. Idempotent. Prints WebUI token on success.
    Bastet is the only component with a confirmed install path.
    Other Agent OS names are probed against PyPI/npm; unresolvable ones are skipped.
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

# ─── Config ────────────────────────────────────────────────────────────────
$Config = @{
    ContainerName = 'bastet'
    Image         = 'yamantaka520/bastet-agent-os:latest'
    UiPort        = 8890
    DataVolume    = 'bastet-data'
    Root          = 'C:\Aegentix'
    RepoMount     = 'C:\Aegentix\repos'
    LogFile       = 'C:\Aegentix\origin-node.log'
}

# ─── Output ────────────────────────────────────────────────────────────────
function Info { param($m) Write-Host "[origin] $m" -ForegroundColor Cyan }
function Ok   { param($m) Write-Host "  [+] $m" -ForegroundColor Green }
function Warn { param($m) Write-Host "  [!] $m" -ForegroundColor Yellow }
function Err  { param($m) Write-Host "  [x] $m" -ForegroundColor Red }
function Log  { param($m) Add-Content -Path $Config.LogFile -Value "$(Get-Date -Format o) $m" -ErrorAction SilentlyContinue }

# ─── Checks ────────────────────────────────────────────────────────────────
function Test-Docker {
    try { $null = docker version --format '{{.Server.Version}}' 2>$null; return $true }
    catch { return $false }
}

function Ensure-Dirs {
    foreach ($d in @($Config.Root, $Config.RepoMount)) {
        if (-not (Test-Path $d)) {
            New-Item -ItemType Directory -Path $d -Force | Out-Null
            Ok "created $d"
        }
    }
}

# ─── Probe ─────────────────────────────────────────────────────────────────
function Invoke-Probe {
    Info 'probing prerequisites'

    if (Test-Docker) {
        Ok "Docker: $((docker version --format '{{.Server.Version}}'))"
    } else {
        Warn 'Docker not reachable — container install will be skipped'
    }

    if (Get-Command wsl.exe -ErrorAction SilentlyContinue) {
        Ok 'WSL2 available — Hermes host install path open'
    } else {
        Warn 'WSL2 not available — Hermes host install will fail'
    }

    if (Get-Command curl.exe -ErrorAction SilentlyContinue) {
        Ok 'curl.exe present'
    } else {
        Warn 'curl.exe missing'
    }

    Info 'image manifest check (no pull)'
    try {
        $null = docker manifest inspect $Config.Image 2>$null
        Ok "image resolves: $($Config.Image)"
    } catch {
        Warn "cannot resolve $($Config.Image)"
    }
}

# ─── Candidate package probe ───────────────────────────────────────────────
function Probe-Candidates {
    Info 'probing candidate Agent OS packages'

    $candidates = @(
        @{ name='opencode';           type='npm';  pkg='opencode-ai' },
        @{ name='nava';               type='pypi'; pkg='nava-agent' },
        @{ name='qualixar';           type='npm';  pkg='qualixar-os' },
        @{ name='jebat';              type='npm';  pkg='@nusabyte/jebat' },
        @{ name='pyagentos';          type='pypi'; pkg='pyagentos' },
        @{ name='agent-os-community'; type='pypi'; pkg='agent-os-kernel' },
        @{ name='agentos-ts';         type='npm';  pkg='@framers/agentos' },
        @{ name='kronos';             type='pypi'; pkg='kronos-agent-os' },
        @{ name='cloudflare-os';      type='npm';  pkg='create-cloudflare-os' }
    )

    foreach ($c in $candidates) {
        if ($c.type -eq 'pypi') {
            try {
                $null = Invoke-RestMethod "https://pypi.org/pypi/$($c.pkg)/json" -TimeoutSec 5
                Ok "$($c.name) -> $($c.pkg) [PyPI]"
            } catch {
                Warn "$($c.name) -> $($c.pkg) NOT FOUND"
            }
        } else {
            try {
                $encPkg = [System.Uri]::EscapeDataString($c.pkg)
                $res = Invoke-RestMethod -Uri "https://registry.npmjs.org/$encPkg/latest" -TimeoutSec 5 -ErrorAction Stop
                if ($res -and $res.version) {
                    Ok "$($c.name) -> $($c.pkg) [npm $($res.version)]"
                } else {
                    Warn "$($c.name) -> $($c.pkg) NOT FOUND"
                }
            } catch {
                Warn "$($c.name) -> $($c.pkg) NOT FOUND"
            }
        }
    }
}

# ─── Bastet install ────────────────────────────────────────────────────────
function Install-Bastet {
    if (-not (Test-Docker)) {
        Warn 'Docker unavailable — skipping Bastet container'
        return $false
    }

    $exists = docker ps -a --filter "name=^$($Config.ContainerName)$" --format '{{.Names}}'
    if ($exists -eq $Config.ContainerName) {
        Ok 'container already exists'
        $running = docker ps --filter "name=^$($Config.ContainerName)$" --format '{{.Names}}'
        if ($running -ne $Config.ContainerName) {
            docker start $Config.ContainerName | Out-Null
            Ok 'started existing container'
        }
        return $true
    }

    Info "pulling $($Config.Image)"
    docker pull $Config.Image | Out-Null
    Ok 'image pulled'

    Info 'starting container'
    $runArgs = @(
        'run','-d',
        '--name', $Config.ContainerName,
        '-p', "$($Config.UiPort):$($Config.UiPort)",
        '-v', "$($Config.DataVolume):/data",
        '-v', "$($Config.RepoMount):/repos",
        $Config.Image
    )
    & docker @runArgs | Out-Null
    Ok "container started on :$($Config.UiPort)"
    return $true
}

function Show-Token {
    try {
        Start-Sleep -Seconds 4
        $token = docker exec $Config.ContainerName cat /data/api_token 2>$null
        if ($token) {
            Write-Host ''
            Write-Host '  API token: ' -NoNewline
            Write-Host $token -ForegroundColor Green
            Write-Host "  Web UI:    http://localhost:$($Config.UiPort)/ui"
            Write-Host ''
        }
    } catch {
        Warn 'token not ready — check docker logs bastet'
    }
}

# ─── Hermes host executor ──────────────────────────────────────────────────
function Install-HermesExecutor {
    if (-not (Get-Command wsl.exe -ErrorAction SilentlyContinue)) {
        Warn 'WSL2 missing — skipping Hermes host install'
        return
    }

    Info 'installing host executors (incl. Hermes) via WSL2'
    $cmd = 'curl -fsSL https://raw.githubusercontent.com/yamantaka520/Bastet-Agent-OS/main/install.sh | bash'
    try {
        wsl -- bash -lc $cmd
        Ok 'host install script completed'
    } catch {
        Warn "host install failed: $($_.Exception.Message)"
        Log "host install error: $_"
    }
}

# ─── Status / Stop / Uninstall ─────────────────────────────────────────────
function Show-Status {
    if (-not (Test-Docker)) { Err 'Docker not reachable'; return }
    $state = docker inspect -f '{{.State.Status}}' $Config.ContainerName 2>$null
    if (-not $state) { $state = 'absent' }
    Write-Host ('  {0,-20} {1,-8} {2}' -f 'SERVICE','PORT','STATE')
    Write-Host ('  ' + ('-' * 40))
    Write-Host ('  {0,-20} {1,-8} {2}' -f 'bastet', $Config.UiPort, $state)
}

function Stop-All {
    if (-not (Test-Docker)) { return }
    $running = docker ps --filter "name=^$($Config.ContainerName)$" --format '{{.Names}}'
    if ($running -eq $Config.ContainerName) {
        docker stop $Config.ContainerName | Out-Null
        Ok 'stopped'
    } else { Ok 'not running' }
}

function Uninstall-All {
    Stop-All
    if (-not (Test-Docker)) { return }

    $exists = docker ps -a --filter "name=^$($Config.ContainerName)$" --format '{{.Names}}'
    if ($exists -eq $Config.ContainerName) {
        docker rm -f $Config.ContainerName | Out-Null
        Ok 'container removed'
    }

    if ($Purge) {
        $vol = docker volume ls --filter "name=^$($Config.DataVolume)$" --format '{{.Name}}'
        if ($vol -eq $Config.DataVolume) {
            docker volume rm $Config.DataVolume | Out-Null
            Ok "volume $($Config.DataVolume) purged"
        }
    } else {
        Warn "volume $($Config.DataVolume) kept (use -Purge to delete)"
    }
}

# ─── Main ──────────────────────────────────────────────────────────────────
Ensure-Dirs
Log "start: $($PSBoundParameters.Keys -join ', ')"

switch ($true) {
    $Probe     { Invoke-Probe; return }
    $Status    { Show-Status; return }
    $Stop      { Stop-All; return }
    $Uninstall { Uninstall-All; return }
    default {
        Invoke-Probe
        Write-Host ''
        if (Install-Bastet) { Show-Token }
        Install-HermesExecutor
        Write-Host ''
        Info 'candidate package check'
        Probe-Candidates
        Write-Host ''
        Info "logs: $($Config.LogFile)"
    }
}
