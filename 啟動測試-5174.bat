@echo off
setlocal
cd /d "%~dp0"
echo ==========================================
echo  kr_travel - 啟動測試 (port 5174)
echo ==========================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo [錯誤] 找不到 npm，請先安裝 Node.js (https://nodejs.org)
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo [提示] 未偵測到 node_modules，正在執行 npm install ...
  call npm install
  if errorlevel 1 (
    echo [錯誤] npm install 失敗
    pause
    exit /b 1
  )
)

echo [啟動] 執行 npm run dev -- --port 5174
echo [提示] 瀏覽器請開啟 http://localhost:5174
echo [提示] 原 5173 可同時保留，兩個並行測試
echo.
call npm run dev -- --port 5174 --strictPort false
pause
