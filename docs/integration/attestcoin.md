# Attestcoin integration

Sources listed at the bottom. Package names still say USC; the product name is Attestcoin.

## Role in VINCE

Attestcoin is the **verification layer**.

It does not decide financial policy.

## SDK

```text
npm package:  @gluwa/usc-sdk
peer:         ethers v6
repo:         https://github.com/gluwa/cc-next-query-builder
```

Components VINCE will use:

| Component | Job |
| --- | --- |
| `chainInfo.PrecompileChainInfoProvider` | `getSupportedChains()`, attestation data |
| `proofProvider.service.ProofBuilder` | `waitUntilHeightAttested`, `getProof`, `getBatchProof` |
| `blockProver.PrecompileBlockProver` | `verifySingle`, `verifyBatch` |

`RawProofBuilder` is an advanced alternative. Default is hosted `ProofBuilder`.

## Documented proof flow

```text
sourceProvider + creditcoinProvider
        ↓
getSupportedChains() → chainKey
        ↓
sourceProvider.getTransaction(txHash) → blockNumber
        ↓
ProofBuilder.waitUntilHeightAttested(chainKey, blockNumber)
        ↓
ProofBuilder.getProof(txHash)
        ↓
PrecompileBlockProver.verifySingle(
  chainKey, headerNumber, txBytes, merkleProof, continuityProof
)
```

`waitUntilHeightAttested` polls the proof builder (default 15s) and times out (default 15m).

Returned proof fields: `chainKey`, `headerNumber`, `txHash`, `txBytes`, `merkleProof`, `continuityProof`, `cached`.

## Environments (official tables)

### CC3 Mainnet

| Item | Value |
| --- | --- |
| ASC dashboard | https://dashboard.cc3-mainnet-usc.creditcoin.network/ |
| Proof Builder API | https://proofbuilder.cc3-mainnet-usc.creditcoin.network/ |
| Decoder | `0x9D094C9f22B10FCf842c2fC6A0981630A4F94B5C` |
| ChainInfo | `0x0000000000000000000000000000000000000fd3` |
| Block Prover | `0x0000000000000000000000000000000000000FD2` |
| Supported source | Ethereum Mainnet, chainkey 1 |

### CC3 Testnet

| Item | Value |
| --- | --- |
| ASC dashboard | https://dashboard.cc3-testnet.creditcoin.network/ |
| Proof builder API | https://proof-gen-api.cc3-testnet.creditcoin.network/ |
| Decoder | `0x731c345d79Fb8BbDC541f9DF3b6317585F849F9f` |
| ChainInfo | `0x0000000000000000000000000000000000000fd3` |
| Block Prover | `0x0000000000000000000000000000000000000FD2` |
| Supported sources | Ethereum Sepolia chainkey 1; Ethereum Mainnet chainkey 3 |

### URL discrepancy — resolved for CC3 Testnet (Phase 2)

Working Proof Builder (2026-09-10):

```text
https://prover.cc3-testnet.creditcoin.network
```

`getSupportedChains()` on CC3 Testnet returned Ethereum `chainKey` 3 (`chainId` 1) and Sepolia `chainKey` 1 (`chainId` 11155111). Base was absent.

Experiment: [../testing/phase2-experiment-log.md](../testing/phase2-experiment-log.md)

## Precompile caveat

The Block Prover does not validate transaction success. VINCE must check receipt status `0x1`.

Verification is synchronous, native-speed. Docs mention verification completing in one Creditcoin block (~15 seconds) **after** the source block is attested.

## Worker pattern

VINCE's evidence worker is Attestcoin's off-chain readability worker, specialized to approved markets.

Future paid relayers may submit queries. VINCE must still verify on-chain if that happens. Relayers do not become oracles.

## Capacity

Official: batch query verification up to 10 queries sharing a continuity proof.

## Sources

- https://docs.attestcoin.org
- https://docs.attestcoin.org/attestcoin-protocol/architecture
- https://docs.attestcoin.org/attestcoin-protocol/dapp-builder-infrastructure
- https://docs.attestcoin.org/attestcoin-protocol/dapp-builder-infrastructure/attestcoin-sdk-usc-sdk
- https://docs.attestcoin.org/attestcoin-protocol/attestcoin-protocol-chains-environments
- https://docs.attestcoin.org/attestcoin-protocol/dapp-builder-infrastructure/offchain-readability-workers
- https://www.npmjs.com/package/@gluwa/usc-sdk
