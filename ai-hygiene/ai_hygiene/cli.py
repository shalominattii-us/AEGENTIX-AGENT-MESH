from __future__ import annotations

import argparse
import asyncio
import json
from pathlib import Path

from .core import concurrent_baseline, load_latest, persist


def main() -> None:
    parser = argparse.ArgumentParser(prog="ai-hygiene")
    sub = parser.add_subparsers(dest="command", required=True)

    baseline = sub.add_parser("baseline", help="run concurrent baselines")
    baseline.add_argument("--config", default="config/models.json")
    baseline.add_argument("--state", default="state")

    status = sub.add_parser("status", help="show latest hygiene state")
    status.add_argument("--state", default="state")

    args = parser.parse_args()

    if args.command == "baseline":
        config = json.loads(Path(args.config).read_text(encoding="utf-8"))
        baseline_config = config["baseline"]
        results = asyncio.run(
            concurrent_baseline(
                config["models"],
                config["probes"],
                float(baseline_config["timeout_seconds"]),
                int(baseline_config["max_concurrency"]),
            )
        )
        persist(results, args.state)
        for result in results:
            print(
                f"{result.model_id:28} {result.state:11} "
                f"score={result.health_score:.3f} "
                f"baseline={result.baseline_hash[:12]}"
            )
        return

    latest = load_latest(args.state)
    if not latest:
        print("No baseline exists.")
        return
    for model_id, result in latest.items():
        print(
            f"{model_id:28} {result['state']:11} "
            f"score={result['health_score']:.3f} "
            f"baseline={result['baseline_hash'][:12]}"
        )


if __name__ == "__main__":
    main()
