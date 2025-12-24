@echo off
setlocal enabledelayedexpansion

set count=0

echo Replacing original images with optimized versions...
echo.

for /r "public\images" %%F in (*.optimized.jpg *.optimized.jpeg *.optimized.png *.optimized.webp) do (
    set "optFile=%%F"
    set "origFile=!optFile:.optimized=!"

    if exist "!origFile!" (
        del /f /q "!origFile!"
        ren "!optFile!" "%%~nxF"
        set /a count+=1
        echo Replaced: %%~nF
    )
)

echo.
echo ============================================================
echo Replacement Complete!
echo    Replaced: %count% images
echo ============================================================
