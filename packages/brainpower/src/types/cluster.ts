import { Cluster as SolanaCluster } from "@solana/web3.js";
export type Cluster = Extract<SolanaCluster, "mainnet-beta" | "devnet">;
