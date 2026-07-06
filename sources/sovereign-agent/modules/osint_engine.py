#!/usr/bin/env python3
"""osint_engine.py — Open Source Intelligence module
Outputs JSON to C:\Sovereign\AE-Hub\data\osint\
"""

import socket, hashlib, json, os, time, subprocess
from pathlib import Path
from datetime import datetime
import dns.resolver
import whois
import requests

DATA_DIR = Path(r"C:\Sovereign\AE-Hub\data\osint")
DATA_DIR.mkdir(parents=True, exist_ok=True)

# === UTILS ===
def save_result(category: str, target: str, data: dict):
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    fname = DATA_DIR / f"{category}_{target.replace('.', '_')}_{ts}.json"
    record = {
        "timestamp": datetime.now().isoformat(),
        "category": category,
        "target": target,
        "data": data,
    }
    with open(fname, "w", encoding="utf-8") as f:
        json.dump(record, f, indent=2, default=str)
    print(f"[OSINT] Saved {fname.name}")
    return record

# === DOMAIN RECONNAISSANCE ===
def domain_recon(domain: str):
    result = {"domain": domain}
    # DNS records
    try:
        answers = dns.resolver.resolve(domain, "A")
        result["dns_a"] = [str(r) for r in answers]
    except Exception as e:
        result["dns_a_error"] = str(e)
    try:
        answers = dns.resolver.resolve(domain, "MX")
        result["dns_mx"] = [str(r.exchange) for r in answers]
    except Exception as e:
        result["dns_mx_error"] = str(e)
    try:
        answers = dns.resolver.resolve(domain, "NS")
        result["dns_ns"] = [str(r) for r in answers]
    except Exception as e:
        result["dns_ns_error"] = str(e)
    # Subdomain brute (common list)
    subs = ["www", "mail", "ftp", "api", "dev", "staging", "admin", "blog", "shop", "cdn"]
    found = []
    for sub in subs:
        try:
            target = f"{sub}.{domain}"
            socket.gethostbyname(target)
            found.append(target)
        except socket.gaierror:
            pass
    result["subdomains_found"] = found
    # WHOIS
    try:
        w = whois.whois(domain)
        result["whois"] = {
            "registrar": w.registrar,
            "creation_date": str(w.creation_date) if w.creation_date else None,
            "expiration_date": str(w.expiration_date) if w.expiration_date else None,
            "name_servers": w.name_servers,
        }
    except Exception as e:
        result["whois_error"] = str(e)
    return save_result("domain_recon", domain, result)

# === IP GEOLOCATION / ASN ===
def ip_recon(ip: str):
    result = {"ip": ip}
    # Free IP-API (no key)
    try:
        r = requests.get(f"http://ip-api.com/json/{ip}", timeout=10)
        j = r.json()
        result["geo"] = j if j.get("status") == "success" else {"error": j}
    except Exception as e:
        result["geo_error"] = str(e)
    return save_result("ip_recon", ip, result)

# === USERNAME ENUMERATION ===
def username_enum(username: str, platforms=None):
    if platforms is None:
        platforms = ["github", "twitter", "reddit"]
    result = {"username": username, "platforms": {}}
    # GitHub check
    if "github" in platforms:
        try:
            r = requests.get(f"https://api.github.com/users/{username}", timeout=10)
            result["platforms"]["github"] = {"exists": r.status_code == 200, "status": r.status_code}
            if r.status_code == 200:
                j = r.json()
                result["platforms"]["github"]["data"] = {k: j.get(k) for k in ["login", "id", "avatar_url", "html_url", "type", "public_repos", "followers", "following", "created_at"]}
        except Exception as e:
            result["platforms"]["github"] = {"error": str(e)}
    # Reddit check (simple)
    if "reddit" in platforms:
        try:
            r = requests.get(f"https://www.reddit.com/user/{username}/about.json", headers={"User-Agent": "AEGENTIS-OSINT/1.0"}, timeout=10)
            result["platforms"]["reddit"] = {"exists": r.status_code == 200, "status": r.status_code}
        except Exception as e:
            result["platforms"]["reddit"] = {"error": str(e)}
    return save_result("username_enum", username, result)

# === DARK WEB MENTION SCAN (placeholder APIs) ===
def darkweb_scan(query: str):
    result = {"query": query, "mentions": []}
    # Placeholder: integrate with Have I Been Pwned or similar if API key available
    # Without a key, we just record the query for future processing
    result["note"] = "Dark web scan requires API key (HIBP, etc.)"
    return save_result("darkweb_scan", query, result)

# === MAIN ===
def run_all(target_domain=None, target_ip=None, target_username=None):
    out = []
    if target_domain:
        out.append(domain_recon(target_domain))
    if target_ip:
        out.append(ip_recon(target_ip))
    if target_username:
        out.append(username_enum(target_username))
    return out

if __name__ == "__main__":
    import sys
    domain = sys.argv[1] if len(sys.argv) > 1 else "example.com"
    run_all(target_domain=domain)
