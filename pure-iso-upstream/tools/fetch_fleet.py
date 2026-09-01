#!/usr/bin/env python3
"""Discover and acquire Linux media without trusting catalog entries.

The runner intentionally separates discovery from promotion. It can ingest a
catalog URL, record every discovered target, and only promote media after
successful checksum/signature verification.
"""
from __future__ import annotations
import argparse, hashlib, json, re, subprocess, sys, time
from pathlib import Path
from urllib.request import Request, urlopen

CATALOG_SOURCES = [
    "https://linuxassociation.ca/distributions.php",
    "https://www.linuxlinks.com/big-list-linux-distros/",
]


def get(url: str) -> str:
    req = Request(url, headers={"User-Agent": "AEGENTIX-PureISO-Upstream/1.0"})
    with urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def normalize(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def discover(urls):
    targets = {}
    for url in urls:
        try:
            body = get(url)
        except Exception as exc:
            print(f"CATALOG_ERROR {url}: {exc}", file=sys.stderr)
            continue
        # Keep source pages as provenance; exact official ISO URLs are resolved
        # later and are never guessed from a distro name.
        names = re.findall(r">\s*([A-Za-z0-9][A-Za-z0-9 ._+!&'()/-]{2,80})\s*</", body)
        for name in names:
            name = normalize(name)
            if len(name) < 3 or len(name) > 80:
                continue
            key = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
            targets.setdefault(key, {"id": key, "name": name, "catalog_sources": []})
            if url not in targets[key]["catalog_sources"]:
                targets[key]["catalog_sources"].append(url)
    return sorted(targets.values(), key=lambda x: x["id"])


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def verify_checksum(media: Path, expected: str) -> bool:
    return sha256(media).lower() == expected.lower()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--catalog", action="append", default=[])
    ap.add_argument("--manifest", default="pure-iso-upstream/catalog/fleet.json")
    ap.add_argument("--root", default="pure-iso-upstream/artifacts")
    ap.add_argument("--media")
    ap.add_argument("--sha256")
    ap.add_argument("--target")
    args = ap.parse_args()

    urls = args.catalog or CATALOG_SOURCES
    targets = discover(urls)
    out = Path(args.manifest); out.parent.mkdir(parents=True, exist_ok=True)
    payload = {"schema": "pure-iso-upstream/v1", "generated_at": time.time(), "targets": targets}
    out.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")
    print(f"DISCOVERED={len(targets)}")

    # Optional explicit verification. Never promote on name matching alone.
    if args.media and args.sha256 and args.target:
        media = Path(args.media)
        ok = media.exists() and verify_checksum(media, args.sha256)
        state = "VERIFIED" if ok else "QUARANTINED"
        print(json.dumps({"target": args.target, "sha256": args.sha256, "state": state}))
        raise SystemExit(0 if ok else 2)

if __name__ == "__main__":
    main()
