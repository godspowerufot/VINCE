# ADR-009 — Application and contract stack

Status: **Accepted**  
Date: 2026-09-10

## Decision

| Surface | Stack |
| --- | --- |
| Web | Next.js, TypeScript, Tailwind CSS |
| Fonts | Inter for body, Poppins for display headings |
| Color | Black and blue |
| Contracts | Solidity and Hardhat |
| Proofs | `@gluwa/usc-sdk` (`ProofBuilder`, `PrecompileChainInfoProvider`, `PrecompileBlockProver`) |
| Settlement network | Creditcoin CC3 Testnet first, mainnet later |

## Why

- Next.js + TS + Tailwind is the requested application stack.
- Creditcoin's own smart-contract guide is Hardhat.
- Attestcoin's supported SDK is `@gluwa/usc-sdk` (still named USC in package names).
- A black/blue, Inter/Poppins UI keeps the product looking like a financial gate instead of an infrastructure explorer.

## Consequences

- No other frontend framework without superseding this ADR.
- No Foundry-first workflow unless an ADR replaces Hardhat. Foundry may be added later for extra tests, not as the deployment path.
- Visual tokens are defined in [../application/frontend.md](../application/frontend.md).
- Do not install these tools until the user asks to leave Phase 0 / start scaffolding.

## Sources

- https://docs.creditcoin.org/smart-contract-guides/hardhat-smart-contract-development
- https://docs.attestcoin.org/attestcoin-protocol/dapp-builder-infrastructure/attestcoin-sdk-usc-sdk
- https://www.npmjs.com/package/@gluwa/usc-sdk
