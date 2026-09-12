export const SEPOLIA = {
  chainId: 11155111,
  chainIdHex: "0xaa36a7",
  name: "Ethereum Sepolia",
  rpc: "https://ethereum-sepolia-rpc.publicnode.com",
  explorer: "https://sepolia.etherscan.io",
  symbol: "ETH",
} as const;

export const ETHEREUM = {
  chainId: 1,
  rpcs: [
    "https://ethereum.publicnode.com",
    "https://eth.llamarpc.com",
    "https://rpc.mevblocker.io",
  ],
} as const;

export const CREDITCOIN = {
  chainId: 102031,
  chainIdHex: "0x18e8f",
  name: "Creditcoin Testnet",
  rpc: "https://rpc.cc3-testnet.creditcoin.network",
  wss: "wss://rpc.cc3-testnet.creditcoin.network",
  explorer: "https://creditcoin-testnet.blockscout.com",
  symbol: "CTC",
} as const;

/** EIP-3085 payload. Official testnet: EVM 102031 = 0x18e8f. 0x18eaf is 102063 — do not use. */
export const CREDITCOIN_WALLET_CHAIN = {
  chainId: "0x18e8f",
  chainName: "Creditcoin Testnet",
  nativeCurrency: {
    name: "CTC",
    symbol: "CTC",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.cc3-testnet.creditcoin.network"],
  blockExplorerUrls: ["https://creditcoin-testnet.blockscout.com/"],
} as const;

export const SETTLEMENT = CREDITCOIN;

export const ATTESTCOIN = {
  prover: "0x0000000000000000000000000000000000000FD2",
  chainInfo: "0x0000000000000000000000000000000000000FD3",
  decoderTestnet: "0x731c345d79Fb8BbDC541f9DF3b6317585F849F9f",
  proofBuilder: "https://prover.cc3-testnet.creditcoin.network",
  ethereumChainKey: 3,
  sepoliaChainKey: 1,
  creditcoinRpc: "https://rpc.cc3-testnet.creditcoin.network",
} as const;

export const ANSWER_UPDATED =
  "0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f";

export const WINDOW_SECONDS = 1800;
export const LTV_BPS = 5000;
