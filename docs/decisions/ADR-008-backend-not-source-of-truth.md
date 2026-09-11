# ADR-008 — Backend is not the source of truth

Status: **Accepted**  
Date: 2026-09-10

## Decision

Backend services and the Next.js app may prepare evidence. They must not become the source of truth.

## Why

Attestcoin documents an off-chain readability worker as the intended UX: users should not wait, generate proofs, and pack precompile arguments by hand.

VINCE will have such a worker. That worker is **liveness and convenience**, not authority.

A compromised backend can:

- delay proofs
- refuse to submit
- select a convenient but still real transaction

It cannot:

- make the precompile accept a fake tx
- make the decision engine ignore registry rules, if those rules are on-chain

## Consequences

- Contract functions that move value take proof bytes (or a verified observation id produced on-chain), never `uint256 price`.
- APIs may return decoded previews, clearly marked.
- Tests that stub the precompile are unit tests. They are not integration proof.
- Admin `setPrice` does not exist.

## Worker duties that remain mandatory

From Attestcoin off-chain worker guidance:

- persist in-progress events across restarts
- catch up after downtime
- avoid duplicate ASC submissions (contract also has replay protection)
- retry proof generation and ASC calls
- follow multiple RPCs if possible
