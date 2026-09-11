# Metrics

Count stages, not vibes.

## Counters

| Metric | Meaning |
| --- | --- |
| `vince_observation_candidates` | txs considered |
| `vince_attestation_wait_seconds` | histogram |
| `vince_proof_generated` | success |
| `vince_proof_failed` | by error class |
| `vince_verification_success` | precompile true |
| `vince_verification_failed` | precompile false/revert |
| `vince_decision_pass` | |
| `vince_decision_reject` | by reason code |
| `vince_execution_success` | |
| `vince_execution_revert` | |

`decision_reject` and `proof_failed` must never share a counter.

## Gauges

| Metric | Meaning |
| --- | --- |
| `vince_supported_chains` | last `getSupportedChains` count |
| `vince_registry_markets` | listed markets |
| `vince_market_paused` | 1/0 per market |

## SLOs (later)

- Proof builder success rate
- Attestation wait p50/p95
- Distinct proof-fail vs policy-reject ratio (sanity: both should be non-zero in tests)
