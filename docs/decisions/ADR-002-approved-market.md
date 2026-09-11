# ADR-002 — Approved market

Status: **Accepted**  
Date: 2026-09-10  
Updated: 2026-09-10

## Decision

Use an approved DEX pool rather than accepting arbitrary TSLAc/USDC markets.

Approved DEX pool is required for **B20 markets**.

MVP Ethereum `REFERENCE_FEED` markets set `pool = address(0)`. Price emitter is `feed` only. A Base TSLAc listing later must still have a sourced pool.

```text
feed  = price observation emitter (Option C)
pool  = approved market identity / future liquidity
```

## Why

Multiple pools may exist with different liquidity and prices. An attacker who cannot fake Attestcoin proofs can still transact in a pool they control.

Even though MVP does not take price from a swap, VINCE must still name **which** venue is recognized. Otherwise "listed TSLAc market" is undefined, and Phase 7 liquidity rules have nothing to bind to.

## Consequences

- Market registry stores `approvedPool` **and** `feed` per asset.
- A market cannot be listed without both (pool address may stay `UNKNOWN` in docs until Phase 1 sources it; it cannot be omitted as a field).
- Price normalization matches the registered **feed / aggregator**, not the pool.
- Listing or changing a pool or feed is a security-critical admin action.

## Still to source (instances, not the rule)

- Which venue on Base (Aerodrome, Uniswap, other)
- Exact pool address for TSLAc/USDC
- Quote asset (USDC vs USDbC vs other)

Record answers in [../integration/base.md](../integration/base.md) with sources. The rule is accepted; the address is not invented.

## Alternatives considered

| Option | Note |
| --- | --- |
| Any pool whose tokens match | Rejected: thin-pool manipulation |
| DEX aggregator print as price | Rejected for MVP price; see ADR-003 |
| Feed-only registry, no pool | Rejected: no sanctioned venue, no liquidity hook |
