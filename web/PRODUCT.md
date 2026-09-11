# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated from ADR-009: Next.js, TypeScript, Tailwind CSS. Inter for body, Poppins for display headings.

## Users

Primary: a person who needs a Creditcoin financial yes-or-no without trusting VINCE’s backend to report another chain’s market. They paste a source-chain transaction hash.

Secondary (later): protocols and companies that consume the same PASS/REJECT.

## Product Purpose

VINCE is a verified market gate. The user points at a real Ethereum Chainlink feed-update. Creditcoin proves inclusion (Attestcoin). VINCE decides whether that **listed** market’s rule passed. A 30-minute PASS window can then back a mock vUSD vault (50% LTV).

Success: the user can say they pasted a hash they chose, saw which market it was, and that proof and PASS are different lines.

## Positioning

Creditcoin does not act on an API price. Action is reconstructable from source tx bytes, an Attestcoin inclusion proof, and explicit policy. Proof is not PASS. Unlisted feeds are not auto-registered.

## Constraints

- UI-only in this pass: no Attestcoin SDK, no Creditcoin wallet, no worker. Results are labeled Preview.
- Do not invent protocol capabilities. MVP source is Ethereum, not Base.
- Identity is feed/aggregator address, not ticker. `tx.from` is not a registry key.
- Default UI must not lead with Merkle trees, continuity proofs, or precompile addresses.
- Black and blue. No third brand color.
- Owner lists markets. Paste does not write the registry.

## Terminology

| Term | Meaning |
| --- | --- |
| Proof verified | Inclusion on Creditcoin succeeded |
| Market condition satisfied | Listed emitter passed that row’s policy |
| REJECT_FEED | Emitter not listed |
| Window | 30 minutes after PASS |
| Preview | Synthetic / UI-only; not an on-chain decision |

## Inferred (labeled)

Inferred from repo ADRs and onboarding spec, 2026-09-10, because init interview was skipped in favor of an explicit build request.
