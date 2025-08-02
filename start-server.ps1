Write-Host "Starting KarmYog Server..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will be available at: http://localhost:3004" -ForegroundColor Yellow
Write-Host "Service Provider Dashboard: http://localhost:3004/providerdash" -ForegroundColor Cyan
Write-Host "Test Dashboard: http://localhost:3004/test-dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

try {
    node server.js
} catch {
    Write-Host "Error starting server. Please check if Node.js is installed." -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
