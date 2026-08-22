@echo off
setlocal
cd /d "%~dp0"
echo Starting Seoul Travel local development server...
call npm run dev
pause
