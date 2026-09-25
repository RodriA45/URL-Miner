@echo off
title Extractor de Enlaces - Servidor
color 0A

echo =======================================================
echo          EXTRACTOR DE ENLACES - INICIO RAPIDO
echo =======================================================
echo.
echo [*] Paso 1: Verificando dependencias necesarias...
call npm install >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Error al instalar dependencias. Asegurate de tener Node.js instalado.
    pause
    exit /b %errorlevel%
)
echo [OK] Dependencias verificadas y actualizadas.
echo.

echo [*] Paso 2: Iniciando el entorno de la aplicacion...
echo [*] El navegador se abrira automaticamente en unos segundos...
echo.
echo (Puedes minimizar esta ventana, pero no la cierres mientras uses la app)
echo =======================================================

:: Usamos el flag --open para que Vite abra el navegador cuando este listo
call npm run dev -- --open

pause
