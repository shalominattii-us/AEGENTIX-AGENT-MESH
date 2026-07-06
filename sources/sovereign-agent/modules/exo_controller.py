#!/usr/bin/env python3
"""exo_controller.py — Exoskeleton Telemetry & Safety Controller module
Outputs JSON to C:\Sovereign\AE-Hub\data\exo\
"""

import json, time
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

DATA_DIR = Path(r"C:\Sovereign\AE-Hub\data\exo")
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
    print(f"[EXO] Saved {fname.name}")
    return record

# === EXO REGISTRY ===
EXO_REGISTRY: Dict[str, dict] = {}

# Safety limits
SAFETY_LIMITS = {
    "max_joint_torque_nm": 150.0,
    "max_battery_temp_c": 60.0,
    "max_motor_temp_c": 85.0,
    "max_payload_kg": 50.0,
    "max_g_force": 3.0,
    "emergency_stop_g": 5.0,
}


def register_exo(
    exo_id: str,
    model: str,
    operator_id: str,
    max_payload_kg: float = 50.0,
    joint_count: int = 12,
    power_source: str = "BATTERY",
):
    exo = {
        "exo_id": exo_id,
        "model": model,
        "operator_id": operator_id,
        "max_payload_kg": max_payload_kg,
        "joint_count": joint_count,
        "power_source": power_source,
        "status": "STANDBY",
        "last_telemetry": None,
        "safety_mode": "NORMAL",
        "registered_at": datetime.now().isoformat(),
    }
    EXO_REGISTRY[exo_id] = exo
    return save_result("register", exo_id, exo)


# === TELEMETRY INGEST ===
def ingest_telemetry(exo_id: str, telemetry: dict):
    result = {"exo_id": exo_id, "telemetry": telemetry, "alerts": [], "emergency_stop": False}
    if exo_id not in EXO_REGISTRY:
        result["alerts"].append("EXO not registered")
        return save_result("telemetry", exo_id, result)
    EXO_REGISTRY[exo_id]["last_telemetry"] = telemetry
    EXO_REGISTRY[exo_id]["status"] = telemetry.get("status", "UNKNOWN")

    # Safety checks
    g_force = telemetry.get("g_force", 0)
    if g_force > SAFETY_LIMITS["emergency_stop_g"]:
        result["alerts"].append(f"EMERGENCY_G_FORCE: {g_force}G > {SAFETY_LIMITS['emergency_stop_g']}G")
        result["emergency_stop"] = True
        EXO_REGISTRY[exo_id]["safety_mode"] = "EMERGENCY_STOP"
    elif g_force > SAFETY_LIMITS["max_g_force"]:
        result["alerts"].append(f"HIGH_G_FORCE: {g_force}G > {SAFETY_LIMITS['max_g_force']}G")
        EXO_REGISTRY[exo_id]["safety_mode"] = "LIMITED"

    motor_temp = telemetry.get("motor_temp_c", 0)
    if motor_temp > SAFETY_LIMITS["max_motor_temp_c"]:
        result["alerts"].append(f"MOTOR_OVERHEAT: {motor_temp}°C > {SAFETY_LIMITS['max_motor_temp_c']}°C")

    batt_temp = telemetry.get("battery_temp_c", 0)
    if batt_temp > SAFETY_LIMITS["max_battery_temp_c"]:
        result["alerts"].append(f"BATTERY_OVERHEAT: {batt_temp}°C > {SAFETY_LIMITS['max_battery_temp_c']}°C")

    payload = telemetry.get("payload_kg", 0)
    if payload > EXO_REGISTRY[exo_id]["max_payload_kg"]:
        result["alerts"].append(f"PAYLOAD_EXCEEDED: {payload}kg > {EXO_REGISTRY[exo_id]['max_payload_kg']}kg")

    joint_torques = telemetry.get("joint_torques_nm", [])
    for i, t in enumerate(joint_torques):
        if t > SAFETY_LIMITS["max_joint_torque_nm"]:
            result["alerts"].append(f"JOINT{i}_TORQUE_EXCEEDED: {t}Nm > {SAFETY_LIMITS['max_joint_torque_nm']}Nm")

    batt_pct = telemetry.get("battery_percent", 100)
    if batt_pct < 15:
        result["alerts"].append(f"LOW_BATTERY: {batt_pct}%")
    if batt_pct < 5:
        result["alerts"].append("CRITICAL_BATTERY_SHUTDOWN")
        result["emergency_stop"] = True
        EXO_REGISTRY[exo_id]["safety_mode"] = "EMERGENCY_STOP"

    return save_result("telemetry", exo_id, result)


# === OPERATOR BIOMETRICS ===
def ingest_operator_biometrics(exo_id: str, biometrics: dict):
    result = {"exo_id": exo_id, "biometrics": biometrics, "alerts": []}
    hr = biometrics.get("heart_rate_bpm", 0)
    if hr > 180:
        result["alerts"].append(f"OPERATOR_HEART_RATE_CRITICAL: {hr} bpm")
    elif hr > 160:
        result["alerts"].append(f"OPERATOR_HEART_RATE_HIGH: {hr} bpm")
    spo2 = biometrics.get("spo2_percent", 100)
    if spo2 < 90:
        result["alerts"].append(f"OPERATOR_SPO2_LOW: {spo2}%")
    temp = biometrics.get("skin_temp_c", 0)
    if temp > 39.5:
        result["alerts"].append(f"OPERATOR_FEVER: {temp}°C")
    return save_result("operator_biometrics", exo_id, result)


# === EXO STATUS ===
def exo_status():
    overview = {
        "total": len(EXO_REGISTRY),
        "standby": sum(1 for e in EXO_REGISTRY.values() if e["status"] == "STANDBY"),
        "active": sum(1 for e in EXO_REGISTRY.values() if e["status"] == "ACTIVE"),
        "emergency": sum(1 for e in EXO_REGISTRY.values() if e["safety_mode"] == "EMERGENCY_STOP"),
        "units": list(EXO_REGISTRY.values()),
    }
    return save_result("exo_status", "all", overview)


if __name__ == "__main__":
    print("[EXO] Controller module loaded. Use functions directly or import.")
