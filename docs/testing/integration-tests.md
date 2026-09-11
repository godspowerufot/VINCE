# Integration tests

## Phase 2 — proof experiment — DONE 2026-09-10

Log: [phase2-experiment-log.md](./phase2-experiment-log.md)

Pasted: `0x21cdceade3cf76d826ea4a36d68c8d3285478062abb445c951fe1c495863e2a0`

| Step | Result |
| --- | --- |
| `getSupportedChains()` | Ethereum key 3, Sepolia key 1. No Base |
| Load tx | Ethereum block 25948522, status 1, BAT/USD `AnswerUpdated` |
| `waitUntilHeightAttested` | success |
| `getProof` | success via `https://prover.cc3-testnet.creditcoin.network` |
| `verifySingle` | **true** |
| Policy vs $250 | REJECT_THRESHOLD |

Replay the script:

```text
cd experiments/phase2-proof
node run.cjs
```

A second fixture should be a **TSLA/USD** feed-update that PASSes the $250 rule, using the same verifier.

## Phase 3 — ASC on testnet

Submit this proof to `VinceVerifier` on CC3 Testnet. Assert `SourceTransactionVerified`. Assert replay reverts.

## Phase 5 — Gate E2E

UI paste field. Must include:

- this BAT tx → proof verified + REJECT_THRESHOLD
- a TSLA/USD tx ≥ $250 → PASS
- garbage hash → could not load transaction

## What is not an integration test

- Hardhat unit test that stubs `verifyAndEmit` to always return true **and** is named `e2e`
- UI test that mocks the API `decision: "PASS"`
