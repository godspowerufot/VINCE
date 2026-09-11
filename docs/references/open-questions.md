# Open questions

## Closed by Phase 2 (2026-09-10)

Pasted tx `0x21cdceade3cf76d826ea4a36d68c8d3285478062abb445c951fe1c495863e2a0`  
Log: [../testing/phase2-experiment-log.md](../testing/phase2-experiment-log.md)

| Question | Result |
| --- | --- |
| `getSupportedChains()` on CC3 Testnet | Ethereum `chainKey` 3 / `chainId` 1; Sepolia `chainKey` 1 / `chainId` 11155111 |
| Is Base listed? | **No** |
| Which Proof Builder URL works? | **`https://prover.cc3-testnet.creditcoin.network`** |
| Can a pasted Ethereum tx be proven? | **Yes.** `verifySingle = true` |
| Was this tx TSLA/USD? | **No. `description()` = BAT / USD, $0.07186539** |
| Policy vs $250 TSLA floor | Would be REJECT_THRESHOLD **if** scored as TSLA |
| Policy vs BAT floor $0.05 | **PASS candidate** under ADR-011 (`eth-bat-usd`) |

Do not label this hash as TSLAc or Base. It is BAT/USD on Ethereum.

## Still open

1. Ethereum TSLA/USD proxy + aggregator (optional second listing). Not required for the BAT fixture to work.
2. More Ethereum USD feeds as extra registry rows (AAPL, ETH, …) — configuration, same pipeline.
3. Base B20 — later, only if `getSupportedChains()` lists Base.

## Honesty checks

Proof success scored against the **wrong market's** floor is a bug. BAT must not be judged as TSLA.
