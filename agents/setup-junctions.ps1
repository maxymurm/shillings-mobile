#!/usr/bin/env pwsh
# Setup directory junctions for shillings-mobile
# No admin required (uses mklink /J directory junctions, not symlinks)
# Run from c:\Users\maxmm\shillings-mobile

$mobile = "c:\Users\maxmm\shillings-mobile"
$shillings = "c:\Users\maxmm\Herd\shillings"

Set-Location $mobile

# Junction 1: parent_shillings -> backend repo (read-only reference)
if (Test-Path "parent_shillings") {
  Write-Host "parent_shillings already exists, skipping"
} else {
  cmd /c mklink /J parent_shillings $shillings
  Write-Host "Created junction: parent_shillings -> $shillings"
}

# Junction 2: src/offline -> shared offline module
New-Item -ItemType Directory -Path src -Force | Out-Null
if (Test-Path "src\offline") {
  Write-Host "src/offline already exists, skipping"
} else {
  cmd /c mklink /J "src\offline" "$shillings\resources\js\offline"
  Write-Host "Created junction: src/offline -> $shillings\resources\js\offline"
}

Write-Host ""
Write-Host "Junctions:"
Get-Item parent_shillings, src\offline | Select-Object Name, LinkType, Target | Format-Table -AutoSize
