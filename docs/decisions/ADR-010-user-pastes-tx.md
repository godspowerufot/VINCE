# ADR-010 — User pastes the source transaction

Status: **Accepted**  
Date: 2026-09-10

## Decision

The MVP application’s primary input is a **source-chain transaction hash the user pastes**.

VINCE does not silently hunt for a qualifying swap or feed-update and then pretend the user verified "the market." The user points at a tx. The protocol **validates** it.

```text
User pastes 0xabc…tx
        ↓
Worker loads the tx (chain, block, receipt)
        ↓
Wait until that block is attested
        ↓
ProofBuilder.getProof(txHash)
        ↓
Creditcoin verifyAndEmit
        ↓
Decode + policy (emitter, event, price, freshness, chainKey)
        ↓
PASS or REJECT with reason codes
```

## Why

The core of the product is: **Attestcoin verification works**. A paste-a-tx gate makes that visible and testable.

Auto-selecting "the latest good print" hides a heuristic oracle in the worker ([ADR-008](./ADR-008-backend-not-source-of-truth.md)).

## What VINCE still checks (the paste is not trusted)

The hash is a hint. After proof success, the engine still requires:

| Check | Reject code |
| --- | --- |
| `chainKey` is an Attestcoin-supported source | `REJECT_SOURCE_CHAIN` |
| Receipt status `0x1` | `REJECT_STATUS` |
| Log emitter matches **a** registered feed | `REJECT_FEED` if none |
| Event decodes to a positive answer | `REJECT_DECODE` |
| `updatedAt` within that market's `maxAgeSeconds` | `REJECT_STALE` |
| Feed not frozen | `REJECT_FEED_FROZEN` |
| `answer >= that market's minimumPrice` | `REJECT_THRESHOLD` |

Proof verified + wrong contract is a **successful proof** and a **failed policy**. UI must show both.

## Worker job after paste

- Resolve tx on the registered source RPC
- Reject unknown hash / pending tx before wasting proof-builder calls
- `waitUntilHeightAttested`
- `getProof` / submit to ASC
- Return Creditcoin tx + decision events
- Never rewrite the user’s hash

Optional later: a "find latest attested feed-update" helper, clearly labeled **Find an example tx**, not the settlement default.

## UX

Primary field: paste transaction hash.

Stages: validating tx → waiting for attestation → generating proof → verifying on Creditcoin → condition met / not met.

Advanced panel: chain, feed, block, pasted hash, Creditcoin hash.

## Consequences

- Frontend Flow A is paste-first, not "we found a swap."
- Tests include: listed BAT feed tx vs BAT floor; listed TSLA feed tx vs $250; Uniswap tx `REJECT_FEED`.
