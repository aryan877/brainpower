import { useEffect, useCallback } from "react";
import { useWalletStore } from "../store/walletStore";
import { useClusterStore } from "../store/clusterStore";
import { useSolanaWallets } from "@privy-io/react-auth/solana";

export function useWallet() {
  const { wallets } = useSolanaWallets();
  const { selectedCluster } = useClusterStore();
  const { balance, isLoadingBalance, error, fetchBalance, resetBalance } =
    useWalletStore();

  const solanaWallet = wallets[0];
  const walletAddress = solanaWallet?.address;

  // Fetch balance whenever wallet address or cluster changes
  useEffect(() => {
    if (walletAddress) {
      fetchBalance(walletAddress, true);
    } else {
      resetBalance();
    }
  }, [walletAddress, selectedCluster, fetchBalance, resetBalance]);

  // Utility function to refresh balance on demand
  const refreshBalance = useCallback(() => {
    if (walletAddress) {
      return fetchBalance(walletAddress, true);
    }
  }, [walletAddress, fetchBalance]);

  return {
    wallet: solanaWallet,
    walletAddress,
    balance,
    isLoadingBalance,
    error,
    refreshBalance,
  };
}
