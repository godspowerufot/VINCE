import deployments from "../deployments.generated.json";

export type Deployments = {
  network: string;
  chainId: number;
  deployedAt: string | null;
  deployer: string | null;
  prover: string;
  decoder: string | null;
  registry: string | null;
  verifier: string | null;
  engine: string | null;
  gate: string | null;
  desk: string | null;
  vault: string | null;
  vusd: string | null;
};

export const PROTOCOL = deployments as Deployments;

export function protocolDeployed(): boolean {
  return Boolean(PROTOCOL.gate && PROTOCOL.registry);
}

export function deskDeployed(): boolean {
  return Boolean(PROTOCOL.desk);
}
