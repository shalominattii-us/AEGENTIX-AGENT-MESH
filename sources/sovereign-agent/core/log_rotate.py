#!/usr/bin/env python3
"""log_rotate.py — Compress logs >7 days, delete logs >30 days
Trigger: daily
"""

import os, gzip, shutil
from pathlib import Path
from datetime import datetime, timedelta

LOG_DIR = Path(r"C:\Sovereign\AE-Hub\logs")
ARCHIVE_DIR = LOG_DIR / "archive"
ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

def log(msg: str):
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_DIR / "log_rotate.log", "a", encoding="utf-8") as f:
        f.write(line + "\n")

def compress_old():
    cutoff = datetime.now() - timedelta(days=7)
    for f in LOG_DIR.iterdir():
        if not f.is_file() or f.suffix == ".gz":
            continue
        try:
            mtime = datetime.fromtimestamp(f.stat().st_mtime)
            if mtime < cutoff:
                arc = ARCHIVE_DIR / (f.name + ".gz")
                with open(f, "rb") as src:
                    with gzip.open(arc, "wb") as dst:
                        shutil.copyfileobj(src, dst)
                f.unlink()
                log(f"Compressed {f.name} -> archive/{arc.name}")
        except Exception as e:
            log(f"Compress error on {f.name}: {e}")

def purge_archive():
    cutoff = datetime.now() - timedelta(days=30)
    for f in ARCHIVE_DIR.iterdir():
        if not f.is_file():
            continue
        try:
            mtime = datetime.fromtimestamp(f.stat().st_mtime)
            if mtime < cutoff:
                f.unlink()
                log(f"Deleted old archive: {f.name}")
        except Exception as e:
            log(f"Purge error on {f.name}: {e}")

def main():
    log("=== log_rotate start ===")
    compress_old()
    purge_archive()
    log("=== log_rotate done ===")

if __name__ == "__main__":
    main()
