Write-Host "🔧 Resolving Port 3004 Conflict..." -ForegroundColor Yellow

# Kill any processes using port 3004
Write-Host "Checking for processes using port 3004..." -ForegroundColor Cyan

# Method 1: Using netstat to find and kill processes
$processes = netstat -ano | Select-String ":3004" | ForEach-Object {
    $fields = $_.ToString().Split(' ', [StringSplitOptions]::RemoveEmptyEntries)
    if ($fields.Length -gt 4) {
        $fields[-1]  # Get the PID (last field)
    }
} | Sort-Object -Unique

if ($processes) {
    Write-Host "Found processes using port 3004: $($processes -join ', ')" -ForegroundColor Red
    foreach ($pid in $processes) {
        try {
            Write-Host "Stopping process $pid..." -ForegroundColor Yellow
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "✅ Process $pid stopped" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠️ Could not stop process $pid" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "✅ No processes found using port 3004" -ForegroundColor Green
}

# Method 2: Kill all node.exe processes as backup
Write-Host "Stopping all Node.js processes..." -ForegroundColor Cyan
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✅ All Node.js processes stopped" -ForegroundColor Green
}
catch {
    Write-Host "ℹ️ No Node.js processes found" -ForegroundColor Blue
}

# Wait a moment for processes to fully stop
Start-Sleep -Seconds 2

# Navigate to project directory
Set-Location "c:\Users\iPC\karmyog\KarmYog"

Write-Host "`n🚀 Starting KarmYog Server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:3004" -ForegroundColor Cyan
Write-Host "Customer Profile Fix Tool: http://localhost:3004/immediate-fix.html" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "==========================================`n" -ForegroundColor Magenta

# Start the server
node server.js
