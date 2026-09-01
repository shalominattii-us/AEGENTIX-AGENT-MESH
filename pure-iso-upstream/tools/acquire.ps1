[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$Manifest,
  [string]$Root = '.\pure-iso-staging',
  [int]$ThrottleLimit = 4
)
$ErrorActionPreference='Stop'
$targets=Get-Content -Raw $Manifest | ConvertFrom-Json
New-Item -ItemType Directory -Force -Path $Root | Out-Null
$results=[System.Collections.Concurrent.ConcurrentBag[object]]::new()
$targets | ForEach-Object -Parallel {
  $t=$_; $root=$using:Root
  $dir=Join-Path $root ($t.id -replace '[^A-Za-z0-9._-]','_')
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $iso=Join-Path $dir ([IO.Path]::GetFileName(([Uri]$t.iso_url).AbsolutePath))
  $meta=Join-Path $dir 'provenance.json'
  try {
    Invoke-WebRequest -Uri $t.iso_url -OutFile $iso -UseBasicParsing
    $hash=(Get-FileHash $iso -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($t.expected_sha256 -and $hash -ne $t.expected_sha256.ToLowerInvariant()) { throw "SHA256 mismatch" }
    [pscustomobject]@{id=$t.id;status='acquired';sha256=$hash;iso=$iso;source=$t.iso_url;timestamp=[DateTime]::UtcNow.ToString('o')} |
      ConvertTo-Json -Depth 8 | Set-Content $meta -Encoding UTF8
  } catch {
    [pscustomobject]@{id=$t.id;status='quarantined';reason=$_.Exception.Message;source=$t.iso_url;timestamp=[DateTime]::UtcNow.ToString('o')} |
      ConvertTo-Json -Depth 8 | Set-Content $meta -Encoding UTF8
  }
} -ThrottleLimit $ThrottleLimit
