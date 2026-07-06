#!/usr/bin/env python3
"""eoc_medic.py — Emergency Operations Center Medical & Triage module
Outputs JSON to C:\Sovereign\AE-Hub\data\medic\
"""

import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional

DATA_DIR = Path(r"C:\Sovereign\AE-Hub\data\medic")
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
    print(f"[MEDIC] Saved {fname.name}")
    return record

# === TRIAGE REGISTRY ===
PATIENT_REGISTRY: Dict[str, dict] = {}
SUPPLY_REGISTRY: Dict[str, dict] = {}

# Triage categories
TRIAGE_PRIORITY = {"IMMEDIATE": 1, "DELAYED": 2, "MINIMAL": 3, "EXPECTANT": 4}


def register_patient(
    patient_id: str,
    name: str = None,
    age: int = None,
    blood_type: str = None,
    allergies: List[str] = None,
    incident_id: str = "GENERAL",
):
    patient = {
        "patient_id": patient_id,
        "name": name,
        "age": age,
        "blood_type": blood_type,
        "allergies": allergies or [],
        "incident_id": incident_id,
        "triage_category": "UNASSIGNED",
        "triage_priority": 99,
        "vitals": {},
        "status": "REGISTERED",
        "registered_at": datetime.now().isoformat(),
    }
    PATIENT_REGISTRY[patient_id] = patient
    return save_result("patient_register", patient_id, patient)


# === TRIAGE ASSESSMENT ===
def triage_assess(patient_id: str, vitals: dict, injuries: List[str] = None):
    result = {"patient_id": patient_id, "vitals": vitals, "injuries": injuries or [], "category": "UNASSIGNED"}
    if patient_id not in PATIENT_REGISTRY:
        result["error"] = "Patient not registered"
        return save_result("triage", patient_id, result)
    
    # Simple START triage logic
    hr = vitals.get("heart_rate_bpm", 0)
    rr = vitals.get("respiratory_rate_per_min", 0)
    spo2 = vitals.get("spo2_percent", 100)
    conscious = vitals.get("conscious", True)
    
    if not conscious and (rr == 0 or (rr > 30 and spo2 < 85)):
        category = "EXPECTANT"
    elif rr > 30 or spo2 < 90 or hr > 120 or hr < 50:
        category = "IMMEDIATE"
    elif injuries and any(i in injuries for i in ["fracture", "burn", "laceration"]):
        category = "DELAYED"
    else:
        category = "MINIMAL"
    
    PATIENT_REGISTRY[patient_id]["triage_category"] = category
    PATIENT_REGISTRY[patient_id]["triage_priority"] = TRIAGE_PRIORITY[category]
    PATIENT_REGISTRY[patient_id]["vitals"] = vitals
    PATIENT_REGISTRY[patient_id]["status"] = "TRIAGED"
    result["category"] = category
    result["priority"] = TRIAGE_PRIORITY[category]
    return save_result("triage", patient_id, result)


# === SUPPLY TRACKING ===
def register_supply(supply_id: str, supply_type: str, quantity: int, location: str, expiry_date: str = None):
    supply = {
        "supply_id": supply_id,
        "supply_type": supply_type,
        "quantity": quantity,
        "location": location,
        "expiry_date": expiry_date,
        "status": "AVAILABLE",
        "registered_at": datetime.now().isoformat(),
    }
    SUPPLY_REGISTRY[supply_id] = supply
    return save_result("supply_register", supply_id, supply)


def consume_supply(supply_id: str, amount: int = 1):
    result = {"supply_id": supply_id, "amount": amount, "success": False}
    if supply_id not in SUPPLY_REGISTRY:
        result["error"] = "Supply not found"
        return save_result("supply_consume", supply_id, result)
    if SUPPLY_REGISTRY[supply_id]["quantity"] < amount:
        result["error"] = "Insufficient quantity"
        return save_result("supply_consume", supply_id, result)
    SUPPLY_REGISTRY[supply_id]["quantity"] -= amount
    if SUPPLY_REGISTRY[supply_id]["quantity"] == 0:
        SUPPLY_REGISTRY[supply_id]["status"] = "DEPLETED"
    result["success"] = True
    result["remaining"] = SUPPLY_REGISTRY[supply_id]["quantity"]
    return save_result("supply_consume", supply_id, result)


# === EOC STATUS ===
def eoc_status():
    triage_counts = {}
    for p in PATIENT_REGISTRY.values():
        cat = p["triage_category"]
        triage_counts[cat] = triage_counts.get(cat, 0) + 1
    
    supply_counts = {}
    for s in SUPPLY_REGISTRY.values():
        stype = s["supply_type"]
        supply_counts[stype] = supply_counts.get(stype, 0) + s["quantity"]
    
    overview = {
        "patients_total": len(PATIENT_REGISTRY),
        "patients_by_triage": triage_counts,
        "supplies_total": len(SUPPLY_REGISTRY),
        "supplies_by_type": supply_counts,
        "critical_patients": triage_counts.get("IMMEDIATE", 0) + triage_counts.get("EXPECTANT", 0),
    }
    return save_result("eoc_status", "all", overview)


if __name__ == "__main__":
    print("[MEDIC] EOC module loaded. Use functions directly or import.")
