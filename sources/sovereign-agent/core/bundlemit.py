#!/usr/bin/env python3
"""bundlemit.py — Auto-commit all repos every 4 hours, push if online
Trigger: every 4 hours
"""

import subprocess, os, socket
from pathlib import Path
from datetime import datetime

LOG_DIR = Path(r"C:\Sovereign\AE-Hub\logs")
LOG_FILE = LOG_DIR / "bundlemit.log"
REPO_ROOTS = [
    Path(r"C:\Sovereign\AE-Hub\repos\sovereign-agent"),
    Path(r"C:\Sovereign\AE-Hub\repos\national-repository"),
]

def log(msg: str):
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def online() -> bool:
    try:
        socket.create_connection(("github.com", 443), timeout=5)
        return True
    except OSError:
        return False

def repo_status(repo: Path) -> str:
    try:
        result = subprocess.run(
            ["git", "-C", str(repo), "status", "--porcelain"],
            capture_output=True, text=True, timeout=30
        )
        return result.stdout
    except Exception as e:
        return f"ERROR: {e}"

def commit_repo(repo: Path) -> bool:
    status = repo_status(repo)
    if not status.strip():
        log(f"{repo.name}: clean, nothing to commit")
        return True
    try:
        subprocess.run(
            ["git", "-C", str(repo), "add", "-A"],
            check=True, capture_output=True, timeout=30
        )
        msg = f"auto-commit {datetime.now().isoformat()}"
        subprocess.run(
            ["git", "-C", str(repo), "commit", "-m", msg],
            check=True, capture_output=True, timeout=30
        )
        log(f"{repo.name}: committed")
        if online():
            subprocess.run(
                ["git", "-C", str(repo), "push"],
                check=True, capture_output=True, timeout=60
            )
            log(f"{repo.name}: pushed")
        else:
            log(f"{repo.name}: offline, commit local only")
        return True
    except subprocess.CalledProcessError as e:
        log(f"{repo.name}: git error — {e}")
        return False
    except Exception as e:
        log(f"{repo.name}: exception — {e}")
        return False

def main():
    log("=== bundlemit start ===")
    for repo in REPO_ROOTS:
        if not repo.exists():
            log(f"{repo.name}: path missing, skipping")
            continue
        commit_repo(repo)
    log("=== bundlemit done ===")

if __name__ == "__main__":
    main()
