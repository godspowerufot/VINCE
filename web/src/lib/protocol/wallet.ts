import { BrowserProvider, type Signer, type TransactionRequest } from "ethers";
import { CREDITCOIN, SETTLEMENT } from "./constants";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

const ADD_CHAIN = {
  chainId: SETTLEMENT.chainIdHex,
  chainName: SETTLEMENT.name,
  nativeCurrency: {
    name: CREDITCOIN.symbol,
    symbol: CREDITCOIN.symbol,
    decimals: 18,
  },
  rpcUrls: [SETTLEMENT.rpc],
  blockExplorerUrls: [SETTLEMENT.explorer],
};

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

function unknownChain(err: unknown): boolean {
  const code = errorCode(err);
  const message = err instanceof Error ? err.message : String(err);
  return (
    code === 4902 ||
    /unrecognized chain|chain has not been added|4902/i.test(message)
  );
}

function sameChain(hex: unknown): boolean {
  if (typeof hex !== "string") return false;
  return Number.parseInt(hex, 16) === SETTLEMENT.chainId;
}

async function chainIdOf(ethereum: EthereumProvider): Promise<string> {
  return (await ethereum.request({ method: "eth_chainId" })) as string;
}

async function addSettlementChain(ethereum: EthereumProvider): Promise<void> {
  await ethereum.request({
    method: "wallet_addEthereumChain",
    params: [ADD_CHAIN],
  });
}

async function ensureSettlementChain(ethereum: EthereumProvider): Promise<void> {
  if (sameChain(await chainIdOf(ethereum))) return;

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SETTLEMENT.chainIdHex }],
    });
  } catch (err) {
    if (userRejected(err)) throw err;
    if (unknownChain(err) || errorCode(err) === -32603) {
      await addSettlementChain(ethereum);
    } else {
      try {
        await addSettlementChain(ethereum);
      } catch (addErr) {
        if (userRejected(addErr)) throw addErr;
        throw err;
      }
    }
  }

  const started = Date.now();
  while (Date.now() - started < 10_000) {
    if (sameChain(await chainIdOf(ethereum))) return;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  await addSettlementChain(ethereum);
  if (!sameChain(await chainIdOf(ethereum))) {
    throw new Error("Wallet is not on Creditcoin Testnet. Add chain 102031 and retry.");
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
}> {
  const ethereum = injected();
  if (!ethereum) {
    throw new Error("No wallet found. Install an EVM wallet to submit on Creditcoin.");
  }
  const accounts = (await ethereum.request({
    method: "eth_requestAccounts",
  })) as string[];
  await ensureSettlementChain(ethereum);
  const provider = new BrowserProvider(ethereum as never);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== SETTLEMENT.chainId) {
    throw new Error("Wallet is not on Creditcoin Testnet.");
  }
  const signer = await provider.getSigner();
  return {
    provider,
    signer,
    address: accounts[0] ?? (await signer.getAddress()),
  };
}

type SettlementReceipt = {
  hash: string;
  logs: { topics: readonly string[]; data: string }[];
};

/** Send a Creditcoin tx so the wallet confirm modal always opens. */
export async function sendSettlementTx(
  signer: Signer,
  tx: TransactionRequest,
): Promise<{ hash: string; wait: () => Promise<SettlementReceipt | null> }> {
  const fee = await signer.provider?.getFeeData();
  const populated = await signer.populateTransaction({
    ...tx,
    chainId: SETTLEMENT.chainId,
    type: 0,
    gasPrice: tx.gasPrice ?? fee?.gasPrice ?? 1_500_000_000n,
  });
  delete populated.maxFeePerGas;
  delete populated.maxPriorityFeePerGas;
  populated.type = 0;
  populated.gasPrice = populated.gasPrice ?? fee?.gasPrice ?? 1_500_000_000n;
  populated.gasLimit = populated.gasLimit ?? 8_000_000n;
  const sent = await signer.sendTransaction(populated);
  return {
    hash: sent.hash,
    wait: async () => {
      const receipt = await sent.wait();
      if (!receipt) return null;
      return {
        hash: receipt.hash,
        logs: receipt.logs.map((log) => ({ topics: log.topics, data: log.data })),
      };
    },
  };
}
