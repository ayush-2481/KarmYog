@echo off
echo.
echo ===============================================
echo    EMERGENCY PORT FIX - Change to Port 3005
echo ===============================================
echo.

echo [STEP 1] Creating backup of server.js...
copy server.js server-backup.js >nul
if %errorlevel% equ 0 (
    echo     ✓ Backup created: server-backup.js
) else (
    echo     ✗ Backup failed - continuing anyway
)

echo.
echo [STEP 2] Changing port from 3004 to 3005...
powershell -Command "(Get-Content server.js) -replace 'app\.listen\(3004', 'app.listen(3005' | Set-Content server.js"
powershell -Command "(Get-Content server.js) -replace 'port 3004', 'port 3005' | Set-Content server.js"
powershell -Command "(Get-Content server.js) -replace ':3004', ':3005' | Set-Content server.js"
echo     ✓ Port changed to 3005

echo.
echo [STEP 3] Killing all Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1
echo     ✓ All Node.js processes stopped

echo.
echo [STEP 4] Starting server on NEW PORT 3005...
echo.
echo     🚀 NEW SERVER URL: http://localhost:3005
echo     🔧 NEW Debug URL: http://localhost:3005/URGENT-FIX-TEST.html
echo     🆘 If this fails, restart your computer
echo.
echo ===============================================
echo Press Ctrl+C to stop the server
echo ===============================================
echo.

node server.js

echo.
echo Server stopped. 
echo To restore original port 3004, run: copy server-backup.js server.js
pause
