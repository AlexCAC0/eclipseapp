@echo off
title Eclipse Studio APP
echo ========================================================
echo   ECLIPSE STUDIO APP - Workspace de Gestion y Tareas
echo ========================================================
echo.
echo Iniciando servidor local...
start http://localhost:8000
python server.py
pause
