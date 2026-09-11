# 01 — Vision

## Protocol identity

**VINCE** — Verified Interchain Network for Collateral Enforcement

The name exists so architecture docs stay coherent. It is an internal protocol identity, not a marketing claim.

## One sentence

A cross-chain collateral and trading gate that uses verifiable source-chain tokenized-stock market activity to make deterministic financial decisions on Creditcoin, without trusting a centralized price-reporting API.

## What VINCE is

- A **gate**: a user may continue only if a verified observation satisfies policy.
- A **decision protocol**: observation, verification, normalization, policy, decision, execution.
- Later, a **vault consumer** of that same decision engine.

## What VINCE is not

- Not a tokenized-stock issuer.
- Not a DEX.
- Not Attestcoin.
- Not a centralized oracle that posts `price = 250`.
- Not, in MVP, a money market with rates, liquidation auctions, and risk tranching.

## Design thesis

Use Base as the source market, Attestcoin as the verification mechanism, Creditcoin as the execution environment, and VINCE as the interpreter of verified observations.

```text
                  BASE
        ┌─────────────────────┐
        │ Tokenized stock     │
        │ TSLAc / USDC        │
        │ DEX                 │
        └──────────┬──────────┘
                   │ source event
                   ▼
              ATTESTCOIN
          ┌──────────────────┐
          │ Merkle proof     │
          │ Continuity proof │
          └────────┬─────────┘
                   ▼
              CREDITCOIN
          ┌──────────────────┐
          │ Verification     │
          │ Decision Engine  │
          │ Vault / Gate     │
          └────────┬─────────┘
                   │ allow / reject
                   ▼
                 USER
```

## Why this is interesting

A dashboard that displays tokenized-stock prices is common.

A Creditcoin contract that **independently verifies** a source-chain market transaction, then **applies its own policy**, is a protocol.

That is the demo, and it is also the infrastructure thesis:

- cross-chain collateral
- lending gates
- liquidation triggers
- trading gates
- RWA financing conditions
- settlement conditions
- conditional contracts
- eligibility checks

## Honesty about usefulness

As a hackathon demonstration, this is strong if Phase 2 works: real asset, real market activity, cryptographic proof, smart-contract decision.

As infrastructure, the hard part is not proving a transaction happened. The hard part is making the financial decision economically robust. Research energy belongs there after the proof path works. See [ADR-003](./decisions/ADR-003-price-observation-model.md).

## MVP product

**Verified Market Gate**

The user picks an approved asset and a condition, VINCE finds or accepts an eligible source transaction, proves it, verifies it, and returns `PASS` or `REJECT`.

Only after that works does VINCE grow a vault:

```text
Collateral $1,000
Asset      TSLAc
Required   TSLAc ≥ $250
Observed   $263.40
Decision   PASS
Borrow     $500 allowed
```

## Non-negotiable product feeling

The UI is a financial gate, not an oracle console.

Simple path: asset, condition, verified result, continue.

Advanced path: chain, pool, block, transaction, proof type, attestation status.

## Related

- Architecture: [../ARCHITECTURE.md](../ARCHITECTURE.md)
- UX: [ux/user-flows.md](./ux/user-flows.md)
- Sequence: [04-DEVELOPMENT-SEQUENCE.md](./04-DEVELOPMENT-SEQUENCE.md)
