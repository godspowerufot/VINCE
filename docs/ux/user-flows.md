# User flows

The product is a **paste-a-tx attestation gate**. Users should not operate Attestcoin, but they **do** paste a source tx hash. The flow stops at the Receipt ([ADR-018](../decisions/ADR-018-attest-only-product.md)).

First-visit clicks, copy, and “where do I get a tx” live in [onboarding.md](./onboarding.md).

## Flow 0 — Land, then paste

```text
/  Open the gate
        ↓
/gate  paste hash
        ↓
Verify transaction
        ↓
Receipt
        STOP
```

## Flow A — Verified Market Gate (MVP core)

```text
Paste transaction hash
        ↓
Validating source transaction...
        ↓
Waiting for source block attestation...
        ↓
Generating proof...
        ↓
Verifying on Creditcoin...
        ↓
✓ Attested
        ↓
[ Open standalone receipt ]
```

This flow **is** the application.

## Copy that must not appear

- Settle this print
- Open settlement
- Release financing
- Verified on Base
