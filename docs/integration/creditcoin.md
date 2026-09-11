# Creditcoin integration

Creditcoin is VINCE's **settlement layer** and the host of Attestcoin.

## Networks

From [Creditcoin Endpoints](https://docs.creditcoin.org/smart-contract-guides/creditcoin-endpoints):

### Mainnet

| Field | Value |
| --- | --- |
| Name | Creditcoin |
| HTTPS RPC | `https://mainnet3.creditcoin.network` |
| WSS | `wss://mainnet3.creditcoin.network` |
| Chain ID | `102030` |
| Symbol | CTC |
| Explorer | https://creditcoin.blockscout.com/ |

### Testnet — default for VINCE

| Field | Value |
| --- | --- |
| Name | Creditcoin Testnet |
| HTTPS RPC | `https://rpc.cc3-testnet.creditcoin.network` |
| WSS | `wss://rpc.cc3-testnet.creditcoin.network` |
| Chain ID | `102031` |
| Symbol | CTC |
| Explorer | https://creditcoin-testnet.blockscout.com/ |

### Local

Creditcoin docs: `docker run -p 9944:9944 gluwa/creditcoin3:3.130.0-testnet --dev --rpc-external`

Chain ID `42`. Precompile behavior on local/dev must be verified; do not assume Attestcoin attestors exist on a solo `--dev` node.

## Contract development

Official path: **Hardhat**, TypeScript, Hardhat Ignition.

- Guide: https://docs.creditcoin.org/smart-contract-guides/hardhat-smart-contract-development
- Do not hardcode private keys. Use Hardhat `vars` / `HARDHAT_VAR_*`.
- Deploy to `creditcoin_testnet` only after unit tests pass.

Example deploy shape from the guide:

```text
npx hardhat ignition deploy ignition/modules/<Module>.ts --network creditcoin_testnet
```

## VINCE contract set (later)

See [../contracts/architecture.md](../contracts/architecture.md).

## Wallets

Users will need an EVM wallet on chain id 102031 for testnet. Frontend must add the chain with the official RPC, not a random proxy.

## What Creditcoin is not

Creditcoin does not host the B20 stocks. It does not replace the DEX. It executes VINCE decisions after Attestcoin verification.
