# 04 — Development sequence

Do not start with Solidity. Do not start with the vault. Do not skip Phase 2.

```text
PHASE 0  Problem + threat model
    ↓
PHASE 1  Base tokenized-stock + DEX investigation
    ↓
PHASE 2  Attestcoin proof experiment          ← feasibility checkpoint
    ↓
PHASE 3  Creditcoin verification contract
    ↓
PHASE 4  Observation → Policy → Decision engine
    ↓
PHASE 5  Verified Market Gate
    ↓
PHASE 6  Collateral Vault
    ↓
PHASE 7  Security + manipulation resistance
    ↓
PHASE 8  Production UX + observability
```

## Phase 0 — Problem and threat model

**Goal:** Shared language.

**Done when:**

- Root docs exist and the core law is written
- Threat model names fake tx, wrong pool, stale observation, compromised backend, and fail-closed
- Open questions are listed instead of guessed
- ADR-002, ADR-003, ADR-005, ADR-006 accepted as models (instances still sourced)

**Phase 3–6 implemented in-repo (2026-09-10).** Local Hardhat tests cover registry, verifier/engine, and vault. CC3 Testnet deploy is gated on a funded `CREDITCOIN_PRIVATE_KEY`.

## Phase 1 — Source-market investigation

**Goal:** Know the Ethereum objects the pasted tx must match.

**Work:**

- Confirm `getSupportedChains()` later in Phase 2; here source the **Ethereum TSLA/USD** Chainlink proxy from [data.chain.link](https://data.chain.link/feeds/ethereum/mainnet/tsla-usd-kalman-24-5)
- Source aggregator vs proxy and the update event
- Optional: Sepolia smoke feed (ETH/USD testnet)
- Keep Base TSLAc addresses as **later market notes only**
- Do not treat ticker `TSLAc` as the MVP asset

**Done when:** [integration/attestcoin.md](./integration/attestcoin.md) / a Phase 1 note lists the Ethereum feed addresses with citations.

## Phase 2 — Attestcoin proof experiment (core)

**Goal:** One **pasted** source-chain tx is proven on Creditcoin. This is the application.

**Work:**

- `getSupportedChains()` on CC3 Testnet
- Confirm Ethereum Mainnet `chainKey` 3 and Sepolia `chainKey` 1
- Pick a real feed-update tx (or any successful tx for the first smoke)
- Paste that hash through `waitUntilHeightAttested` → `getProof` → `verifySingle`
- Record proof-builder URL, chainKey, result
- Base appearing is a bonus note, not a blocker

**Done when:** experiment log shows `SUCCESS` for a known pasted hash.

**Done 2026-09-10.** Log: [testing/phase2-experiment-log.md](./testing/phase2-experiment-log.md). `verifySingle = true` on the pasted BAT/USD tx. Policy correctly `REJECT_THRESHOLD` vs $250.

If a later paste fails, fix Attestcoin integration before changing vault math.

## Phase 3 — Creditcoin verification contract

**Goal:** An ASC on Creditcoin that verifies proofs on-chain, checks success status, and records the verified tx key.

**Done when:** a Hardhat-deployed contract on CC3 Testnet emits a verification event for the Phase 2 transaction, with replay protection.

Local tests: `cd contracts && npm test`. Live deploy: `npm run deploy:testnet`.

## Phase 4 — Decision engine

**Goal:** Normalize verified bytes into a `MarketObservation` and evaluate explicit policy rules.

**Done when:** the same **pasted** verified tx can `PASS` or `REJECT` at 250e8 / 3600s freshness without changing the verifier.

## Phase 5 — Verified Market Gate

**Goal:** User-facing MVP: paste tx, see proof vs policy.

**Done when:** Next.js can paste a hash, wait, verify, and distinguish proof failure from `REJECT_FEED` / `REJECT_THRESHOLD`. Copy says Ethereum (or Sepolia smoke), never Base for those proofs.

## Phase 6 — Collateral vault

**Goal:** Consume the 30-minute PASS window. 50% LTV on vUSD.

**Done when:** `borrowLimit = collateral * 50%` inside the window, 0 after expiry or REJECT, no verification code inside the vault.

## Phase 7 — Manipulation resistance

**Goal:** Strengthen economic validity.

Candidates, each requiring an ADR:

- minimum liquidity
- TWAP / multiple observations
- batch proofs (`MAX_BATCH_SIZE` 10, `MAX_BATCH_RANGE` 1000 blocks per SDK)
- pause / multiplier-aware rules

## Phase 8 — Production UX and observability

**Goal:** Stage-distinct logs, metrics, traces, alerts, and a UI that still hides cryptography by default.

## What "do not rush" means here

- Do not scaffold the app during Phase 0 unless explicitly requested.
- Do not close ADR-003 or ADR-005 with guesses.
- Do not copy DEX or token addresses from blogs. Use official docs, then verify onchain.
- Do not build vault math before one proof verifies.
