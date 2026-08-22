@echo off
setlocal
cd /d "%~dp0"
echo kr_travel - run dev port 5174
where npm >nul 2>nul || (echo npm not found & pause & exit /b 1)
if not exist "node_modules\" call npm install
echo open http://localhost:5174
call npm run dev -- --port 5174
pause
