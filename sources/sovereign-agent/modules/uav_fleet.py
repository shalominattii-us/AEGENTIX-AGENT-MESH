#!/usr/bin/env python3
"""uav_fleet.py — UAV Fleet Management & Mission Planning module
Outputs JSON to C:\Sovereign\AE-Hub\data\uav\
"""

import json, math
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional

DATA_DIR = Path(r"C:\Sovereign\AE-Hub\data\uav")
DATA_DIR.mkdir(parents=True, exist_ok=True)

# === UTILS ===
def save_result(category: str, target: str, data: dict):
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    fname = DATA_DIR / f"{category}_{target.replace(' ', '_').replace('/', '_')}_{ts}.json"
    record = {
        "timestamp": datetime.now().isoformat(),
        "category": category,
        "target": target,
        "data": data,
    }
    with open(fname, "w", encoding="utf-8") as f:
        json.dump(record, f, indent=2, default=str)
    print(f"[UAV] Saved {fname.name}")
    return record

# === FLEET REGISTRY ===
FLEET_REGISTRY: Dict[str, dict] = {}


def register_uav(
    uav_id: str,
    model: str,
    max_altitude_ft: float = 400.0,
    max_speed_ms: float = 25.0,
    battery_capacity_mah: float = 5000.0,
    sensors: List[str] = None,
    home_lat: float = None,
    home_lon: float = None,
):
    uav = {
        "uav_id": uav_id,
        "model": model,
        "max_altitude_ft": max_altitude_ft,
        "max_speed_ms": max_speed_ms,
        "battery_capacity_mah": battery_capacity_mah,
        "sensors": sensors or [],
        "home": {"lat": home_lat, "lon": home_lon},
        "status": "IDLE",
        "last_telemetry": None,
        "registered_at": datetime.now().isoformat(),
    }
    FLEET_REGISTRY[uav_id] = uav
    return save_result("register", uav_id, uav)


# === TELEMETRY INGEST ===
def ingest_telemetry(uav_id: str, telemetry: dict):
    result = {"uav_id": uav_id, "telemetry": telemetry, "alerts": []}
    if uav_id not in FLEET_REGISTRY:
        result["alerts"].append("UAV not registered in fleet")
    else:
        FLEET_REGISTRY[uav_id]["last_telemetry"] = telemetry
        FLEET_REGISTRY[uav_id]["status"] = telemetry.get("status", "UNKNOWN")
        # Safety checks
        alt = telemetry.get("altitude_ft", 0)
        if alt > FLEET_REGISTRY[uav_id]["max_altitude_ft"]:
            result["alerts"].append(f"ALTITUDE_EXCEEDED: {alt}ft > {FLEET_REGISTRY[uav_id]['max_altitude_ft']}ft")
        spd = telemetry.get("speed_ms", 0)
        if spd > FLEET_REGISTRY[uav_id]["max_speed_ms"]:
            result["alerts"].append(f"SPEED_EXCEEDED: {spd}m/s > {FLEET_REGISTRY[uav_id]['max_speed_ms']}m/s")
        bat = telemetry.get("battery_percent", 100)
        if bat < 20:
            result["alerts"].append(f"LOW_BATTERY: {bat}%")
        if bat < 10:
            result["alerts"].append("CRITICAL_BATTERY_RTH")
    return save_result("telemetry", uav_id, result)


# === MISSION PLANNING ===
def plan_mission(
    uav_id: str,
    waypoints: List[Dict[str, float]],
    mission_type: str = "RECON",
    loiter_time_sec: float = 0.0,
):
    result = {
        "uav_id": uav_id,
        "mission_type": mission_type,
        "waypoints": waypoints,
        "loiter_time_sec": loiter_time_sec,
        "estimated_distance_km": 0.0,
        "estimated_duration_min": 0.0,
        "valid": False,
        "errors": [],
    }
    if uav_id not in FLEET_REGISTRY:
        result["errors"].append("UAV not registered")
        return save_result("mission_plan", uav_id, result)
    if len(waypoints) < 2:
        result["errors"].append("Minimum 2 waypoints required")
        return save_result("mission_plan", uav_id, result)
    # Distance calc (Haversine)
    total_km = 0.0
    for i in range(len(waypoints) - 1):
        lat1, lon1 = math.radians(waypoints[i]["lat"]), math.radians(waypoints[i]["lon"])
        lat2, lon2 = math.radians(waypoints[i + 1]["lat"]), math.radians(waypoints[i + 1]["lon"])
        dlat, dlon = lat2 - lat1, lon2 - lon1
        a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        total_km += 6371 * c
    result["estimated_distance_km"] = round(total_km, 2)
    # Duration estimate (cruise @ 15 m/s + loiter)
    cruise_time = (total_km * 1000) / 15.0
    result["estimated_duration_min"] = round((cruise_time + loiter_time_sec) / 60, 2)
    result["valid"] = True
    return save_result("mission_plan", uav_id, result)


# === FLEET STATUS OVERVIEW ===
def fleet_status():
    overview = {
        "total": len(FLEET_REGISTRY),
        "idle": sum(1 for u in FLEET_REGISTRY.values() if u["status"] == "IDLE"),
        "active": sum(1 for u in FLEET_REGISTRY.values() if u["status"] == "ACTIVE"),
        "rtb": sum(1 for u in FLEET_REGISTRY.values() if u["status"] == "RTB"),
        "emergency": sum(1 for u in FLEET_REGISTRY.values() if u["status"] == "EMERGENCY"),
        "units": list(FLEET_REGISTRY.values()),
    }
    return save_result("fleet_status", "all", overview)


if __name__ == "__main__":
    print("[UAV] Fleet module loaded. Use functions directly or import.")
