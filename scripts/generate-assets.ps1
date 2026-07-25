# Generates the PWA icons and the Open Graph card into public/.
# Windows-only (System.Drawing). Run: powershell -ExecutionPolicy Bypass -File scripts/generate-assets.ps1

Add-Type -AssemblyName System.Drawing

$public = Join-Path $PSScriptRoot "..\public"
New-Item -ItemType Directory -Force -Path $public | Out-Null

function New-RoundedPath($size, $radius) {
  $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $radius * 2
  $gp.AddArc(0, 0, $d, $d, 180, 90)
  $gp.AddArc($size - $d, 0, $d, $d, 270, 90)
  $gp.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
  $gp.AddArc(0, $size - $d, $d, $d, 90, 90)
  $gp.CloseFigure()
  return $gp
}

function New-Icon($size, $path) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
  $top = [System.Drawing.Color]::FromArgb(255, 9, 151, 255)
  $bottom = [System.Drawing.Color]::FromArgb(255, 0, 82, 200)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $top, $bottom, 90)
  $gp = New-RoundedPath $size ([int]($size * 0.125))
  $g.FillPath($brush, $gp)

  $font = New-Object System.Drawing.Font('Tahoma', [int]($size * 0.5), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $g.DrawString('H', $font, [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF(0, 0, $size, $size)), $sf)

  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "wrote $path"
}

function New-OgCard($path) {
  $w = 1200; $h = 630
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  # night-sky gradient background (matches the landing page)
  $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
  $c1 = [System.Drawing.Color]::FromArgb(255, 10, 10, 26)
  $c2 = [System.Drawing.Color]::FromArgb(255, 27, 40, 56)
  $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 135)
  $g.FillRectangle($bg, $rect)

  # four-quadrant flag
  $fx = 96; $fy = 130; $q = 34; $gap = 6
  $colors = @(
    [System.Drawing.Color]::FromArgb(255, 255, 62, 62),
    [System.Drawing.Color]::FromArgb(255, 0, 166, 81),
    [System.Drawing.Color]::FromArgb(255, 0, 120, 215),
    [System.Drawing.Color]::FromArgb(255, 255, 185, 0)
  )
  $g.TranslateTransform($fx, $fy)
  $g.RotateTransform(-5)
  $i = 0
  foreach ($col in $colors) {
    $qx = ($i % 2) * ($q + $gap)
    $qy = [Math]::Floor($i / 2) * ($q + $gap)
    $b = New-Object System.Drawing.SolidBrush($col)
    $g.FillRectangle($b, $qx, $qy, $q, $q)
    $b.Dispose()
    $i++
  }
  $g.ResetTransform()

  # text
  $white = [System.Drawing.Brushes]::White
  $titleFont = New-Object System.Drawing.Font('Segoe UI', 92, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $g.DrawString('Harit', $titleFont, $white, 88, 220)
  $dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 0, 120, 215))
  $dotFont = $titleFont
  $titleSize = $g.MeasureString('Harit', $titleFont)
  $g.DrawString('.', $dotFont, $dotBrush, 88 + $titleSize.Width - 30, 220)

  $subFont = New-Object System.Drawing.Font('Segoe UI', 36, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 200, 208, 220))
  $g.DrawString('Software Engineer & ML Researcher', $subFont, $subBrush, 92, 350)

  $tagFont = New-Object System.Drawing.Font('Segoe UI', 26, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $tagBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 130, 140, 160))
  # non-ASCII via char codes: PS 5.1 reads BOM-less scripts as ANSI
  $sep = [char]0x00B7
  $tagline = "Interactive Windows XP-style portfolio $sep AI assistant $sep Minesweeper included"
  $g.DrawString($tagline, $tagFont, $tagBrush, 92, 412)

  # XP-style taskbar strip
  # (precompute Y: comma binds tighter than minus inside New-Object arg lists)
  $tbY = $h - 64
  $tbRect = New-Object System.Drawing.Rectangle(0, $tbY, $w, 64)
  $tb1 = [System.Drawing.Color]::FromArgb(255, 41, 104, 205)
  $tb2 = [System.Drawing.Color]::FromArgb(255, 24, 80, 181)
  $tbBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($tbRect, $tb1, $tb2, 90)
  $g.FillRectangle($tbBrush, $tbRect)

  # green start button
  $sbRect = New-Object System.Drawing.Rectangle(0, $tbY, 190, 64)
  $sb1 = [System.Drawing.Color]::FromArgb(255, 93, 182, 67)
  $sb2 = [System.Drawing.Color]::FromArgb(255, 36, 121, 15)
  $sbBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($sbRect, $sb1, $sb2, 90)
  $sbPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $sbRectMain = New-Object System.Drawing.Rectangle(0, $tbY, 160, 64)
  $sbPath.AddRectangle($sbRectMain)
  $sbPath.AddEllipse(130, $tbY, 60, 64)
  $g.FillPath($sbBrush, $sbPath)
  $startFont = New-Object System.Drawing.Font('Trebuchet MS', 30, ([System.Drawing.FontStyle]::Bold -bor [System.Drawing.FontStyle]::Italic), [System.Drawing.GraphicsUnit]::Pixel)
  $g.DrawString('start', $startFont, $white, 52, $h - 47)

  # clock
  $clockFont = New-Object System.Drawing.Font('Tahoma', 22, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $g.DrawString('12:00 PM', $clockFont, $white, $w - 140, $h - 45)

  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "wrote $path"
}

New-Icon 180 (Join-Path $public "apple-touch-icon.png")
New-Icon 192 (Join-Path $public "icon-192.png")
New-Icon 512 (Join-Path $public "icon-512.png")
New-OgCard (Join-Path $public "og.png")
