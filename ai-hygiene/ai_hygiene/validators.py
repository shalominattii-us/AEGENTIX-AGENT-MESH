from __future__ import annotations
import json
from typing import Any

def validate_probe(probe: dict[str, Any], output: str) -> bool:
    expected = probe.get("expected")
    if expected is None:
        return bool(output.strip())
    kind = probe.get("validator", "exact")
    if kind == "exact":
        return output.strip() == str(expected)
    if kind == "contains":
        return str(expected) in output
    if kind == "json":
        try:
            value = json.loads(output)
        except (TypeError, ValueError):
            return False
        return value == expected
    return False
