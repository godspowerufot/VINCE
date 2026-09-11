# Contract security model

On-chain controls that match [THREAT-MODEL.md](../../THREAT-MODEL.md).

## Invariants

1. No settlement function accepts an unchecked price.
2. No settlement function succeeds if precompile verification did not succeed in that flow (or on a still-valid on-chain observation).
3. Failed source receipts cannot PASS.
4. Unregistered assets and pools cannot PASS.
5. Unregistered callers cannot update the registry.
6. Unavailable verification cannot be replaced by admin `setPrice`.
7. Replay of the same source tx cannot duplicate value-extracting actions unless an ADR explicitly allows a freshness window.

## Controls by threat

| Threat | Contract control |
| --- | --- |
| Fake tx | Precompile verify |
| Wrong token | registry asset address |
| Wrong pool | registry pool address + log emitter check |
| Failed source tx | receipt status == 1 |
| Stale observation | maxAge vs observation timestamp |
| Double use | processedQueries / observation consumption |
| Compromised backend | no privileged prove-bypass |
| Registry capture | Ownable + events; later timelock |
| Decoder confusion | explicit event signature match |

## Admin surface

Keep it small:

- list / delist market
- pause market
- pause global (fail closed)
- transfer ownership

No:

- `setObservedPrice`
- `skipVerification`
- `trustBackend(address)`

## Pause

Pause is fail closed: gate and vault security-critical functions revert. View functions may still show last decision.

## Decoding risk

Wrong ABI against verified bytes can "PASS" a nonsense observation. Treat decoder tests as security tests. Prefer Attestcoin `EvmV1Decoder` over a homemade RLP parser unless an ADR says otherwise.

## External calls

Verifier → precompile is required.

Avoid arbitrary external calls from the vault during evaluation. Registry is internal VINCE state.

## Testing bar

See [../testing/adversarial-cases.md](../testing/adversarial-cases.md). Security-critical paths require tests before the feature is "done".
