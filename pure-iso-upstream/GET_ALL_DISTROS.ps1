$ErrorActionPreference = 'Stop'
$Root = Join-Path $PWD 'pure-iso-upstream'
$Py = Get-Command python -ErrorAction SilentlyContinue
if (-not $Py) { throw 'Python 3 is required.' }

New-Item -ItemType Directory -Force -Path (Join-Path $Root 'catalog') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $Root 'artifacts') | Out-Null

& $Py.Source (Join-Path $Root 'tools/fetch_fleet.py') `
  --catalog 'https://linuxassociation.ca/distributions.php' `
  --catalog 'https://www.linuxlinks.com/big-list-linux-distros/' `
  --manifest (Join-Path $Root 'catalog/fleet.json')

Write-Host ''
Write-Host 'CATALOG DISCOVERY COMPLETE.' -ForegroundColor Green
Write-Host 'Every discovered target is now represented as an acquisition target.'
Write-Host 'ISO acquisition requires explicit official media URLs and upstream verification evidence.'
Write-Host 'Unverifiable media is quarantined; nothing is silently trusted.'
