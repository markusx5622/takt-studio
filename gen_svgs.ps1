$publicDir = Join-Path $PSScriptRoot "public"
if (!(Test-Path -Path $publicDir)) {
    New-Item -ItemType Directory -Path $publicDir | Out-Null
}

function Write-Svg {
    param([string]$Name, [string]$Content)
    $path = Join-Path $publicDir $Name
    Set-Content -Path $path -Value $Content.Trim() -Encoding UTF8
    Write-Host "Created $Name"
}

$baseInner = @"
  <rect width="512" height="512" rx="112" fill="#2563EB"/>
  <path d="M128 170H384" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M256 170V334" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M140 300C184 252 218 252 256 300C294 348 336 348 376 300" stroke="#06B6D4" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="140" cy="300" r="16.5" fill="white"/>
  <circle cx="256" cy="300" r="18" fill="white"/>
  <circle cx="376" cy="300" r="16.5" fill="white"/>
  <circle cx="256" cy="300" r="10.5" fill="#22C55E"/>
"@

Write-Svg "favicon.svg" @"
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
$baseInner
</svg>
"@

Write-Svg "logo.svg" @"
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">Takt Studio logo</title>
  <desc id="desc">A blue rounded square logo with an abstract T, a production flow line, station nodes and a highlighted bottleneck point.</desc>
$baseInner
</svg>
"@

Write-Svg "logo-mark.svg" @"
<svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Takt Studio">
$baseInner
</svg>
"@

Write-Svg "logo-mark-transparent.svg" @"
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M128 170H384" stroke="#2563EB" stroke-width="38" stroke-linecap="round"/>
  <path d="M256 170V334" stroke="#2563EB" stroke-width="38" stroke-linecap="round"/>
  <path d="M140 300C184 252 218 252 256 300C294 348 336 348 376 300" stroke="#06B6D4" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="140" cy="300" r="16.5" fill="#2563EB"/>
  <circle cx="256" cy="300" r="18" fill="#2563EB"/>
  <circle cx="376" cy="300" r="16.5" fill="#2563EB"/>
  <circle cx="256" cy="300" r="10.5" fill="#22C55E"/>
</svg>
"@

$iconGroup = @"
  <g transform="translate({0}, {1}) scale({2})">
$baseInner
  </g>
"@

$textStyle = 'font-family="Inter, Geist, Arial, sans-serif"'

Write-Svg "logo-horizontal.svg" @"
<svg width="960" height="256" viewBox="0 0 960 256" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Takt Studio">
$($iconGroup -f 48, 48, 0.3125)
  <text x="240" y="140" font-size="72" font-weight="800" letter-spacing="-2" $textStyle fill="#0F172A">Takt</text>
  <text x="405" y="140" font-size="72" font-weight="800" letter-spacing="-2" $textStyle fill="#2563EB">Studio</text>
  <text x="245" y="180" font-size="20" font-weight="500" letter-spacing="0" $textStyle fill="#64748B">Simulación y análisis de líneas de producción</text>
</svg>
"@

Write-Svg "logo-horizontal-dark.svg" @"
<svg width="960" height="256" viewBox="0 0 960 256" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Takt Studio">
$($iconGroup -f 48, 48, 0.3125)
  <text x="240" y="140" font-size="72" font-weight="800" letter-spacing="-2" $textStyle fill="#FFFFFF">Takt</text>
  <text x="405" y="140" font-size="72" font-weight="800" letter-spacing="-2" $textStyle fill="#60A5FA">Studio</text>
  <text x="245" y="180" font-size="20" font-weight="500" letter-spacing="0" $textStyle fill="#CBD5E1">Simulación y análisis de líneas de producción</text>
</svg>
"@

Write-Svg "logo-horizontal-light.svg" @"
<svg width="720" height="160" viewBox="0 0 720 160" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Takt Studio">
$($iconGroup -f 24, 20, 0.234375)
  <text x="168" y="105" font-size="64" font-weight="800" letter-spacing="-2" $textStyle fill="#0F172A">Takt</text>
  <text x="315" y="105" font-size="64" font-weight="800" letter-spacing="-2" $textStyle fill="#2563EB">Studio</text>
</svg>
"@

Write-Svg "logo-horizontal-compact.svg" @"
<svg width="720" height="160" viewBox="0 0 720 160" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Takt Studio">
$($iconGroup -f 24, 20, 0.234375)
  <text x="168" y="105" font-size="64" font-weight="800" letter-spacing="-2" $textStyle fill="#0F172A">Takt Studio</text>
</svg>
"@

Write-Svg "logo-monochrome.svg" @"
<svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="#2563EB"/>
  <path d="M128 170H384" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M256 170V334" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M140 300C184 252 218 252 256 300C294 348 336 348 376 300" stroke="white" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="140" cy="300" r="16.5" fill="#2563EB"/>
  <circle cx="256" cy="300" r="18" fill="#2563EB"/>
  <circle cx="376" cy="300" r="16.5" fill="#2563EB"/>
  <circle cx="256" cy="300" r="10.5" fill="white"/>
</svg>
"@

Write-Svg "logo-white.svg" @"
<svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M128 170H384" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M256 170V334" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M140 300C184 252 218 252 256 300C294 348 336 348 376 300" stroke="white" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="140" cy="300" r="16.5" fill="white"/>
  <circle cx="256" cy="300" r="18" fill="white"/>
  <circle cx="376" cy="300" r="16.5" fill="white"/>
  <circle cx="256" cy="300" r="10.5" fill="#0F172A"/>
</svg>
"@

$maskableInner = @"
  <path d="M128 170H384" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M256 170V334" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M140 300C184 252 218 252 256 300C294 348 336 348 376 300" stroke="#06B6D4" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="140" cy="300" r="16.5" fill="white"/>
  <circle cx="256" cy="300" r="18" fill="white"/>
  <circle cx="376" cy="300" r="16.5" fill="white"/>
  <circle cx="256" cy="300" r="10.5" fill="#22C55E"/>
"@

Write-Svg "maskable-icon.svg" @"
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2563EB"/>
  <g transform="translate(51.2, 51.2) scale(0.8)">
$maskableInner
  </g>
</svg>
"@

Write-Svg "apple-touch-icon-source.svg" @"
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#2563EB"/>
$maskableInner
</svg>
"@

Write-Host "Done"
