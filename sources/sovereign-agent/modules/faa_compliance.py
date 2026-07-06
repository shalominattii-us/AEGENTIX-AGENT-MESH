#!/usr/bin/env python3
"""faa_compliance.py — FAA Compliance & Flight Log Validation module
Outputs JSON to C:\Sovereign\AE-Hub\data\faa\
"""

import json, os, re
from pathlib import Path
from datetime import datetime

DATA_DIR = Path(r"C:\Sovereign\AE-Hub\data\faa")
DATA_DIR.mkdir(parents=True, exist_ok=True)

# === UTILS ===
def save_result(category: str, target: str, data: dict):
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    fname = DATA_DIR / f"{category}_{target.replace(' ', '_')}_{ts}.json"
    record = {
        "timestamp": datetime.now().isoformat(),
        "category": category,
        "target": target,
        "data": data,
    }
    with open(fname, "w", encoding="utf-8") as f:
        json.dump(record, f, indent=2, default=str)
    print(f"[FAA] Saved {fname.name}")
    return record

# === PART 107 COMPLIANCE CHECK ===
def check_part107(pilot_id: str, cert_date: str, recurrent_date: str = None):
    result = {
        "pilot_id": pilot_id,
        "certification_date": cert_date,
        "recurrent_date": recurrent_date,
        "status": "UNKNOWN",
    }
    try:
        cert = datetime.fromisoformat(cert_date.replace("Z", "+00:00"))
        days_since = (datetime.now(datetime.timezone.utc) - cert).days
        result["days_since_certification"] = days_since
        if recurrent_date:
            rec = datetime.fromisoformat(recurrent_date.replace("Z", "+00:00"))
            days_since_rec = (datetime.now(datetime.timezone.utc) - rec).days
            result["days_since_recurrent"] = days_since_rec
            result["status"] = "COMPLIANT" if days_since_rec <= 730 else "EXPIRED"
        else:
            result["status"] = "COMPLIANT" if days_since <= 730 else "EXPIRED"
    except Exception as e:
        result["error"] = str(e)
    return save_result("part107", pilot_id, result)

# === FLIGHT LOG VALIDATION ===
def validate_flight_log(log_path: Path):
    result = {"log_path": str(log_path), "valid": False, "errors": []}
    if not log_path.exists():
        result["errors"].append("Log file not found")
        return save_result("flight_log_validation", str(log_path), result)
    try:
        with open(log_path, "r", encoding="utf-8") as f:
            log_data = json.load(f)
        required_fields = ["flight_id", "uav_id", "pilot_id", "start_time", "end_time", "waypoints"]
        missing = [f for f in required_fields if f not in log_data]
        if missing:
            result["errors"].append(f"Missing fields: {missing}")
        else:
            result["valid"] = True
            result["flight_id"] = log_data["flight_id"]
            result["waypoint_count"] = len(log_data.get("waypoints", []))
    except Exception as e:
        result["errors"].append(str(e))
    return save_result("flight_log_validation", str(log_path), result)

# === AIRSPACE CHECK (stub for API integration) ===
def check_airspace(lat: float, lon: float, radius_nm: float = 5.0):
    result = {
        "coordinates": {"lat": lat, "lon": lon},
        "radius_nm": radius_nm,
        "airspace_class": "UNKNOWN",
        "restrictions": [],
        "laanc_required": False,
        "status": "CHECK_PENDING",
    }
    # TODO: Integrate with FAA LAANC API or UAS Facility Maps
    # https://uasdoc.faa.gov/
    result["status"] = "MANUAL_REVIEW_REQUIRED"
    return save_result("airspace_check", f"{lat}_{lon}", result)

# === BVLOS CERTIFICATION CHECK ===
def check_bvlos_certification(uav_id: str, waiver_number: str = None):
    result = {
        "uav_id": uav_id,
        "waiver_number": waiver_number,
        "bvlos_authorized": False,
        "status": "NO_WAIVER",
    }
    if waiver_number and re.match(r"^[A-Z]{2}[A-Z0-9]{2,}\d{4}$", waiver_number):
        result["bvlos_authorized"] = True
        result["status"] = "WAIVER_ACTIVE"
    return save_result("bvlos_check", uav_id, result)

# === BATCH PROCESS FLIGHT LOGS ===
def batch_process_logs(log_dir: Path = DATA_DIR / "raw"):
    log_dir.mkdir(parents=True, exist_ok=True)
    results = []
    for f in log_dir.glob("*.json"):
        results.append(validate_flight_log(f))
    return save_result("batch_flight_logs", str(log_dir), {"processed": len(results)})

if __name__ == "__main__":
    print("[FAA] Compliance module loaded. Use functions directly or import.")
