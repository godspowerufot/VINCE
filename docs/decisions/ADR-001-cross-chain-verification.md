# ADR-001 — Cross-chain verification vs economic decision

Status: **Accepted**  
Date: 2026-09-10

## Decision

Attestcoin verifies source-chain transaction inclusion.

VINCE, not Attestcoin, determines whether the verified observation satisfies financial policy.

## Why

Cryptographic validity and economic validity are different.

Attestcoin, per official protocol docs, proves:

- a transaction is in a source-chain block (Merkle proof)
- that block is part of the attested source chain (continuity proof)

It does not prove:

- the transaction succeeded
- the token is the approved B20 asset
- the pool is the approved market
- the decoded amounts imply a robust price
- the observation is fresh enough to act on

If VINCE treated `verify() == true` as `PASS`, a valid inclusion of the wrong swap would unlock financial actions.

## Consequences

- Verification and policy are separate modules.
- Observability must emit both `verification=success` and `decision=REJECT` as a valid pair.
- UI copy must not say "market condition satisfied" when only the proof verified.
- After verification, VINCE must still check receipt status `0x1`. Official Attestcoin docs require this.

## Sources

- https://docs.attestcoin.org/attestcoin-protocol/architecture
- https://docs.attestcoin.org/attestcoin-protocol/attestcoin-readability/step-2-transaction-proving
- https://docs.attestcoin.org/attestcoin-protocol/dapp-builder-infrastructure/attestcoin-smart-contracts
