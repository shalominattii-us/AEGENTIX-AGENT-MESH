import asyncio
from ai_hygiene.stabilizer import Stabilizer

class FakeResult:
    def __init__(self, score):
        self.health_score=score
        self.baseline_hash="abc"
        self.state="unknown"


def test_quarantine_after_consecutive_failures():
    s=Stabilizer([{"id":"m","provider":"x","enabled":True}],[],failure_threshold=2)
    async def fake(spec, probes, timeout): return FakeResult(.1)
    import ai_hygiene.stabilizer as mod
    old=mod.baseline_model; mod.baseline_model=fake
    try:
        asyncio.run(s.evaluate(s.models[0])); assert s.health["m"].state=="degraded"
        asyncio.run(s.evaluate(s.models[0])); assert s.health["m"].state=="quarantined"
    finally: mod.baseline_model=old
