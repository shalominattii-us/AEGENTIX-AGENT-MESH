#!/usr/bin/env python3
"""dashboard_feed.py — WebSocket server on localhost:8765
Real-time JSON feed of all operations for future React dashboard.
"""

import asyncio, json, websockets, threading, time, sys
from pathlib import Path
from datetime import datetime
from collections import deque

# Config
WS_HOST = "localhost"
WS_PORT = 8765
MAX_HISTORY = 1000

# In-memory ring buffer + connected clients
history = deque(maxlen=MAX_HISTORY)
clients = set()
lock = threading.Lock()

def log(msg: str):
    ts = datetime.now().isoformat()
    line = f"[{ts}] [DASHBOARD] {msg}"
    print(line)

# === BROADCAST ===
async def broadcast(message: str):
    if clients:
        await asyncio.gather(
            *[client.send(message) for client in clients],
            return_exceptions=True
        )

def broadcast_sync(payload: dict):
    """Thread-safe broadcast from non-async callers."""
    msg = json.dumps(payload, default=str)
    with lock:
        history.append(payload)
    # Schedule in event loop
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(broadcast(msg))
        else:
            loop.run_until_complete(broadcast(msg))
    except Exception as e:
        log(f"Broadcast error: {e}")

# === WEBSOCKET HANDLER ===
async def handler(websocket, path=None):
    clients.add(websocket)
    log(f"Client connected: {websocket.remote_address} | total={len(clients)}")
    try:
        # Send recent history on connect
        with lock:
            recent = list(history)[-50:]
        if recent:
            await websocket.send(json.dumps({"type": "history", "data": recent}))
        # Keep alive, echo ping if needed
        async for message in websocket:
            try:
                req = json.loads(message)
                if req.get("action") == "ping":
                    await websocket.send(json.dumps({"type": "pong", "time": datetime.now().isoformat()}))
                elif req.get("action") == "stats":
                    with lock:
                        stats = {"type": "stats", "clients": len(clients), "history": len(history)}
                    await websocket.send(json.dumps(stats))
            except json.JSONDecodeError:
                pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        clients.discard(websocket)
        log(f"Client disconnected | total={len(clients)}")

# === PUBLISH API ===
def publish(source: str, category: str, data: dict, threat_level: int = 0):
    payload = {
        "type": "event",
        "timestamp": datetime.now().isoformat(),
        "source": source,
        "category": category,
        "threat_level": threat_level,
        "data": data,
    }
    broadcast_sync(payload)
    return payload

def publish_alert(msg: str, threat_level: int = 9):
    payload = {
        "type": "alert",
        "timestamp": datetime.now().isoformat(),
        "message": msg,
        "threat_level": threat_level,
    }
    broadcast_sync(payload)
    return payload

# === SERVER START ===
def start_server():
    log(f"Starting WebSocket server on ws://{WS_HOST}:{WS_PORT}")
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    server = websockets.serve(handler, WS_HOST, WS_PORT)
    loop.run_until_complete(server)
    log("Server running. Press Ctrl+C to stop.")
    try:
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        loop.close()

def start_daemon():
    """Run server in background thread."""
    t = threading.Thread(target=start_server, daemon=True)
    t.start()
    log("Server thread started")
    return t

# === MAIN ===
if __name__ == "__main__":
    # Check if websockets installed
    try:
        import websockets
    except ImportError:
        print("[ERROR] websockets package required. Run: python -m pip install websockets")
        sys.exit(1)
    start_server()
