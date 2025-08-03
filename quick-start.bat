@echo off
echo 🔧 QUICK FIX for Port 3004 Conflict
echo.

:: Kill all node.exe processes
echo Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel%==0 (
    echo ✅ Node.js processes stopped
) else (
    echo ℹ️ No Node.js processes found
)

:: Wait a moment
timeout /t 2 /nobreak > nul

:: Change to project directory
cd /d "c:\Users\iPC\karmyog\KarmYog"

echo.
echo 🚀 Starting KarmYog Server...
echo Server will be at: http://localhost:3004
echo Fix Tool: http://localhost:3004/immediate-fix.html
echo.
echo Press Ctrl+C to stop the server
echo ==========================================
echo.

:: Start the server
node server.js

pause
