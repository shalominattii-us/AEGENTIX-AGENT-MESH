# AI Hygiene Invariants

1. **No weight mutation.** The hygiene layer never rewrites model weights.
2. **Baseline before trust.** A model must pass its runtime probes before being marked healthy.
3. **Concurrent isolation.** Models are baselined independently under a bounded concurrency limit.
4. **Evidence first.** Each run emits an append-only event record.
5. **Fail closed.** Timeout, unavailable endpoint, exception, or empty response is a failed probe.
6. **Deterministic probes.** Probe definitions are version-controlled.
7. **Provider neutral.** Routing and scoring must not depend on vendor identity.
8. **Quarantine on sustained failure.** A degraded model must not be treated as healthy merely because alternatives are unavailable.
9. **Human override.** Autonomous hygiene may isolate a model but does not remove operator authority.
10. **Runtime health outranks preference.** The healthiest compatible model is preferred over a preferred-but-degraded model.
