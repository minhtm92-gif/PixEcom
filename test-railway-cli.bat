@echo off
echo Testing Railway CLI installation...
echo.

echo 1. Checking if Railway CLI is installed...
where railway
if %errorlevel% neq 0 (
    echo Railway CLI NOT FOUND
    echo Installing Railway CLI...
    npm install -g @railway/cli
) else (
    echo Railway CLI FOUND
)
echo.

echo 2. Checking Railway CLI version...
railway --version
echo.

echo 3. Current directory:
cd
echo.

echo 4. Backend directory exists?
if exist "apps\api" (
    echo YES - apps\api directory exists
) else (
    echo NO - apps\api directory NOT found
)
echo.

echo 5. Press any key to close...
pause
