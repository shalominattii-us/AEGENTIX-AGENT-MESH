from __future__ import annotations

import asyncio
import hashlib
import json
import statistics
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

import httpx


@dataclass
class ProbeResult:
    probe_id: str
    ok: bool
    latency_ms: float
    output: str
    error: str | None = None


@dataclass
class ModelResult:
    model_id: str
    provider: str
    timestamp: float
    probes: list[ProbeResult]
    health_score: float
    baseline_hash: str
    state: str


class Adapter:
    def __init__(self, spec: dict[str, Any], timeout: float):
        self.spec = spec
        self.timeout = timeout

    async def generate(self, prompt: str) -> str:
        raise NotImplementedError


class OllamaAdapter(Adapter):
    async def generate(self, prompt: str) -> str:
        url = self.spec["base_url"].rstrip("/") + "/api/generate"
        payload = {"model": self.spec["model"], "prompt": prompt, "stream": False}
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            return str(response.json().get("response", ""))


class OpenAICompatibleAdapter(Adapter):
    async def generate(self, prompt: str) -> str:
        url = self.spec["base_url"].rstrip("/") + "/v1/chat/completions"
        headers: dict[str, str] = {}
        if self.spec.get("api_key"):
            headers["Authorization"] = "Bearer " + self.spec["api_key"]
        payload = {
            "model": self.spec["model"],
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0,
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return str(response.json()["choices"][0]["message"]["content"])


def adapter_for(spec: dict[str, Any], timeout: float) -> Adapter:
    if spec["provider"].lower() == "ollama":
        return OllamaAdapter(spec, timeout)
    return OpenAICompatibleAdapter(spec, timeout)


def canonical(text: str) -> str:
    return " ".join(text.strip().split())


def fingerprint(probes: list[ProbeResult]) -> str:
    material = [
        {"id": p.probe_id, "ok": p.ok, "output": canonical(p.output)}
        for p in probes
    ]
    encoded = json.dumps(material, sort_keys=True, ensure_ascii=False).encode()
    return hashlib.sha256(encoded).hexdigest()


def score(probes: list[ProbeResult]) -> float:
    if not probes:
        return 0.0
    success = sum(p.ok for p in probes) / len(probes)
    latencies = [p.latency_ms for p in probes if p.ok]
    latency_penalty = 0.0 if not latencies else min(statistics.mean(latencies) / 5000.0, 1.0)
    return max(0.0, success * (1.0 - 0.25 * latency_penalty))


async def run_probe(adapter: Adapter, probe: dict[str, str]) -> ProbeResult:
    start = time.perf_counter()
    try:
        output = await adapter.generate(probe["prompt"])
        return ProbeResult(
            probe_id=probe["id"],
            ok=bool(output.strip()),
            latency_ms=(time.perf_counter() - start) * 1000.0,
            output=output,
        )
    except Exception as exc:
        return ProbeResult(
            probe_id=probe["id"],
            ok=False,
            latency_ms=(time.perf_counter() - start) * 1000.0,
            output="",
            error=f"{type(exc).__name__}: {exc}",
        )


async def baseline_model(
    spec: dict[str, Any], probes: list[dict[str, str]], timeout: float
) -> ModelResult:
    adapter = adapter_for(spec, timeout)
    results = await asyncio.gather(*(run_probe(adapter, probe) for probe in probes))
    health = score(results)
    state = "healthy" if health >= 0.75 else "degraded" if health >= 0.50 else "quarantined"
    return ModelResult(
        model_id=spec["id"],
        provider=spec["provider"],
        timestamp=time.time(),
        probes=results,
        health_score=health,
        baseline_hash=fingerprint(results),
        state=state,
    )


async def concurrent_baseline(
    models: list[dict[str, Any]],
    probes: list[dict[str, str]],
    timeout: float,
    max_concurrency: int,
) -> list[ModelResult]:
    semaphore = asyncio.Semaphore(max(1, max_concurrency))

    async def one(spec: dict[str, Any]) -> ModelResult:
        async with semaphore:
            return await baseline_model(spec, probes, timeout)

    enabled = [model for model in models if model.get("enabled", True)]
    return await asyncio.gather(*(one(model) for model in enabled))


def persist(results: list[ModelResult], state_dir: str) -> None:
    path = Path(state_dir)
    path.mkdir(parents=True, exist_ok=True)
    event = {
        "ts": time.time(),
        "type": "concurrent_baseline",
        "models": [asdict(result) for result in results],
    }
    with (path / "events.jsonl").open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(event, sort_keys=True, ensure_ascii=False) + "\n")
    latest = {result.model_id: asdict(result) for result in results}
    (path / "latest.json").write_text(
        json.dumps(latest, indent=2, sort_keys=True, ensure_ascii=False), encoding="utf-8"
    )


def load_latest(state_dir: str) -> dict[str, Any]:
    path = Path(state_dir) / "latest.json"
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))
