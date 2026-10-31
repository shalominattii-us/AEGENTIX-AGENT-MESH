# AEGENTIX Agent Communication Protocol (AACP)

**Version:** 1.0.0  
**Status:** Protocol proposal / implementation not yet verified  
**Home:** AEGENTIX-AGENT-MESH  
**Consumers:** CYBERNETICS, STARdesk, CyberCore, World Monitor, specialist agents, and approved external agent adapters.

## 1. Purpose

AACP defines a consistent, auditable way for agents and services to discover one another, exchange task messages, acknowledge work, request approvals, and report outcomes. Agents do not call one another with unrestricted credentials. All cross-agent communication passes through an authenticated, policy-enforcing broker/router.

## 2. Core principles

1. **Identity before messaging:** every participant has a registered stable identity.
2. **Least authority:** capabilities are explicit, scoped, time-bounded, and revocable.
3. **Brokered communication:** no implicit direct agent-to-agent trust.
4. **Typed envelopes:** messages use versioned schemas and validated payloads.
5. **Traceability:** every message and task is correlatable and auditable.
6. **Fail closed:** invalid identity, expired authorization, schema mismatch, or policy uncertainty means reject or quarantine.
7. **Human control:** high-impact actions require a human approval workflow.
8. **Transport independence:** protocol semantics do not depend on one vendor or transport.

## 3. Participant identity

Each registered participant has:
- `agent_id`: immutable URI-like identifier, e.g. `urn:aegentix:agent:cybernetics`;
- `display_name`;
- `owner_domain`;
- `agent_type`: `orchestrator`, `specialist`, `service`, or `external_adapter`;
- `capabilities`: registered capability identifiers, not free-form claims;
- `public_key_id`: reference to a key held by the identity service;
- `trust_state`: `pending`, `active`, `restricted`, `suspended`, or `revoked`;
- `policy_profile`;
- `protocol_versions`.

A display name or avatar is never an identity credential.

## 4. Message envelope

Every message MUST conform to the following logical envelope. Payloads are validated against a schema selected by `message_type` and `schema_version`.

```json
{
  "protocol": "AACP",
  "protocol_version": "1.0",
  "message_id": "msg_<unique-id>",
  "message_type": "task.request",
  "schema_version": "1.0.0",
  "sender": {
    "agent_id": "urn:aegentix:agent:cybernetics",
    "session_id": "session_<id>"
  },
  "recipient": {
    "agent_id": "urn:aegentix:agent:world-monitor"
  },
  "task": {
    "task_id": "task_<id>",
    "parent_task_id": null
  },
  "correlation_id": "corr_<id>",
  "causation_id": null,
  "created_at": "2026-10-31T00:00:00Z",
  "expires_at": "2026-10-31T00:05:00Z",
  "priority": "normal",
  "delivery": {
    "mode": "at_least_once",
    "idempotency_key": "idem_<stable-key>"
  },
  "authorization": {
    "capability": "world_monitor.read",
    "grant_id": "grant_<id>",
    "approval_id": null
  },
  "payload": {},
  "integrity": {
    "key_id": "key_<id>",
    "signature": "<detached-signature>"
  }
}
```

The example is illustrative. Production identifiers, timestamps, grants, and signatures must be issued and verified by trusted services.

## 5. Message types

- `registry.discover` — request permitted agent/service discovery.
- `task.request` — submit a task to a recipient.
- `task.accepted` — recipient accepted responsibility.
- `task.rejected` — recipient rejected with a machine-readable reason.
- `task.progress` — report bounded progress.
- `task.completed` — return a result reference and outcome.
- `task.failed` — return a failure code and safe diagnostic reference.
- `approval.request` — request human authorization for a gated action.
- `approval.granted` / `approval.denied` / `approval.expired` — approval lifecycle.
- `presence.updated` — publish agent presence/health.
- `event.publish` — publish a typed domain event.
- `control.revoke` — revoke a grant/session/capability through the authority service.

## 6. Acknowledgement and delivery

The broker returns a transport-level receipt separately from the application acknowledgement.

Application outcomes:
- `accepted`: recipient owns the task;
- `rejected`: recipient or policy engine refused it;
- `queued`: accepted for later delivery, not yet owned;
- `completed`: task finished with a result reference;
- `failed`: task terminated unsuccessfully;
- `expired`: deadline passed before completion;
- `cancelled`: authorized cancellation completed.

Use at-least-once delivery with idempotent handlers for the initial implementation. Consumers must deduplicate by `message_id` and enforce `idempotency_key` for side-effecting operations. Never promise exactly-once delivery across distributed systems.

## 7. Routing and discovery

The registry returns only participants visible to the requesting identity and allowed by policy. Routing decisions are made by the broker using recipient identity, capability grants, trust state, task type, and policy. Agents cannot self-assign privileged capabilities by writing them into a message.

## 8. Security requirements

- Authenticate senders using short-lived, audience-bound credentials and registered key material.
- Verify message signatures/integrity at the broker boundary.
- Authorize sender, recipient, capability, payload schema, and requested operation.
- Enforce expiry, replay protection, rate limits, quotas, and payload size limits.
- Encrypt transport; encrypt sensitive persisted messages at rest.
- Keep secrets and signing keys outside agent prompts and browser clients.
- Treat all message payloads, tool output, documents, and external agent responses as untrusted data.
- Do not allow a message payload to override system/developer policy or grant itself permissions.
- Redact secrets and sensitive fields from logs; preserve tamper-evident audit references.
- Support revocation of identity, session, grant, and adapter independently.

## 9. Human approval boundary

The broker must classify operations by risk. Read-only discovery and low-risk internal tasks may proceed under an existing grant. Financial transfers, trades, wallet signing, external publishing, account/security changes, destructive operations, and privilege escalation require explicit human approval plus a fresh policy decision. Approval is bound to the exact action parameters, recipient, scope, and expiry; changing parameters invalidates the approval.

## 10. Transport adapters

AACP defines semantics; transports are adapters:
- **Internal broker:** preferred default for local and sovereign deployments.
- **MCP adapter:** exposes approved tools/resources to compatible agents. MCP is a tool/context protocol, not by itself the complete AACP message lifecycle.
- **A2A adapter:** optional interoperability with agents implementing Google's Agent2Agent protocol; map identities, tasks, capabilities, and lifecycle without weakening AACP policy.
- **HTTPS/WebSocket:** authenticated service transport for requests, events, and presence.
- **Local IPC/event bus:** optional on-device transport with the same identity and authorization checks.

Adapters must preserve message identity, correlation, authorization, expiry, and audit metadata.

## 11. Observability and audit

Record message ID, task ID, correlation/causation IDs, sender/recipient, schema version, timestamps, policy decision, capability/grant reference, delivery attempts, acknowledgement, result reference, and terminal outcome. Audit records should be append-only or tamper-evident. Do not store raw secrets or unnecessary personal data.

## 12. Versioning and compatibility

- Protocol versions use major/minor form; payload schemas use semantic versions.
- A major version may introduce breaking envelope changes.
- Minor versions add backward-compatible optional fields or message types.
- Unknown message types, unsupported major versions, and invalid schemas are rejected or quarantined.
- Maintain conformance fixtures and adapter contract tests.

## 13. Initial implementation order

1. Identity/registry read-only discovery.
2. Envelope schema and validation.
3. Broker authorization and message routing.
4. Receipt and application acknowledgement lifecycle.
5. Idempotency, expiry, replay protection, and audit.
6. Presence/event channel.
7. MCP and A2A adapters.
8. Human approval workflow and policy integration.
9. Conformance tests and threat-model review.

## 14. Conformance minimum

A participant is AACP 1.0 conformant only if it validates envelopes, authenticates sender identity, checks recipient and capability authorization, enforces expiry, deduplicates messages, returns defined acknowledgements, handles revocation, and emits auditable outcomes. A document alone does not establish implementation or conformance.
