Write-Host "🚨 INSTANT PORT FIX - Changing to Port 3005" -ForegroundColor Red
Write-Host ""

# Kill all Node processes
taskkill /F /IM node.exe /T 2>$null
Write-Host "✅ Killed all Node.js processes" -ForegroundColor Green

# Change to project directory
Set-Location "c:\Users\iPC\karmyog\KarmYog"
Write-Host "✅ Changed to project directory" -ForegroundColor Green

# Backup original server.js
Copy-Item "server.js" "server-backup-original.js" -Force
Write-Host "✅ Backup created: server-backup-original.js" -ForegroundColor Green

# Change port from 3004 to 3005
(Get-Content "server.js") -replace "app\.listen\(3004", "app.listen(3005" | Set-Content "server.js"
(Get-Content "server.js") -replace "port 3004", "port 3005" | Set-Content "server.js"
(Get-Content "server.js") -replace ":3004", ":3005" | Set-Content "server.js"
Write-Host "✅ Port changed from 3004 to 3005" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Starting server on NEW PORT 3005..." -ForegroundColor Cyan
Write-Host "📍 NEW URL: http://localhost:3005" -ForegroundColor Yellow
Write-Host "🔧 NEW Test URL: http://localhost:3005/URGENT-FIX-TEST.html" -ForegroundColor Yellow
Write-Host ""

# Start server
node server.js
