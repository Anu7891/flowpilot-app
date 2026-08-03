@echo off
title FlowPilot - First Time Setup
cd /d "%~dp0"
echo.
echo  ============================================
echo   FlowPilot Backend - One Time Setup
echo  ============================================
echo.
echo  [Step 1/4] Libraries install ho rahi hain (2-3 min)...
echo.
call npm install
if errorlevel 1 goto :error

echo.
echo  [Step 2/4] Database me tables ban rahe hain...
echo.
call npx prisma migrate dev --name init
if errorlevel 1 goto :error

echo.
echo  [Step 3/4] Demo data bhara ja raha hai...
echo.
call npm run db:seed
if errorlevel 1 goto :error

echo.
echo  ============================================
echo   SETUP COMPLETE! Ab app start ho raha hai...
echo   Browser me kholo:  http://localhost:3000
echo   Band karne ke liye: is window me Ctrl+C
echo   Agli baar sirf START.bat double-click karna.
echo  ============================================
echo.
call npm run dev
goto :end

:error
echo.
echo  ****************************************************
echo   Kuch galat hua. Upar wala red/error message
echo   screenshot karke Claude ko bhej do - fix mil jayega.
echo   (Sabse common wajah: .env me DATABASE_URL sahi nahi)
echo  ****************************************************
pause

:end
