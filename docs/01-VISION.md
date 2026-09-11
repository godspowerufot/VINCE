# 01 — Vision

## Protocol identity

**VINCE** — Verified Interchain Network for Collateral Enforcement

The name exists so architecture docs stay coherent. It is an internal protocol identity, not a marketing claim.

## One sentence

A verified market gate: paste an Ethereum feed-update, Attestcoin proves inclusion on Creditcoin, VINCE scores the listed rule, a Creditcoin desk may act only after `PASS`. Proof ≠ PASS.

## What VINCE is

- A **gate**: a user may continue only if a verified observation satisfies policy.
- A **decision protocol**: observation, verification, normalization, policy, decision, execution.
- A **desk consumer**: `/desk` may `releaseFinancing` only while a PASS window is live ([ADR-013](./decisions/ADR-013-gate-is-the-product.md)).
- A vault exists only as a **lab consumer**. It is not in the UI.

## What VINCE is not

- Not a tokenized-stock issuer.
- Not a DEX.
- Not Attestcoin.
- Not a centralized oracle that posts `price = 250`.
- Not, in MVP, a money market with rates, liquidation auctions, and risk tranching.
- Not a Base/TSLAc product until Attestcoin lists Base.

## Design thesis

Use Ethereum as the MVP source market (Attestcoin-supported), Attestcoin as the verification mechanism, Creditcoin as the execution environment, and VINCE as the interpreter of verified observations. Base B20 is the intended later market, never faked ([ADR-005](./decisions/ADR-005-source-chain-feasibility.md)).

```text
                 ETHEREUM
        ┌─────────────────────┐
        │ Chainlink feed-update│
        │ AnswerUpdated        │
        └──────────┬──────────┘
                   │ user pastes hash
                   ▼
              ATTESTCOIN
          ┌──────────────────┐
          │ Merkle proof     │
          │ Continuity proof │
          └────────┬─────────┘
                   ▼
              CREDITCOIN
          ┌──────────────────┐
          │ VinceVerifier    │
          │ VinceEngine      │
          │ VinceGate/Desk   │
          └────────┬─────────┘
                   │ PASS / REJECT
                   ▼
                 USER
```

## Why this is interesting

A dashboard that displays a price is common.

A Creditcoin contract that **independently verifies** a source-chain market transaction, then **applies its own policy**, is a protocol.

That is the demo, and it is also the infrastructure thesis:

- RWA financing conditions
- lending gates
- liquidation triggers
- trading gates
- settlement conditions
- eligibility checks

## Honesty about usefulness

As a hackathon demonstration, this is strong when the pasted hash is real, `verifyAndEmit` runs on Creditcoin, and the desk is locked until PASS.

As infrastructure, the hard part is not proving a transaction happened. The hard part is making the financial decision economically robust. Research energy belongs there after the proof path works. See [ADR-003](./decisions/ADR-003-price-observation-model.md).

## MVP product

**Verified Market Gate** plus a **Creditcoin RWA desk**.

```text
Asset      listed feed (owner-registered aggregator)
Required   that market’s floor
Observed   proven AnswerUpdated
Decision   PASS or REJECT
Desk       release financing only while PASS is live
```

Live registry starts empty. Unlisted → `REJECT_FEED`.

## Non-negotiable product feeling

The UI is a financial gate, not an oracle console.

Simple path: paste, two verdicts, listed markets, desk.

Advanced path: chain, block, transaction, proof type, attestation status.

## Related

- Architecture: [../ARCHITECTURE.md](../ARCHITECTURE.md)
- UX: [ux/user-flows.md](./ux/user-flows.md)
- Sequence: [04-DEVELOPMENT-SEQUENCE.md](./04-DEVELOPMENT-SEQUENCE.md)
