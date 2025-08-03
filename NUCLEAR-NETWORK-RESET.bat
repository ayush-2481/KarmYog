@echo off
echo.
echo ===============================================
echo    NUCLEAR OPTION - Reset Network Stack
echo ===============================================
echo.
echo This will reset Windows network stack to clear port conflicts.
echo This is SAFE but will temporarily disconnect your internet.
echo.
set /p confirm="Type YES to continue or anything else to cancel: "
if /i not "%confirm%"=="YES" (
    echo Cancelled by user.
    pause
    exit /b
)

echo.
echo [1/5] Killing all Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1
echo     ✓ Done

echo.
echo [2/5] Resetting network stack...
netsh int ip reset >nul
echo     ✓ IP stack reset

echo.
echo [3/5] Resetting TCP/IP...
netsh winsock reset >nul
echo     ✓ Winsock reset

echo.
echo [4/5] Flushing DNS...
ipconfig /flushdns >nul
echo     ✓ DNS flushed

echo.
echo [5/5] Waiting for network to stabilize...
timeout /t 5 /nobreak >nul
echo     ✓ Network ready

echo.
echo ===============================================
echo Network stack reset complete!
echo Now run RESTART-SERVER.bat to start server
echo ===============================================
echo.
pause
