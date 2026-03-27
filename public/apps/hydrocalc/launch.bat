@echo off
setlocal
cd /d "%~dp0app"

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [LAUNCHER] Node.js is missing. Attempting to install automatically via winget...
    where winget >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        echo [LAUNCHER] Found winget. Installing Node.js LTS...
        winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements --silent
        if %ERRORLEVEL% neq 0 (
            echo [ERROR] Automatic installation failed. 
            echo Please install Node.js manually from https://nodejs.org/
            pause
            exit
        )
        echo [SUCCESS] Node.js installed. Refreshing environment...
        set "PATH=%PATH%;C:\Program Files\nodejs\"
    ) else (
        echo [ERROR] winget not found. 
        echo Please install Node.js manually from https://nodejs.org/
        pause
        exit
    )
)

:: 2. Start the local server HIDDEN in the background
powershell -windowstyle hidden -command "Start-Process node -ArgumentList 'server.js' -WindowStyle Hidden"

:: 3. Wait a moment for server to start
timeout /t 1 /nobreak > nul

:: 4. Check for Edge
set EDGE_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist %EDGE_PATH% set EDGE_PATH="C:\Program Files\Microsoft\Edge\Application\msedge.exe"

if exist %EDGE_PATH% (
    start "" %EDGE_PATH% --app="http://localhost:8080/index.html"
) else (
    start http://localhost:8080/index.html
)

:: 5. Exit
endlocal
exit
