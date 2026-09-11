import { BrowserProvider } from "ethers";
import { SEPOLIA } from "./constants";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function injected(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return (window as Window & { ethereum?: EthereumProvider }).ethereum ?? null;
}

export async function connectSepolia(): Promise<{
  provider: BrowserProvider;
  address: string;
}> {
  const ethereum = injected();
  if (!ethereum) {
    throw new Error("No wallet found. Install an EVM wallet to use the vault.");
  }
  const accounts = (await ethereum.request({
    method: "eth_requestAccounts",
  })) as string[];
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA.chainIdHex }],
    });
  } catch (err) {
    const code = (err as { code?: number }).code;
    if (code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: SEPOLIA.chainIdHex,
            chainName: SEPOLIA.name,
            nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: [SEPOLIA.rpc],
            blockExplorerUrls: [SEPOLIA.explorer],
          },
        ],
      });
    } else {
      throw err;
    }
  }
  const provider = new BrowserProvider(ethereum as never, SEPOLIA.chainId);
  const signer = await provider.getSigner();
  return { provider, address: accounts[0] ?? (await signer.getAddress()) };
}
