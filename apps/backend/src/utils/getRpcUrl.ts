import { Cluster } from "@repo/brainpower-agent";

export function getRpcUrl(cluster: Cluster): string {
  const rpcUrl =
    cluster === "mainnet-beta"
      ? process.env.SOLANA_MAINNET_RPC_URL
      : process.env.SOLANA_DEVNET_RPC_URL;

  if (!rpcUrl) {
    throw new Error(`RPC URL not configured for cluster ${cluster}`);
  }

  return rpcUrl;
}
