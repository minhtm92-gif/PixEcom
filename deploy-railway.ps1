Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Railway Initial Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
Write-Host "Checking for Railway CLI..." -ForegroundColor Yellow
$railwayExists = Get-Command railway -ErrorAction SilentlyContinue
if (-not $railwayExists) {
    Write-Host "Railway CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @railway/cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install Railway CLI" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "Railway CLI version:" -ForegroundColor Green
railway --version
Write-Host ""

# Prompt for Railway token
$RAILWAY_TOKEN = Read-Host "Enter your Railway Token"
if ([string]::IsNullOrWhiteSpace($RAILWAY_TOKEN)) {
    Write-Host "ERROR: No token provided" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Set environment variable
$env:RAILWAY_TOKEN = $RAILWAY_TOKEN

# Navigate to backend directory
Write-Host "Navigating to backend directory..." -ForegroundColor Yellow
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\apps\api"
Write-Host "Current directory: $PWD" -ForegroundColor Green
Write-Host ""

# Set Railway IDs
$RAILWAY_PROJECT_ID = "9b1325ad-fb34-40e8-9594-6cbbd093ecb3"
$RAILWAY_SERVICE_ID = "ae6dc82f-8a62-4d00-8482-c05175045f69"

Write-Host "Linking to Railway project..." -ForegroundColor Yellow
railway link $RAILWAY_PROJECT_ID
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to link Railway project" -ForegroundColor Red
    Write-Host "Try running: railway login" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

Write-Host "Deploying to Railway..." -ForegroundColor Yellow
Write-Host "This may take 2-3 minutes..." -ForegroundColor Cyan
railway up --service $RAILWAY_SERVICE_ID
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Deployment failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Check deployment status:" -ForegroundColor Cyan
Write-Host "https://railway.app/project/$RAILWAY_PROJECT_ID/service/$RAILWAY_SERVICE_ID" -ForegroundColor Blue
Write-Host ""
Write-Host "Test your API:" -ForegroundColor Cyan
Write-Host "https://backend-production-46ad.up.railway.app/api/health" -ForegroundColor Blue
Write-Host ""

Read-Host "Press Enter to exit"
