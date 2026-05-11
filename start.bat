@echo off
echo ============================================
echo    Elevate AI Image Application Setup
echo ============================================
echo.

echo Step 1: Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo Step 2: Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo Step 3: Setting up environment variables...
cd backend
if not exist .env (
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit backend\.env and add your API keys!
    echo - Cloudinary credentials
    echo - Supabase credentials
    echo.
    echo Press any key after editing .env...
    pause
) else (
    echo .env file already exists
)
cd ..

echo.
echo Step 4: Starting the application...
echo.
echo Opening two terminals for frontend and backend...
echo.

start cmd /k "cd frontend && npm start"
timeout /t 3 /nobreak > nul
start cmd /k "cd backend && node server.js"

echo.
echo ============================================
echo    Application Started Successfully!
echo ============================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Press any key to exit...
pause > nul