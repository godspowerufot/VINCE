# Collateral vault

The vault consumes a verified PASS window. It is not the protocol core. Core is pasted-tx attestation ([ADR-010](../decisions/ADR-010-user-pastes-tx.md)).

Parameters: [ADR-004](../decisions/ADR-004-vault-decision-model.md).

## Position in the system

```text
User pastes source tx → verify → PASS window (30 min)
User deposits vUSD
User requestBorrow
        ↓
in window? collateral * 50% : 0
```

## Responsibilities

| Vault does | Vault does not |
| --- | --- |
| Hold `vUSD` | Verify Merkle proofs |
| Track balances | Decode feed logs |
| Apply 50% LTV inside the window | Trust an API price |
| Revert when the window expired | Relabel Ethereum as TSLAc |

## Actions

```text
deposit(amount)
withdraw(amount)                 // reverts if it would break LTV
requestBorrow(amount)            // requires live PASS window
repay(amount)
refreshObservation(evidence)     // paste/prove a newer feed-update
```

Liquidation is not MVP.

## Formula

```text
WINDOW_SECONDS = 1800
LTV_BPS        = 5000
borrowLimit    = inWindow(PASS) ? collateral * 5000 / 10000 : 0
```

Example:

```text
Collateral:           1000 vUSD
Required:             TSLA/USD ≥ 250e8
Verified observation: 263.40e8
Decision:             PASS
Window:               30 minutes
Borrow limit:         500 vUSD
```

## Collateral asset

Mock ERC-20 `vUSD` on Creditcoin Testnet, 18 decimals.
