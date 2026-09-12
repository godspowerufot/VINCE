# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated from ADR-009: Next.js, TypeScript, Tailwind CSS. Inter for body, Poppins for display headings.

## Users

Primary: a person who needs a Creditcoin financial yes-or-no without trusting VINCE’s backend to report another chain’s market. They paste a source-chain transaction hash, then connect Creditcoin Testnet to submit.

Secondary: a counterparty who opens a shared Receipt and re-runs observation.

## Product Purpose

VINCE is a verified market gate. The user points at a real Ethereum Chainlink feed-update. Attestcoin proves inclusion on Creditcoin. VINCE issues a Receipt. The product stops at attestation ([ADR-018](../docs/decisions/ADR-018-attest-only-product.md)). Hackathon track is still RWA: the condition is a real-world market print.

Success: the user can say they pasted a hash they chose, Attestcoin verified it, and they received a shareable Receipt. The receipt is a record, not a trading license and not a settlement ([ADR-015](../docs/decisions/ADR-015-attestation-receipt.md), [ADR-018](../docs/decisions/ADR-018-attest-only-product.md)).

## Positioning

Creditcoin does not act on an API price. Action is reconstructable from source tx bytes, an Attestcoin inclusion proof (`verifyAndEmit` at `0x0FD2`), and explicit policy. Proof is not PASS. Unlisted feeds are not auto-registered.

## Constraints

- MVP source is Ethereum, not Base.
- Identity is feed/aggregator address, not ticker. `tx.from` is not a registry key.
- Default UI must not lead with Merkle trees, continuity proofs, or precompile addresses.
- Black and blue. No third brand color.
- Owner lists markets. Paste does not write the registry.
- Live registry starts empty.
- Wallet is Creditcoin Testnet (CTC), after `verifySingle`.

## Terminology

| Term | Meaning |
| --- | --- |
| Proof verified | Inclusion on Creditcoin succeeded |
| Market condition satisfied | Listed emitter passed that row’s policy |
| REJECT_FEED | Emitter not listed |
| Window | 30 minutes after PASS |
| Preview | Worker `verifySingle` + policy preview; not the on-chain decision until Submit |
| Receipt | Shareable invoice-style record of the proved print and the policy line. Not a token certificate. |
