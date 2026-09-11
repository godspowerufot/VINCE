# Observation

Observation is raw source-chain information, before VINCE decides anything.

MVP model is closed: [ADR-003](../decisions/ADR-003-price-observation-model.md) Option C + [ADR-002](../decisions/ADR-002-approved-market.md) approved pool.

## Raw fields

```text
chain             source chain name
chainKey          Attestcoin identifier
chainId           EVM chain id, for display only
block             source block number
transaction       tx hash
contract          tx.to and/or log emitter
event             signature + decoded args
answer            Chainlink round answer (8 decimals)
updatedAt         round timestamp
timestamp         block timestamp
status            receipt status
```

## Observation principles

1. Prefer address identity over ticker.
2. MVP **price** logs come from the registered Chainlink feed/aggregator, not from an arbitrary pool.
3. The approved pool is still required registry identity. It is not the MVP price emitter.
4. Keep the original tx hash with the observation forever.
5. Do not mix Chainlink total-return values and DEX prints. Label them.
6. Do not apply the B20 multiplier a second time. Coinbase feeds are already total-return.

## Accepted observation class

| Role | Class | Notes |
| --- | --- | --- |
| Price | Chainlink round update | Official equity total-return feed; 24/5; prove the update tx |
| Market listing | Approved DEX pool | Required config; liquidity later |
| Not used for MVP price | DEX `Swap` / `Sync`, B20 `Transfer` | Manipulable or too generic |

Phase 1 still must source: aggregator vs proxy, exact event signature, TSLAc pool address.

## Normalization target

Once verified:

```text
asset            B20 address
market           approved pool (identity)
feed             Chainlink proxy / aggregator
observedPrice    int256 answer, 8 decimals, must be > 0
timestamp        round updatedAt (not Creditcoin now)
liquidity        not required for MVP price PASS
```

Normalization lives in the decision engine, not in the worker. The worker may compute a preview for UX, labeled Preview.

## Freeze and freshness

If `updatedAt` is stale, or the feed is paused/frozen, do not PASS. Codes: `REJECT_STALE`, `REJECT_FEED_FROZEN`.

## Related

- [ADR-003](../decisions/ADR-003-price-observation-model.md)
- [ADR-006](../decisions/ADR-006-observation-event-model.md)
- [../integration/base.md](../integration/base.md)
