# PowerShell script to replace original images with optimized versions
# Usage: .\tools\replace-optimized.ps1

$baseDir = "public\images"
$count = 0
$errors = 0

Write-Host "Replacing original images with optimized versions..." -ForegroundColor Cyan
Write-Host ""

Get-ChildItem -Path $baseDir -Recurse -File -Filter "*.optimized.*" | ForEach-Object {
    $optimizedFile = $_.FullName
    $originalFile = $optimizedFile -replace '\.optimized\.(jpg|jpeg|png|webp)$', '.$1'

    try {
        if (Test-Path $originalFile) {
            Remove-Item $originalFile -Force
            Rename-Item $optimizedFile $originalFile -Force
            Write-Host "Replaced: $($_.Directory.Name)\$([System.IO.Path]::GetFileName($originalFile))" -ForegroundColor Green
            $count++
        } else {
            Write-Host "Original not found: $originalFile" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Error replacing $originalFile : $($_.Exception.Message)" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "Replacement Complete!" -ForegroundColor Green
Write-Host "Replaced: $count images"
Write-Host "Errors: $errors images"
