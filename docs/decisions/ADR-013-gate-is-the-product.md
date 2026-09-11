# ADR-013 — The product is attestation; borrow is not

Status: **Accepted**  
Date: 2026-09-11

Directed by the product owner: the core idea is proving a source-chain market print and solving the trust problem. Borrow/lend and JSON market catalogs are not that idea.

## Decision

1. **VINCE’s product is the Verified Market Gate.** The user pastes a source-chain transaction hash. Attestcoin proves inclusion on Creditcoin. VINCE applies listed-market policy. Proof and PASS remain different questions ([ADR-001](./ADR-001-cross-chain-verification.md)).

2. **The hackathon consumer is the RWA desk, not a vault.** `/desk` may `releaseFinancing` only while a PASS window is live. That is what a Creditcoin lending/RWA app would call. Borrow/lend/mock vUSD is not in the UI. Lab vault Solidity may remain in `contracts/`. Live settlement is Creditcoin Testnet ([ADR-014](./ADR-014-creditcoin-settlement.md)).

3. **Delete `protocol/markets.json`.** No worker, API, or UI may treat a committed JSON file as the catalog or as a price. Listings are `VinceRegistry` on Creditcoin Testnet. Prices are chain reads.

4. **Two labeled numbers, both from chain, never from UI mocks:**

   | Number | Source | May PASS? |
   | --- | --- | --- |
   | RPC latest | Ethereum `latestRoundData()` on the listed aggregator | No. Live context only. Unverified. |
   | Attested print | `AnswerUpdated.answer` from a proven feed-update tx | Yes, if that emitter is listed and policy holds. |

   Do not settle on `eth_call`. Do not invent CoinGecko. Do not invent a TSLA aggregator.

## Why borrow existed

The vision sentence includes collateral enforcement. A gate answers yes or no. A vault was the smallest consumer so PASS was not a dead end.

That is **downstream**. `docs/00-PROBLEM.md` already says VINCE is not, in MVP, a lending market. `ARCHITECTURE.md` already says do not start with a lending protocol. The demo that matters is: real hash → Merkle + continuity → `verifySingle` → listed policy → PASS or REJECT.

## Why a “live” dashboard price is not enough

The naive design is:

```text
RPC latestRoundData → UI number → user believes it is verified
```

That is the trust problem. Attestcoin proves **transactions**, not storage. VINCE proves a feed-**update**. Showing RPC latest is allowed only if it is labeled unverified and cannot open a window.

## Consequences

- Default UI: Home, Gate, Desk, Markets, Activity.
- `/desk` stays locked unless Attestcoin `verifySingle` was required at submit and `VinceEngine.inWindow()` is true.
- Creditcoin ASC (`VinceVerifier` + `VinceGate` + `VinceDesk`) deploys with `npm run deploy:testnet` ([ADR-014](./ADR-014-creditcoin-settlement.md)).
- `/api/markets` reads the registry. Empty if the registry is unreachable (fail closed), not a seed file.
- Worker policy preview matches the on-chain registry, not `seed.json`.
- `protocol/markets.json` is removed.

## Related

- Problem: [../00-PROBLEM.md](../00-PROBLEM.md)
- Vision: [../01-VISION.md](../01-VISION.md)
- ADR-003, ADR-004, ADR-008, ADR-010, ADR-011, ADR-012
