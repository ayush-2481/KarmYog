@echo off
echo 🔧 KarmYog Server Startup Script
echo ================================
echo.

echo 🔍 Checking for existing Node.js processes...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe" >NUL
if "%ERRORLEVEL%"=="0" (
    echo ⚠️  Found existing Node.js processes. Stopping them...
    taskkill /F /IM node.exe >NUL 2>&1
    timeout /t 2 >NUL
    echo ✅ Previous processes stopped.
) else (
    echo ✅ No existing Node.js processes found.
)

echo.
echo 🚀 Starting KarmYog Server...
echo 📍 Port: 3004
echo 🌐 URL: http://localhost:3004
echo.
echo Press Ctrl+C to stop the server
echo ================================
echo.

cd /d "%~dp0"
node server.js

pause
