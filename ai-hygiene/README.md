# AI Hygiene v0.1.0

Autonomous runtime hygiene and stabilization for heterogeneous AI model fleets.

## Core loop

`discover -> concurrent baseline -> verify -> score -> quarantine/route -> re-baseline`

AI Hygiene treats each model as an independently measurable runtime. It does not modify model weights.

## Initial capabilities

- Concurrent per-model baselines with bounded concurrency.
- Provider-neutral adapter boundary.
- Ollama and OpenAI-compatible chat endpoints.
- Deterministic probe corpus.
- Latency and success scoring.
- Healthy / degraded / quarantined states.
- Append-only JSONL evidence ledger.
- Latest-state snapshot for supervisors.
- Fail-closed handling for timeout, unavailable, or malformed responses.

## AEGENTIX integration

This subsystem is designed to sit below the agent mesh as the model-health authority. Routing decisions should consume the hygiene state rather than trusting model identity or provider reputation.

## Invariants

1. No weight mutation.
2. Baseline before trust.
3. Concurrent isolation.
4. Evidence first.
5. Fail closed.
6. Human override remains possible.
7. Runtime health outranks model preference.
