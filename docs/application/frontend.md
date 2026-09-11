# Frontend

Status: Gate, desk, and markets wired in `web/`. Worker at `POST /api/observe`. Settlement is Creditcoin Testnet (ADR-014). The product is the gate + desk (ADR-013).

## Stack

| Piece | Choice |
| --- | --- |
| Framework | Next.js (App Router) |
| Language | TypeScript, strict |
| Styling | Tailwind CSS |
| Body type | Inter |
| Display type | Poppins |
| Color | Black and blue |

## Visual system

The product should feel like a quiet financial gate. Not an oracle dashboard. Not a neon DeFi farm.

### Color tokens (target)

| Token | Role | Direction |
| --- | --- | --- |
| `--bg` | Page | Near-black `#07080A` |
| `--surface` | Cards | `#0E1116` |
| `--line` | Borders | `#1C2430` |
| `--text` | Primary text | `#F4F6F8` |
| `--muted` | Secondary text | `#9AA3B2` |
| `--blue` | Actions, verified marks | `#2F6FED` |
| `--blue-deep` | Hover / pressed | `#1F4FCC` |
| `--danger` | Reject / errors | keep restrained, not rainbow |

Use blue for primary actions and verified states. Use black/charcoal for structure. Do not introduce a third brand color without an ADR.

### Type

- **Poppins** medium/semibold for titles (`Verified Market Gate`, then the decoded market name)
- **Inter** for body, numbers, advanced details, buttons
- Tabular numerals for prices and thresholds

### Layout

Left rail for VINCE + nav. Right work area is two panes (intent | result). Content is left-aligned, not a centered column.

Default screen:

```text
Paste source tx          0x…

Matched market       BAT/USD  (Ethereum)

Official feed        $0.0719
Required             ≥ $0.05

✓ Verified on Ethereum
✓ Cross-chain proof verified
✓ Market condition satisfied
Window               29:12 remaining

              [ Submit on Creditcoin ]
              [ Open the desk ]
```

Advanced panel (collapsed):

```text
Verification Details
Source chain     Ethereum
chainKey         3 (CC3 Testnet)
Pasted tx        0x…
Feed             TSLA/USD  (sourced Chainlink proxy)
Block            …
Attestation      Verified
Proof            Merkle + continuity
Observed at      round updatedAt
Price model      Chainlink 8 decimals
Creditcoin tx    0x…
Window until     …
```

Never lead with Merkle trees.

## UX mapping to protocol states

| Protocol | UI |
| --- | --- |
| Empty paste | Paste a source transaction hash |
| Invalid hash / pending | Could not load transaction |
| Waiting attestation | Waiting for source block attestation… |
| `getProof` | Generating proof… |
| Precompile | Verifying on Creditcoin… |
| verified | Proof verified |
| PASS | Market condition satisfied |
| REJECT after verify | Proof verified · condition not met |
| proof fail | Could not verify source transaction |

That last distinction is mandatory. See [../ux/error-states.md](../ux/error-states.md).

## Data rules

- Display tickers, key by address.
- Truncate addresses; link to the correct explorer (Ethereum vs Creditcoin Testnet).
- Worker policy is labeled **Preview** until `VinceGate` emits an on-chain decision.
- Do not hide REJECT reasons.

## Routes (planned)

```text
/                       landing + three-step onboarding
/gate                   Verified Market Gate (paste-first)
/desk                   RWA desk — locked until PASS
/markets                listed feeds; owner listMarket
/activity               user's proofs and decisions
```

Click-by-click first session: [../ux/onboarding.md](../ux/onboarding.md).

## Wallet

Connect to Creditcoin Testnet for policy submit. Attestcoin proofs are prepared server-side, then `VinceGate` re-checks `0x0FD2` on-chain. Users need CTC.

## Accessibility

- Contrast on blue/black must pass
- Status is not color-only (use checkmarks and text)
- Motion is optional, short, no looping spinners without a stage label
