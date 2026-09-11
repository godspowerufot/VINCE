# Base integration

Source: [List Tokenized Stocks](https://docs.base.org/build-on-base/integrate-defi/list-tokenized-stocks), retrieved 2026-09-10.

Confirm addresses onchain before using them in a registry. This file is a sourced notebook, not a live indexer.

## What Base is to VINCE

The intended **market layer**: Coinbase-issued tokenized stocks, B20 standard, secondary-market DEX activity.

VINCE does not deploy the tokens. VINCE does not administer them.

MVP **price** is the Coinbase Chainlink total-return feed on Base ([ADR-003](../decisions/ADR-003-price-observation-model.md)). The approved DEX pool is listing/identity ([ADR-002](../decisions/ADR-002-approved-market.md)), not the price print.

## B20 facts VINCE must respect

- Extension of ERC-20; standard methods and events exist.
- Identify by **address**, not ticker. `name` and `symbol` are updatable.
- Discover new tokens via `B20Created` if VINCE ever auto-lists (it should not in MVP).
- Multiplier: 1 token is not permanently 1 share. Dividends currently increase multiplier rather than paying cash onchain.
- `scaledBalanceOf`, `toScaledBalance`, `toRawBalance` exist. Multiplier is WAD (`WAD_PRECISION()` = 1e18).
- Policies may block transfers. `approve` is not policy-gated; allowance ≠ transferability.
- Individual functions may be paused.
- Tokens are **native precompiles**, not ordinary deployed bytecode. Do not expect per-asset verified source on Basescan.
- Secondary-market holding/trading is described as permissionless; mint/redeem is AP-restricted.
- Jurisdictional restriction: Coinbase tokenized stocks are for eligible persons **outside the U.S.** Product copy must not imply otherwise.

## Token addresses (official table)

See [../protocol/market-registry.md](../protocol/market-registry.md). MVP candidate: **TSLAc** `0xb2000000000000000000001e800a7f5189430cD0`.

Onchain registry: `0x3f3E8cf41cdd3b1D118c16471aB0113DfDDd5CaD`.

## Two different prices

Official docs:

```text
Token Price = Underlying Equity Market Price × Multiplier
```

Chainlink Coinbase feeds:

- 8 decimals
- 24/5
- hold last close off-hours
- freeze during corporate actions
- **DEX price does not feed the oracle**
- read `latestRoundData()`; honor `updatedAt` staleness; never settle on a frozen feed

TSLA feed proxy (official): `0xFaf869185383a24F8cb00e27BdA6b63B9905DCb4`

DEX / aggregators:

- 24/7 secondary-market price of the B20 token
- This is the "TSLAc traded on Base" story

VINCE **picked Option C** ([ADR-003](../decisions/ADR-003-price-observation-model.md)): settlement price is the Chainlink total-return feed. Mixing that number with a DEX last-trade in protocol state is a bug. UI may show a DEX preview only if labeled Preview and it cannot settle.

## DEX venue — not yet sourced

Base agent docs mention Aerodrome as a leading DEX on Base, and Uniswap V2/V3/V4. That is **not** an official listing of the TSLAc/USDC pool VINCE will approve.

Phase 1 must:

1. Confirm Coinbase TSLA proxy `0xFaf869185383a24F8cb00e27BdA6b63B9905DCb4` and find the aggregator that actually emits the update
2. Record the feed-update event signature
3. Find current TSLAc liquidity venues from primary sources
4. Record pool address, factory, fee tier, token0/token1 (listing, not price)
5. Put the citation in this file

Until then:

```text
approvedPool = UNKNOWN
feedEmitter  = UNKNOWN  // proxy vs aggregator
feedEvent    = UNKNOWN
```

## What VINCE must not do on Base

- Modify B20 tokens
- Instruct users to mint/redeem as if VINCE were an AP
- Treat ticker `TSLAc` as a unique key
- Assume Chainlink 24/5 price equals overnight DEX price

## Related

Product `PASS` for TSLAc requires Base attestation ([ADR-005](../decisions/ADR-005-source-chain-feasibility.md)). If Base is not in `getSupportedChains()`, this integration cannot produce a market decision. A Sepolia harness is not a substitute.
