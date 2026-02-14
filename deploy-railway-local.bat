@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Railway Initial Deployment Script
echo ========================================
echo.

REM Check if Railway CLI is installed
echo Checking for Railway CLI...
where railway >nul 2>&1
if %errorlevel% neq 0 (
    echo Railway CLI not found. Installing...
    call npm install -g @railway/cli
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Railway CLI
        pause
        exit /b 1
    )
)

echo Railway CLI version:
call railway --version
if %errorlevel% neq 0 (
    echo ERROR: Railway CLI not working properly
    pause
    exit /b 1
)
echo.

REM Prompt for Railway token
set /p RAILWAY_TOKEN="Enter your Railway Token: "
if "!RAILWAY_TOKEN!"=="" (
    echo ERROR: No token provided
    pause
    exit /b 1
)
echo.

REM Navigate to backend directory
echo Navigating to backend directory...
cd /d "%~dp0apps\api"
if %errorlevel% neq 0 (
    echo ERROR: Failed to navigate to apps\api directory
    pause
    exit /b 1
)
echo Current directory: %CD%
echo.

REM Set environment variables
set RAILWAY_PROJECT_ID=9b1325ad-fb34-40e8-9594-6cbbd093ecb3
set RAILWAY_SERVICE_ID=ae6dc82f-8a62-4d00-8482-c05175045f69

echo Linking to Railway project...
call railway link %RAILWAY_PROJECT_ID%
if %errorlevel% neq 0 (
    echo ERROR: Failed to link Railway project
    echo Try running: railway login
    pause
    exit /b 1
)
echo.

echo Deploying to Railway...
echo This may take 2-3 minutes...
call railway up --service %RAILWAY_SERVICE_ID%
if %errorlevel% neq 0 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Check deployment status:
echo https://railway.app/project/%RAILWAY_PROJECT_ID%/service/%RAILWAY_SERVICE_ID%
echo.
echo Test your API:
echo https://backend-production-46ad.up.railway.app/api/health
echo.

pause
endlocal
