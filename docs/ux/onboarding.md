# Onboarding UX

Status: first-session UI shipped in `web/` as a preview (no protocol).

The first session must teach **one idea by doing it**, not by explaining Attestcoin.

> You point at a real Ethereum transaction. Creditcoin proves it was included. VINCE decides whether that **listed** market’s rule passed. Proof and PASS are different.

Wallet is not the first click. Paste is. Connect Creditcoin only when the user wants a 30-minute window / vault action ([ADR-010](../decisions/ADR-010-user-pastes-tx.md), [ADR-011](../decisions/ADR-011-multi-market-registry.md)).

## Routes and first clicks

```text
/            Landing — what this is, three steps, Open the gate
/gate        Paste hash. One primary button: Verify transaction
/vault       After PASS (or with a live window). Deposit / borrow vUSD
/activity    Past proofs and decisions (same two-verdict pattern)
```

Nav: **Gate** · **Vault** · **Activity**. Logo returns to `/`. No “Markets” admin screen in the default user nav.

## Screen 0 — Landing (`/`)

Quiet black page. Poppins title, Inter body. One blue button.

```text
VINCE
Verified Interchain Network for Collateral Enforcement

Paste a real Ethereum market print.
Creditcoin verifies it happened.
VINCE decides if that listed market’s rule passed.

        [ Open the gate ]

How it works
  1. Copy a Chainlink feed-update tx on Ethereum
  2. Paste it here. We prove inclusion on Creditcoin
  3. See two results: proof verified  ·  condition met or not

Listed now     BAT/USD
Coming         TSLA/USD (address still being sourced)
Not auto-added GOOGL, SPCX, or any unlisted feed
```

Do **not** lead with Merkle, `0x0FD2`, or chainKey. Do **not** say “Verified on Base.” MVP source is Ethereum.

Secondary link, not a button: **Where do I get a transaction?** → Screen 0b, or a drawer on `/gate`.

## Screen 0b — Where do I get a transaction?

This is the onboarding that usually fails. Spell the clicks.

```text
VINCE does not pick a print for you. You point at one.

1. Open a listed feed on Ethereum
   Example listed market: BAT/USD
   Chainlink Data Feeds → Ethereum → that pair
2. Open a recent update on the block explorer
3. Copy the transaction hash (64 hex characters after 0x)
4. Return here and paste it

Do not paste:
  · a wallet address (40 hex chars) — that is a transmitter, not a print
  · a Base TSLAc swap — Base is not an Attestcoin source yet
  · a Uniswap swap — VINCE prices Chainlink updates, not DEX fills
```

Optional later helper, labeled **Find an example tx** (not the settlement default). It may fill a known good listed-feed hash. Copy must say *example*, not *your market*.

## Screen 1 — Empty gate (`/gate`)

One column. One field. One button.

```text
Verified Market Gate

Paste an Ethereum feed-update transaction

[  0x…                                         ]

Listed markets this gate will score
  BAT/USD   ≥ $0.05
  TSLA/USD  ≥ $250   (when aggregator is sourced)

              [ Verify transaction ]

Where do I get a transaction?
```

Before paste: **Verify** is disabled. After a 66-char `0x` hash: enabled.

Title is **Verified Market Gate**, not a hardcoded TSLA heading. The market name appears **after decode**.

No wallet modal yet.

## Screen 2 — Working

Replace the button with a single stage line and elapsed time. Do not fake a bar that completes before Creditcoin returns.

```text
Validating source transaction…
Waiting for source block attestation…     0:42
Generating proof…
Verifying on Creditcoin…
```

If they pasted an address (`0x413e…`), stop here: **That looks like a wallet, not a transaction. Paste the 64-character hash of a feed-update.**

## Screen 3a — Two verdicts (always)

After verification, the page splits into two facts. Never collapse them.

```text
Matched market     BAT/USD          (from the feed, not from the title)

Official feed      $0.0719
Required           ≥ $0.05          (that listing’s floor)

✓ Verified on Ethereum
✓ Cross-chain proof verified
✓ Market condition satisfied

Window             29:12 remaining

              [ Continue to vault ]

[ Verification details ]            collapsed
```

**Continue** is enabled only on PASS.

## Screen 3b — Proof ok, policy no

Same layout. Second check fails. Continue stays disabled.

Unlisted GOOGL (measured Phase 2):

```text
Matched market     GOOGL-USD (24/5)

Official feed      $330.37
Required           —  this market is not listed

✓ Verified on Ethereum
✓ Cross-chain proof verified
✗ This market is not listed

VINCE proved the print. It did not open a window.
Listing a market is an owner action, not a side effect of paste.
```

Stale listed feed:

```text
✓ Cross-chain proof verified
✗ Observation is too old
```

Listed but under floor:

```text
✓ Cross-chain proof verified
✗ Market condition not met
Required  ≥ $0.05
Observed  $0.03
```

Never: “Verification failed” when the proof succeeded.

## Screen 4 — Vault (`/vault`)

Only after PASS, or if a live window already exists for this wallet.

```text
Connect Creditcoin Testnet          chain id 102031

Collateral     vUSD
Window         29:12  (from the gate)

Deposit
Borrow         up to 50% of collateral while the window is live
```

If they open `/vault` with no window: **No live market window. Paste a listed feed-update on the gate.** Link back to `/gate`. Do not run a silent proof.

## What each click is for

| Click | Teaches |
| --- | --- |
| Open the gate | The product is a paste, not a price ticker |
| Where do I get a transaction? | User chooses the print; VINCE does not hunt |
| Verify transaction | Inclusion proof is a wait, not an API quote |
| Two checkmarks | Proof ≠ PASS |
| Continue to vault | Settlement is a consumer of a 30-minute window |
| Verification details | Optional audit; Merkle lives here only |

## Copy that must never appear on the default path

- Merkle tree, continuity proof, precompile `0x0FD2`
- “Verified on Base” for an Ethereum or Sepolia proof
- “TSLA/USD” as the page title before decode
- “We added GOOGL to the registry”
- A single red banner that erases a successful proof

## First-session success

The user has onboarded when they can say:

1. I pasted a hash I copied from a feed-update.
2. VINCE showed me which market that print was.
3. Proof verified and condition met are different lines.
4. Only a listed market can open a window.

They do not need to know Attestcoin’s precompile address.
