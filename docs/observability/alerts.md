# Alerts

Fail closed means operators hear about liveness, not that the protocol starts trusting a backup price.

## Page (security / availability)

| Alert | Because |
| --- | --- |
| Proof builder error rate high | Gate is unusable; users may demand a bypass |
| Precompile verification always failing | Integration break or wrong chainKey |
| Registry changed | Security-critical |
| Pause flipped | Security-critical |
| Worker lag / crash loop | Censorship / liveness |

## Ticket (not page)

| Alert | Because |
| --- | --- |
| Attestation wait p95 high | Expected under load or source congestion |
| High REJECT_THRESHOLD rate | Market moved, or threshold mis-set |
| Supported-chains list changed | May be good or catastrophic; inspect ADR-005 |

## Never alert-handle by

- Switching the gate to Chainlink-only settlement
- Admin `PASS`
- Replaying a stale successful observation without freshness checks
