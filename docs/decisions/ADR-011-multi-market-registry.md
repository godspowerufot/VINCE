# ADR-011 — Many registered markets, not TSLA-only

Status: **Accepted**  
Date: 2026-09-10

## Decision

VINCE is **not** a TSLA-only protocol.

It is a **registry of markets**. TSLA/USD is one listing. BAT/USD, AAPL/USD, ETH/USD, and later Base B20 names (TSLAc, NVDAc, …) are the same architecture: another row.

```text
pasted tx
    → prove inclusion (Attestcoin)
    → decode AnswerUpdated
    → match log.emitter to a registered feed
    → apply THAT market's minimumPrice / maxAge
```

A global `$250` threshold is wrong. That number belongs on the TSLA row only.

## Why

Phase 2 already proved a **BAT / USD** feed-update on Ethereum. Forcing that print through a TSLA `$250` rule produced `REJECT_THRESHOLD` for a reason that is not "BAT is invalid." It was "we treated every feed as TSLA."

The gate the user pastes into must be open to **any listed** Chainlink feed on an Attestcoin-supported chain.

It is **not** open to arbitrary unlisted aggregators. Unlisted emitter → `REJECT_FEED`.

Proof does **not** write the registry.

```text
prove  →  "this tx is a GOOGL-USD (24/5) update"     (observation)
list   →  owner sets emitter + minimumPrice + maxAge  (configuration)
PASS   →  listed emitter AND that row's policy        (decision)
```

UI **returns** the decoded market (`description()` / emitter) on every verified paste, including rejects. That is a label. It is not a listing.

## Rules

1. Identity is the feed/aggregator **address**, not the ticker. `tx.from` (oracle transmitter EOA) is not a registry key.
2. Each market has its own `minimumPrice`, `maxAgeSeconds`, `sourceChainKey`, and `feed`.
3. UI shows the matched market name from `description()` / registry, not a hardcoded TSLA title.
4. Adding a market is configuration (owner-gated). It is not a new protocol.
5. Base B20 tokens remain later listings, same registry, different `sourceChainKey` when Attestcoin supports Base.

## MVP seed listings (Ethereum, chainKey 3)

| id | Display | Feed / aggregator | minimumPrice | Status |
| --- | --- | --- | --- | --- |
| `eth-tsla-usd` | TSLA/USD | copy from Chainlink TSLA-USD 24/5 | `250e8` | instance still sourced |
| `eth-bat-usd` | BAT/USD | aggregator `0x1c9049C48C24111A3546a73C67FD2A4Fc6C86Fdc` (Phase 2) | `5e6` ($0.05) | **measured** |

The Phase 2 pasted tx matches `eth-bat-usd`. Under this ADR it is a threshold PASS candidate ($0.0718 ≥ $0.05), not a TSLA reject.

Sourced, **not** seeded (same transmitter EOA `0x413e725094c7810669F91856cc58e73eA3fbc400`; match emitter, not `tx.from`):

- SPCX-USD aggregator `0x1d37422e15ee379549B0B8E2a47523D3Ef5071a9` (`description()` = `SPCX-USD (24/5)`)
- GOOGL-USD aggregator `0x2A539061d701471c3835256f8FF982e81E9B4374` (`description()` = `GOOGL-USD (24/5)`)

Unlisted → `REJECT_FEED`. Floors not set.

Proxy address for BAT, if different from the aggregator, still to source. Matching on the **log emitter** is enough for MVP.

## Rejected alternative — prove-to-list

**Rejected:** first successful proof auto-adds the emitter and PASSes as that market.

Why rejected:

- `minimumPrice` is a policy parameter. A proof cannot invent a floor.
- Same transmitter EOA already printed SPCX and GOOGL. Auto-list would open every Chainlink OCR feed the node touches.
- Listing is a security-critical admin action ([ADR-002](./ADR-002-approved-market.md)). Contracts decide; workers do not mutate the registry ([ADR-008](./ADR-008-backend-not-source-of-truth.md)).

## Consequences

- Worker/engine: `marketId = registry.findByEmitter(log.address)`; if none, `REJECT_FEED` (still emit decoded `description()` for the UI).
- Tests: BAT fixture and TSLA fixture, same verifier, different thresholds. Unlisted GOOGL/SPCX fixtures must `REJECT_FEED` even when `verifySingle` is true.
- Frontend: user pastes tx first; asset label comes from the match, not from auto-registration.
