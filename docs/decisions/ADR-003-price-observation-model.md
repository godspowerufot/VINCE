# ADR-003 — Price observation model

Status: **Accepted**  
Date: 2026-09-10  
Updated: 2026-09-10 (MVP feed on Ethereum, not Base TSLAc)

## Decision

Price is **Option C**: a registered Chainlink feed-update, decoded from a **proven source-chain transaction**.

```text
observedPrice  ←  proven Chainlink round (8 decimals)
```

**MVP feeds live on Ethereum** (Attestcoin-supported). There are **many listings**, not one TSLA row ([ADR-011](./ADR-011-multi-market-registry.md)). Each listing is a Chainlink USD reference feed. None of them is Coinbase B20 `TSLAc`.

**Later:** Base B20 feeds, same Option C, only after Base is an Attestcoin source.

Approved DEX pool ([ADR-002](./ADR-002-approved-market.md)) is required for B20 markets. MVP Ethereum `REFERENCE_FEED` markets may set `pool = 0x0`.

## Why Option C still

A single DEX swap is too easy to manufacture before attestation lands. Chainlink rounds are the stricter observation.

## Why the MVP feed is on Ethereum, not Base

The application core is **prove this pasted tx via Attestcoin**. Base B20 feeds cannot be proven until Base is attested. Ethereum Mainnet is a documented source (CC3 Testnet `chainKey` 3).

Chainlink publishes a TSLA-USD (24/5) feed on Ethereum Mainnet. Phase 1 must copy the **proxy address from [data.chain.link](https://data.chain.link/feeds/ethereum/mainnet/tsla-usd-kalman-24-5)** — do not invent it here.

That number is **not** TSLAc. UI uses the matched registry display name (`BAT/USD`, `TSLA/USD`, …).

## What transaction is proven

Attestcoin proves **transactions**, not `eth_call` storage.

VINCE does **not** prove a random user calling `latestRoundData()`. That call does not create the price.

VINCE proves a source-chain transaction that **updates** the registered feed (OCR/transmitter round). Normalization decodes the round from that tx's logs.

Exact event signature is Phase 1 confirmation (standard Aggregator V3 / `AnswerUpdated` family). Do not invent a signature in contracts until it is sourced from the live aggregator.

## Price formula

Official Chainlink USD feeds typically return **8 decimals**.

```text
observedPrice = answer          // int256 from the proven round, 8 decimals
require(answer > 0)
require(receiptStatus == 1)
require(log.emitter is registered feed or its aggregator)
require(updatedAt within maxAgeSeconds)
require(feed is not frozen / paused)
compare observedPrice to minimumPrice in the same 8-decimal scale
```

Do not apply a B20 multiplier on the Ethereum reference feed. That multiplier is a Base B20 concept.

Do not mix this number with a DEX last-trade. Do not label it `TSLAc`.

## Fail closed on freeze

Equity feeds are 24/5. `updatedAt` stops advancing off-hours. Never settle against a frozen feed. `REJECT_FEED_FROZEN` / `REJECT_STALE`. [ADR-007](./ADR-007-fail-closed.md).

## Consequences

- Registry stores `feed` (proxy) and aggregator/emitter once sourced.
- **User pastes the tx** ([ADR-010](./ADR-010-user-pastes-tx.md)). The worker does not silently pick a swap.
- If the pasted tx is not the registered emitter, `REJECT_FEED` even if the proof verifies.
- Base Coinbase TSLAc proxies remain documented for the later market only.

## Rejected for MVP

| Option | Why not MVP |
| --- | --- |
| A — single DEX swap | Manipulable print; weaker than the official feed |
| B — DEX Sync | Same problem, still spot |
| D — hybrid | Correct direction later; two proof paths is extra Phase 5 risk |
| E — TWAP / batch | Phase 7 |

## Still blank (not the model — the instances)

- Ethereum TSLA/USD proxy address (copy from Chainlink; do not invent)
- BAT/USD proxy if it differs from aggregator `0x1c9049C48C24111A3546a73C67FD2A4Fc6C86Fdc`
- `maxAgeSeconds` = **3600** for all MVP reference feeds unless a row overrides it
- `minimumPrice` is **per market**: TSLA `250e8`, BAT `5e6` ($0.05). Never a global $250.

## Sources

- https://docs.base.org/build-on-base/integrate-defi/list-tokenized-stocks
- https://docs.attestcoin.org/attestcoin-protocol/architecture
