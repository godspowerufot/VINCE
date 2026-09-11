# Test strategy

Security-critical decisions require tests. Convenience features can wait.

## Layers

| Layer | Tooling (when coding starts) | Proves |
| --- | --- | --- |
| Contract unit | Hardhat | registry, pause, replay, policy math |
| Adversarial | Hardhat | wrong token/pool/status/stale |
| Decoder | Hardhat fixtures | event decode against real byte shapes |
| SDK integration | `@gluwa/usc-sdk` against testnet | Phase 2 proof experiment |
| Worker | unit + recorded HTTP | retries, idempotency, stage logs |
| UI | component tests | copy for PASS vs proof-fail |

## What "tested" means for VINCE

A feature is not done if it can `PASS` without:

- a mocked-or-real precompile success, and
- receipt status 1, and
- registry match, and
- freshness, and
- threshold rule

## Phase 2 experiment is a test

The first integration test is a written log:

```text
date
creditcoin rpc
proof builder url
supported chains dump
source tx
chainKey
block
verifySingle result
notes
```

Store it under `docs/testing/` when it exists. Do not delete failing logs.

## Out of scope until later

- Load tests of attestors
- Fuzzing the precompile (not VINCE's binary)
- Full mainnet fork of Base + Creditcoin together, unless tooling makes it cheap

## Related

- [adversarial-cases.md](./adversarial-cases.md)
- [integration-tests.md](./integration-tests.md)
