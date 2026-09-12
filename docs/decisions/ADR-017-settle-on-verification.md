# ADR-017 — Settlement unlocks on Attestcoin verification

Status: **Superseded** by [ADR-018](./ADR-018-attest-only-product.md)  
Date: 2026-09-12

Directed by the product owner: remove listed-market policy as a lock. If the source tx is **verified**, the user may settle and perform the Creditcoin operation.

## Decision

1. **`VinceEngine.evaluate` opens the 30-minute window after Attestcoin verification succeeds.** `verifyAndEmit` at `0x0FD2` plus receipt status `0x1` are required. Unlisted feed, stale print, and below-floor print do **not** block the window.

2. **Policy reasons remain informational.** The receipt may still show `REJECT_FEED` / `REJECT_THRESHOLD` / `REJECT_STALE` as notes. They do not lock `/desk`.

3. **Proof failure still fails closed.** Bad Merkle/continuity, `verifySingle != true`, or source receipt `≠ 0x1` cannot settle ([ADR-007](./ADR-007-fail-closed.md)).

4. **This amends the live consumer in [ADR-001](./ADR-001-cross-chain-verification.md) and [ADR-016](./ADR-016-settlement-consumer.md).** Cryptographic validity and economic validity stay different sentences on the receipt. Only the **desk lock** now keys off verification, not the listed floor.

## Residual risk (accepted)

Any attested successful Ethereum transaction that the gate will accept can open settlement for 30 minutes, including an unlisted aggregator or a print below a listed floor. The owner accepted that so the demo is: prove → settle.

## What does not change

- User pastes the hash ([ADR-010](./ADR-010-user-pastes-tx.md)).
- MVP source is Ethereum. Do not label the receipt as TSLAc / Base ([ADR-005](./ADR-005-source-chain-feasibility.md)).
- The receipt is not a trading license ([ADR-015](./ADR-015-attestation-receipt.md)).
- Registry listing is still owner-only. Paste still does not list a market.

## Related

- [ADR-001](./ADR-001-cross-chain-verification.md)
- [ADR-016](./ADR-016-settlement-consumer.md)
