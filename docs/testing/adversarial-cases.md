# Adversarial cases

Each case should become a test. If it cannot be tested, the rule is not real.

| ID | Attack | Expect |
| --- | --- | --- |
| A1 | Random bytes as txBytes | verification fail / revert |
| A2 | Valid proof of a tx that is not the registered feed | REJECT_FEED |
| A2b | Same `tx.from` transmitter, different aggregator (SPCX vs GOOGL) | match emitter only; unlisted → REJECT_FEED |
| A3 | Valid proof of a DEX swap offered as TSLAc price | REJECT_FEED / REJECT_DECODE |
| A4 | Included but reverted source tx | REJECT_STATUS |
| A5 | Old qualifying round outside maxAge | REJECT_STALE |
| A6 | Same source tx submitted twice for two borrows | second value action reverts |
| A7 | Worker-supplied price without matching decode | ignored; decode wins or revert |
| A8 | Registry update from non-owner | revert |
| A9 | Call vault.borrow with no observation | revert |
| A10 | Lookalike ticker, different address | REJECT_ASSET |
| A11 | Proof for chainKey that is not the registered source (e.g. Sepolia harness vs TSLAc market) | REJECT_SOURCE_CHAIN |
| A12 | Pause market, then submit good evidence | revert fail-closed |
| A14 | Frozen Chainlink feed used as if live | REJECT_FEED_FROZEN |

Phase 7 additions:

| ID | Attack | Expect |
| --- | --- | --- |
| A13 | Single-block pool manipulation meeting threshold | REJECT_LIQUIDITY or hybrid-band fail — not MVP |

Do not implement Phase 7 tests as if those rules already shipped.
