@echo off
chcp 65001 >nul
setlocal
title Desinstalador - CSP Sistemas Digitais

echo Isso remove apenas os atalhos criados pelo instalador
echo (Area de Trabalho e Menu Iniciar). Os arquivos do site,
echo os aplicativos cadastrados e o historico de visitas NAO
echo sao apagados.
echo.
set /p confirm="Remover os atalhos agora? (S/N) "
if /i not "%confirm%"=="S" (
  echo Cancelado.
  pause
  exit /b 0
)

for %%F in ("%USERPROFILE%\Desktop\CSP Sistemas Digitais.lnk") do if exist "%%~F" del "%%~F"
for /f "delims=" %%P in ('powershell -NoProfile -Command "(New-Object -ComObject WScript.Shell).SpecialFolders('Programs')"') do set "STARTMENU=%%P"
if exist "%STARTMENU%\CSP Sistemas Digitais.lnk" del "%STARTMENU%\CSP Sistemas Digitais.lnk"

echo.
echo Atalhos removidos.
pause
