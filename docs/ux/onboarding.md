# Onboarding UX

Status: first-session UI shipped in `web/`, wired to Creditcoin Testnet (ADR-014).

The first session must teach **one idea by doing it**, not by explaining Attestcoin.

> You point at a real Ethereum transaction. Creditcoin proves it was included. VINCE decides whether that **listed** market’s rule passed. Proof and PASS are different.

Wallet is not the first click. Paste is. Connect Creditcoin Testnet only to submit policy after `verifySingle` ([ADR-010](../decisions/ADR-010-user-pastes-tx.md), [ADR-014](../decisions/ADR-014-creditcoin-settlement.md)).

## Routes and first clicks

```text
/            Landing — what this is, Open the gate
/gate        Paste hash. Verify transaction. Receipt
/receipt     Shareable VINCE Receipt
/desk        Redirects to /gate (settlement removed)
/markets     VinceRegistry listings
/activity    Past proofs and decisions
```

Nav: **Gate** · **Receipt** · **Markets** · **Activity**.

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
  3. Take the receipt — inclusion · Merkle annex · policy. Not a trading license.

Listed now     (from VinceRegistry — empty until owner lists)
Coming         TSLA/USD (address still being sourced)
Not auto-added GOOGL, SPCX, BAT, or any unlisted feed
```

Do **not** lead with Merkle, `0x0FD2`, or chainKey. Do **not** say “Verified on Base.” MVP source is Ethereum.

Secondary link, not a button: **Where do I get a transaction?** → Screen 0b, or a drawer on `/gate`.

## Screen 0b — Where do I get a transaction?

This is the onboarding that usually fails. Spell the clicks.

```text
VINCE does not pick a print for you. You point at one.

1. Open an Ethereum Chainlink feed-update
   Only an owner-listed aggregator can PASS
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
  (rows from VinceRegistry, or empty)

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

## Screen 3a — Receipt (always)

After verification, the gate issues a VINCE Receipt. Two facts stay separate. Merkle is the annex, not the headline. The receipt is a record, not a trading license ([ADR-015](../decisions/ADR-015-attestation-receipt.md)).

```text
VINCE RECEIPT                         VNC-21CD-E2A0
BAT/USD

Observed print     $0.0719
Required           ≥ $0.05

✓ Inclusion verified
✓ PASS

Proof annex        Merkle root · siblings · continuity
              [ Copy share link ]
              [ Submit on Creditcoin ]
              [ Open standalone receipt ]
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

## Screen 4 — Markets (`/markets`)

Listed feeds from VinceRegistry. Two prices, labeled:

```text
(empty until owner lists)

When listed:
  DISPLAY    floor ≥ $X
  RPC latest $…   (Ethereum read — not attested)
  Attested   $…   (proven feed-update, if one was submitted)
```

RPC latest cannot PASS. Only a pasted, proven print can.

## What each click is for

| Click | Teaches |
| --- | --- |
| Open the gate | The product is a paste, not a price ticker |
| Where do I get a transaction? | User chooses the print; VINCE does not hunt |
| Verify transaction | Inclusion proof is a wait, not an API quote |
| Two checkmarks | Proof ≠ PASS |
| Copy share link | The receipt is the artifact; it is not a trading license |
| See listed markets | PASS is a policy result, not a borrow unlock |
| Proof annex | Merkle root and siblings live on the receipt, not the first line |

## Copy that must never appear on the default path

- Precompile `0x0FD2` as the first line (Merkle belongs on the receipt annex only)
- “Verified on Base” for an Ethereum or Sepolia proof
- “TSLA/USD” as the page title before decode
- “We added GOOGL to the registry”
- A single red banner that erases a successful proof

## First-session success

The user has onboarded when they can say:

1. I pasted a hash I copied from a feed-update.
2. VINCE showed me which market that print was.
3. Proof verified and condition met are different lines on a shareable receipt.
4. Only a listed market can open a window. The receipt is not a trading license.

They do not need to know Attestcoin’s precompile address.
