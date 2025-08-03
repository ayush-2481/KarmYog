@echo off
echo.
echo ===============================================
echo    KarmYog Server Quick Restart
echo ===============================================
echo.

echo [1/4] Stopping existing Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✓ Existing processes stopped
) else (
    echo     ℹ No existing Node.js processes found
)

echo.
echo [2/4] Waiting for processes to terminate...
timeout /t 3 /nobreak >nul

echo.
echo [3/4] Changing to project directory...
cd /d "c:\Users\iPC\karmyog\KarmYog"
echo     ✓ Directory: %cd%

echo.
echo [4/4] Starting KarmYog server...
echo.
echo     🚀 Server starting on port 3004
echo     📍 URL: http://localhost:3004
echo     🔧 Debug: http://localhost:3004/server-debug-panel.html
echo     🐛 Test: http://localhost:3004/debug-400-error.html
echo.
echo ===============================================
echo Press Ctrl+C to stop the server
echo ===============================================
echo.

node server.js

echo.
echo Server stopped. Press any key to close...
pause >nul
