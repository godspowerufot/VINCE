# ADR-015 — The next artifact is a VINCE Receipt

Status: **Accepted**  
Date: 2026-09-12

Directed by the product owner: after a source tx is attested, “what next” was unclear. The proposed idea was a shareable invoice/card with the Merkle proof that a stock ETH/USD token is valid for trading.

## Decision

1. **After attestation, VINCE issues a Receipt.** The receipt is the shareable record of (a) Attestcoin inclusion and (b) VINCE policy. It is the “what next” after Verify, before Desk.

2. **The receipt is not a trading credential.** It does not certify that a token, stock, or ETH/USD asset is valid, listed, or usable for trading. Attestcoin proves inclusion of a source-chain transaction. VINCE then scores a **listed** feed rule. Proof ≠ PASS ≠ tradable ([ADR-001](./ADR-001-cross-chain-verification.md)).

3. **MVP observation remains an Ethereum Chainlink feed-update**, identified by aggregator address. Do not label the receipt as TSLAc, Base, or a tokenized-stock certificate ([ADR-005](./ADR-005-source-chain-feasibility.md)).

4. **Merkle belongs on the receipt annex**, not as the first line of the gate. The card leads with market, observed print, inclusion, and policy. Root, sibling count, continuity digest, and `verifySingle` are on the same artifact so a counterparty can see the proof without opening an advanced drawer first.

5. **A shared `/receipt?tx=` link re-runs observation.** The UI is not the source of truth ([ADR-008](./ADR-008-backend-not-source-of-truth.md)). A downloaded screenshot is a copy of a view, not a capability.

## Why the raw idea was rejected

| Claim | Problem |
| --- | --- |
| “This stock ETH/USD token is valid” | VINCE does not issue or validate tokens. MVP is a feed print, not a B20 stock. |
| “Can be used for trading” | Inclusion of `AnswerUpdated` is not exchange eligibility, not custody, not a listing. |
| “The card is a blueprint that is valid” | A receipt records a proved print + a decision. It does not create a new asset. |

The useful part of the idea is kept: a clean, shareable invoice-style artifact so attestation is not a dead end.

## Flow

```text
Paste Ethereum feed-update
        → Verify (Merkle + continuity + verifySingle)
        → Receipt (shareable)
        → optional Submit on Creditcoin (on-chain decision)
        → Desk only if PASS window is live
```

## Consequences

- Default UI after Verify is the Receipt, not an unexplained verdict stack.
- Copy must say the receipt is a record, not a license.
- `/receipt` is a first-class route.
- Desk remains the only financial consumer of PASS ([ADR-013](./ADR-013-gate-is-the-product.md)).

## Related

- [ADR-001](./ADR-001-cross-chain-verification.md)
- [ADR-013](./ADR-013-gate-is-the-product.md)
- [ADR-014](./ADR-014-creditcoin-settlement.md)
