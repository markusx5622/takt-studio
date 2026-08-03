$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$publicDir = Join-Path $PSScriptRoot "public"

function Convert-SvgToPng {
    param([string]$SvgFile, [string]$PngFile, [int]$Size)
    $svgPath = Join-Path $publicDir $SvgFile
    $pngPath = Join-Path $publicDir $PngFile
    
    $svgContent = Get-Content $svgPath -Raw
    $htmlContent = @"
<!DOCTYPE html>
<html>
<head>
<style>
  html, body { margin: 0; padding: 0; background: transparent; width: ${Size}px; height: ${Size}px; overflow: hidden; }
  svg { width: ${Size}px; height: ${Size}px; display: block; }
</style>
</head>
<body>
$svgContent
</body>
</html>
"@
    $htmlFile = Join-Path $PSScriptRoot "temp_icon_$Size.html"
    Set-Content -Path $htmlFile -Value $htmlContent -Encoding UTF8
    
    $fileUri = "file:///" + ($htmlFile -replace '\\', '/')
    
    Write-Host "Rendering $PngFile at ${Size}x${Size}..."
    Start-Process -FilePath $edgePath -ArgumentList "--headless", "--disable-gpu", "--default-background-color=00000000", "--force-device-scale-factor=1", "--window-size=$Size,$Size", "--hide-scrollbars", "--screenshot=`"$pngPath`"", "`"$fileUri`"" -Wait -NoNewWindow
    
    Remove-Item $htmlFile
    Write-Host "Saved $PngFile"
}

Convert-SvgToPng "favicon.svg" "favicon.png" 512
Convert-SvgToPng "favicon.svg" "icon-512.png" 512
Convert-SvgToPng "favicon.svg" "icon-192.png" 192
Convert-SvgToPng "maskable-icon.svg" "maskable-icon-512.png" 512
Convert-SvgToPng "apple-touch-icon-source.svg" "apple-touch-icon.png" 512

Write-Host "All PNGs generated successfully."
