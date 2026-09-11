# ADR-007 — Fail closed

Status: **Accepted**  
Date: 2026-09-10

## Decision

If Attestcoin proofs cannot be generated or verified, security-critical VINCE actions fail closed.

No operator override, no REST price, no Chainlink shortcut on the settlement path, no "demo mode" flag in contracts.

## Why

The protocol's only reason to exist is that Creditcoin does not take an intermediary's word. A fallback price reintroduces the original problem at the exact moment it is most tempting.

Liveness is sacrificed. Safety is not.

## Consequences

- Proof builder downtime → gate returns a retryable error, not `PASS`.
- Attestation delay → UI waits; it does not skip.
- Unsupported source chain → no verification path; see ADR-005.
- Frozen or unproven auxiliary feeds, if used later, cannot authorize settlement by themselves.

Non-critical UX (displaying a *preview* price in the UI) may use untrusted market data if it is labeled as preview and cannot call settlement.
