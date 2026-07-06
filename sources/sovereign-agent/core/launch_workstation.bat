@echo off
REM Ω SOVEREIGN WORKSTATION LAUNCHER — AEG-576414
REM Auto-starts immersive dashboard on boot/login

title SOVEREIGN WORKSTATION

REM Kill any existing browser instances (optional — uncomment if needed)
REM taskkill /f /im msedge.exe 2>nul
REM taskkill /f /im chrome.exe 2>nul

REM Wait for network
ping -n 3 127.0.0.1 >nul

REM Launch in Chrome kiosk mode (fullscreen, no UI)
start "SOVEREIGN" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --incognito --disable-features=TranslateUI --no-first-run --noerrdialogs --disable-infobars --start-fullscreen "C:\Sovereign\AE-Hub\dashboard\workstation.html"

REM Or use Edge if Chrome not installed:
REM start "SOVEREIGN" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --kiosk --edge-kiosk-type=fullscreen "C:\Sovereign\AE-Hub\dashboard\workstation.html"

REM Keep alive (restart if browser crashes)
:loop
ping -n 30 127.0.0.1 >nul
tasklist | findstr /i "chrome.exe" >nul
if %errorlevel% neq 0 (
    echo [RESTART] Browser crashed — relaunching...
    start "SOVEREIGN" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --incognito --disable-features=TranslateUI --no-first-run --noerrdialogs --disable-infobars --start-fullscreen "C:\Sovereign\AE-Hub\dashboard\workstation.html"
)
goto loop
