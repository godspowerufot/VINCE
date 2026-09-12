# ADR-016 — The hackathon consumer is settlement, not financing copy

Status: **Superseded** by [ADR-018](./ADR-018-attest-only-product.md)  
Date: 2026-09-12

Directed by the product owner: after Verify, the useful action is a **settlement condition** — pay or close only after a proved print. Replace “RWA financing / release financing” as the story. Stay on the BUIDL CTC **RWA track**.

## Decision

1. **`/desk` is a settlement dApp.** It may call `VinceDesk.releaseFinancing()` only while `VinceEngine.inWindow()` is true. UI copy is **Settle this print**, not “Release financing.” The Solidity name stays (already deployed on Creditcoin Testnet). Do not redeploy to rename an event.

2. **What settlement means here:** Creditcoin records that a listed, attested feed print met policy, so a Creditcoin app is allowed to proceed. The demo action is that on-chain consume. It is **not** a CEX close, not a Uniswap fill, not a bank wire, and not a token listing.

3. **Hackathon placement stays RWA + Attestcoin.** The real-world asset in MVP is the **Ethereum equity/USD (or crypto/USD) Chainlink print**, not a minted stock token. Attestcoin is still the core feature. Settlement is how RWA conditionality shows up on Creditcoin.

4. **The gate and receipt do not change.** Paste → prove → receipt → settle only if PASS ([ADR-013](./ADR-013-gate-is-the-product.md), [ADR-015](./ADR-015-attestation-receipt.md)). Proof ≠ PASS ≠ “the trade paid.”

## Why this is still RWA

RWA on Creditcoin is not “we issued TSLAc.” It is: a Creditcoin contract will not move until a **real-world market print** was included on an Attestcoin-supported chain and VINCE’s listed rule passed.

Financing copy implied a lender. Settlement copy matches the primitive we actually have: a yes/no gate, then one Creditcoin action.

## What we will not build in this hackathon

| Idea | Why not |
| --- | --- |
| Full exchange / order book | Invented venue. Misses Attestcoin judging. |
| “This token is now tradable” | Receipt is not a listing ([ADR-015](./ADR-015-attestation-receipt.md)). |
| Base / TSLAc settlement | Base is not an Attestcoin source ([ADR-005](./ADR-005-source-chain-feasibility.md)). |
| Rename `releaseFinancing` on-chain | Would need a new deploy. UI is enough. |

## Consequences

- Landing, desk, demo script, and README say settle / settlement desk.
- Nav label may say Settle; route stays `/desk`.
- Judges should hear: proved print → policy → Creditcoin settlement tx.

## Related

- [ADR-013](./ADR-013-gate-is-the-product.md)
- [ADR-014](./ADR-014-creditcoin-settlement.md)
- [ADR-015](./ADR-015-attestation-receipt.md)
