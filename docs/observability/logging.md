# Logging

VINCE logs are useless if they collapse five stages into one error.

## Required stages

Every security-critical request carries `traceId` and emits these stages when they occur:

```text
[Observation]
[Proof]
[Creditcoin]
[Decision]
[Execution]
```

## Example — success

```text
[Observation] chain=base asset=TSLAc pool=0x… block=… tx=0x…
[Proof]       status=generated proofType=transaction-inclusion
[Creditcoin]  verification=success precompile=0x0FD2
[Decision]    price=… threshold=… liquidity=… freshness=… decision=PASS
[Execution]   action=gateContinue status=SUCCESS
```

## Example — verified but rejected

```text
[Observation] chain=base asset=TSLAc pool=0x… block=… tx=0x…
[Proof]       status=generated proofType=transaction-inclusion
[Creditcoin]  verification=success
[Decision]    price=241.00 threshold=250 decision=REJECT reasons=REJECT_THRESHOLD
[Execution]   action=gateContinue status=REVERTED
```

This is not a proof failure.

## Example — proof generation failed

```text
[Observation] chain=base asset=TSLAc tx=0x…
[Proof]       status=failed error=builder_unavailable
```

Stop. Do not emit a Decision stage with a fake price.

## Field conventions

| Field | Rule |
| --- | --- |
| `asset` | address, ticker optional extra |
| `pool` | address |
| `tx` | 0x hash |
| `chainKey` | Attestcoin key, number |
| `chainId` | EVM id, labeled separately |
| `decision` | PASS or REJECT |
| `reasons` | stable codes |

No PII. No private keys. Proof bytes may be hashed in logs (`keccak256(txBytes)`), not dumped in full at info level.
