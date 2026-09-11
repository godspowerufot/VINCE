import deployments from "../deployments.generated.json";

export type Deployments = {
  network: string;
  chainId: number;
  deployedAt: string | null;
  deployer: string | null;
  prover: string;
  decoder: string;
  registry: string | null;
  verifier: string | null;
  engine: string | null;
  gate: string | null;
  vault: string | null;
  vusd: string | null;
};

export const PROTOCOL = deployments as Deployments;

export function protocolDeployed(): boolean {
  return Boolean(PROTOCOL.gate && PROTOCOL.registry && PROTOCOL.vault && PROTOCOL.vusd);
}
