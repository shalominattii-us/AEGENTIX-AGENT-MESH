#!/usr/bin/env python3
"""stream_handler.py — Data Stream Router & Queue Manager
SQLite-backed. Survives reboots.
Routes: local DB, GitHub vault, real-time alert
"""

import json, sqlite3, threading, time, os, subprocess
from pathlib import Path
from datetime import datetime
from queue import Queue

DB_PATH = Path(r"C:\Sovereign\AE-Hub\data\stream_queue.db")
DB_PATH.parent.mkdir(parents=True, exist_ok=True)
DATA_DIR = Path(r"C:\Sovereign\AE-Hub\data\stream")
DATA_DIR.mkdir(parents=True, exist_ok=True)

# === SOVEREIGN SCHEMA ===
SOVEREIGN_SCHEMA = {
    "version": "1.0",
    "required": ["timestamp", "source", "category", "target", "threat_level", "payload"],
    "sources": ["osint_engine", "dfir_engine", "governor", "external"],
    "threat_levels": range(0, 11),
}

# === DB INIT ===
def init_db():
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS stream_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            source TEXT NOT NULL,
            category TEXT NOT NULL,
            target TEXT,
            threat_level INTEGER DEFAULT 0,
            payload TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            route TEXT DEFAULT 'local',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_status ON stream_queue(status)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_threat ON stream_queue(threat_level)")
    conn.commit()
    return conn

DB = init_db()
DB_LOCK = threading.Lock()

# === NORMALIZE ===
def normalize(record: dict) -> dict:
    """Force any input into sovereign schema."""
    normalized = {
        "timestamp": record.get("timestamp", datetime.now().isoformat()),
        "source": record.get("source", record.get("category", "unknown")),
        "category": record.get("category", "general"),
        "target": record.get("target", record.get("domain", record.get("ip", record.get("path", "unknown")))),
        "threat_level": record.get("threat_level", record.get("threat", 0)),
        "payload": json.dumps(record.get("data", record), default=str),
    }
    # Ensure threat_level is int 0-10
    try:
        tl = int(normalized["threat_level"])
        normalized["threat_level"] = max(0, min(10, tl))
    except (ValueError, TypeError):
        normalized["threat_level"] = 0
    return normalized

# === INGEST ===
def ingest(record: dict, route="local"):
    norm = normalize(record)
    with DB_LOCK:
        DB.execute("""
            INSERT INTO stream_queue (timestamp, source, category, target, threat_level, payload, status, route)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
        """, (
            norm["timestamp"], norm["source"], norm["category"],
            norm["target"], norm["threat_level"], norm["payload"], route
        ))
        DB.commit()
    print(f"[STREAM] Ingested {norm['category']} | threat={norm['threat_level']} | route={route}")
    # Auto-route high threat
    if norm["threat_level"] >= 7:
        alert(norm)
    return norm

# === ROUTE ===
def route_pending():
    with DB_LOCK:
        cur = DB.execute("SELECT * FROM stream_queue WHERE status='pending' ORDER BY threat_level DESC, created_at ASC LIMIT 100")
        rows = cur.fetchall()
    for row in rows:
        rid, ts, src, cat, tgt, tl, payload, status, route, created = row
        if route == "github":
            _route_github(rid, payload)
        elif route == "alert":
            _route_alert(rid, payload)
        else:
            _route_local(rid, payload)
        with DB_LOCK:
            DB.execute("UPDATE stream_queue SET status='routed' WHERE id=?", (rid,))
            DB.commit()

def _route_local(rid, payload):
    fname = DATA_DIR / f"stream_{rid}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    try:
        data = json.loads(payload)
    except:
        data = {"raw": payload}
    with open(fname, "w") as f:
        json.dump(data, f, indent=2, default=str)
    print(f"[STREAM] Local dump: {fname.name}")

def _route_github(rid, payload):
    # Placeholder: assumes repos exist at known path
    print(f"[STREAM] GitHub route #{rid} — implement push logic")

def _route_alert(rid, payload):
    print(f"[STREAM] ALERT route #{rid} — high priority")

# === ALERT ===
def alert(record: dict):
    """Immediate notification for threat >= 7."""
    msg = f"[ALERT] {record.get('category','?')} | target={record.get('target','?')} | threat={record.get('threat_level',0)}"
    print(msg)
    # Could extend: write to alert log, trigger webhook, etc.
    alert_file = DATA_DIR / "alerts.jsonl"
    with open(alert_file, "a") as f:
        f.write(json.dumps(record, default=str) + "\n")

# === STATS ===
def stats():
    with DB_LOCK:
        total = DB.execute("SELECT COUNT(*) FROM stream_queue").fetchone()[0]
        pending = DB.execute("SELECT COUNT(*) FROM stream_queue WHERE status='pending'").fetchone()[0]
        high = DB.execute("SELECT COUNT(*) FROM stream_queue WHERE threat_level >= 7").fetchone()[0]
    return {"total": total, "pending": pending, "high_threat": high}

# === MAIN ===
def run_daemon(interval=60):
    print("[STREAM] Daemon start")
    while True:
        route_pending()
        time.sleep(interval)

if __name__ == "__main__":
    # Test ingest
    test = {
        "timestamp": datetime.now().isoformat(),
        "source": "osint_engine",
        "category": "domain_recon",
        "target": "example.com",
        "threat_level": 3,
        "data": {"dns_a": ["93.184.216.34"]},
    }
    ingest(test)
    print("Stats:", stats())
