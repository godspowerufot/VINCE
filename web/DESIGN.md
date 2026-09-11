# Design

Written from the shipped preview UI in `web/`, 2026-09-10.

## Visitor modes

| Surface | Mode |
| --- | --- |
| `/` | Persuade, restrained |
| `/gate` `/desk` `/markets` `/activity` | Operate |

## World

Near-black field, cool blue-gray neutrals, one blue accent. Poppins for titles, Inter for everything else. Quiet financial gate — not an oracle console.

Color strategy: Restrained. Neutrals do the work. Accent is ~10%: primary actions, verified marks, focus, selection.

## Tokens (OKLCH)

| Token | Value | Role |
| --- | --- | --- |
| `--color-bg` | `oklch(0.105 0.006 260)` | Page |
| `--color-surface` | `oklch(0.152 0.01 258)` | Fields |
| `--color-line` | `oklch(0.236 0.016 255)` | Hairlines |
| `--color-ink` | `oklch(0.97 0.006 250)` | Text |
| `--color-mute` | `oklch(0.78 0.02 250)` | Secondary (L ≥ 0.75 on dark) |
| `--color-accent` | `oklch(0.57 0.13 262)` | Action / verified |
| `--color-accent-deep` | `oklch(0.47 0.12 262)` | Hover |
| `--color-danger` | `oklch(0.72 0.1 25)` | Policy fail / invalid paste |
| `--color-on-accent` | `oklch(0.99 0.004 250)` | Label on primary button |

Hue held at ~260. Chroma kept mid so the blue is quieter than `#2F6FED`. Display-P3 may raise accent chroma to 0.16.

## Layout

Left rail (VINCE + nav), not a centered column. Work area is a two-pane split: intent on the left, result or teaching copy on the right. Radius 14px. No nested cards, no kickers, no Merkle on the default path.

## Motion

200ms color transitions on controls. Stage list has no entrance choreography. Elapsed time is the wait signal.

## States that must stay distinct

Proof verified and market condition are separate rows. A successful proof with `REJECT_FEED` is not “verification failed.”
