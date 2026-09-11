# Contract interfaces

Conceptual interfaces for architecture review. Implementation lives in `contracts/`.

Field lists follow Attestcoin's documented `mintFromQuery` / `INativeQueryVerifier` shapes.

## INativeQueryVerifier (external)

Address `0x0FD2`. VINCE does not deploy this.

Documented functions:

- `verify(...)` — view, no event
- `verifyAndEmit(...)` — state-changing, emits `TransactionVerified`

Documented structs:

```text
MerkleProofEntry { bytes32 hash; bool isLeft; }
MerkleProof { bytes32 root; MerkleProofEntry[] siblings; }
ContinuityProof { bytes32 lowerEndpointDigest; bytes32[] roots; }
```

VINCE should call `verifyAndEmit` on the settlement path so verification is auditable.

## IVinceVerifier

```text
function submitSourceTransaction(
  uint64 chainKey,
  uint64 blockHeight,
  bytes encodedTransaction,
  bytes32 merkleRoot,
  MerkleProofEntry[] siblings,
  bytes32 lowerEndpointDigest,
  bytes32[] continuityRoots
) external returns (bytes32 observationId);
```

Must:

- call the precompile
- require success
- require receipt status `0x1`
- replay-protect
- emit `SourceTransactionVerified(observationId, chainKey, blockHeight, txKey)`

Must not compute a price.

## IVinceRegistry

```text
function getMarket(bytes32 marketId) view returns (MarketConfig);
function isApprovedAsset(address asset) view returns (bool);
function isApprovedPool(address pool) view returns (bool);
```

Writes are owner-gated. Every write emits an event with old and new values.

## IVinceEngine

```text
function evaluate(bytes32 observationId, bytes32 marketId)
  external
  returns (uint8 decision, bytes32[] reasons);
```

`decision`: `1 = PASS`, `2 = REJECT` (zero reserved).

## IVinceGate

```text
function verifyMarket(bytes32 marketId, evidence...) external returns (bool pass);
```

User-facing MVP. Returns or reverts; UI should also watch events.

## IVinceVault

Phase 6.

```text
function deposit(uint256 amount) external;
function requestBorrow(uint256 amount, bytes32 observationId) external;
```

`requestBorrow` reads engine output. It does not accept `uint256 price`.

## Events the UI should treat as truth

```text
SourceTransactionVerified
ObservationNormalized
DecisionEmitted          // PASS/REJECT + reasons
GateCompleted
VaultActionExecuted
RegistryUpdated
```

If the API disagrees with these events, the events win.
