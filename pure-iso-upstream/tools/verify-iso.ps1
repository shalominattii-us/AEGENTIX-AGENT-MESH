[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$Iso,
  [Parameter(Mandatory=$true)][string]$ExpectedSha256,
  [string]$ChecksumFile,
  [string]$SignatureFile,
  [string]$KeyFile
)
$ErrorActionPreference='Stop'
if (!(Test-Path -LiteralPath $Iso)) { throw "ISO not found: $Iso" }
$actual=(Get-FileHash -LiteralPath $Iso -Algorithm SHA256).Hash.ToLowerInvariant()
$expected=$ExpectedSha256.Trim().ToLowerInvariant()
if ($actual -ne $expected) { throw "SHA256 MISMATCH: expected $expected got $actual" }
if ($ChecksumFile -and !(Test-Path -LiteralPath $ChecksumFile)) { throw "Checksum file missing" }
if ($SignatureFile -and !(Test-Path -LiteralPath $SignatureFile)) { throw "Signature file missing" }
if ($SignatureFile -and !$KeyFile) { throw "Signature supplied without trusted key material" }
[pscustomobject]@{
  status='verified'
  iso=(Resolve-Path $Iso).Path
  sha256=$actual
  checksum_present=[bool]$ChecksumFile
  signature_present=[bool]$SignatureFile
  key_present=[bool]$KeyFile
  verified_at=[DateTime]::UtcNow.ToString('o')
} | ConvertTo-Json -Compress
