@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0.."
title Instalador - CSP Sistemas Digitais

echo ============================================
echo   CSP Sistemas Digitais - Instalador
echo ============================================
echo.

echo [1/5] Verificando o Node.js...
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERRO] Node.js nao foi encontrado neste computador.
  echo Baixe e instale a versao LTS em https://nodejs.org/ ,
  echo reinicie o computador e execute este instalador novamente.
  echo.
  pause
  exit /b 1
)
echo       OK.

echo [2/5] Verificando o gerenciador de pacotes pnpm...
where pnpm >nul 2>nul
if errorlevel 1 (
  echo       pnpm nao encontrado, instalando...
  call npm install -g pnpm
  if errorlevel 1 (
    echo.
    echo [ERRO] Nao foi possivel instalar o pnpm.
    echo.
    pause
    exit /b 1
  )
)
echo       OK.

echo [3/5] Instalando dependencias do projeto...
echo       (isso pode levar alguns minutos na primeira vez)
call pnpm install
if errorlevel 1 (
  echo.
  echo [ERRO] Falha ao instalar as dependencias do projeto.
  echo.
  pause
  exit /b 1
)
echo       OK.

echo [4/5] Gerando a versao de producao do site...
call pnpm build
if errorlevel 1 (
  echo.
  echo [ERRO] Falha ao gerar a versao de producao.
  echo.
  pause
  exit /b 1
)
echo       OK.

echo [5/5] Criando atalhos...
cscript //nologo "%~dp0create_shortcut.vbs" "Desktop" "CSP Sistemas Digitais" "%~dp0Iniciar.bat" "%~dp0.."
cscript //nologo "%~dp0create_shortcut.vbs" "StartMenu" "CSP Sistemas Digitais" "%~dp0Iniciar.bat" "%~dp0.."
echo       OK.

echo.
echo ============================================
echo   Instalacao concluida com sucesso!
echo.
echo   Use o atalho "CSP Sistemas Digitais" que foi
echo   criado na Area de Trabalho (e no Menu Iniciar)
echo   para abrir o site sempre que quiser.
echo ============================================
echo.
echo Senha padrao do painel administrativo (/admin): csp@admin2026
echo Pode ser alterada no arquivo .env, na pasta do projeto.
echo.
pause
