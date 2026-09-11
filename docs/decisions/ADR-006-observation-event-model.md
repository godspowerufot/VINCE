# ADR-006 — Observation event model

Status: **Accepted**  
Date: 2026-09-10  
Updated: 2026-09-10

## Decision

Do not modify third-party tokenized-stock contracts.

MVP **price** observation is an existing **Chainlink feed-update** event on the registered Coinbase equity feed ([ADR-003](./ADR-003-price-observation-model.md)).

The **approved DEX pool** ([ADR-002](./ADR-002-approved-market.md)) is listed in the registry. It is not the MVP price emitter.

No VINCE wrapper contract on Base unless a later ADR (ADR-010) exists.

## Why

Attestcoin's recommended dApp pattern is: deploy a minimal source-chain contract and emit a custom event. VINCE cannot do that to B20 tokens (issuer-controlled precompiles). Generic `Transfer` is a bad cross-chain trigger.

The official price path on Base is already a Chainlink V3 feed. Those updates are ordinary source-chain transactions. VINCE proves those, then decodes the round.

## Consequences

- Worker filters logs from the registered feed/aggregator, not from "any TSLAc transfer" and not from arbitrary pools.
- Decision engine checks log address against `feed` (or sourced aggregator), event signature, positive `answer`, and `updatedAt`.
- UI does not describe this as a DEX last-trade.

## Still to source

- Whether logs emit on the **proxy** (`0xFaf869185383a24F8cb00e27BdA6b63B9905DCb4` for Coinbase TSLA) or the underlying aggregator
- Exact event (`AnswerUpdated` or the live OCR event)
- How the Coinbase oracle registry pause flag is read in the same proven tx, or whether staleness of `updatedAt` is the MVP freeze detector

Do not hardcode an unsourced event signature.

## Wrapper contract

Left unbuilt. A VINCE helper that wraps a swap and emits `VinceMarketEvidence` would match Attestcoin guidance but is extra trust surface. Not MVP.
