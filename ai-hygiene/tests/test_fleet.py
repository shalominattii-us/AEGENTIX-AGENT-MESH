from ai_hygiene.fleet import FleetRouter

def test_quarantined_models_are_excluded():
    latest = {
        "good": {"state": "healthy", "health_score": 0.99, "timestamp": 1},
        "bad": {"state": "quarantined", "health_score": 0.1, "timestamp": 2},
    }
    decision = FleetRouter().choose(latest)
    assert decision.model_id == "good"
    assert "bad" not in decision.eligible

def test_no_healthy_model_fails_closed():
    decision = FleetRouter().choose({"bad": {"state": "degraded", "health_score": 0.6}})
    assert decision.model_id is None
    assert decision.reason == "NO_HEALTHY_MODEL"
