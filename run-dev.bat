@echo off
setlocal
cd /d "%~dp0"
echo ==========================================
echo  kr_travel - run dev (npm run dev)
echo ==========================================
where npm >nul 2>nul || (echo [ERROR] npm not found, install Node.js & pause & exit /b 1)
if not exist "node_modules\" (echo [INFO] node_modules not found, running npm install... & call npm install)
echo [INFO] starting npm run dev ... open http://localhost:5173
call npm run dev
pause
