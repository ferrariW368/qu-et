# qu/et — CONSTRAINTS.md'deki tüm kontroller tek komutta. Çıkış kodu 0 = hepsi geçti.
$ErrorActionPreference = 'Stop'
$qa = $PSScriptRoot
$site = Resolve-Path "$qa\..\..\Site"
$env:QUET_QA_MODULES = "$qa\node_modules"
Set-Location $site
python tools\build-pages.py
node tools\check-site.cjs; if ($LASTEXITCODE) { throw 'check-site FAILED' }
$server = Start-Process python -ArgumentList "$qa\serve-with-headers.py" -PassThru -WindowStyle Hidden
try {
  Start-Sleep 2
  $env:QUET_BASE = 'http://127.0.0.1:8766/'
  Set-Location $qa
  $b = (node browser-check.cjs) -join "`n" | ConvertFrom-Json
  if ($b.errors.Count -or $b.small.Count -or $b.overflow.Count -or -not $b.flows.drawer.slides -or -not $b.flows.checkout.ok -or -not $b.flows.lang.ok -or -not $b.flows.zoom.ok) { $b | ConvertTo-Json -Depth 5; throw 'browser-check FAILED' }
  node axe-check.cjs; if ($LASTEXITCODE) { throw 'axe FAILED' }
  $c = (node c-check.cjs) -join "`n" | ConvertFrom-Json
  if ($c.firstVisit.seen -or -not $c.returnVisit.seen -or $c.returnVisit.logo -ne '0' -or $c.returnVisit.wordmark -ne '1' -or $c.scrolled.fade -ne '0.000' -or $c.scrolled.logo -ne '1' -or $c.errors.Count) { $c | ConvertTo-Json -Depth 4; throw 'C-check FAILED' }
  if ($args -contains '-perf') { node perf-check.cjs }
  'TUM KONTROLLER GECTI'
} finally { Stop-Process -Id $server.Id -ErrorAction SilentlyContinue }
