# ADR-014 — Live settlement is Creditcoin Testnet

Status: **Accepted**  
Date: 2026-09-11

Directed by the product owner: the deployer is funded with CTC. Stop using Ethereum Sepolia as the live policy chain. Deploy VINCE on Creditcoin Testnet.

Supersedes the **live path** in [ADR-012](./ADR-012-sepolia-policy-lab.md). Sepolia does not host `0x0FD2`. Do not move Attestcoin there.

## Decision

| Layer | Where | What |
| --- | --- | --- |
| Source observation | Ethereum Mainnet (`chainKey` 3) | User pastes a feed-update. Unchanged (ADR-005, ADR-010). |
| Attestation (view) | Attestcoin on Creditcoin | Worker: `waitUntilHeightAttested` → `getProof` → `verifySingle` at `0x0FD2`. Fail closed if false. |
| Attestation (settlement) | **Creditcoin Testnet** (`102031`) | `VinceVerifier` calls `verifyAndEmit` at `0x0FD2`. Costs CTC. Inclusion ≠ success; receipt `0x1` required. |
| Policy + desk | **Creditcoin Testnet** | `VinceRegistry`, `VinceEngine`, `VinceGate`, `VinceDesk`. Registry starts empty. Unlisted emitter → `REJECT_FEED`. |

UI copy:

```text
Ethereum source · Attestcoin proof · Creditcoin policy
```

Wallet connects to Creditcoin Testnet (CTC), not Sepolia. Submit is disabled unless `verifySingle === true` and Merkle + continuity proofs are present. On-chain submit still re-checks the precompile.

## Why

ADR-012 moved policy to Sepolia because CTC was unavailable. That constraint is gone. The production ASC (`VinceVerifier` + `VinceGate`) was always the intended settlement path. Sepolia `VincePolicy.submitAttestedFeedUpdate` cannot call `0x0FD2`; a hostile UI could submit fake fields. Creditcoin can re-check the proof.

## What does not change

- MVP source is Ethereum. Never label an Ethereum proof as TSLAc or Verified on Base.
- Proof ≠ PASS. Listed floor and freshness still decide.
- Paste does not list a market.
- Vault / mock vUSD stay lab-only (ADR-013). They may deploy; they are not the product.
- Sepolia lab contracts remain on-chain as history. The app does not call them.

## Rejected

| Option | Why not |
| --- | --- |
| Keep Sepolia policy, only deploy unused Creditcoin slots | Owner asked for Creditcoin, not Sepolia. |
| Skip `verifySingle` in the worker because on-chain will check | Fail closed before the wallet spends CTC. |
| Invent `0x0FD2` on Sepolia | Forbidden. |

## Related

- [ADR-001](./ADR-001-cross-chain-verification.md)
- [ADR-012](./ADR-012-sepolia-policy-lab.md) (superseded for live settlement)
- [ADR-013](./ADR-013-gate-is-the-product.md)
- [../integration/creditcoin.md](../integration/creditcoin.md)
