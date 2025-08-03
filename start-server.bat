@echo off
echo Starting KarmYog Server...
echo.

:: Check if port 3004 is in use and kill any existing processes
echo Checking if port 3004 is in use...
netstat -ano | findstr :3004 > nul
if %errorlevel%==0 (
    echo Port 3004 is in use. Stopping existing processes...
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3004') do (
        echo Stopping process %%i
        taskkill /F /PID %%i 2>nul
    )
    timeout /t 2 /nobreak > nul
    echo Previous processes stopped.
) else (
    echo Port 3004 is free.
)

echo.
echo Server will be available at: http://localhost:3004
echo Service Provider Dashboard: http://localhost:3004/service-providerdashboard.html
echo Alternative Provider Dashboard: http://localhost:3004/providerdash
echo Test Dashboard: http://localhost:3004/test-dashboard
echo.
echo Press Ctrl+C to stop the server
echo.
node server.js
pause
