import { BrowserProvider, type Signer, type TransactionRequest } from "ethers";
import { CREDITCOIN_WALLET_CHAIN, SETTLEMENT } from "./constants";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

const SETTLEMENT_HEX = "0x18e8f";
const SWITCH_IDS = ["0x18e8f", "0x018e8f"] as const;
const WRONG_IDS = new Set([102063, "0x18eaf", "0x018eaf"]);

function injected(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return (window as Window & { ethereum?: EthereumProvider }).ethereum ?? null;
}

function errorCode(err: unknown): number | string | undefined {
  if (!err || typeof err !== "object") return undefined;
  const rec = err as { code?: number | string; data?: { originalError?: { code?: number } } };
  return rec.code ?? rec.data?.originalError?.code;
}

function userRejected(err: unknown): boolean {
  const code = errorCode(err);
  return code === 4001 || code === "ACTION_REJECTED";
}

function numericChain(hex: unknown): number {
  if (typeof hex !== "string") return 0;
  return Number.parseInt(hex, 16);
}

function isSettlementChain(hex: unknown): boolean {
  return numericChain(hex) === SETTLEMENT.chainId;
}

async function chainIdOf(ethereum: EthereumProvider): Promise<string> {
  return (await ethereum.request({ method: "eth_chainId" })) as string;
}

async function addSettlementChain(ethereum: EthereumProvider): Promise<void> {
  await ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: SETTLEMENT_HEX,
        chainName: CREDITCOIN_WALLET_CHAIN.chainName,
        nativeCurrency: { ...CREDITCOIN_WALLET_CHAIN.nativeCurrency },
        rpcUrls: [...CREDITCOIN_WALLET_CHAIN.rpcUrls],
        blockExplorerUrls: [...CREDITCOIN_WALLET_CHAIN.blockExplorerUrls],
      },
    ],
  });
}

async function switchSettlementChain(ethereum: EthereumProvider): Promise<void> {
  let last: unknown;
  for (const chainId of SWITCH_IDS) {
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
      if (isSettlementChain(await chainIdOf(ethereum))) return;
    } catch (err) {
      if (userRejected(err)) throw err;
      last = err;
    }
  }
  throw last ?? new Error("Could not switch to Creditcoin Testnet 102031.");
}

async function ensureSettlementChain(ethereum: EthereumProvider): Promise<void> {
  const current = await chainIdOf(ethereum);
  if (WRONG_IDS.has(numericChain(current)) || WRONG_IDS.has(current.toLowerCase())) {
    await addSettlementChain(ethereum);
  } else if (!isSettlementChain(current)) {
    try {
      await switchSettlementChain(ethereum);
    } catch (err) {
      if (userRejected(err)) throw err;
      await addSettlementChain(ethereum);
    }
  }

  const started = Date.now();
  while (Date.now() - started < 10_000) {
    if (isSettlementChain(await chainIdOf(ethereum))) return;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  await addSettlementChain(ethereum);
  const finalId = await chainIdOf(ethereum);
  if (!isSettlementChain(finalId)) {
    throw new Error(
      `Wallet chain is ${numericChain(finalId) || finalId}, not Creditcoin Testnet 102031 (0x18e8f). Remove the 102063 network and retry.`,
    );
  }
}

export function walletError(err: unknown): string {
  if (userRejected(err)) return "Wallet rejected the request.";
  if (err && typeof err === "object" && "shortMessage" in err) {
    return String((err as { shortMessage: string }).shortMessage);
  }
  if (err instanceof Error) return err.message;
  return "Wallet request failed.";
}

export async function connectSettlement(): Promise<{
  provider: BrowserProvider;
  signer: Signer;
  address: string;
  ethereum: EthereumProvider;
}> {
  const ethereum = injected();
  if (!ethereum) {
    throw new Error("No wallet found. Install an EVM wallet to submit on Creditcoin.");
  }
  const accounts = (await ethereum.request({
    method: "eth_requestAccounts",
  })) as string[];
  await ensureSettlementChain(ethereum);
  const provider = new BrowserProvider(ethereum as never, SETTLEMENT.chainId);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== SETTLEMENT.chainId) {
    throw new Error("Wallet is not on Creditcoin Testnet 102031.");
  }
  const signer = await provider.getSigner();
  return {
    provider,
    signer,
    ethereum,
    address: accounts[0] ?? (await signer.getAddress()),
  };
}

type SettlementReceipt = {
  hash: string;
  status: number | null;
  logs: { topics: readonly string[]; data: string }[];
};

/** Send a Creditcoin tx on chain 102031 only. */
export async function sendSettlementTx(
  signer: Signer,
  tx: TransactionRequest,
): Promise<{ hash: string; wait: () => Promise<SettlementReceipt | null> }> {
  const ethereum = injected();
  if (ethereum) await ensureSettlementChain(ethereum);

  const fee = await signer.provider?.getFeeData();
  const gasPrice = `0x${(tx.gasPrice ?? fee?.gasPrice ?? 1_500_000_000n).toString(16)}`;
  const gas = `0x${(tx.gasLimit ?? 8_000_000n).toString(16)}`;
  const from = typeof tx.from === "string" ? tx.from : await signer.getAddress();
  const to = typeof tx.to === "string" ? tx.to : undefined;
  const data = typeof tx.data === "string" ? tx.data : undefined;
  if (!to || !data) throw new Error("Submit is missing to/data.");

  if (!ethereum) {
    throw new Error("No wallet found. Install an EVM wallet to submit on Creditcoin.");
  }

  const hash = (await ethereum.request({
    method: "eth_sendTransaction",
    params: [
      {
        from,
        to,
        data,
        gas,
        gasPrice,
        chainId: SETTLEMENT_HEX,
      },
    ],
  })) as string;

  return {
    hash,
    wait: async () => {
      const receipt = await signer.provider!.waitForTransaction(hash, 1, 90_000);
      if (!receipt) return null;
      return {
        hash: receipt.hash,
        status: receipt.status ?? null,
        logs: receipt.logs.map((log) => ({ topics: log.topics, data: log.data })),
      };
    },
  };
}
