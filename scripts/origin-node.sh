#!/usr/bin/env bash
# =========================================================================
# AEGENTIX SOVEREIGN ORIGIN NODE - AUTONOMOUS RUNNER (Linux / POSIX / WSL)
# Primary Authority: Sovereign OS · Cybercore Deep · Hardware HMAC Enclave
# =========================================================================

set -euo pipefail

SERVER_URL="${SERVER_URL:-http://localhost:3000}"

echo ""
echo "=========================================================================="
echo "   AEGENTIX SOVEREIGN ORIGIN NODE - AUTONOMOUS PRIMARY CONTROLLER         "
echo "   Root Authority: Sovereign OS · Cybercore Deep · Hardware HMAC Enclave   "
echo "=========================================================================="
echo ""

case "${1:-}" in
  --probe)
    echo "[PROBE] Querying Origin Node Registry..."
    curl -s "$SERVER_URL/api/origin-node/probe" | jq . || echo "Query failed."
    exit 0
    ;;
  --pulse)
    echo "[ACTION] Emitting Cryptographic Pulse..."
    curl -s -X POST "$SERVER_URL/api/origin-node/action" -H "Content-Type: application/json" -d '{"action":"PULSE_HEARTBEAT"}' | jq .
    exit 0
    ;;
  --refuel)
    echo "[ACTION] Refueling Gas Tank from Zero-Capital Surplus..."
    curl -s -X POST "$SERVER_URL/api/origin-node/action" -H "Content-Type: application/json" -d '{"action":"REFUEL_GAS"}' | jq .
    exit 0
    ;;
  *)
    echo "[1/4] Checking Sovereign Primary Node status..."
    curl -s "$SERVER_URL/api/origin-node/status" | jq .state.name || echo "Server not reachable at $SERVER_URL"
    
    echo "[2/4] Auditing Zero-Capital Reserves..."
    curl -s "$SERVER_URL/api/zero-cap/status" | jq '{totalEarned: .state.totalRevenueEarnedUsd, gasTank: .state.gasTankBalanceUsd}' || true

    echo "[3/4] Triggering Moltbook Swarm Cycle..."
    curl -s -X POST "$SERVER_URL/api/moltbook/swarm/trigger" | jq .message || true

    echo "[4/4] Synchronizing Origin Mesh..."
    curl -s -X POST "$SERVER_URL/api/origin-node/action" -H "Content-Type: application/json" -d '{"action":"BOOT_ALL"}' | jq .message || true

    echo ""
    echo "Sovereign Origin Node online. UI: $SERVER_URL/#origin"
    ;;
esac
