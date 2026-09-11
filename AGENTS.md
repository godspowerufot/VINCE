# VINCE Engineering Rules

These rules apply to every human and coding agent working in this repository.

VINCE is a protocol, not a dashboard. Prefer correctness, explicit assumptions, and fail-closed behavior over speed.

## Core law

No financial action may depend solely on an off-chain price. **Attestation** is Attestcoin on Creditcoin: worker `verifySingle` (view) then `VinceVerifier.verifyAndEmit` at `0x0FD2` (CTC). **Hackathon policy + desk** settle on Creditcoin Testnet ([ADR-014](./docs/decisions/ADR-014-creditcoin-settlement.md)). Sepolia does not host `0x0FD2`. Do not invent it there.

## Capability rules

1. Never invent protocol capabilities.
2. Verify Attestcoin capabilities against the official SDK and protocol documentation before writing contracts, workers, or UI copy that claims a proof can be generated.
3. Query `PrecompileChainInfoProvider.getSupportedChains()` before assuming a source chain is supported. Official environment docs currently list Ethereum Mainnet and Ethereum Sepolia, not Base.
4. Never treat an attestation as equivalent to economic truth. Inclusion proof ≠ price truth ≠ policy pass.
5. Do not claim Base is an Attestcoin-supported source chain until Phase 2 confirms it on-chain. **MVP source is Ethereum.** Never label an Ethereum or Sepolia proof as TSLAc/Base.
6. MVP price is a registered Chainlink feed-update (8 decimals) on an Attestcoin-supported chain. **Many markets**, not TSLA-only. Each listing has its own `minimumPrice`. User pastes the tx. Unlisted emitter → `REJECT_FEED`. Frozen or stale feeds fail closed.

## Architecture rules

7. Separate observation, verification, normalization, policy, decision, and execution. Do not bury policy inside the vault.
8. Never hardcode external contract addresses without documenting their source and date of verification.
9. Every protocol assumption must have an ADR in `docs/decisions/`. If you need a new assumption, open an ADR first.
10. Smart contracts must remain deterministic. No off-chain price fetches inside settlement logic.
11. Backend services may prepare evidence but must not become the source of truth.
12. Never bypass proof verification for convenience, tests that claim to be integration tests, or demo shortcuts that can leak into the protocol path.
13. Every external dependency must have a documented failure mode.
14. Security-critical decisions require tests before they are considered implemented.
15. Do not modify third-party tokenized-stock contracts or B20 precompiles.
16. Prefer explicit configuration over hidden assumptions.
17. Every financial condition must be represented as a testable rule.
18. Identify B20 tokens by address, not ticker. Metadata is mutable onchain.
19. After Attestcoin verification, always check source-transaction receipt status. The Block Prover precompile proves inclusion, not success. Status `0x1` is required.

## Observability rules

20. Observability must distinguish:
    - source observation
    - proof generation
    - proof verification
    - policy evaluation
    - execution
21. A failed proof and a verified-but-rejected decision are different events. Never collapse them into one error.

## Documentation rules

22. This repository is documentation-first until Phase 2 succeeds. Do not scaffold application or contract code unless the user explicitly asks for it.
23. If official docs and this repo disagree, stop and record the discrepancy in `docs/references/open-questions.md`.
24. Leave unresolved ADRs as `Proposed` or `Open`. Do not silently pick a design to make implementation easier.
25. Diagrams belong in markdown as Mermaid unless a later design phase requires another format.

## Application rules

26. Frontend stack is Next.js, TypeScript, and Tailwind CSS.
27. Visual system is black and blue, with Inter for body text and Poppins for display headings.
28. The default UI must not expose Merkle trees, continuity proofs, or precompile addresses. Put cryptographic detail in an advanced panel.
29. Copy must distinguish "proof verified" from "market condition satisfied". Never label a Sepolia harness as Base/TSLAc.

## Stack rules

30. Policy + desk settle on Creditcoin Testnet. `VinceVerifier` calls `0x0FD2` there. Do not invent `0x0FD2` on Sepolia.
31. Cross-chain proofs use `@gluwa/usc-sdk`. Do not write a custom prover unless an ADR authorizes `RawProofBuilder`.
32. Fail closed for security-critical actions when Attestcoin, the proof builder, or attestation is unavailable. Creditcoin Submit stays disabled unless `verifySingle` is true.
