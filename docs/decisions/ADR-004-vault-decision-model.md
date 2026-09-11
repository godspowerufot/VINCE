# ADR-004 — Vault decision model

Status: **Accepted**  
Date: 2026-09-10  
Updated: 2026-09-10

## Decision

1. Gate first, then vault. The vault **consumes** the decision engine. It does not verify proofs itself.
2. A `PASS` is a **time window**, not a one-shot coupon.
3. Borrow limit is a fixed LTV while that window is live.
4. MVP collateral is a mock ERC-20 on Creditcoin (`vUSD`), 18 decimals, demo dollars.

The core of the application remains: **pasted tx → Attestcoin proof → policy**. This vault is a lab consumer of that result, not the product ([ADR-013](./ADR-013-gate-is-the-product.md)).

## Time window

```text
validUntil = verifiedAt + WINDOW_SECONDS
WINDOW_SECONDS = 1800        // 30 minutes
maxAgeSeconds  = 3600        // round updatedAt must also be ≤ 1 hour old
```

A borrow is allowed only if **all** hold:

```text
decision == PASS
block.timestamp <= validUntil
round.updatedAt is within maxAgeSeconds of verification time
market not paused
```

When the window expires, borrow reverts. User must paste a **newer** feed-update tx and re-verify. Existing debt is not auto-liquidated in MVP (liquidation is Phase 7).

The same verified observation may be used by **any** user while the window is live (global market observation). That matches "prove this print, then the gate is open for a while." Replay still prevents verifying the same source tx twice.

## Borrow limit formula

```text
LTV_BPS = 5000                 // 50%

if !inWindow(PASS):
    borrowLimit = 0
else:
    borrowLimit = collateral * LTV_BPS / 10_000
```

Worked example (the original illustration, now parameters):

```text
Collateral:           1000 vUSD
Required:             TSLA/USD ≥ 250e8
Verified observation: 263.40e8
Decision:             PASS
Window:               30 minutes
Borrow limit:         500 vUSD
```

No extra scaling by how far price sits above the threshold. Binary PASS × 50% LTV is testable.

`withdraw` of collateral that would break `borrowLimit` reverts.

## Collateral

Hackathon dummy ERC-20 `vUSD` minted on Creditcoin Testnet. Not bridged USDC. Not CTC unless a later ADR says so.

## Consequences

- `requestBorrow(amount)` reads the current observation window. It does not take `uint256 price`.
- User still pastes a tx to **open or refresh** the window ([ADR-010](./ADR-010-user-pastes-tx.md)).
- Tests: PASS inside window allows 50%; expired window reverts; REJECT reverts; over-LTV reverts.

## Rejected

| Option | Why not |
| --- | --- |
| One-shot PASS per tx per user | Worse UX; attestation is slow; window is the point |
| LTV scales with price | Extra surface, not needed to prove verification |
| Liquidation in MVP | Needs a stronger observation model |
