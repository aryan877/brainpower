import { Cluster } from "@repo/brainpower-agent";
import { create } from "zustand";

interface ClusterState {
  selectedCluster: Cluster;
  setSelectedCluster: (cluster: Cluster) => void;
  getRpcUrl: () => string;
}

export const useClusterStore = create<ClusterState>((set, get) => ({
  selectedCluster: "mainnet-beta" as Cluster,
  setSelectedCluster: (cluster) => set({ selectedCluster: cluster }),
  getRpcUrl: () => {
    const cluster = get().selectedCluster;
    return cluster === "mainnet-beta"
      ? process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL ||
          "https://api.mainnet-beta.solana.com"
      : process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL ||
          "https://api.devnet.solana.com";
  },
}));
