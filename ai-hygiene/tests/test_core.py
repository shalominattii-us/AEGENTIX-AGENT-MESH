from ai_hygiene.core import ProbeResult, fingerprint, score


def test_fingerprint_is_deterministic():
    probes = [ProbeResult("x", True, 10.0, "  hello   world ")]
    assert fingerprint(probes) == fingerprint(probes)


def test_empty_score_is_zero():
    assert score([]) == 0.0


def test_successful_probe_scores_near_one():
    probes = [ProbeResult("x", True, 10.0, "ok")]
    assert score(probes) > 0.99
