@echo off
title FlowPilot - Phase 4 Update
cd /d "%~dp0"
echo.
echo  ============================================
echo   FlowPilot - Phase 4 (Workspace Management)
echo   Database ko upgrade kar rahe hain
echo  ============================================
echo.
echo  [Step 1/3] Nayi libraries (agar koi) install ho rahi hain...
echo.
call npm install
if errorlevel 1 goto :error

echo.
echo  [Step 2/3] Database me Phase 4 tables/columns ban rahe hain...
echo   (invitations, settings, workspace switching - sab additive, data safe)
echo.
call npx prisma migrate deploy
if errorlevel 1 goto :error

echo.
echo  [Step 3/3] Prisma client regenerate ho raha hai...
echo.
call npx prisma generate
if errorlevel 1 goto :error

echo.
echo  ============================================
echo   UPDATE COMPLETE! Ab app start ho raha hai...
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
