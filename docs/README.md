# VINCE documentation

Documentation maps the live protocol. Phase 2 proved a pasted Ethereum tx on Creditcoin. Settlement is Creditcoin Testnet ([ADR-014](./decisions/ADR-014-creditcoin-settlement.md)).

## How to read this

Start at the root, then come here for depth.

```text
README.md                 project in one page
AGENTS.md                 engineering laws
ARCHITECTURE.md           four layers + pipeline
DECISIONS.md              ADR index
THREAT-MODEL.md           attacks and fail-closed posture
docs/                     everything below
```

## Map

### Foundations

| File | Purpose |
| --- | --- |
| [00-PROBLEM.md](./00-PROBLEM.md) | Why a backend price is not good enough |
| [01-VISION.md](./01-VISION.md) | What VINCE is and is not |
| [02-SYSTEM-ARCHITECTURE.md](./02-SYSTEM-ARCHITECTURE.md) | Expanded architecture and diagrams |
| [03-ECOSYSTEM.md](./03-ECOSYSTEM.md) | Parties and responsibilities |
| [04-DEVELOPMENT-SEQUENCE.md](./04-DEVELOPMENT-SEQUENCE.md) | Phase 0 through Phase 8 |

### Decisions

| File | Status |
| --- | --- |
| [decisions/ADR-001-cross-chain-verification.md](./decisions/ADR-001-cross-chain-verification.md) | Accepted |
| [decisions/ADR-002-approved-market.md](./decisions/ADR-002-approved-market.md) | Accepted |
| [decisions/ADR-003-price-observation-model.md](./decisions/ADR-003-price-observation-model.md) | Accepted |
| [decisions/ADR-004-vault-decision-model.md](./decisions/ADR-004-vault-decision-model.md) | Accepted |
| [decisions/ADR-005-source-chain-feasibility.md](./decisions/ADR-005-source-chain-feasibility.md) | Accepted |
| [decisions/ADR-006-observation-event-model.md](./decisions/ADR-006-observation-event-model.md) | Accepted |
| [decisions/ADR-007-fail-closed.md](./decisions/ADR-007-fail-closed.md) | Accepted |
| [decisions/ADR-008-backend-not-source-of-truth.md](./decisions/ADR-008-backend-not-source-of-truth.md) | Accepted |
| [decisions/ADR-009-application-stack.md](./decisions/ADR-009-application-stack.md) | Accepted |
| [decisions/ADR-010-user-pastes-tx.md](./decisions/ADR-010-user-pastes-tx.md) | Accepted |
| [decisions/ADR-011-multi-market-registry.md](./decisions/ADR-011-multi-market-registry.md) | Accepted |
| [decisions/ADR-012-sepolia-policy-lab.md](./decisions/ADR-012-sepolia-policy-lab.md) | Superseded |
| [decisions/ADR-013-gate-is-the-product.md](./decisions/ADR-013-gate-is-the-product.md) | Accepted |
| [decisions/ADR-014-creditcoin-settlement.md](./decisions/ADR-014-creditcoin-settlement.md) | Accepted |

### Protocol

| File | Purpose |
| --- | --- |
| [protocol/verification.md](./protocol/verification.md) | Attestcoin proof path |
| [protocol/observation.md](./protocol/observation.md) | Raw source evidence |
| [protocol/decision-engine.md](./protocol/decision-engine.md) | Normalize → policy → decision |
| [protocol/collateral-vault.md](./protocol/collateral-vault.md) | Phase 6 vault, after the gate |
| [protocol/market-registry.md](./protocol/market-registry.md) | Approved assets, pools, rules |

### Contracts

| File | Purpose |
| --- | --- |
| [contracts/architecture.md](./contracts/architecture.md) | ASC + business-logic split |
| [contracts/interfaces.md](./contracts/interfaces.md) | Conceptual interfaces, not deployed code |
| [contracts/security-model.md](./contracts/security-model.md) | On-chain controls |

### Integration

| File | Purpose |
| --- | --- |
| [integration/base.md](./integration/base.md) | B20 tokenized stocks, DEX, addresses |
| [integration/attestcoin.md](./integration/attestcoin.md) | SDK, precompiles, proof flow |
| [integration/creditcoin.md](./integration/creditcoin.md) | Networks, Hardhat, endpoints |

### Application

| File | Purpose |
| --- | --- |
| [application/frontend.md](./application/frontend.md) | Next.js, TypeScript, Tailwind, color, type |
| [application/evidence-worker.md](./application/evidence-worker.md) | Off-chain proof preparation |

### Observability, UX, testing

| File | Purpose |
| --- | --- |
| [observability/logging.md](./observability/logging.md) | Stage-distinct logs |
| [observability/metrics.md](./observability/metrics.md) | What to count |
| [observability/tracing.md](./observability/tracing.md) | Cross-chain trace ids |
| [observability/alerts.md](./observability/alerts.md) | Fail-closed alerts |
| [ux/onboarding.md](./ux/onboarding.md) | First-visit clicks and where to get a tx |
| [ux/user-flows.md](./ux/user-flows.md) | Product flows |
| [ux/verification-flow.md](./ux/verification-flow.md) | Gate verification UX |
| [ux/error-states.md](./ux/error-states.md) | User-visible failures |
| [testing/test-strategy.md](./testing/test-strategy.md) | What must be tested |
| [testing/adversarial-cases.md](./testing/adversarial-cases.md) | Attacks as tests |
| [testing/integration-tests.md](./testing/integration-tests.md) | Phase 2 and later |

### References

| File | Purpose |
| --- | --- |
| [references/sources.md](./references/sources.md) | Official docs this architecture was read from |
| [references/open-questions.md](./references/open-questions.md) | Unresolved facts and design blanks |

## Alias names

Root-level planning often uses shorter names. They map here:

| Alias | File |
| --- | --- |
| PROBLEM | [00-PROBLEM.md](./00-PROBLEM.md) |
| PROTOCOL | [protocol/decision-engine.md](./protocol/decision-engine.md) plus [02-SYSTEM-ARCHITECTURE.md](./02-SYSTEM-ARCHITECTURE.md) |
| OBSERVABILITY | [observability/logging.md](./observability/logging.md) |
| USER-FLOW | [ux/user-flows.md](./ux/user-flows.md) |
| TEST-STRATEGY | [testing/test-strategy.md](./testing/test-strategy.md) |
