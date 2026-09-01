from __future__ import annotations

import asyncio
import json
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Awaitable, Callable

from .core import ModelResult, baseline_model


@dataclass
class ModelHealth:
    model_id: str
    state: str = "unknown"
    consecutive_failures: int = 0
    last_score: float = 0.0
    baseline_hash: str = ""
    last_change: float = 0.0


class Stabilizer:
    """Autonomous eligibility controller; never mutates model weights."""

    def __init__(self, models: list[dict[str, Any]], probes: list[dict[str, str]],
                 timeout: float = 45, max_concurrency: int = 8,
                 failure_threshold: int = 3, recovery_score: float = .75):
        self.models = models
        self.probes = probes
        self.timeout = timeout
        self.max_concurrency = max(1, max_concurrency)
        self.failure_threshold = max(1, failure_threshold)
        self.recovery_score = recovery_score
        self.health = {m["id"]: ModelHealth(m["id"]) for m in models}
        self._lock = asyncio.Lock()

    async def evaluate(self, spec: dict[str, Any]) -> ModelResult:
        result = await baseline_model(spec, self.probes, self.timeout)
        async with self._lock:
            h = self.health[spec["id"]]
            previous = h.state
            h.last_score = result.health_score
            h.baseline_hash = result.baseline_hash
            if result.health_score >= self.recovery_score:
                h.consecutive_failures = 0
                h.state = "healthy"
            else:
                h.consecutive_failures += 1
                if h.consecutive_failures >= self.failure_threshold:
                    h.state = "quarantined"
                else:
                    h.state = "degraded"
            if h.state != previous:
                h.last_change = time.time()
                result.state = h.state
            else:
                result.state = h.state
        return result

    async def cycle(self) -> list[ModelResult]:
        sem = asyncio.Semaphore(self.max_concurrency)
        async def one(m):
            async with sem:
                return await self.evaluate(m)
        return await asyncio.gather(*(one(m) for m in self.models if m.get("enabled", True)))

    def eligible(self) -> list[str]:
        return [m for m, h in self.health.items() if h.state == "healthy"]

    def snapshot(self) -> dict[str, Any]:
        return {k: asdict(v) for k, v in self.health.items()}

    def save(self, state_dir: str, results: list[ModelResult] | None = None) -> None:
        p = Path(state_dir)
        p.mkdir(parents=True, exist_ok=True)
        if results is not None:
            with (p / "events.jsonl").open("a", encoding="utf-8") as f:
                f.write(json.dumps({"ts": time.time(), "type": "stabilizer_cycle",
                                    "models": [asdict(x) for x in results]}, sort_keys=True) + "\n")
        (p / "stabilizer.json").write_text(json.dumps(self.snapshot(), indent=2, sort_keys=True), encoding="utf-8")

    async def run_forever(self, interval_seconds: float, state_dir: str,
                          on_transition: Callable[[ModelHealth], Awaitable[None]] | None = None) -> None:
        while True:
            before = {k: v.state for k, v in self.health.items()}
            results = await self.cycle()
            self.save(state_dir, results)
            if on_transition:
                for model_id, health in self.health.items():
                    if before.get(model_id) != health.state:
                        await on_transition(health)
            await asyncio.sleep(max(1.0, interval_seconds))
