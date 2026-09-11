# Market registry

The registry is the protocol's list of allowed markets. VINCE is **not** TSLA-only ([ADR-011](../decisions/ADR-011-multi-market-registry.md)).

A pasted tx is valid for **whichever listed feed emitted `AnswerUpdated`**. Each row has its own threshold.

## What it stores

Per listed market:

```text
id
kind                  REFERENCE_FEED | B20_MARKET
sourceChainKey
sourceChainId
displayName           UI only (TSLA/USD, BAT/USD, TSLAc, …)
asset                 B20 token address, or 0x0 for REFERENCE_FEED
quote                 quote token / USD
pool                  approved DEX pool; 0x0 for REFERENCE_FEED
feed                  Chainlink proxy if known
feedAggregator        log emitter (what we match)
requiredEvent         AnswerUpdated (MVP)
minimumPrice          8-decimal, per market
maxAgeSeconds         policy vs round updatedAt
paused                bool
sourceNotes
```

## Rules

- Identify by **address**, never by ticker.
- Unlisted emitter → `REJECT_FEED`. Listed emitter → that row's `minimumPrice`.
- Changing `feed` / `feedAggregator` / `minimumPrice` is security-critical.
- A paused market must fail closed.

## Sourced Ethereum aggregators (Attestcoin chainKey 3)

These addresses are **candidates**. Live `VinceRegistry` starts empty. Deploy scripts do not seed rows. Until the owner calls `listMarket`, every emitter is `REJECT_FEED`.

| id (if listed) | Display | Emitter (aggregator) | suggested minimumPrice | Source |
| --- | --- | --- | --- | --- |
| `eth-bat-usd` | BAT/USD | `0x1c9049C48C24111A3546a73C67FD2A4Fc6C86Fdc` | `5e6` ($0.05) | Phase 2 `description()` |
| `eth-tsla-usd` | TSLA/USD | UNKNOWN — copy from Chainlink TSLA-USD 24/5 | `250e8` ($250) | [data.chain.link](https://data.chain.link/feeds/ethereum/mainnet/tsla-usd-kalman-24-5) |

Add more Ethereum USD feeds the same way: source the aggregator, set a market-specific floor, then list it.

Phase 2 pasted hash `0x21cdce…e2a0` matches **BAT/USD**, not TSLA.

**Match the log emitter, never `tx.from`.** Address `0x413e725094c7810669F91856cc58e73eA3fbc400` is an EOA transmitter (no bytecode). The same wallet's Forward txs hit **different** aggregators:

| Emitter | `description()` | Example tx | Status |
| --- | --- | --- | --- |
| `0x1d37422e15ee379549B0B8E2a47523D3Ef5071a9` | SPCX-USD (24/5) | `0xd24a64c8…2bdc` | sourced, **not listed** → `REJECT_FEED` |
| `0x2A539061d701471c3835256f8FF982e81E9B4374` | GOOGL-USD (24/5) | `0xffb77a3e…ab36` | sourced, **not listed** → `REJECT_FEED` |

Do not treat these as Base `SPCXc` / `GOOGLc`. Listing either requires a market-specific `minimumPrice`.

## Later: Base B20 (not MVP)

Only after Base appears in `getSupportedChains()`. Tokens are identified by address. Tickers below are display-only.

| Ticker (display) | Contract address | Source |
| --- | --- | --- |
| Onchain Registry | `0x3f3E8cf41cdd3b1D118c16471aB0113DfDDd5CaD` | Base tokenized stocks docs, 2026-09-10 |
| AAPLc | `0xb200000000000000000000C2e324d24d7eEcd1fb` | same |
| AMZNc | `0xb200000000000000000000d9192b6B456483C2E8` | same |
| COINc | `0xb200000000000000000000c85a31389D71F3ecfb` | same |
| CRCLc | `0xB20000000000000000000019f6E7C675b73C2e4D` | same |
| GOOGLc | `0xb2000000000000000000002D0BA3164cc74f58B7` | same |
| INTCc | `0xB2000000000000000000004AFF16039bA04bdFBc` | same |
| METAc | `0xb2000000000000000000008bC8786B856E61707C` | same |
| MSFTc | `0xB200000000000000000000Ab99cFa739E253872B` | same |
| MSTRc | `0xb2000000000000000000004884b426556b92883d` | same |
| NVDAc | `0xb20000000000000000000078ee7ce2fE4908108C` | same |
| SNDKc | `0xb200000000000000000000397293Cb8cda9a10c5` | same |
| SPCXc | `0xb2000000000000000000007b9fcbd005511aCBd5` | same |
| TSLAc | `0xb2000000000000000000001e800a7f5189430cD0` | same |

Base Coinbase equity feed proxies (not MVP emitters):

| Display | Feed proxy | Source |
| --- | --- | --- |
| Coinbase TSLA | `0xFaf869185383a24F8cb00e27BdA6b63B9905DCb4` | Base docs, 2026-09-10 |
| Coinbase AAPL | `0x787f13dEa48Db0897CbCDD985de77809D837F988` | same |
| Coinbase NVDA | `0x04689a41629776563E6822F76f2e57D148d28513` | same |
| Coinbase MSFT | `0xeB10A6c9aa7E537aEd766C08c35Dae35B321b18c` | same |

## Admin

- owner lists / delists / pauses
- tests: non-owner cannot mutate
- later: timelock

## Related

- [ADR-011](../decisions/ADR-011-multi-market-registry.md)
- [ADR-002](../decisions/ADR-002-approved-market.md)
- [../testing/phase2-experiment-log.md](../testing/phase2-experiment-log.md)
