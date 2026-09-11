# Tracing

A VINCE action spans Base, a proof API, and Creditcoin. Use one `traceId` from UI click to settlement receipt.

```text
traceId
  span: ui.gate.submit
  span: worker.select_tx
  span: worker.wait_attestation
  span: worker.get_proof
  span: creditcoin.verify
  span: creditcoin.evaluate
  span: ui.render_result
```

Attributes to attach:

```text
marketId
asset
sourceTx
sourceBlock
chainKey
creditcoinTx
decision
```

Do not create a new trace when the worker retries; add retry spans under the same trace.

If the user refreshes the UI, the client may mint a new traceId but must still show the existing `sourceTx` / `creditcoinTx` once known.
