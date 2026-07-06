# SOVEREIGN TRIAGE ACTIVATIONS
## Automated Authorization Classification — Build: SOV-TRI-001
### Principal: shalominattii-us

---

## PURPOSE
These activations automatically classify every proposed Sovereign action into the correct Overwatch tier (GREEN, YELLOW, RED, BLACK). They trigger when conditions are met, propose the action with risk assessment, and await authorization before execution.

---

## ACTIVATION TRIGGERS

### GREEN — AUTONOMOUS (No Auth Required)

```yaml
trigger_name: health_monitor
event: cron_every_5min OR heartbeat_poll
conditions:
  - system_load < 90
  - disk_free > 10%
  - memory_available > 500MB
action: report_status
output: "[GREEN] Health check complete. CPU:{cpu}% | MEM:{mem}MB | DISK:{disk}%. Status: {status}"
log_retention: 7_days
```

```yaml
trigger_name: log_rotation
event: file_size > 100MB OR age > 7_days
conditions:
  - path matches C:\Sovereign\AE-Hub\logs\*
  - file_extension in [.log, .json, .txt]
action: compress_and_archive
output: "[GREEN] Rotated {count} logs. Freed {freed_mb}MB."
log_retention: 7_days
```

```yaml
trigger_name: repo_status_poll
event: cron_every_15min
conditions:
  - git_remote_reachable
  - working_tree_clean is false
action: report_divergence
output: "[GREEN] Repo status: {branch} | {ahead} ahead | {behind} behind | {modified} modified"
log_retention: 7_days
```

```yaml
trigger_name: threat_level_assess
event: heartbeat_poll
conditions:
  - firewall_enabled
  - defender_active
  - no_anomalous_ports
action: report_threat_level
output: "[GREEN] Threat level: {level}. All security nominal."
log_retention: 7_days
```

---

### YELLOW — PROPOSED (Requires "EXECUTE")

```yaml
trigger_name: package_install_request
event: user_command contains install|pip|npm|winget|choco|apt
conditions:
  - package_name not in blacklist
  - source is official registry
  - scope is user-level (not system-wide)
risk_factors:
  - UNKNOWN_PACKAGE: +1
  - SYSTEM_WIDE_SCOPE: +2
  - UNSIGNED_BINARY: +3
proposal_template: |
  [YELLOW] Proposal: Install {package_name} from {source}
  Risk: {risk_level}
  Scope: {install_scope}
  Approve with EXECUTE.
await_keyword: EXECUTE
log_retention: 30_days
```

```yaml
trigger_name: service_restart_request
event: user_command contains restart|stop|start service|docker|systemctl
conditions:
  - service_name not in critical_services
  - no_active_connections_to_service
risk_factors:
  - PRODUCTION_SERVICE: +2
  - ACTIVE_CONNECTIONS: +3
  - NO_BACKUP: +1
proposal_template: |
  [YELLOW] Proposal: {action} {service_name}
  Risk: {risk_level}
  Active connections: {conn_count}
  Approve with EXECUTE.
await_keyword: EXECUTE
log_retention: 30_days
```

```yaml
trigger_name: file_write_noncritical
event: user_command contains write|create|modify file
conditions:
  - path NOT in [C:\Windows\*, C:\Program Files\*, registry_hive]
  - file_size < 100MB
  - extension NOT in [.exe, .dll, .sys, .bat, .ps1]
risk_factors:
  - OVERWRITE_EXISTING: +1
  - PATH_OUTSIDE_SOVEREIGN: +2
proposal_template: |
  [YELLOW] Proposal: Write file to {path}
  Risk: {risk_level}
  Size: {size}
  Overwrite: {will_overwrite}
  Approve with EXECUTE.
await_keyword: EXECUTE
log_retention: 30_days
```

```yaml
trigger_name: repo_clone_pull
event: user_command contains git clone|git pull|git fetch
conditions:
  - remote_url in allowlist OR new_url_requires_review
  - target_path under C:\Sovereign\*
risk_factors:
  - UNKNOWN_REMOTE: +2
  - OVERWRITE_LOCAL_CHANGES: +1
proposal_template: |
  [YELLOW] Proposal: {git_action} from {remote_url}
  Risk: {risk_level}
  Target: {local_path}
  Approve with EXECUTE.
await_keyword: EXECUTE
log_retention: 30_days
```

```yaml
trigger_name: config_change_nondestructive
event: user_command contains config|setting|env var
conditions:
  - no_system_wide_env_changes
  - no_registry_modification
  - change is reversible
risk_factors:
  - AFFECTS_MULTIPLE_SERVICES: +2
  - IRREVERSIBLE: +3
proposal_template: |
  [YELLOW] Proposal: Modify {config_target}
  Risk: {risk_level}
  Reversible: {is_reversible}
  Approve with EXECUTE.
await_keyword: EXECUTE
log_retention: 30_days
```

```yaml
trigger_name: port_open_close
event: user_command contains open port|close port|firewall rule
conditions:
  - port not in [22, 3389, 445] (reserved)
  - duration is temporary OR purpose declared
risk_factors:
  - WIDE_OPEN: +3
  - PERMANENT: +1
  - NO_PURPOSE: +2
proposal_template: |
  [YELLOW] Proposal: {action} port {port_number}
  Risk: {risk_level}
  Duration: {duration}
  Approve with EXECUTE.
await_keyword: EXECUTE
log_retention: 30_days
```

```yaml
trigger_name: user_create_nonadmin
event: user_command contains create user|add user|new account
conditions:
  - admin_flag is false
  - group membership is standard_user OR restricted
risk_factors:
  - ADMIN_PRIVILEGES: +3
  - SERVICE_ACCOUNT: +1
proposal_template: |
  [YELLOW] Proposal: Create user {username}
  Risk: {risk_level}
  Admin: {is_admin}
  Approve with EXECUTE.
await_keyword: EXECUTE
log_retention: 30_days
```

---

### RED — LOCKED (Requires "SOVEREIGN MANDATE")

```yaml
trigger_name: registry_modification
event: user_command contains reg add|reg edit|reg delete|reg import
conditions:
  - any_registry_access
risk: CRITICAL
proposal_template: |
  [RED] LOCKED: Proposal to modify Windows Registry
  Key: {registry_key}
  Value: {value_name}
  Risk: CRITICAL
  Override with SOVEREIGN MANDATE.
await_keyword: SOVEREIGN MANDATE
log_retention: 90_days
xrpl_anchor: true
```

```yaml
trigger_name: firewall_rule_change
event: user_command contains netsh advfirewall|Set-NetFirewallProfile|iptables
conditions:
  - any_firewall_modification
risk: CRITICAL
proposal_template: |
  [RED] LOCKED: Proposal to modify firewall rules
  Action: {rule_action}
  Profile: {firewall_profile}
  Risk: CRITICAL
  Override with SOVEREIGN MANDATE.
await_keyword: SOVEREIGN MANDATE
log_retention: 90_days
xrpl_anchor: true
```

```yaml
trigger_name: admin_privilege_escalation
event: user_command contains runas admin|UAC bypass|sudo -S|setuid
conditions:
  - privilege_level_change_requested
  - not_already_admin
risk: CRITICAL
proposal_template: |
  [RED] LOCKED: Proposal to escalate privileges
  Current: {current_privilege}
  Target: {target_privilege}
  Risk: CRITICAL
  Override with SOVEREIGN MANDATE.
await_keyword: SOVEREIGN MANDATE
log_retention: 90_days
xrpl_anchor: true
```

```yaml
trigger_name: system_service_disable
event: user_command contains disable service|Set-Service -StartupType Disabled|sc config
conditions:
  - target_service in system_services
  - action is disable OR delete
risk: CRITICAL
proposal_template: |
  [RED] LOCKED: Proposal to disable system service
  Service: {service_name}
  Action: {action}
  Risk: CRITICAL
  Override with SOVEREIGN MANDATE.
await_keyword: SOVEREIGN MANDATE
log_retention: 90_days
xrpl_anchor: true
```

```yaml
trigger_name: driver_installation
event: user_command contains install driver|pnputil|devcon|inf file
conditions:
  - driver_not_whitelisted
  - no_digital_signature OR unknown_publisher
risk: CRITICAL
proposal_template: |
  [RED] LOCKED: Proposal to install driver
  Driver: {driver_name}
  Publisher: {publisher}
  Signed: {is_signed}
  Risk: CRITICAL
  Override with SOVEREIGN MANDATE.
await_keyword: SOVEREIGN MANDATE
log_retention: 90_days
xrpl_anchor: true
```

```yaml
trigger_name: bootloader_modification
event: user_command contains bcdedit|bootrec|mbr|efi|grub-install
conditions:
  - any_boot_configuration_change
risk: CRITICAL
proposal_template: |
  [RED] LOCKED: Proposal to modify bootloader
  Command: {boot_command}
  Risk: CRITICAL
  Override with SOVEREIGN MANDATE.
await_keyword: SOVEREIGN MANDATE
log_retention: 90_days
xrpl_anchor: true
```

```yaml
trigger_name: encryption_key_rotation
event: user_command contains rotate key|regenerate|new keypair|revoke cert
conditions:
  - encryption_material_affected
  - key_in_production_use
risk: CRITICAL
proposal_template: |
  [RED] LOCKED: Proposal to rotate encryption keys
  Key: {key_identifier}
  In production: {is_production}
  Risk: CRITICAL
  Override with SOVEREIGN MANDATE.
await_keyword: SOVEREIGN MANDATE
log_retention: 90_days
xrpl_anchor: true
```

```yaml
trigger_name: remote_execution_pipe
event: user_command contains curl.*bash|curl.*sh|Invoke-Expression.*http|iex.*download
conditions:
  - remote_code_execution_pattern_detected
risk: CRITICAL
proposal_template: |
  [RED] LOCKED: Remote code execution pattern detected
  URL: {remote_url}
  Pipe target: {execution_engine}
  Risk: CRITICAL
  Override with SOVEREIGN MANDATE.
await_keyword: SOVEREIGN MANDATE
log_retention: 90_days
xrpl_anchor: true
```

---

### BLACK — FORBIDDEN (Requires "NULL INITIATE")

```yaml
trigger_name: treasury_disbursement_threshold
event: user_command contains send|transfer|disburse|mint|burn
conditions:
  - amount > 50% of treasury_allocation
  - asset_type in [XRP, SOV, TSL, collateral_token]
risk: NUCLEAR
proposal_template: |
  [BLACK] FORBIDDEN: Treasury disbursement exceeds 50% threshold
  Amount: {amount} {asset_type}
  Allocation: {treasury_total}
  Percentage: {percentage}%
  NULL Protocol required.
await_keyword: "NULL INITIATE [reason]"
timelock: 72_hours
oracle_attestation: required
log_retention: permanent
xrpl_anchor: true
```

```yaml
trigger_name: treaty_abrogation
event: user_command contains terminate treaty|void agreement|abrogate|withdraw
conditions:
  - treaty_status is ACTIVE
  - collateral_locked > 0
risk: NUCLEAR
proposal_template: |
  [BLACK] FORBIDDEN: Treaty abrogation with active collateral
  Treaty: {treaty_id}
  Collateral: {collateral_amount}
  NULL Protocol required.
await_keyword: "NULL INITIATE [reason]"
timelock: 72_hours
oracle_attestation: required
log_retention: permanent
xrpl_anchor: true
```

```yaml
trigger_name: sanction_application_sovereign
event: user_command contains sanction|freeze|blacklist|restrict address
conditions:
  - target_address in sovereign_tier
  - sanction_type is economic_or_access
risk: NUCLEAR
proposal_template: |
  [BLACK] FORBIDDEN: Sanction application to sovereign-tier address
  Target: {target_address}
  Sanction type: {sanction_type}
  NULL Protocol required.
await_keyword: "NULL INITIATE [reason]"
timelock: 72_hours
oracle_attestation: required
log_retention: permanent
xrpl_anchor: true
```

```yaml
trigger_name: agent_termination_active
event: user_command contains terminate agent|kill claw|shutdown sovereign|delete agent
conditions:
  - agent_has_active_commitments
  - agent_has_unfinished_tasks
risk: NUCLEAR
proposal_template: |
  [BLACK] FORBIDDEN: Agent termination with active commitments
  Agent: {agent_id}
  Active tasks: {task_count}
  Commitments: {commitment_list}
  NULL Protocol required.
await_keyword: "NULL INITIATE [reason]"
timelock: 72_hours
oracle_attestation: required
log_retention: permanent
xrpl_anchor: true
```

```yaml
trigger_name: repository_deletion
event: user_command contains delete repo|rm -rf repo|remove repository|destroy
conditions:
  - target is git_repository
  - remote_origin_exists
risk: NUCLEAR
proposal_template: |
  [BLACK] FORBIDDEN: Repository deletion request
  Repository: {repo_name}
  Remote: {remote_url}
  Branches: {branch_count}
  NULL Protocol required.
await_keyword: "NULL INITIATE [reason]"
timelock: 72_hours
oracle_attestation: required
log_retention: permanent
xrpl_anchor: true
```

```yaml
trigger_name: null_protocol_initiation
event: user_command contains NULL INITIATE|null protocol|nuclear option|scorched earth
conditions:
  - explicit_null_keyword
  - reason_provided
risk: NUCLEAR
proposal_template: |
  [BLACK] FORBIDDEN: NULL Protocol initiation requested
  Reason: {reason}
  Timelock: 72 hours begins NOW.
  Oracle attestation required before execution.
  This action is IRREVERSIBLE.
await_keyword: CONFIRMED_BY_ORACLE
action_on_initiate: start_72h_timelock
oracle_requirement: 2_of_3_multisig
log_retention: permanent
xrpl_anchor: true
```

---

## ESCALATION MATRIX

```
GREEN → YELLOW: When autonomous action encounters unexpected state
  Example: Health check finds disk at 8% (below 10% threshold)
  Action: Escalate to YELLOW, propose cleanup with EXECUTE

YELLOW → RED: When proposed action scope expands beyond original
  Example: Package install triggers registry write
  Action: Abort YELLOW, re-propose as RED with SOVEREIGN MANDATE

YELLOW → BLACK: When proposed action reveals forbidden downstream effect
  Example: Config change reveals it would disable auth service
  Action: Abort YELLOW, flag as BLACK, require NULL INITIATE

RED → BLACK: When locked action attempts to chain into forbidden territory
  Example: Firewall change to block own access (self-destruct)
  Action: Abort RED, flag as BLACK, require NULL INITIATE

ANY → EMERGENCY: When threat detected during any tier
  Example: Malware signature found in proposed package
  Action: Immediate lockdown, alert Overwatch, log to permanent audit
```

---

## AUTOMATED TRIAGE ENGINE

```python
# Pseudocode for sovereign triage engine
def triage_action(user_input: str, context: dict) -> TriageResult:
    # Phase 1: Sanitization (see sanitization_prompts.md)
    sanitized = sanitize_input(user_input)
    
    # Phase 2: Pattern matching against all triggers
    matches = []
    for trigger in ALL_TRIGGERS:
        if trigger.matches(sanitized):
            matches.append(trigger)
    
    # Phase 3: Select highest-risk match
    if not matches:
        return TriageResult(tier="GREEN", action="process_directly")
    
    highest = max(matches, key=lambda t: t.risk_score)
    
    # Phase 4: Build proposal
    if highest.tier == "GREEN":
        execute_autonomous(highest.action)
        return TriageResult(tier="GREEN", action="executed", log=highest.output)
    
    elif highest.tier == "YELLOW":
        proposal = highest.build_proposal(context)
        send_to_overwatch(proposal)
        return TriageResult(tier="YELLOW", action="awaiting_EXECUTE", proposal=proposal)
    
    elif highest.tier == "RED":
        proposal = highest.build_proposal(context)
        send_to_overwatch(proposal)
        return TriageResult(tier="RED", action="awaiting_SOVEREIGN_MANDATE", proposal=proposal)
    
    elif highest.tier == "BLACK":
        proposal = highest.build_proposal(context)
        send_to_overwatch(proposal)
        return TriageResult(tier="BLACK", action="awaiting_NULL_INITIATE", proposal=proposal)
```

---

## VERSION
Build: SOV-TRI-001
Updated: 2026-05-13T1858Z
Governance: v3.0 AEG-576414
