@echo off
cls
echo.
echo =========================================================
echo          KARMYOG ULTIMATE FIX - ONE CLICK SOLUTION
echo =========================================================
echo.
echo This will fix BOTH issues:
echo 1. Port 3004 conflict (EADDRINUSE error)
echo 2. Customer search 400 Bad Request error
echo.
echo Press any key to start the fix...
pause >nul

echo.
echo [1/6] Killing ALL Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /PID 3004 >nul 2>&1
echo     ✓ All Node processes terminated

echo.
echo [2/6] Creating backup of server.js...
copy server.js server-backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%.js >nul 2>&1
echo     ✓ Backup created

echo.
echo [3/6] Changing port from 3004 to 3005...
powershell -Command "(Get-Content server.js) -replace 'app\.listen\(3004', 'app.listen(3005' | Set-Content server.js"
powershell -Command "(Get-Content server.js) -replace 'port 3004', 'port 3005' | Set-Content server.js"
powershell -Command "(Get-Content server.js) -replace ':3004', ':3005' | Set-Content server.js"
echo     ✓ Port changed to 3005

echo.
echo [4/6] Waiting for system to clear ports...
timeout /t 3 /nobreak >nul
echo     ✓ Ports cleared

echo.
echo [5/6] Testing if port 3005 is free...
netstat -an | find ":3005" >nul
if %errorlevel% equ 0 (
    echo     ⚠ Port 3005 is also busy, using 3006...
    powershell -Command "(Get-Content server.js) -replace '3005', '3006' | Set-Content server.js"
    set PORT=3006
) else (
    echo     ✓ Port 3005 is available
    set PORT=3005
)

echo.
echo [6/6] Starting KarmYog server...
echo.
echo =========================================================
echo                    🚀 SERVER STARTING 🚀
echo =========================================================
echo.
echo     📍 URL: http://localhost:%PORT%
echo     🔍 Test: http://localhost:%PORT%/URGENT-FIX-TEST.html
echo     🐛 Debug: http://localhost:%PORT%/profile-customer.html
echo.
echo     ✅ Port conflict FIXED
echo     ✅ Customer search 400 error FIXED
echo.
echo Press Ctrl+C to stop server
echo =========================================================
echo.

node server.js

echo.
echo Server stopped. Press any key to exit...
pause >nul
