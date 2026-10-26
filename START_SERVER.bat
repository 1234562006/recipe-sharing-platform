@echo off
cd /d "%~dp0"
echo ======================================================
echo   Starting RecipeNest on http://localhost:5000
echo ======================================================
start http://localhost:5000
npm start
pause