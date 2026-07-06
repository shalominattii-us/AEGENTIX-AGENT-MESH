#!/usr/bin/env python3
"""explorer_heal.py — Fix explorer.exe / tray icon issues
Trigger: boot + every 30 minutes
"""

import psutil, subprocess, time, os, shutil
from pathlib import Path
from datetime import datetime

LOG_DIR = Path(r"C:\Sovereign\AE-Hub\logs")
LOG_FILE = LOG_DIR / "explorer_heal.log"
LOG_DIR.mkdir(parents=True, exist_ok=True)

def log(msg: str):
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def explorer_running() -> bool:
    for proc in psutil.process_iter(['name']):
        try:
            if proc.info['name'] and proc.info['name'].lower() == "explorer.exe":
                return True
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    return False

def clear_icon_cache():
    paths = [
        Path(os.environ.get("LOCALAPPDATA", r"C:\Users\%USERNAME%\AppData\Local")) / "IconCache.db",
        Path(os.environ.get("LOCALAPPDATA", r"C:\Users\%USERNAME%\AppData\Local")) / "Microsoft" / "Windows" / "Explorer" / "iconcache_*.db",
    ]
    for p in paths:
        try:
            if p.exists() and p.is_file():
                p.unlink()
                log(f"Deleted {p}")
            elif "*" in str(p):
                import glob
                for f in glob.glob(str(p)):
                    os.remove(f)
                    log(f"Deleted {f}")
        except Exception as e:
            log(f"Cache clear error: {e}")

def restart_explorer():
    log("Killing explorer.exe")
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            if proc.info['name'] and proc.info['name'].lower() == "explorer.exe":
                proc.kill()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    time.sleep(2)
    clear_icon_cache()
    time.sleep(1)
    subprocess.Popen(["explorer.exe"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    log("explorer.exe restarted")

def main():
    log("=== explorer_heal start ===")
    if not explorer_running():
        log("explorer.exe not running — restarting")
        restart_explorer()
    else:
        log("explorer.exe OK")
    log("=== explorer_heal done ===")

if __name__ == "__main__":
    main()
