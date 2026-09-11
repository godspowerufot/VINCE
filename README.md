# VINCE

**Verified Interchain Network for Collateral Enforcement**

BUIDL CTC 2026 Fall · **RWA track** · Attestcoin Protocol is the core feature.

Creditcoin apps cannot trust a price API. VINCE lets a user **paste an Ethereum feed-update**. Attestcoin proves inclusion on Creditcoin (`verifySingle`, then on-chain `verifyAndEmit` at `0x0FD2`). VINCE decides whether that **listed** market’s rule passed. A Creditcoin **desk** may release financing only after `PASS`. Proof ≠ PASS.

```text
Ethereum feed-update     user pastes the hash
        ↓
Attestcoin               waitUntilHeightAttested → getProof → verifySingle
        ↓
VinceGate on Creditcoin  verifyAndEmit at 0x0FD2  (CTC)
        ↓
VinceEngine              listed emitter · floor · freshness
        ↓
VinceDesk                release financing only while PASS is live
```

MVP source is **Ethereum Mainnet** (CC3 Testnet `chainKey` 3). Base / TSLAc are **not** claimed. They wait until `getSupportedChains()` lists Base.

## Try it

```text
cd web && npm install && npm run dev
```

Connect the injected wallet to **Creditcoin Testnet** (CTC). Paste is first; wallet is only for submit / desk / owner list.

| Route | What it is |
| --- | --- |
| `/gate` | Paste tx · Attestcoin proofs · submit on Creditcoin |
| `/desk` | Locked until PASS · then release financing |
| `/markets` | VinceRegistry · RPC latest (unverified) vs attested |

Example print (measured Phase 2; **not auto-listed**):  
`0x21cdceade3cf76d826ea4a36d68c8d3285478062abb445c951fe1c495863e2a0`

Live registry **starts empty**. Unlisted emitter → `REJECT_FEED`. Owner lists a sourced aggregator on `/markets`. Paste never adds a row.

Worker: `POST /api/observe` — never rewrites the pasted hash. Submit stays disabled unless `verifySingle` is true.

## Attestcoin integration

Code: `web/src/lib/protocol/observe.ts` (`@gluwa/usc-sdk`). On-chain: `VinceVerifier` → `0x0FD2`.

| Step | Where |
| --- | --- |
| Supported chains | `PrecompileChainInfoProvider.getSupportedChains()` on CC3 Testnet |
| Attest | `waitUntilHeightAttested(chainKey, height)` |
| Prove | Hosted Proof Builder `https://prover.cc3-testnet.creditcoin.network` |
| Verify (view) | `PrecompileBlockProver.verifySingle` at `0x0FD2` (no CTC) |
| Verify (settlement) | `VinceGate.submitSourceTransaction` → `verifyAndEmit` (CTC) |
| Receipt | Source status `0x1` required (inclusion ≠ success) |

Measured 2026-09-10: `verifySingle === true` on the BAT hash above. Log: [`docs/testing/phase2-experiment-log.md`](./docs/testing/phase2-experiment-log.md).

Sepolia does **not** host `0x0FD2`. Do not call the old Sepolia lab from the app.

## Addresses

### Live now — Creditcoin Testnet (`102031`)

[ADR-014](./docs/decisions/ADR-014-creditcoin-settlement.md). Explorer: https://creditcoin-testnet.blockscout.com

| Piece | Address |
| --- | --- |
| RPC | `https://rpc.cc3-testnet.creditcoin.network` |
| Block Prover | `0x0000000000000000000000000000000000000FD2` |
| Chain info | `0x0000000000000000000000000000000000000FD3` |
| EvmV1Decoder | [`0x731c345d79Fb8BbDC541f9DF3b6317585F849F9f`](https://creditcoin-testnet.blockscout.com/address/0x731c345d79Fb8BbDC541f9DF3b6317585F849F9f) |
| VinceRegistry | [`0x8C4D6fDe62399ffAC59f94748aD7971d146D7C85`](https://creditcoin-testnet.blockscout.com/address/0x8C4D6fDe62399ffAC59f94748aD7971d146D7C85) |
| VinceVerifier | [`0xE40049B2907F5e3a64892cEB87E46D0bd04b6cE9`](https://creditcoin-testnet.blockscout.com/address/0xE40049B2907F5e3a64892cEB87E46D0bd04b6cE9) |
| VinceEngine | [`0x51Ce2eEb608067E3Ecff94BEcaB4B2449e66B7Fe`](https://creditcoin-testnet.blockscout.com/address/0x51Ce2eEb608067E3Ecff94BEcaB4B2449e66B7Fe) |
| VinceGate | [`0xe108bBF7Da6b2E6df81a3e4654F163590ea5121E`](https://creditcoin-testnet.blockscout.com/address/0xe108bBF7Da6b2E6df81a3e4654F163590ea5121E) |
| VinceDesk | [`0x6C0bfD0afFf3ACf3C4d395f22fb4cff16aC1620e`](https://creditcoin-testnet.blockscout.com/address/0x6C0bfD0afFf3ACf3C4d395f22fb4cff16aC1620e) |
| Deployer / registry owner | `0x10Ede187d03D651fc68f62a2d6501F67A6e93a86` |

File: [`contracts/deployments/creditcoin-testnet.json`](./contracts/deployments/creditcoin-testnet.json).

## Docs

1. [ARCHITECTURE.md](./ARCHITECTURE.md) — four layers as they run today  
2. [AGENTS.md](./AGENTS.md) — engineering laws  
3. [docs/00-PROBLEM.md](./docs/00-PROBLEM.md) — why a backend price is not enough  
4. [docs/testing/phase2-experiment-log.md](./docs/testing/phase2-experiment-log.md) — live Attestcoin proof  
5. [DECISIONS.md](./DECISIONS.md) — ADRs (ADR-014 Creditcoin settlement, ADR-013 gate + desk)

## Official sources

- [Attestcoin Protocol](https://docs.attestcoin.org)
- [Attestcoin SDK](https://docs.attestcoin.org/attestcoin-protocol/dapp-builder-infrastructure/attestcoin-sdk-usc-sdk)
- [Creditcoin endpoints](https://docs.creditcoin.org/smart-contract-guides/creditcoin-endpoints)
