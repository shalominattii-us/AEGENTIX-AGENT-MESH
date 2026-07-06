"""
Ephemeral + Persistent Memory for Agent Swarms
"""
import json
import sqlite3
from typing import Any, Optional
from datetime import datetime

class AgentMemory:
    def __init__(self, db_path: str = ":memory:"):
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self._init_db()

    def _init_db(self):
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS memory (
                key TEXT PRIMARY KEY,
                value TEXT,
                agent_id TEXT,
                created_at TEXT,
                ttl INTEGER DEFAULT 0
            )
        """)
        self.conn.commit()

    def set(self, key: str, value: Any, agent_id: str = "system", ttl: int = 0):
        self.conn.execute(
            "INSERT OR REPLACE INTO memory (key, value, agent_id, created_at, ttl) VALUES (?, ?, ?, ?, ?)",
            (key, json.dumps(value), agent_id, datetime.utcnow().isoformat(), ttl)
        )
        self.conn.commit()

    def get(self, key: str) -> Optional[Any]:
        row = self.conn.execute("SELECT value FROM memory WHERE key = ?", (key,)).fetchone()
        return json.loads(row[0]) if row else None

    def get_by_agent(self, agent_id: str) -> dict:
        rows = self.conn.execute("SELECT key, value FROM memory WHERE agent_id = ?", (agent_id,)).fetchall()
        return {k: json.loads(v) for k, v in rows}
