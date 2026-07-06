# Shared Agentic Layer

## Purpose
Common infrastructure for SOVEREIGN agent communication.

## Components
- Message Bus (pub/sub)
- State Store (distributed KV)
- Auth Layer (mTLS + JWT)
- Discovery (mDNS + DHT)

## Message Format
{version, from, to, type, payload, sig}
