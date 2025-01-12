import { create } from "zustand";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useClusterStore } from "./clusterStore";

interface WalletState {
  balance: number | null;
  isLoadingBalance: boolean;
  lastFetchedAddress: string | null;
  lastFetchTimestamp: number | null;
  error: string | null;
}

interface WalletActions {
  fetchBalance: (walletAddress: string, force?: boolean) => Promise<void>;
  resetBalance: () => void;
  setError: (error: string | null) => void;
}

export type WalletStore = WalletState & WalletActions;

export const useWalletStore = create<WalletStore>((set, get) => ({
  balance: null,
  isLoadingBalance: false,
  lastFetchedAddress: null,
  lastFetchTimestamp: null,
  error: null,

  setError: (error) => set({ error }),

  resetBalance: () => {
    set({
      balance: null,
      lastFetchedAddress: null,
      lastFetchTimestamp: null,
      error: null,
    });
  },

  fetchBalance: async (walletAddress: string, force = false) => {
    if (!walletAddress) return;

    const now = Date.now();
    const CACHE_DURATION = 30000; // 30 seconds

    // Skip if already loading
    if (get().isLoadingBalance) return;

    // Skip if we've fetched recently for this address (unless forced)
    const lastFetchTimestamp = get().lastFetchTimestamp;
    if (
      !force &&
      get().lastFetchedAddress === walletAddress &&
      lastFetchTimestamp !== null &&
      now - lastFetchTimestamp < CACHE_DURATION
    ) {
      return;
    }

    set({ isLoadingBalance: true, error: null });
    try {
      const connection = new Connection(useClusterStore.getState().getRpcUrl());
      const publicKey = new PublicKey(walletAddress);
      const balance = await connection.getBalance(publicKey);
      set({
        balance: balance / LAMPORTS_PER_SOL,
        lastFetchedAddress: walletAddress,
        lastFetchTimestamp: now,
      });
    } catch (error) {
      console.error("Error fetching balance:", error);
      set({
        balance: null,
        error:
          error instanceof Error ? error.message : "Failed to fetch balance",
      });
    } finally {
      set({ isLoadingBalance: false });
    }
  },
}));
