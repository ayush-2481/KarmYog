# KarmYog Server Restart Script
Write-Host "🔄 KarmYog Server Restart - Fixing Port 3004 Conflict" -ForegroundColor Yellow
Write-Host ""

# Kill any existing Node.js processes
Write-Host "🚫 Stopping existing Node.js processes..." -ForegroundColor Red
try {
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Existing Node.js processes stopped" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ No existing Node.js processes found" -ForegroundColor Blue
}

# Additional cleanup - kill any process using port 3004
Write-Host "🔍 Finding processes using port 3004..." -ForegroundColor Blue
try {
    $connections = Get-NetTCPConnection -LocalPort 3004 -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $processId = $conn.OwningProcess
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "🔫 Killing process: $($process.ProcessName) (PID: $processId)" -ForegroundColor Red
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        }
        Write-Host "✅ All processes using port 3004 terminated" -ForegroundColor Green
    } else {
        Write-Host "✅ No processes found using port 3004" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Could not check port 3004 usage (this is normal on some systems)" -ForegroundColor Yellow
}

# Additional brute force cleanup using netstat and taskkill
Write-Host "🔧 Running additional port cleanup..." -ForegroundColor Blue
try {
    $netstatOutput = netstat -ano | Select-String ":3004"
    if ($netstatOutput) {
        Write-Host "⚠️ Found processes still using port 3004:" -ForegroundColor Yellow
        foreach ($line in $netstatOutput) {
            $parts = $line.ToString().Split(' ', [StringSplitOptions]::RemoveEmptyEntries)
            if ($parts.Length -ge 5) {
                $pid = $parts[-1]
                Write-Host "🔫 Killing PID: $pid" -ForegroundColor Red
                taskkill /F /PID $pid 2>$null
            }
        }
    }
} catch {
    Write-Host "ℹ️ Netstat cleanup completed" -ForegroundColor Blue
}

# Wait for processes to fully terminate
Write-Host "⏳ Waiting for processes to terminate..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Change to project directory
Write-Host "📁 Changing to project directory..." -ForegroundColor Blue
Set-Location "c:\Users\iPC\karmyog\KarmYog"

# Check if port 3004 is free
Write-Host "🔍 Final check - is port 3004 available?" -ForegroundColor Blue
$portCheck = netstat -an | Select-String ":3004"
if ($portCheck) {
    Write-Host "❌ ERROR: Port 3004 is STILL in use after cleanup!" -ForegroundColor Red
    Write-Host $portCheck -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🆘 MANUAL FIX REQUIRED:" -ForegroundColor Red
    Write-Host "1. Restart your computer to clear all port conflicts" -ForegroundColor Yellow
    Write-Host "2. Or change server port in server.js from 3004 to 3005" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to try starting anyway (will likely fail)"
} else {
    Write-Host "✅ Port 3004 is now available!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting KarmYog server..." -ForegroundColor Green
Write-Host "📍 Server will be available at: http://localhost:3004" -ForegroundColor Cyan
Write-Host "🔧 Debug panel: http://localhost:3004/server-debug-panel.html" -ForegroundColor Cyan
Write-Host "🐛 Customer search test: http://localhost:3004/debug-400-error.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Gray

# Start the server
node server.js
