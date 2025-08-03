@echo off
echo Starting KarmYog server for debugging 400 error...
echo.

REM Kill any existing Node.js processes
taskkill /F /IM node.exe /T >nul 2>&1

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start the server
echo Server starting on port 3004...
echo Debug mode: Enhanced logging enabled
echo.
echo Test URL: http://localhost:3004/debug-400-error.html
echo.

cd /d "c:\Users\iPC\karmyog\KarmYog"
node server.js

pause
