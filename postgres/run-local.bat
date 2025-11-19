@echo off
REM HomeVisit - PostgreSQL & PostgREST Local Setup (Windows Batch Wrapper)
REM This script runs the PowerShell setup script with proper permissions

setlocal enabledelayedexpansion

REM Check if running as admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║ This script must be run as Administrator                  ║
    echo ║                                                            ║
    echo ║ Right-click this file and select "Run as administrator"   ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    pause
    exit /b 1
)

REM Get script directory
set SCRIPT_DIR=%~dp0

REM Parse command line arguments
set CMD=%1
if "%CMD%"=="" set CMD=start

REM Run PowerShell script
powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%run-local.ps1" -%CMD%

if %errorLevel% equ 0 (
    echo.
    pause
)

endlocal
