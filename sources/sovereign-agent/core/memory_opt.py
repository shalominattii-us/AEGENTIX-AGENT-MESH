#!/usr/bin/env python3
"""memory_opt.py — Kill bloat, clear temp, free memory
Trigger: every 15 minutes
"""

import psutil, os, shutil, subprocess
from pathlib import Path
from datetime import datetime

LOG_DIR = Path(r"C:\Sovereign\AE-Hub\logs")
LOG_FILE = LOG_DIR / "memory_opt.log"
LOG_DIR.mkdir(parents=True, exist_ok=True)

BLOAT_PROCS = [
    "ArmouryCrateSEService", "ACSE", "ArmouryCrate.UserSessionHelper",
    "AsusSoftwareManager", "AsusOptimization", "AsusSystemAnalysis",
    " ArmouryCrate.Service",
]
TEMP_PATHS = [
    Path(os.environ.get("TEMP", r"C:\Windows\Temp")),
    Path(r"C:\Windows\Temp"),
    Path(os.environ.get("LOCALAPPDATA", "")) / "Temp",
]

def log(msg: str):
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def kill_bloat():
    killed = 0
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            name = proc.info['name'] or ""
            for bloat in BLOAT_PROCS:
                if bloat.lower() in name.lower():
                    proc.kill()
                    killed += 1
                    log(f"Killed bloat: {name} (pid {proc.info['pid']})")
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    if killed == 0:
        log("No bloat processes found")
    return killed

def clear_temps():
    freed = 0
    for tmp in TEMP_PATHS:
        if not tmp.exists():
            continue
        for item in tmp.iterdir():
            try:
                if item.is_file():
                    sz = item.stat().st_size
                    item.unlink()
                    freed += sz
                elif item.is_dir():
                    shutil.rmtree(item, ignore_errors=True)
            except Exception as e:
                log(f"Temp delete error: {e}")
    log(f"Temp cleanup freed ~{freed / (1024**2):.1f}MB")
    return freed

def main():
    log("=== memory_opt start ===")
    mem_before = psutil.virtual_memory().available / (1024**3)
    kill_bloat()
    clear_temps()
    mem_after = psutil.virtual_memory().available / (1024**3)
    log(f"Memory: {mem_before:.2f}GB -> {mem_after:.2f}GB")
    log("=== memory_opt done ===")

if __name__ == "__main__":
    main()
