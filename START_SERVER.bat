@echo off
echo.
echo ===============================================
echo   KarmYog Server Startup
echo ===============================================
echo.
echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed.
echo.
echo Starting KarmYog Server...
echo.
echo Server URLs:
echo   Home: http://localhost:3004/
echo   Provider Dashboard: http://localhost:3004/providerdash
echo   Test Dashboard: http://localhost:3004/test-dashboard
echo   Admin Panel: http://localhost:3004/admin
echo.
echo Press Ctrl+C to stop the server
echo ===============================================
echo.

node server.js

echo.
echo Server stopped.
pause
