# ADR-018 — The product stops at attestation

Status: **Accepted**  
Date: 2026-09-12

Directed by the product owner: remove the settlement layer from the product and the UI. The flow ends when Attestcoin has verified the pasted source tx and VINCE has issued a Receipt.

Supersedes the **UI consumer** in [ADR-016](./ADR-016-settlement-consumer.md) and [ADR-017](./ADR-017-settle-on-verification.md). `VinceDesk` may remain deployed; it is not a product surface.

## Decision

1. **VINCE’s live product is paste → Attestcoin verify → Receipt.** No `/desk`. No “Settle this print.” No third layer after attestation.

2. **Default UI does not submit a settlement transaction.** `verifySingle` plus the shareable receipt are the demo. `VinceGate.submitSourceTransaction` / `VinceDesk.releaseFinancing` stay in contracts as unused consumers.

3. **Hackathon track stays RWA + Attestcoin.** The artifact is a proved real-world market print, not a Creditcoin payment.

## Flow

```text
Paste Ethereum feed-update
        → Verify (Merkle + continuity + verifySingle)
        → Receipt (shareable)
        STOP
```

## Related

- [ADR-013](./ADR-013-gate-is-the-product.md)
- [ADR-015](./ADR-015-attestation-receipt.md)
- [ADR-016](./ADR-016-settlement-consumer.md) (superseded for UI)
- [ADR-017](./ADR-017-settle-on-verification.md) (superseded for UI)
