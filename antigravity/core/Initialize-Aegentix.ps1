Write-Host "`n[AEGENTIX] Initializing Sovereign Stack..." -ForegroundColor Cyan

# --- Ensure base directory ---
$base = "C:\Aegentix"
if (-not (Test-Path $base)) {
    New-Item -ItemType Directory -Path $base | Out-Null
}


# --- Install Jarvis Core ---
$jarvisCore = "$base\Jarvis-Core.psm1"
Set-Content -Path $jarvisCore -Value @"
function Invoke-Jarvis {
    param([string]`$q)
    "`$([DateTime]::Now) :: JARVIS :: $q"
}
"@ -Encoding UTF8

# --- Install KirkPrime Voice ---
$kirkPrime = "$base\Jarvis-KirkPrime.psm1"
Set-Content -Path $kirkPrime -Value @"
function Invoke-KirkPrime {
    param([string]`$q)
    "KIRKPRIME VOICE >> $q"
}
"@ -Encoding UTF8

# --- Install Antigravity integration stub ---
$anti = "$base\Antigravity-120B.psm1"
Set-Content -Path $anti -Value @"
function Invoke-Antigravity {
    param([string]`$design)
    "ANTIGRAVITY-120B :: BUILD :: $design"
}
"@ -Encoding UTF8

# --- Load modules ---
Import-Module $jarvisCore -Force
Import-Module $kirkPrime -Force
Import-Module $anti -Force

Write-Host "[AEGENTIX] Modules loaded." -ForegroundColor Green

# --- Register Agentic Cyberdeck ---
Write-Host "[AEGENTIX] Initializing Agentic Cyberdeck..." -ForegroundColor Yellow
Set-Alias -Name cyberdeck -Value "C:\Aegentix\cyberdeck\cyberdeck.ps1" -Scope Global -Force
Set-Alias -Name ai -Value "C:\Aegentix\cyberdeck\cyberdeck.ps1" -Scope Global -Force
Write-Host "[AEGENTIX] Agentic Cyberdeck online. Type 'cyberdeck' or 'ai' to interact with agents." -ForegroundColor Green

# --- Self-healing boot confirmation ---
Write-Host "`n[AEGENTIX] Sovereign Stack is UP and RUNNING." -ForegroundColor Cyan
Write-Host "[AEGENTIX] Jarvis + KirkPrime + Antigravity ready." -ForegroundColor Cyan
