@echo off
setlocal
cd /d "%~dp0"

echo Creating Desktop Shortcut for HydroCalc...

set "SCRIPT_PATH=%~dp0launch.bat"
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\HydroCalc.lnk"

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); $Shortcut.TargetPath = '%SCRIPT_PATH%'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.WindowStyle = 1; $Shortcut.Save()"

if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Shortcut created on your Desktop.
) else (
    echo [ERROR] Failed to create shortcut.
)

pause
exit
