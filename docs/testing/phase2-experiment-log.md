# Phase 2 experiment log

Date: 2026-09-10  
Script: `experiments/phase2-proof/run.cjs`  
Pasted tx: `0x21cdceade3cf76d826ea4a36d68c8d3285478062abb445c951fe1c495863e2a0`

This is the VINCE ideology on a real hash: **paste → observe → attest → prove → verify → policy**.

## Observation (Ethereum)

| Field | Value |
| --- | --- |
| Chain | Ethereum Mainnet (`chainId` 1) |
| Block | 25948522 |
| Time | 2026-09-10T17:36:11.000Z |
| Status | success (`0x1`) |
| `tx.to` | `0x0C46Dc0BA85eAb5A515f819F1a705eD324dA687B` (forwarder) |
| Feed emitter | `0x1c9049C48C24111A3546a73C67FD2A4Fc6C86Fdc` |
| `description()` | **BAT / USD** |
| Decimals | 8 |
| Event | `AnswerUpdated` |
| `answer` | 7186539 → **$0.07186539** |
| Freshness | ~16 minutes (within 3600s) |

This is a Chainlink **feed-update** transaction. It is **not** Coinbase TSLAc and **not** TSLA/USD. The user copied it from a Chainlink URL; the aggregator describes itself as BAT/USD.

Explorer: https://etherscan.io/tx/0x21cdceade3cf76d826ea4a36d68c8d3285478062abb445c951fe1c495863e2a0

## Attestcoin / Creditcoin

CC3 Testnet RPC: `https://rpc.cc3-testnet.creditcoin.network`

`getSupportedChains()`:

| chainKey | chainId | chainName (decoded) |
| --- | --- | --- |
| 3 | 1 | Ethereum |
| 1 | 11155111 | Sepolia ethereum |

**Base is not listed.** Matches ADR-005.

Latest attestation on chainKey 3: height **25948560** (tx block 25948522 is below that → attested).

Working Proof Builder: **`https://prover.cc3-testnet.creditcoin.network`**  
(`getProof` returned `cached: true`)

The `proof-gen-api.cc3-testnet.creditcoin.network` URL was not needed; the SDK URL worked first.

## Proof + verification

| Step | Result |
| --- | --- |
| `waitUntilHeightAttested(3, 25948522)` | success |
| `getProof(tx)` | success, 9 Merkle siblings, 9 continuity roots |
| `PrecompileBlockProver.verifySingle` | **`true`** |

**Attestcoin works for this pasted Ethereum transaction.**

## Decision (VINCE policy, not Attestcoin)

MVP TSLA threshold is `250e8` ($250). That floor is **only for a TSLA listing**.

This tx is **BAT/USD**. Under [ADR-011](../decisions/ADR-011-multi-market-registry.md) it matches `eth-bat-usd` with floor `$0.05`. Observed `$0.07186539` ≥ `$0.05`.

```text
[Proof]      status=verified
[Market]     BAT/USD
[Decision]   PASS vs BAT floor   (would be REJECT_THRESHOLD vs a TSLA-only $250 rule)
```

Do not score every pasted feed as TSLA.

## What this proves

1. User-paste path is real.
2. Ethereum Mainnet is Attestcoin-supported on CC3 Testnet as `chainKey` 3.
3. Hosted `ProofBuilder` at `prover.cc3-testnet.creditcoin.network` generates inclusion proofs.
4. Creditcoin precompile `0x0FD2` verifies them.
5. Policy is a separate layer: verified ≠ PASS.

## What this does not prove

- Not TSLAc on Base
- Not TSLA/USD (this aggregator is BAT/USD)
- Not a vault borrow

To get a **PASS** under current MVP rules, paste a **TSLA/USD** (or other registered feed) update whose `answer >= 250e8` and is fresh. Verification of *this* hash already succeeded.

---

## Follow-up: pasted address `0x413e725094c7810669F91856cc58e73eA3fbc400`

This is **40 hex chars = an Ethereum address**, not a 32-byte tx hash. Do not send it to `getProof`.

| Field | Value |
| --- | --- |
| Ethereum bytecode | none (EOA) |
| Nonce | 45867 |
| Balance | ~6.62 ETH |
| Sepolia / Base / Creditcoin | empty |
| Typical `tx.to` | `0x585B3e95EEdd03AF221F724557D03384864Da3ca` (`AuthorizedForwarder`) |

VINCE does **not** match on `tx.from`. This wallet is a Chainlink transmitter. A recent outbound tx was proved instead:

| Field | Value |
| --- | --- |
| Tx | `0xd24a64c8aca36f2e18d828cdeab55d0763870b694ce48ee75f39f7b917c52bdc` |
| Block | 25948567 |
| `tx.from` | `0x413e7250…fbc400` (this address) |
| `tx.to` | AuthorizedForwarder above |
| Emitter | `0x1d37422e15ee379549B0B8E2a47523D3Ef5071a9` |
| `description()` | **SPCX-USD (24/5)** |
| Decimals | 8 |
| `answer` | 15185540000 → **$151.8554** |
| `verifySingle` | **true** |

`run.cjs` still scores every feed against the global TSLA `$250` floor, so it printed `REJECT_THRESHOLD`. Under [ADR-011](../decisions/ADR-011-multi-market-registry.md) the correct engine outcome for an **unlisted** SPCX aggregator is **`REJECT_FEED`**, not a TSLA-threshold reject. Do not treat this as Base `SPCXc`.

Replay:

```text
cd experiments/phase2-proof
node run.cjs 0xd24a64c8aca36f2e18d828cdeab55d0763870b694ce48ee75f39f7b917c52bdc
```

---

## Follow-up: pasted tx `0xffb77a3e4696e350bd308c1a546a256512404ecec8194fc14c41fca48c1dab36`

Valid 32-byte Ethereum tx. Same transmitter EOA as above. **Different emitter.**

| Field | Value |
| --- | --- |
| Chain | Ethereum Mainnet (`chainId` 1), `chainKey` 3 |
| Block | 25947558 |
| Time | 2026-09-10T14:22:35.000Z |
| Status | success (`0x1`) |
| `tx.from` | `0x413e725094c7810669F91856cc58e73eA3fbc400` |
| `tx.to` | `0x585B3e95EEdd03AF221F724557D03384864Da3ca` (AuthorizedForwarder) |
| Emitter | `0x2A539061d701471c3835256f8FF982e81E9B4374` |
| `description()` | **GOOGL-USD (24/5)** |
| Decimals | 8 |
| `answer` | 33037340000 → **$330.3734** |
| Age at check | ~13165s (~3.7h) vs `maxAgeSeconds=3600` |
| Proof Builder | `https://prover.cc3-testnet.creditcoin.network` (`cached: true`) |
| `verifySingle` | **true** |

Same `tx.from` as the SPCX update. Registry identity is the **aggregator**, so this is a different market.

`run.cjs` printed `REJECT_STALE` (and would have passed a global `$250` floor). Under ADR-011 the first protocol reason is **`REJECT_FEED`**: GOOGL is sourced, not listed. Stale would also fail if it were listed with `maxAgeSeconds=3600`. Not Base `GOOGLc`. Not TSLA.

Replay:

```text
cd experiments/phase2-proof
node run.cjs 0xffb77a3e4696e350bd308c1a546a256512404ecec8194fc14c41fca48c1dab36
```
