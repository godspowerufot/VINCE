# VINCE web

Next.js gate: paste an Ethereum feed-update, generate Merkle + continuity proofs, submit to Creditcoin, then use the vault.

```text
cd web
npm run dev
```

| Route | Screen |
| --- | --- |
| `/` | Landing |
| `/gate` | Paste a tx · Attestcoin proofs · policy |
| `/vault` | vUSD faucet, deposit, 50% LTV borrow |
| `/markets` | Listed feeds · owner `listMarket` |
| `/activity` | Measured Phase 2 prints |

Worker: `POST /api/observe` (never rewrites the pasted hash).

Contracts must be deployed to Ethereum Sepolia (`11155111`) for submit / vault / list. Attestcoin proofs still run as a Creditcoin view (`verifySingle`) and do not need CTC.

Example listed print (BAT/USD):

`0x21cdceade3cf76d826ea4a36d68c8d3285478062abb445c951fe1c495863e2a0`
