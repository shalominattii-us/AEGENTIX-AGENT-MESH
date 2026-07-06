#!/usr/bin/env python3
"""AEGENTIS GOVERNOR v2.1 — System Monitor & Auto-Heal
Monitors: Ollama, AEGENTIS_BRAIN, OSINT/DFIR modules, disk, memory
Logs: C:\Sovereign\AE-Hub\logs\governor.log
"""

import psutil, os, time, json, subprocess, sys, sqlite3
from datetime import datetime, timedelta
from pathlib import Path

# === CONFIG ===
LOG_DIR = Path(r"C:\Sovereign\AE-Hub\logs")
LOG_FILE = LOG_DIR / "governor.log"
BRAIN_PATH = Path(r"C:\Sovereign\AE-Hub\core\AEGENTIS_BRAIN.py")
MODULES_DIR = Path(r"C:\Sovereign\AE-Hub\modules")
STREAM_DB = Path(r"C:\Sovereign\AE-Hub\data\stream_queue.db")
ALERT_LOG = Path(r"C:\Sovereign\AE-Hub\data\stream\alerts.jsonl")
MIN_DISK_GB = 50
MIN_MEM_GB = 1
CHECK_INTERVAL = 60  # seconds
STREAM_STALL_MINUTES = 5
THREAT_ALERT_THRESHOLD = 7

# Module paths to monitor
OSINT_PATH = MODULES_DIR / "osint_engine.py"
DFIR_PATH = MODULES_DIR / "dfir_engine.py"
STREAM_PATH = MODULES_DIR / "stream_handler.py"
DASHBOARD_PATH = MODULES_DIR / "dashboard_feed.py"

LOG_DIR.mkdir(parents=True, exist_ok=True)

# === LOGGING ===
def log(level: str, msg: str):
    ts = datetime.now().isoformat()
    line = f"[{ts}] [{level}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")

# === MONITOR FUNCTIONS ===
def check_process(name: str, path: Path = None) -> bool:
    """Check if a process is running. If path given, match by cmdline."""
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            if proc.info['name'] and name.lower() in proc.info['name'].lower():
                if path and proc.info['cmdline']:
                    if str(path) in ' '.join(proc.info['cmdline']):
                        return True
                    continue
                return True
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return False

def restart_module(name: str, path: Path):
    log("ACTION", f"Restarting {name}...")
    # Kill existing
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            if proc.info['name'] and 'python' in proc.info['name'].lower():
                if proc.info['cmdline'] and str(path) in ' '.join(proc.info['cmdline']):
                    proc.kill()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    time.sleep(1)
    subprocess.Popen([sys.executable, str(path)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    log("INFO", f"{name} restart initiated")

def restart_ollama():
    log("ACTION", "Restarting Ollama...")
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            if proc.info['name'] and 'ollama' in proc.info['name'].lower():
                proc.kill()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    time.sleep(2)
    subprocess.Popen(["ollama", "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    log("INFO", "Ollama restart initiated")

def restart_brain():
    log("ACTION", "Restarting AEGENTIS_BRAIN...")
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            if proc.info['name'] and 'python' in proc.info['name'].lower():
                if proc.info['cmdline'] and str(BRAIN_PATH) in ' '.join(proc.info['cmdline']):
                    proc.kill()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    time.sleep(1)
    subprocess.Popen([sys.executable, str(BRAIN_PATH)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    log("INFO", "AEGENTIS_BRAIN restart initiated")

def check_disk():
    disk = psutil.disk_usage("C:\\")
    free_gb = disk.free / (1024**3)
    if free_gb < MIN_DISK_GB:
        log("ALERT", f"Disk space critical: {free_gb:.1f}GB free (threshold {MIN_DISK_GB}GB)")
    else:
        log("INFO", f"Disk OK: {free_gb:.1f}GB free")
    return free_gb

def check_memory():
    mem = psutil.virtual_memory()
    free_gb = mem.available / (1024**3)
    if free_gb < MIN_MEM_GB:
        log("ALERT", f"Memory critical: {free_gb:.1f}GB available (threshold {MIN_MEM_GB}GB)")
    else:
        log("INFO", f"Memory OK: {free_gb:.1f}GB available")
    return free_gb

def check_ollama_api():
    import urllib.request
    try:
        with urllib.request.urlopen("http://localhost:11434/api/tags", timeout=5) as r:
            if r.status == 200:
                log("INFO", "Ollama API responding")
                return True
    except Exception as e:
        log("WARN", f"Ollama API unreachable: {e}")
    return False

# === STREAM STALL DETECTION ===
def check_stream_stall():
    """Check if data stream has stalled (no new records in STREAM_STALL_MINUTES)."""
    if not STREAM_DB.exists():
        log("WARN", "Stream DB not found — skip stall check")
        return False
    try:
        conn = sqlite3.connect(str(STREAM_DB), timeout=5)
        cur = conn.execute(
            "SELECT MAX(created_at) FROM stream_queue"
        )
        row = cur.fetchone()
        conn.close()
        if row and row[0]:
            last = datetime.fromisoformat(row[0])
            delta = datetime.now() - last
            if delta > timedelta(minutes=STREAM_STALL_MINUTES):
                log("ALERT", f"Stream stalled: last activity {delta.seconds//60} minutes ago")
                return True
            else:
                log("INFO", f"Stream active: last activity {delta.seconds//60} minutes ago")
    except Exception as e:
        log("WARN", f"Stream stall check error: {e}")
    return False

# === THREAT ALERT MONITORING ===
def check_threat_alerts():
    """Monitor for high-priority findings (threat >= THREAT_ALERT_THRESHOLD)."""
    alerts = []
    # Check stream DB for high-threat pending items
    if STREAM_DB.exists():
        try:
            conn = sqlite3.connect(str(STREAM_DB), timeout=5)
            cur = conn.execute(
                f"SELECT timestamp, source, category, target, threat_level, payload FROM stream_queue WHERE threat_level >= {THREAT_ALERT_THRESHOLD} AND status='pending' ORDER BY created_at DESC LIMIT 5"
            )
            for row in cur.fetchall():
                ts, src, cat, tgt, tl, payload = row
                alert_msg = f"THREAT {tl}: {src}/{cat} | target={tgt}"
                log("ALERT", alert_msg)
                alerts.append({"timestamp": ts, "source": src, "category": cat, "target": tgt, "threat_level": tl, "payload": payload})
            conn.close()
        except Exception as e:
            log("WARN", f"Threat alert DB check error: {e}")
    # Check alert log file for new lines
    if ALERT_LOG.exists():
        try:
            with open(ALERT_LOG, "r") as f:
                lines = f.readlines()
            # Only alert if there are new entries since last check (simplified)
            if lines:
                log("INFO", f"Alert log has {len(lines)} entries")
        except Exception as e:
            log("WARN", f"Alert log check error: {e}")
    return alerts

# === MAIN LOOP ===
def main():
    log("INFO", "=== GOVERNOR v2.1 START ===")
    while True:
        # Core services
        if not check_process("ollama") or not check_ollama_api():
            restart_ollama()
        if not check_process("python", BRAIN_PATH):
            restart_brain()
        # OSINT/DFIR modules
        if not check_process("python", OSINT_PATH):
            restart_module("OSINT_ENGINE", OSINT_PATH)
        if not check_process("python", DFIR_PATH):
            restart_module("DFIR_ENGINE", DFIR_PATH)
        if not check_process("python", STREAM_PATH):
            restart_module("STREAM_HANDLER", STREAM_PATH)
        if not check_process("python", DASHBOARD_PATH):
            restart_module("DASHBOARD_FEED", DASHBOARD_PATH)
        # Stream stall detection
        if check_stream_stall():
            # Restart stream handler if stalled
            restart_module("STREAM_HANDLER", STREAM_PATH)
        # Threat alerts
        check_threat_alerts()
        # Resources
        check_disk()
        check_memory()
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
