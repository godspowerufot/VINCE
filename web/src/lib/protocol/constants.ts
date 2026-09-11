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
