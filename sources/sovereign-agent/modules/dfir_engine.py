#!/usr/bin/env python3
"""dfir_engine.py — Digital Forensics & Incident Response module
Outputs JSON to C:\Sovereign\AE-Hub\data\dfir\
"""

import hashlib, json, os, time, psutil, socket
from pathlib import Path
from datetime import datetime

DATA_DIR = Path(r"C:\Sovereign\AE-Hub\data\dfir")
DATA_DIR.mkdir(parents=True, exist_ok=True)

# === UTILS ===
def save_result(category: str, target: str, data: dict):
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    fname = DATA_DIR / f"{category}_{target.replace('\\', '_').replace(':', '').replace('/', '_')}_{ts}.json"
    record = {
        "timestamp": datetime.now().isoformat(),
        "category": category,
        "target": target,
        "data": data,
    }
    with open(fname, "w", encoding="utf-8") as f:
        json.dump(record, f, indent=2, default=str)
    print(f"[DFIR] Saved {fname.name}")
    return record

# === FILE HASH ANALYSIS ===
def file_hashes(filepath: Path):
    result = {"path": str(filepath)}
    if not filepath.exists():
        result["error"] = "File not found"
        return save_result("file_hash", str(filepath), result)
    md5 = hashlib.md5()
    sha256 = hashlib.sha256()
    try:
        with open(filepath, "rb") as f:
            while chunk := f.read(8192):
                md5.update(chunk)
                sha256.update(chunk)
        result["md5"] = md5.hexdigest()
        result["sha256"] = sha256.hexdigest()
        result["size"] = filepath.stat().st_size
        result["mtime"] = datetime.fromtimestamp(filepath.stat().st_mtime).isoformat()
    except Exception as e:
        result["error"] = str(e)
    return save_result("file_hash", str(filepath), result)

def dir_hashes(directory: Path, max_files=100):
    result = {"directory": str(directory), "files": []}
    if not directory.exists():
        result["error"] = "Directory not found"
        return save_result("dir_hash", str(directory), result)
    count = 0
    for item in directory.rglob("*"):
        if item.is_file() and count < max_files:
            count += 1
            h = hashlib.sha256()
            try:
                with open(item, "rb") as f:
                    while chunk := f.read(8192):
                        h.update(chunk)
                result["files"].append({
                    "path": str(item.relative_to(directory)),
                    "sha256": h.hexdigest(),
                    "size": item.stat().st_size,
                    "mtime": datetime.fromtimestamp(item.stat().st_mtime).isoformat(),
                })
            except Exception as e:
                result["files"].append({"path": str(item.relative_to(directory)), "error": str(e)})
    result["count"] = count
    return save_result("dir_hash", str(directory), result)

# === TIMELINE GENERATION ===
def timeline(directory: Path, max_files=200):
    result = {"directory": str(directory), "events": []}
    if not directory.exists():
        result["error"] = "Directory not found"
        return save_result("timeline", str(directory), result)
    count = 0
    for item in directory.rglob("*"):
        if count >= max_files:
            break
        try:
            stat = item.stat()
            result["events"].append({
                "path": str(item.relative_to(directory)),
                "type": "dir" if item.is_dir() else "file",
                "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "accessed": datetime.fromtimestamp(stat.st_atime).isoformat(),
                "size": stat.st_size if item.is_file() else None,
            })
            count += 1
        except Exception as e:
            pass
    result["count"] = count
    # Sort by modified time
    result["events"].sort(key=lambda x: x["modified"])
    return save_result("timeline", str(directory), result)

# === NETWORK CONNECTION FORENSICS ===
def network_forensics():
    result = {"connections": [], "listeners": []}
    try:
        for conn in psutil.net_connections(kind="inet"):
            entry = {
                "fd": conn.fd,
                "family": str(conn.family),
                "type": str(conn.type),
                "laddr": conn.laddr._asdict() if conn.laddr else None,
                "raddr": conn.raddr._asdict() if conn.raddr else None,
                "status": conn.status,
                "pid": conn.pid,
            }
            if conn.status == "LISTEN":
                result["listeners"].append(entry)
            else:
                result["connections"].append(entry)
    except Exception as e:
        result["error"] = str(e)
    return save_result("network_forensics", "system", result)

# === MEMORY DUMP PARSING (placeholder) ===
def memory_info():
    result = {}
    try:
        mem = psutil.virtual_memory()
        result["total"] = mem.total
        result["available"] = mem.available
        result["percent"] = mem.percent
        result["used"] = mem.used
        result["free"] = mem.free
        # Swap
        swap = psutil.swap_memory()
        result["swap"] = {"total": swap.total, "used": swap.used, "free": swap.free, "percent": swap.percent}
    except Exception as e:
        result["error"] = str(e)
    return save_result("memory_info", "system", result)

# === MAIN ===
def run_all(target_dir=None):
    out = []
    out.append(network_forensics())
    out.append(memory_info())
    if target_dir:
        p = Path(target_dir)
        if p.is_file():
            out.append(file_hashes(p))
        elif p.is_dir():
            out.append(dir_hashes(p))
            out.append(timeline(p))
    return out

if __name__ == "__main__":
    import sys
    target = sys.argv[1] if len(sys.argv) > 1 else None
    run_all(target_dir=target)
