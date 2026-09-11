# Decisions

This is the index of Architecture Decision Records. Every important assumption belongs here.

Status vocabulary:

| Status | Meaning |
| --- | --- |
| Accepted | Binding for this repository |
| Proposed | Recommended, not yet closed |
| Open | Must be reasoned through before implementation |
| Rejected | Considered and declined |
| Superseded | Replaced by a later ADR |

## Index

| ID | Title | Status |
| --- | --- | --- |
| [ADR-001](./docs/decisions/ADR-001-cross-chain-verification.md) | Attestcoin verifies inclusion; VINCE verifies policy | Accepted |
| [ADR-002](./docs/decisions/ADR-002-approved-market.md) | Approved DEX pool rather than arbitrary markets | Accepted |
| [ADR-003](./docs/decisions/ADR-003-price-observation-model.md) | Chainlink feed-update is price; MVP feed on Ethereum | Accepted |
| [ADR-004](./docs/decisions/ADR-004-vault-decision-model.md) | Gate first; 30m PASS window; 50% LTV; vUSD | Accepted |
| [ADR-005](./docs/decisions/ADR-005-source-chain-feasibility.md) | MVP source = Ethereum; Base later; never fake Base | Accepted |
| [ADR-006](./docs/decisions/ADR-006-observation-event-model.md) | Prove Chainlink feed-update events; do not modify B20 | Accepted |
| [ADR-007](./docs/decisions/ADR-007-fail-closed.md) | Unavailable verification fails closed | Accepted |
| [ADR-008](./docs/decisions/ADR-008-backend-not-source-of-truth.md) | Workers prepare evidence; contracts decide | Accepted |
| [ADR-009](./docs/decisions/ADR-009-application-stack.md) | Next.js, TypeScript, Tailwind, Hardhat, Solidity | Accepted |
| [ADR-010](./docs/decisions/ADR-010-user-pastes-tx.md) | User pastes source tx; protocol validates | Accepted |
| [ADR-012](./docs/decisions/ADR-012-sepolia-policy-lab.md) | Sepolia policy lab; Attestcoin stays Creditcoin view | Accepted |

## How to add a decision

1. Copy the structure of an existing ADR.
2. State the decision, why, consequences, and status.
3. Link it from this file.
4. Do not encode an undocument assumption in contracts or UI.

## Instances that stay blank until sourced

The **models** above are closed. Remaining instances:

- Ethereum **TSLA/USD** proxy + aggregator + a qualifying `AnswerUpdated` tx (Phase 2 used BAT/USD)
- Optional Sepolia smoke feed

Confirmed 2026-09-10:

- Proof Builder: `https://prover.cc3-testnet.creditcoin.network`
- Ethereum `chainKey` 3 on CC3 Testnet
- Pasted tx verified: see [docs/testing/phase2-experiment-log.md](./docs/testing/phase2-experiment-log.md)
