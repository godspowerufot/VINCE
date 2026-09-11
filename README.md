# VINCE

**Verified Interchain Network for Collateral Enforcement**

A cross-chain collateral and trading gate that uses verifiable source-chain tokenized-stock market activity to make deterministic financial decisions on Creditcoin, without trusting a centralized price-reporting API.

```text
Base market observation
        ↓
Attestcoin transaction proof
        ↓
VINCE decision engine
        ↓
Creditcoin settlement
```

This repository now has protocol contracts, an evidence worker, and a Next.js gate. The first engineering law is:

> **No financial action on Creditcoin may depend solely on an off-chain assertion about a source-chain market observation. The action must be derived from verifiable source-chain evidence and pass the protocol's explicit policy rules.**

## Status

| Layer | Status |
| --- | --- |
| Architecture and threat model | Drafted |
| Protocol ADRs | Accepted (ADR-001–011) |
| Attestcoin proof experiment | Done 2026-09-10 — see `docs/testing/phase2-experiment-log.md` |
| Smart contracts | Implemented in `contracts/` (Hardhat tests passing) |
| Frontend | Gate / vault / markets in `web/` |
| CC3 Testnet deploy | Not required for the lab. Policy lab deploys to Sepolia (ADR-012) |

## Read in this order

1. [AGENTS.md](./AGENTS.md) — engineering rules for humans and coding agents
2. [docs/00-PROBLEM.md](./docs/00-PROBLEM.md) — the trust problem
3. [ARCHITECTURE.md](./ARCHITECTURE.md) — four-layer system
4. [DECISIONS.md](./DECISIONS.md) — index of architecture decisions
5. [THREAT-MODEL.md](./THREAT-MODEL.md) — attacks and fail-closed posture
6. [docs/04-DEVELOPMENT-SEQUENCE.md](./docs/04-DEVELOPMENT-SEQUENCE.md) — what to build, and in what order
7. [docs/references/open-questions.md](./docs/references/open-questions.md) — unresolved feasibility items

The full documentation map is in [docs/README.md](./docs/README.md).

## Intended stack

Documented in [docs/application/frontend.md](./docs/application/frontend.md) and [docs/integration/creditcoin.md](./docs/integration/creditcoin.md). Not installed yet.

| Surface | Choice |
| --- | --- |
| Application | Next.js, TypeScript, Tailwind CSS |
| Typeface | Inter (body), Poppins (display) |
| Color | Black and blue |
| Contracts | Solidity, Hardhat |
| Settlement | Creditcoin (CC3 Testnet first) |
| Verification | Attestcoin SDK `@gluwa/usc-sdk` |
| Source market | Ethereum Chainlink `REFERENCE_FEED` (MVP). Base B20 later, after `getSupportedChains()`. |

## Core invariant

Attestcoin proves that a source-chain transaction was included in an attested block. VINCE decides whether that verified observation satisfies financial policy. Those are different jobs. Do not collapse them.

## Official sources

All protocol claims must be checked against:

- [Base tokenized stocks](https://docs.base.org/build-on-base/integrate-defi/list-tokenized-stocks)
- [Attestcoin Protocol](https://docs.attestcoin.org)
- [Attestcoin SDK](https://docs.attestcoin.org/attestcoin-protocol/dapp-builder-infrastructure/attestcoin-sdk-usc-sdk)
- [Creditcoin Hardhat](https://docs.creditcoin.org/smart-contract-guides/hardhat-smart-contract-development)
- [Creditcoin endpoints](https://docs.creditcoin.org/smart-contract-guides/creditcoin-endpoints)

See [docs/references/sources.md](./docs/references/sources.md).
