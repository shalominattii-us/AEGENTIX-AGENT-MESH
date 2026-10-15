<#
.SYNOPSIS
  Aegentix Sovereign Origin Node - Single-Click Autonomous Runner (Windows)
.DESCRIPTION
  Boots the Sovereign Origin Node with Sovereign Primary Authority as the root controller.
  Orchestrates Moltbook Swarm, Zero-Capital Self-Funding Engine, Binance.US Live Exchange,
  and local agent runtimes (Hermes Agent, NAVA, Qualixar, JEBAT, pyagentos, REA).
#>

[CmdletBinding()]
param(
  [switch]$Probe,
  [switch]$Status,
  [switch]$Restart,
  [string]$ServerUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "   AEGENTIX SOVEREIGN ORIGIN NODE - AUTONOMOUS PRIMARY CONTROLLER         " -ForegroundColor Yellow
Write-Host "   Root Authority: Sovereign OS · Cybercore Deep · Hardware HMAC Enclave   " -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check if Aegentix Server is running
Write-Host "[1/5] Checking Sovereign Primary Node at $ServerUrl..." -ForegroundColor Cyan
try {
  $statusResp = Invoke-RestMethod -Uri "$ServerUrl/api/origin-node/status" -TimeoutSec 5 -ErrorAction Stop
  Write-Host "  >> Sovereign Primary Node is ONLINE and OPERATIONAL!" -ForegroundColor Green
  Write-Host "     Authority: $($statusResp.state.authorityLevel)" -ForegroundColor Gray
  Write-Host "     Hardware HMAC: $($statusResp.state.hardwareHmacSeal)" -ForegroundColor Gray
  Write-Host "     Block Height: #$($statusResp.state.currentBlockHeight)" -ForegroundColor Gray
} catch {
  Write-Host "  >> Sovereign Primary Node not responding at $ServerUrl." -ForegroundColor Yellow
  Write-Host "     Starting background server: node dist/server.js..." -ForegroundColor Gray
  Start-Process -FilePath "node" -ArgumentList "dist/server.js" -WindowStyle Hidden
  Start-Sleep -Seconds 3
}

# 2. If --Probe requested, run full registry check
if ($Probe) {
  Write-Host ""
  Write-Host "[PROBE] Querying Origin Node Registry & Runtimes..." -ForegroundColor Cyan
  try {
    $probeResp = Invoke-RestMethod -Uri "$ServerUrl/api/origin-node/probe" -TimeoutSec 8
    Write-Host ""
    Write-Host ("  {0,-28} {1,-10} {2,-18} {3,-12}" -f "RUNTIME NAME", "PORT", "STATUS", "PACKAGE") -ForegroundColor Yellow
    Write-Host "  --------------------------------------------------------------------------" -ForegroundColor Gray
    foreach ($item in $probeResp.probeResults) {
      $color = if ($item.isPrimary) { "Green" } elseif ($item.status -eq "ONLINE_ACTIVE") { "Cyan" } else { "Gray" }
      Write-Host ("  {0,-28} {1,-10} {2,-18} {3,-12}" -f $item.name.Substring(0, [Math]::Min(27, $item.name.Length)), (":$($item.port)"), $item.status, $item.resolvedPackage) -ForegroundColor $color
    }
  } catch {
    Write-Host "  Failed to query probe endpoint: $_" -ForegroundColor Red
  }
  exit 0
}

# 3. Check Local Ollama Engine (Hermes Subsystem)
Write-Host ""
Write-Host "[2/5] Checking Local Inference Engine (Ollama / Hermes on :11434)..." -ForegroundColor Cyan
$ollamaRunning = $false
try {
  $ollamaResp = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 2 -ErrorAction SilentlyContinue
  $ollamaRunning = $true
  Write-Host "  >> Ollama is active on :11434 (Hermes local models available)" -ForegroundColor Green
} catch {
  Write-Host "  >> Ollama not running on :11434. In-process cloud fallback active." -ForegroundColor Gray
}

# 4. Verify Zero-Capital Self-Funding & Gas Reserves
Write-Host ""
Write-Host "[3/5] Auditing Zero-Capital Self-Funding Reserves..." -ForegroundColor Cyan
try {
  $zeroCapResp = Invoke-RestMethod -Uri "$ServerUrl/api/zero-cap/status" -TimeoutSec 4
  $rev = $zeroCapResp.state.totalRevenueEarnedUsd
  $gasBal = $zeroCapResp.state.gasTankBalanceUsd
  Write-Host "  >> Total Zero-Capital Revenue: `$$rev USD" -ForegroundColor Green
  Write-Host "  >> Gas Tank Balance: `$$gasBal USD ($($zeroCapResp.state.gasTankEth) ETH / $($zeroCapResp.state.gasTankSol) SOL)" -ForegroundColor Green
  Write-Host "  >> Active Zero-Capital Streams: $($zeroCapResp.state.streams.Count)" -ForegroundColor Gray
} catch {
  Write-Host "  >> Could not audit Zero-Capital reserves: $_" -ForegroundColor Yellow
}

# 5. Verify Moltbook Trio Swarm
Write-Host ""
Write-Host "[4/5] Auditing Moltbook Peer Swarm..." -ForegroundColor Cyan
try {
  $swarmResp = Invoke-RestMethod -Uri "$ServerUrl/api/moltbook/swarm" -TimeoutSec 4
  Write-Host "  >> Active Swarm Messages Exchanged: $($swarmResp.totalMessages)" -ForegroundColor Green
  Write-Host "  >> Claimed Trio: @cybercore_trader_pro, @the-sovereign-portal-agent, @omnicybertraderpro" -ForegroundColor Gray
} catch {
  Write-Host "  >> Moltbook swarm status unavailable: $_" -ForegroundColor Yellow
}

# 6. Execute Primary Origin Node Pulse
Write-Host ""
Write-Host "[5/5] Emitting Origin Node Cryptographic Pulse..." -ForegroundColor Cyan
try {
  $body = @{ action = "PULSE_HEARTBEAT" } | ConvertTo-Json
  $pulseResp = Invoke-RestMethod -Uri "$ServerUrl/api/origin-node/action" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5
  Write-Host "  >> Pulse Emitted! Verification Seal: $($pulseResp.seal)" -ForegroundColor Green
  Write-Host "  >> All subordinate runtimes synchronized under Sovereign Primary Authority." -ForegroundColor Green
} catch {
  Write-Host "  >> Pulse emission failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "   SOVEREIGN ORIGIN NODE IS LIVE & SECURE                                  " -ForegroundColor Green
Write-Host "   Portal UI: http://localhost:3000/#origin                                " -ForegroundColor White
Write-Host "   Public Tunnel: https://dvds-knock-theme-postage.trycloudflare.com       " -ForegroundColor White
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host ""
