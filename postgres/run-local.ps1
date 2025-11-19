# HomeVisit PostgreSQL and PostgREST Local Setup Script for Windows
# This script installs and runs PostgreSQL and PostgREST without Docker

# Requires: Administrator privileges
# Run as: powershell -ExecutionPolicy Bypass -File run-local.ps1

param(
    [switch]$Install,
    [switch]$Start,
    [switch]$Stop,
    [switch]$Clean
)

$PostgresqlVersion = "15.2-1"
$PostgresqlUrl = "https://get.enterprisedb.com/postgresql/postgresql-$PostgresqlVersion-windows-x64.exe"
$PostgRESTVersion = "12.0.2"
$PostgRESTUrl = "https://github.com/PostgREST/postgrest/releases/download/v$PostgRESTVersion/postgrest-v$PostgRESTVersion-windows-x64.exe"

$InstallPath = "C:\Program Files\PostgreSQL\15"
$DataPath = "C:\PostgreSQL\data"
$PostgRESTPath = "C:\PostgREST"
$ConfigPath = $PSScriptRoot

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  HomeVisit - PostgreSQL & PostgREST Local Setup (Windows)  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Function to check if running as admin
function Test-Admin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Function to install PostgreSQL
function Install-PostgreSQL {
    Write-Host "`n[1/4] Installing PostgreSQL..." -ForegroundColor Yellow
    
    if (Test-Path $InstallPath) {
        Write-Host "✓ PostgreSQL already installed at $InstallPath" -ForegroundColor Green
        return
    }
    
    $installer = "$env:TEMP\postgresql-installer.exe"
    Write-Host "Downloading PostgreSQL..." -ForegroundColor Gray
    
    try {
        Invoke-WebRequest -Uri $PostgresqlUrl -OutFile $installer -ErrorAction Stop
        Write-Host "Running PostgreSQL installer..." -ForegroundColor Gray
        & $installer /S /D=$InstallPath
        Write-Host "✓ PostgreSQL installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to download/install PostgreSQL: $_" -ForegroundColor Red
        exit 1
    }
}

# Function to initialize PostgreSQL database
function Initialize-Database {
    Write-Host "`n[2/4] Initializing PostgreSQL database..." -ForegroundColor Yellow
    
    if (-not (Test-Path $InstallPath)) {
        Write-Host "✗ PostgreSQL not found at $InstallPath" -ForegroundColor Red
        exit 1
    }
    
    $pgBin = "$InstallPath\bin"
    
    # Create data directory
    if (-not (Test-Path $DataPath)) {
        New-Item -ItemType Directory -Path $DataPath -Force | Out-Null
    }
    
    # Initialize cluster
    Write-Host "Initializing database cluster..." -ForegroundColor Gray
    & "$pgBin\initdb.exe" -D $DataPath -U postgres -A trust
    
    Write-Host "✓ Database initialized" -ForegroundColor Green
}

# Function to start PostgreSQL
function Start-PostgreSQL {
    Write-Host "`n[3/4] Starting PostgreSQL service..." -ForegroundColor Yellow
    
    $pgBin = "$InstallPath\bin"
    
    if (-not (Test-Path $pgBin)) {
        Write-Host "✗ PostgreSQL binary not found" -ForegroundColor Red
        exit 1
    }
    
    # Check if already running
    $pgProcess = Get-Process postgres -ErrorAction SilentlyContinue
    if ($pgProcess) {
        Write-Host "✓ PostgreSQL is already running (PID: $($pgProcess.Id))" -ForegroundColor Green
        return
    }
    
    # Start postgres
    Write-Host "Starting PostgreSQL server..." -ForegroundColor Gray
    & "$pgBin\pg_ctl.exe" -D $DataPath -l "$DataPath\logfile.log" start
    
    Start-Sleep -Seconds 3
    
    $pgProcess = Get-Process postgres -ErrorAction SilentlyContinue
    if ($pgProcess) {
        Write-Host "✓ PostgreSQL started successfully (PID: $($pgProcess.Id))" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to start PostgreSQL" -ForegroundColor Red
        exit 1
    }
}

# Function to initialize database schema
function Initialize-Schema {
    Write-Host "`n[4/4] Initializing database schema..." -ForegroundColor Yellow
    
    $pgBin = "$InstallPath\bin"
    $sqlScript = "$ConfigPath\db\init.sql"
    
    if (-not (Test-Path $sqlScript)) {
        Write-Host "✗ SQL script not found at $sqlScript" -ForegroundColor Red
        exit 1
    }
    
    # Wait for PostgreSQL to be ready
    Start-Sleep -Seconds 2
    
    Write-Host "Running initialization script..." -ForegroundColor Gray
    & "$pgBin\psql.exe" -U postgres -h localhost -f $sqlScript
    
    Write-Host "✓ Database schema initialized" -ForegroundColor Green
}

# Function to install PostgREST
function Install-PostgREST {
    Write-Host "`n[5/5] Installing PostgREST..." -ForegroundColor Yellow
    
    if (-not (Test-Path $PostgRESTPath)) {
        New-Item -ItemType Directory -Path $PostgRESTPath -Force | Out-Null
    }
    
    $postgrestExe = "$PostgRESTPath\postgrest.exe"
    
    if (Test-Path $postgrestExe) {
        Write-Host "✓ PostgREST already installed" -ForegroundColor Green
        return
    }
    
    Write-Host "Downloading PostgREST..." -ForegroundColor Gray
    
    try {
        Invoke-WebRequest -Uri $PostgRESTUrl -OutFile $postgrestExe -ErrorAction Stop
        Write-Host "✓ PostgREST installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to download PostgREST: $_" -ForegroundColor Red
        exit 1
    }
}

# Function to start PostgREST
function Start-PostgREST {
    Write-Host "`nStarting PostgREST..." -ForegroundColor Yellow
    
    $postgrestExe = "$PostgRESTPath\postgrest.exe"
    $configFile = "$ConfigPath\postgrest-local.conf"
    
    if (-not (Test-Path $postgrestExe)) {
        Write-Host "✗ PostgREST executable not found" -ForegroundColor Red
        exit 1
    }
    
    # Create local config if it doesn't exist
    if (-not (Test-Path $configFile)) {
        Create-PostgRESTConfig
    }
    
    # Check if already running
    $postgrestProcess = Get-Process postgrest -ErrorAction SilentlyContinue
    if ($postgrestProcess) {
        Write-Host "✓ PostgREST is already running (PID: $($postgrestProcess.Id))" -ForegroundColor Green
        return
    }
    
    Write-Host "Starting PostgREST server on http://localhost:3000..." -ForegroundColor Gray
    Start-Process -FilePath $postgrestExe -ArgumentList $configFile -NoNewWindow
    
    Start-Sleep -Seconds 2
    
    Write-Host "✓ PostgREST started successfully" -ForegroundColor Green
    Write-Host "  API endpoint: http://localhost:3000" -ForegroundColor Cyan
}

# Function to create PostgREST config
function Create-PostgRESTConfig {
    $config = @"
db-uri = "postgres://postgres@localhost:5432/postgres"
db-schema = "public"
db-anon-role = "anon"
server-host = "127.0.0.1"
server-port = 3000
jwt-secret = "a_very_secret_jwt_secret_should_be_long_enough"
"@
    
    Set-Content -Path "$ConfigPath\postgrest-local.conf" -Value $config
    Write-Host "✓ Created PostgREST config: $ConfigPath\postgrest-local.conf" -ForegroundColor Green
}

# Function to stop services
function Stop-Services {
    Write-Host "`nStopping services..." -ForegroundColor Yellow
    
    # Stop PostgREST
    $postgrestProcess = Get-Process postgrest -ErrorAction SilentlyContinue
    if ($postgrestProcess) {
        Stop-Process -Name postgrest -Force
        Write-Host "✓ PostgREST stopped" -ForegroundColor Green
    }
    
    # Stop PostgreSQL
    $pgBin = "$InstallPath\bin"
    if (Test-Path $pgBin) {
        & "$pgBin\pg_ctl.exe" -D $DataPath stop
        Write-Host "✓ PostgreSQL stopped" -ForegroundColor Green
    }
}

# Function to clean up
function Clean-Installation {
    Write-Host "`nCleaning up installation..." -ForegroundColor Yellow
    
    Stop-Services
    
    if (Test-Path $DataPath) {
        Remove-Item -Path $DataPath -Recurse -Force
        Write-Host "✓ Removed database data" -ForegroundColor Green
    }
    
    Write-Host "✓ Cleanup complete" -ForegroundColor Green
}

# Main execution
try {
    if (-not (Test-Admin)) {
        Write-Host "`n✗ This script must be run as Administrator" -ForegroundColor Red
        Write-Host "   Please run: powershell -ExecutionPolicy Bypass -File run-local.ps1" -ForegroundColor Gray
        exit 1
    }
    
    if ($Install) {
        Install-PostgreSQL
        Initialize-Database
        Initialize-Schema
        Install-PostgREST
        Start-PostgreSQL
        Start-PostgREST
        
        Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║           ✓ Setup Complete!                                ║" -ForegroundColor Green
        Write-Host "╠════════════════════════════════════════════════════════════╣" -ForegroundColor Green
        Write-Host "║  PostgreSQL: localhost:5432                               ║" -ForegroundColor Green
        Write-Host "║  PostgREST:  http://localhost:3000                        ║" -ForegroundColor Green
        Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
        
    } elseif ($Start) {
        Start-PostgreSQL
        Start-PostgREST
        
        Write-Host "`n✓ Services started" -ForegroundColor Green
        
    } elseif ($Stop) {
        Stop-Services
        
    } elseif ($Clean) {
        Clean-Installation
        
    } else {
        # Default: just start if not already running
        Start-PostgreSQL
        Start-PostgREST
        
        Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║           ✓ Services Running!                              ║" -ForegroundColor Green
        Write-Host "╠════════════════════════════════════════════════════════════╣" -ForegroundColor Green
        Write-Host "║  PostgreSQL: localhost:5432 (user: postgres)              ║" -ForegroundColor Green
        Write-Host "║  PostgREST:  http://localhost:3000                        ║" -ForegroundColor Green
        Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    }
    
} catch {
    Write-Host "`n✗ Error: $_" -ForegroundColor Red
    exit 1
}
