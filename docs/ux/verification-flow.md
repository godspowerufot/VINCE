# Verification flow UX

Map worker stages to human language. Keep the default view short. Put cryptography in Advanced.

Title of the page is **Verified Market Gate**, never a hardcoded ticker. The matched market (`description()` / registry display name) appears **after** decode ([ADR-011](../decisions/ADR-011-multi-market-registry.md)).

## Default

Subtitle: Ethereum source · Creditcoin decision

Primary control: paste source transaction hash.

After decode, two numbers: official feed and **that listing’s** required floor. Hide “Required” until a market is matched. Unlisted → “this market is not listed,” not a TSLA `$250` number.

Three checks, in order:

1. Verified on Ethereum (or Sepolia smoke — labeled Sepolia)
2. Cross-chain proof verified
3. Market condition satisfied

Show window remaining after PASS.

Button: **Verify transaction**, then **Continue to vault** only after PASS.

## Advanced panel

| Label | Value |
| --- | --- |
| Source chain | Ethereum + chainKey (CC3 Testnet: 3) |
| Pasted tx | hash, Ethereum explorer link |
| Feed | Chainlink proxy + aggregator addresses |
| Price model | Chainlink, 8 decimals |
| Block | number |
| Attestation | pending / verified |
| Proof | Merkle + continuity |
| Observed at | source `updatedAt` |
| Creditcoin tx | hash, Creditcoin explorer link |

## Waiting

Attestation can take minutes. Show stage + elapsed time. Do not fake progress bars that complete before the precompile returns.

## After PASS

Continue is enabled. Advanced remains available so a reviewer can audit the print.

## After REJECT

Proof row stays green if verification succeeded. Policy row names the reason (`REJECT_FEED`, `REJECT_STALE`, `REJECT_THRESHOLD`, …). See [error-states.md](./error-states.md) and [onboarding.md](./onboarding.md).
