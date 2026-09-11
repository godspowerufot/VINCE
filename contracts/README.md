# VINCE contracts

Creditcoin settlement: registry, Attestcoin verifier, policy engine, gate, vault, mock vUSD.

## Layout

| Contract | Job |
| --- | --- |
| `VinceRegistry` | Owner `listMarket` / `unlistMarket` / `pauseMarket`. Match `feedAggregator`. |
| `VinceVerifier` | Call Block Prover `0x0FD2` `verifyAndEmit`, require receipt `0x1`, replay key. No price. |
| `VinceEngine` | Decode `AnswerUpdated`, registry policy, 30-minute PASS window. |
| `VinceGate` | User-facing submit of Merkle + continuity proofs. |
| `VinceVault` | 50% LTV on vUSD while `engine.inWindow()`. No proofs. |
| `MockVUSD` | 18-decimal faucet token. |

MVP seed listing: BAT/USD aggregator `0x1c9049C48C24111A3546a73C67FD2A4Fc6C86Fdc`, floor `$0.05` (`5e6`). TSLA/USD aggregator is still unsourced — do not invent it. Use `listMarket` when you have a cited aggregator.

## Test

```bash
cd contracts
npm install
npm test
```

Local Hardhat cannot call real `0x0FD2`. Tests use `MockVerifier` + `MockDecoder`.

## Deploy CC3 Testnet

Do not put a key in the repo.

```bash
npx hardhat vars set CREDITCOIN_PRIVATE_KEY
# or export CREDITCOIN_PRIVATE_KEY=0x…
npm run deploy:testnet
```

On Hardhat/localhost the script deploys mocks. On `creditcoin_testnet` it uses prover `0x0FD2` and decoder `0x731c345d79Fb8BbDC541f9DF3b6317585F849F9f`.

## List another Ethereum feed

```bash
export VINCE_REGISTRY_ADDRESS=0x…
export ID=eth-googl-usd
export AGGREGATOR=0x…   # sourced aggregator, not a ticker
export FLOOR=25000000000  # 8 decimals
export NAME="GOOGL/USD"
npm run list-market
```

Pasting a proof never lists a market (ADR-011).
