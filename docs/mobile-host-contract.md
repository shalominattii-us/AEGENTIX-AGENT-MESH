# AEGENTIX Mobile Host Contract

Mobile hosts participate in the existing agent mesh as constrained execution nodes.

## Required envelope

```json
{
  "event_id": "uuid",
  "node_id": "aegentix-mobile-<platform>-<instance>",
  "type": "command|event|ack|heartbeat|reconcile",
  "timestamp": "RFC3339",
  "causal_parent": "event-id-or-null",
  "payload_hash": "sha256",
  "policy": "guardian-required|preapproved",
  "payload": {}
}
```

## Rules
- Persist inbound event/command before acknowledging it.
- Verify authentication and payload integrity before execution.
- A denied/escalated/unknown Guardian result is terminal for that execution attempt.
- A mobile node reports observed results; it never fabricates success.
- Offline events are queued locally and replayed in causal order after reconnect.
- Reconciliation must be idempotent.

## iOS
The transport and persistence layers must be independent of SwiftUI so App Intents and background task handlers can reuse them.

## Pixel
The transport and persistence layers must be independent of Compose UI so WorkManager/service handlers can reuse them.
