@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
title SingingHill Tuner Plugin

py -3 -c "import sys" >nul 2>&1
if %errorlevel%==0 (
    py -3 "%~dp0tools\tuner\server.py"
    goto :done
)

python -c "import sys" >nul 2>&1
if %errorlevel%==0 (
    python "%~dp0tools\tuner\server.py"
    goto :done
)

where powershell >nul 2>&1
if %errorlevel%==0 (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\tuner\server.ps1"
    goto :done
)

echo [Error] Neither Python nor PowerShell was found to start the tuner plugin server.
exit /b 1

:done
if %errorlevel% neq 0 (
    echo.
    echo Tuner plugin server exited with code %errorlevel%.
    pause
)
endlocal
