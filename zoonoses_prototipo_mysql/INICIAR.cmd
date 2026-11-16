@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Instale Node.js 22.12 ou superior para continuar.
 pause
 exit /b 1
)
if not exist node_modules (
 call npm.cmd install --no-audit --no-fund
 if errorlevel 1 goto erro
)
if not exist .env (
 call npm.cmd run setup
 if errorlevel 1 goto erro
)
call npm.cmd run build
if errorlevel 1 goto erro
echo Abra http://127.0.0.1:4310 no navegador.
set OPEN_BROWSER=1
call npm.cmd start
goto fim
:erro
echo Nao foi possivel iniciar. Confira a mensagem acima.
:fim
pause
