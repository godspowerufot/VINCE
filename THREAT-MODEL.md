# Threat Model

Status: Draft  
Related: [docs/contracts/security-model.md](./docs/contracts/security-model.md), [docs/testing/adversarial-cases.md](./docs/testing/adversarial-cases.md)

VINCE's value is that Creditcoin does not take a backend's word for a source-chain market fact. The threat model is written against that claim.

## Assets

| Asset | Why it matters |
| --- | --- |
| Gate decision | Incorrect `PASS` unlocks the desk |
| Desk action | `releaseFinancing` without a live PASS |
| Market registry | Wrong emitter becomes protocol truth |
| Observation freshness | Stale evidence can satisfy a condition that is no longer true |
| Proof verification path | Bypassing it collapses the whole design |

## Actors

| Actor | Capability | Trust |
| --- | --- | --- |
| User | Submits actions, may choose which tx to present | Untrusted |
| Attacker | Can transact on Ethereum, call VINCE contracts, lie to the API | Untrusted |
| Evidence worker / API | Finds txs, builds proofs, can omit or delay | Untrusted for truth; trusted only for liveness/UX |
| Tokenized-stock issuer | Controls B20 parameters, pauses, policies, multipliers | External; not VINCE-controlled |
| DEX | Provides the market VINCE observes | External; selected by registry |
| Attestcoin attestors | Attest source-chain blocks | External protocol trust |
| Creditcoin validators | Include VINCE txs and run the precompile | Settlement trust |

## Threats and defenses

### Fake transaction

**Attack:** Attacker gives the backend or UI a fabricated transaction or a tx from another chain.

**Defense:** Creditcoin Block Prover precompile verifies Merkle inclusion and continuity against an attestation. Backend-supplied bytes that are not on the attested source chain fail verification.

**Residual risk:** If VINCE skips the precompile, this defense disappears.

### Wrong token

**Attack:** Attacker submits a successful swap of a lookalike token, or a ticker collision.

**Defense:** Identify assets by address. Approved asset registry. B20 metadata is mutable; tickers are not identifiers.

**Residual risk:** Registry misconfiguration.

### Wrong pool

**Attack:** Attacker uses a thin or manipulated TSLAc/USDC pool whose price is easy to move.

**Defense:** MVP price is the Chainlink feed (ADR-003), not the pool. Approved pool is still required listing so a fake venue cannot become "the market". Liquidity policy is Phase 7.

**Residual risk:** Registry lists a nonsense pool; feed emitter mis-set to a fake aggregator.

### Failed or reverted source transaction

**Attack:** Attacker proves inclusion of a transaction that reverted, or that did not actually swap.

**Defense:** After precompile success, decode receipt status and require `0x1`. Then require the expected event from the approved contract.

**Residual risk:** Decoder bugs. Official Attestcoin docs warn that the precompile does not check success.

### Stale observation

**Attack:** Attacker proves a stale Chainlink round from a closed session or a frozen feed.

**Defense:** Freshness vs round `updatedAt`. `REJECT_FEED_FROZEN` / `REJECT_STALE`. Replay protection.

**Residual risk:** Choosing `maxAge` too large. Attestation delay itself ages the round.

### Price manipulation

**Attack:** Attacker temporarily moves the approved pool, emits a qualifying swap, then dumps.

**Defense for MVP:** Price is not taken from that swap. VINCE proves a Chainlink feed-update (ADR-003). Off-hours freeze fails closed.

**Later:** Option D (DEX within a band of the feed) / multiple rounds.

**Residual risk:** Chainlink is 24/5 traditional-market total return, not DEX 24/7. Weekend DEX prints cannot PASS. Feed admin/oracle risk is inherited from Chainlink/Coinbase, not from VINCE.

### Compromised backend

**Attack:** Worker or API reports `TSLAc = $250` without a real qualifying tx, or omits failing evidence.

**Defense:** Contracts never take a price argument as truth. They take proofs and encoded transaction bytes, verify them, decode, then evaluate policy. A lying backend can censor (liveness) but cannot forge a `PASS`.

**Residual risk:** Censorship and delayed proofs. Fail closed for security-critical actions.

### Attestcoin unavailable

**Attack or outage:** Proof builder down, attestors delayed, precompile unreachable.

**Decision:** Fail closed. Do not substitute Chainlink, a REST price, or an operator override on the settlement path.

**Residual risk:** Liveness. Users cannot pass the gate until verification recovers. That is accepted.

### Registry capture

**Attack:** Admin sets a malicious pool, a fake token address, or a broken threshold.

**Defense:** Treat registry updates as security-critical. Document admin, timelock, and review requirements before mainnet. Tests for unauthorized registry writes.

**Residual risk:** Admin key compromise. Not solved in MVP; must be explicit.

### Corporate-action / B20 semantics surprise

**Attack or mishandling:** Multiplier change, pause, policy block, or name/symbol update is ignored. VINCE treats 1 token as 1 share, or uses a frozen mental model of the asset.

**Defense:** Identify by address. Document multiplier, pause, and policy as market-risk inputs. Do not assume B20 token amount equals share count.

**Residual risk:** MVP may not fully model corporate actions. Must not pretend it does.

### UI deception

**Attack:** UI shows "verified" when only the API returned 200, or shows "condition satisfied" when only the proof verified.

**Defense:** UX copy maps onto protocol states. Advanced panel shows chain, tx, block, and verification status from on-chain events where possible.

## STRIDE snapshot

| Category | VINCE example | Primary control |
| --- | --- | --- |
| Spoofing | Fake Base tx | Precompile verification |
| Tampering | Altered proof bytes | Continuity digest cascade |
| Repudiation | Disputed PASS | On-chain `TransactionVerified` + VINCE decision event |
| Information disclosure | Proof details in UI | Acceptable; no secrets in proofs |
| Denial of service | Proof builder outage | Fail closed; retries in worker; no silent fallback |
| Elevation of privilege | Backend-authorized borrow | Contracts ignore backend assertions |

## Explicit non-goals for MVP

VINCE MVP does **not** claim:

- Manipulation-resistant oracle-grade TWAP
- Protection against issuer pause/policy/admin action
- That DEX price equals traditional equity price — MVP **does not use DEX price**
- That Attestcoin currently supports Base until Phase 2 says so
- Weekend/24/7 DEX settlement (feeds are 24/5)

Honesty about those limits is part of the security model.
