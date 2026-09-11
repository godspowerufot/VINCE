# ADR-005 — Source chain feasibility

Status: **Accepted**  
Date: 2026-09-10  
Updated: 2026-09-10 (MVP source = Ethereum)

Supersedes the earlier "TSLAc PASS requires Base" product rule for MVP. Base remains the intended later market, not the MVP source.

## The question

Should VINCE's **MVP** use Base tokenized stocks, or an event on an Attestcoin-supported chain (Ethereum)?

Attestcoin's published environment tables do **not** list Base. They do list Ethereum.

## Documented Attestcoin source chains

From [Attestcoin Protocol Chains — Environments](https://docs.attestcoin.org/attestcoin-protocol/attestcoin-protocol-chains-environments):

**CC3 Mainnet**

| Chain | Chainkey | Genesis |
| --- | --- | --- |
| Ethereum Mainnet | 1 | 0 |

**CC3 Testnet**

| Chain | Chainkey | Genesis |
| --- | --- | --- |
| Ethereum Sepolia | 1 | 0 |
| Ethereum Mainnet | 3 | 0 |

`chainKey` is not EVM `chainId`. Base `8453` must never be sent as a `chainKey`.

## Decision

**MVP source chain is Ethereum, because proving Attestcoin verification is the core of the application.**

| Track | Chain | Role |
| --- | --- | --- |
| **MVP market** | Ethereum Mainnet as source (`chainKey` 3 on CC3 Testnet, `chainKey` 1 on CC3 Mainnet) | User pastes a real Ethereum tx. VINCE proves it. Policy runs. Gate/vault may PASS. |
| **MVP smoke** | Ethereum Sepolia (`chainKey` 1 on CC3 Testnet) | Cheap test txs if mainnet attestation is slow. Same contracts, different registry market. |
| **Later market** | Base B20 TSLAc | Only after `getSupportedChains()` lists Base. Never faked. |

UI and events must name the chain that was actually proven:

```text
✓ Verified on Ethereum
```

Never:

```text
✓ Verified on Base
```

for an Ethereum proof. Coinbase `TSLAc` is a Base B20 token. An Ethereum Chainlink TSLA/USD round is **not** TSLAc.

## Why not Base for MVP

The core demo is:

```text
user pastes tx
        ↓
wait for attestation
        ↓
Merkle + continuity proof
        ↓
Creditcoin precompile
        ↓
PASS / REJECT
```

That path is documented for Ethereum. It is not documented for Base. Building the vault on an unproven Base `chainKey` would make attestation theater.

## Why not call Ethereum TSLAc

B20 TSLAc (`0xb2000000000000000000001e800a7f5189430cD0`) lives on Base. Relabeling an Ethereum feed-update as TSLAc is a fake market. Forbidden.

MVP display name: **TSLA/USD reference feed (Ethereum)** or a Sepolia smoke-market name. Production name **TSLAc** is reserved for Base.

## Still required

```text
On CC3 Testnet:
  supported = PrecompileChainInfoProvider.getSupportedChains()
  confirm Sepolia chainKey=1 and Ethereum Mainnet chainKey=3
  record whether Base appears (research only; does not unblock MVP)
```

| Result | Action |
| --- | --- |
| Ethereum present | MVP market path — **confirmed 2026-09-10, chainKey 3** |
| Sepolia present | MVP smoke path — **confirmed, chainKey 1** |
| Base present | Open a new ADR to add a Base TSLAc market **in addition** |
| Ethereum absent | Fail closed; do not guess chainKeys |

## Consequences

- Registry `sourceChainKey` for the MVP market is Ethereum's documented key, confirmed by `getSupportedChains()`.
- Worker/UI primary input is a **pasted tx hash** ([ADR-010](./ADR-010-user-pastes-tx.md)).
- Option C still applies: prove a Chainlink **feed-update** on that chain ([ADR-003](./ADR-003-price-observation-model.md)).
- Base pool/token addresses stay in docs as the later market, not as MVP emitters.

## Sources

- https://docs.attestcoin.org/attestcoin-protocol/attestcoin-protocol-chains-environments
- https://docs.attestcoin.org/attestcoin-protocol/dapp-builder-infrastructure/attestcoin-sdk-usc-sdk
- https://docs.base.org/build-on-base/integrate-defi/list-tokenized-stocks
