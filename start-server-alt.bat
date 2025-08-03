@echo off
echo Starting KarmYog Server on Alternative Port...
echo.
echo This will start the server on port 3005 instead of 3004
echo.
set PORT=3005
echo Server will be available at: http://localhost:3005
echo Service Provider Dashboard: http://localhost:3005/service-providerdashboard.html
echo Alternative Provider Dashboard: http://localhost:3005/providerdash
echo.
echo Press Ctrl+C to stop the server
echo.
node server.js
pause
