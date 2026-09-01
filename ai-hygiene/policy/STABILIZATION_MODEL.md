# Autonomous Stabilization Contract

AI Hygiene v0.2 continuously evaluates enabled models concurrently.

## State machine

`unknown -> healthy | degraded -> quarantined -> healthy`

- A healthy result clears the consecutive-failure counter.
- A failed result enters `degraded`.
- Repeated failures at the configured threshold enter `quarantined`.
- A later passing evaluation restores the model to `healthy`.
- Only healthy models are eligible for routing.

## Safety boundary

The stabilizer may change **eligibility state** and publish evidence. It does not modify weights, training data, provider configuration, credentials, or external systems.

## Evidence

Every stabilization cycle is appended to `state/events.jsonl`; current controller state is stored in `state/stabilizer.json`.
