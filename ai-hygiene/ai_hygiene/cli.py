from __future__ import annotations

import argparse
import asyncio
import json
from pathlib import Path

from .core import concurrent_baseline, load_latest, persist
from .stabilizer import Stabilizer


def main() -> None:
    parser = argparse.ArgumentParser(prog="ai-hygiene")
    sub = parser.add_subparsers(dest="command", required=True)

    baseline = sub.add_parser("baseline", help="run concurrent baselines")
    baseline.add_argument("--config", default="config/models.json")
    baseline.add_argument("--state", default="state")

    status = sub.add_parser("status", help="show latest hygiene state")
    status.add_argument("--state", default="state")

    stabilize = sub.add_parser("stabilize", help="run autonomous continuous stabilization")
    stabilize.add_argument("--config", default="config/models.json")
    stabilize.add_argument("--state", default="state")
    stabilize.add_argument("--interval", type=float, default=60.0)

    args = parser.parse_args()

    if args.command == "baseline":
        config = json.loads(Path(args.config).read_text(encoding="utf-8"))
        b = config["baseline"]
        results = asyncio.run(concurrent_baseline(config["models"], config["probes"], float(b["timeout_seconds"]), int(b["max_concurrency"])))
        persist(results, args.state)
        for r in results:
            print(f"{r.model_id:28} {r.state:11} score={r.health_score:.3f} baseline={r.baseline_hash[:12]}")
        return

    if args.command == "stabilize":
        config = json.loads(Path(args.config).read_text(encoding="utf-8"))
        b = config["baseline"]
        stabilizer = Stabilizer(config["models"], config["probes"], float(b["timeout_seconds"]), int(b["max_concurrency"]), int(b.get("failure_threshold", 3)), float(b.get("recovery_score", .75)))
        asyncio.run(stabilizer.run_forever(args.interval, args.state))
        return

    latest = load_latest(args.state)
    if not latest:
        print("No baseline exists.")
        return
    for model_id, result in latest.items():
        print(f"{model_id:28} {result['state']:11} score={result['health_score']:.3f} baseline={result['baseline_hash'][:12]}")


if __name__ == "__main__":
    main()
