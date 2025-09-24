@echo off
echo 🚀 Starting Kaggle Dataset Import Process...
echo.

echo Step 1: Testing setup...
call npm run test-kaggle
if %errorlevel% neq 0 (
    echo ❌ Setup test failed. Please fix the issues above.
    pause
    exit /b 1
)

echo.
echo Step 2: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo Step 3: Starting dataset import...
echo This may take 30-60 minutes depending on your internet speed.
echo.
call npm run import-kaggle

echo.
echo ✅ Import process completed!
pause

