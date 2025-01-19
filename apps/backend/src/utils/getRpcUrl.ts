export function getRpcUrl(cluster: "mainnet-beta" | "devnet"): string {
  const rpcUrl =
    cluster === "mainnet-beta"
      ? process.env.SOLANA_MAINNET_RPC_URL
      : process.env.SOLANA_DEVNET_RPC_URL;

  if (!rpcUrl) {
    throw new Error(`RPC URL not configured for cluster ${cluster}`);
  }

  return rpcUrl;
}
