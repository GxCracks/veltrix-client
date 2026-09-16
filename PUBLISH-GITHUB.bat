@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0publish-github.ps1"
if errorlevel 1 (
  echo.
  echo Publishing failed. Read the message above.
  pause
  exit /b 1
)
echo.
echo Finished.
pause
