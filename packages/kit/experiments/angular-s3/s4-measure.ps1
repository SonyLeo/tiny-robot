param(
  [Parameter(Mandatory = $true)][string]$HostDir
)
$ErrorActionPreference = 'Stop'
$source = Join-Path $PSScriptRoot 'src'
$hostSource = Join-Path $HostDir 'src'
if (-not (Test-Path (Join-Path $HostDir 'node_modules'))) { throw 'Use an installed isolated host outside the repository.' }
if ((Resolve-Path $HostDir).Path.StartsWith((Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path, [StringComparison]::OrdinalIgnoreCase)) {
  throw 'Host must be outside the repository.'
}
Copy-Item (Join-Path $source 's4-state.ts') $hostSource -Force
$spec = Get-Content -Raw (Join-Path $source 's4.spec.ts')
Write-Output "Node $(node -v); npm $(npm -v); $([System.Runtime.InteropServices.RuntimeInformation]::OSDescription)"
Push-Location $HostDir
try {
  foreach ($mode in @('full', 'revision', 'adapter')) {
    $modeSpec = $spec.Replace('const benchmarkModes: S4Mode[] = modes;', "const benchmarkModes: S4Mode[] = ['$mode'];")
    Set-Content -Encoding utf8 (Join-Path $hostSource 's4.spec.ts') $modeSpec
    Write-Output "--- $mode (fresh Angular test process) ---"
    $output = & npm test 2>&1
    $output | Select-String 'S4_MEASURE|Test Files|Tests  |FAIL' | ForEach-Object { $_.Line }
    if ($LASTEXITCODE -ne 0) { $output | Select-Object -Last 60; throw "npm test failed for $mode" }
  }
} finally {
  Set-Content -Encoding utf8 (Join-Path $hostSource 's4.spec.ts') $spec
  Pop-Location
}
