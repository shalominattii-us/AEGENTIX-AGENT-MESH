from __future__ import annotations

from dataclasses import dataclass
from typing import Any

@dataclass(frozen=True)
class RouteDecision:
    model_id: str | None
    reason: str
    eligible: tuple[str, ...]

class FleetRouter:
    """Route only to models inside the current hygiene trust envelope."""
    def __init__(self, minimum_score: float = 0.75):
        self.minimum_score = minimum_score

    def eligible(self, latest: dict[str, Any]) -> list[dict[str, Any]]:
        pool = []
        for model_id, state in latest.items():
            if state.get("state") == "healthy" and float(state.get("health_score", 0.0)) >= self.minimum_score:
                pool.append({"model_id": model_id, **state})
        return sorted(pool, key=lambda x: (-float(x["health_score"]), float(x.get("timestamp", 0.0))))

    def choose(self, latest: dict[str, Any], exclude: set[str] | None = None) -> RouteDecision:
        excluded = exclude or set()
        pool = [x for x in self.eligible(latest) if x["model_id"] not in excluded]
        ids = tuple(x["model_id"] for x in pool)
        if not pool:
            return RouteDecision(None, "NO_HEALTHY_MODEL", ids)
        return RouteDecision(pool[0]["model_id"], "HEALTHIEST_ELIGIBLE", ids)
