# Error states

Every failure the user can see must map to a protocol stage. Do not use a single "Something went wrong".

| User message | Stage | Typical cause |
| --- | --- | --- |
| That looks like a wallet, not a transaction | Observation | 40-hex address pasted instead of 64-hex tx |
| Could not load that transaction | Observation | Unknown / pending hash |
| Waiting for source block attestation timed out | Attestation | Slow attestors, unsupported chain |
| Proof generation failed | Proof | Builder URL/down, unattested height |
| Proof verification failed | Creditcoin | Bad proof, wrong chainKey |
| Source transaction did not succeed | Extraction | Receipt status ≠ 1 |
| This market is not listed | Policy | Emitter not in registry (`REJECT_FEED`) |
| Observation is too old | Policy | Stale `updatedAt` |
| Market condition not met | Policy | Under that listing’s `minimumPrice` |
| This feed is frozen | Policy | Paused / non-advancing round |
| Verification unavailable | Fail closed | Builder/attestation/precompile down |
| This asset cannot be listed by ticker | UX | User typed a symbol we will not key on |
| No live market window | Vault | `/vault` with no PASS window |

Proof verified + condition not met is a **successful verification** and a **failed policy**. Show both:

```text
✓ Cross-chain proof verified
✗ Market condition not met

Required  ≥ $0.05
Observed  $0.03
```

Unlisted but decoded (GOOGL/SPCX experiments):

```text
✓ Cross-chain proof verified
✗ This market is not listed

Matched  GOOGL-USD (24/5)
VINCE proved the print. It did not open a window.
```

Never replace either of those with "verification failed".
