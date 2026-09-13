@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0.."
title CSP Sistemas Digitais

echo ============================================
echo   CSP Sistemas Digitais
echo ============================================
echo.

if not exist "dist\index.js" (
  echo [ERRO] A versao de producao ainda nao foi gerada.
  echo Execute "Instalar.bat" primeiro.
  echo.
  pause
  exit /b 1
)

echo Iniciando o servidor local...
echo O navegador vai abrir sozinho em instantes.
echo.
echo Para ENCERRAR o site, feche esta janela.
echo.

call pnpm start

pause
