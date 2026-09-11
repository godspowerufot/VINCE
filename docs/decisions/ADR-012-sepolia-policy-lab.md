# ADR-012 — Sepolia policy lab; Attestcoin stays a Creditcoin view

Status: **Accepted**  
Date: 2026-09-10

Directed by the product owner: do not require Creditcoin gas, a CTC faucet, or Creditcoin wallets for the hackathon path. Attestation remains the important layer. Policy, vault, and borrow run on Ethereum Sepolia.

## Decision

| Layer | Where | What |
| --- | --- | --- |
| Source observation | Ethereum Mainnet (`chainKey` 3) | User pastes a feed-update. Unchanged (ADR-005, ADR-010). |
| Attestation | Attestcoin on Creditcoin | Worker: `waitUntilHeightAttested` → `getProof` → `verifySingle` at `0x0FD2`. **View call. No CTC.** |
| Policy + vault | **Ethereum Sepolia** (`11155111`) | Registry, 30-minute window, 50% LTV, mock vUSD. User wallet + Sepolia ETH faucet. |

Sepolia does **not** host Block Prover `0x0FD2` or EvmV1Decoder. Do not claim it does. Do not label a Sepolia tx as Attestcoin settlement or as TSLAc/Base.

UI copy:

```text
Attestcoin proof (Creditcoin view) · Sepolia policy
```

Submit on Sepolia is disabled unless `verifySingle === true` and Merkle root + continuity digest are present. That is fail-closed in the app. Sepolia cannot re-check the precompile.

## Why

Creditcoin Testnet CTC is Discord-gated. Sepolia ETH is faucetable. The product to prove is still: pasted tx → Merkle + continuity → proof ≠ PASS → listed-market policy → vault. Moving only the **policy lab** off Creditcoin unblocks that without inventing Attestcoin-on-Sepolia.

## On-chain Sepolia surface

`VincePolicy.submitAttestedFeedUpdate` takes the pasted source tx hash, `chainKey`, emitter, 8-decimal answer, `updatedAt`, Merkle root, and continuity lower digest. It runs the same registry rules (`REJECT_FEED`, `REJECT_STALE`, `REJECT_THRESHOLD`, …) and opens the vault window on PASS.

It does **not** call `0x0FD2`. A compromised UI could submit fake fields. Production Creditcoin ASC (`VinceVerifier` + `VinceGate`) remains in `contracts/` for later; it is not the lab path.

Sepolia lab seed may use `maxAgeSeconds = 7 days` so the measured BAT print can exercise PASS/vault. Production freshness stays 3600s (ADR-004).

## Rejected

| Option | Why not |
| --- | --- |
| Move `verifyAndEmit` to Sepolia | Precompile does not exist. Inventing it is forbidden. |
| Skip Attestcoin entirely | Attestation is the product. |
| Trust worker `setPrice` | Core law. Worker still must not be economic truth; UI requires `verifySingle` first. |

## Related

- [ADR-001](./ADR-001-cross-chain-verification.md)
- [ADR-004](./ADR-004-vault-decision-model.md)
- [ADR-005](./ADR-005-source-chain-feasibility.md)
- [ADR-008](./ADR-008-backend-not-source-of-truth.md)
