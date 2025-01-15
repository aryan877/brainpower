import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { useClusterStore } from "../store/clusterStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { walletClient } from "../clients/wallet";
import { ChainType } from "../types/api/wallet";

export const walletKeys = {
  all: ["wallets"] as const,
  user: () => [...walletKeys.all, "user"] as const,
  balance: (address: string, cluster: string) =>
    [...walletKeys.all, "balance", address, cluster] as const,
};

// wallet connection hook
export function useWalletConnection() {
  const { wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];

  return {
    wallet: solanaWallet,
    walletAddress: solanaWallet?.address,
  };
}

//  balance hook
export function useWalletBalance(
  walletAddress: string | undefined,
  cluster: "mainnet-beta" | "devnet"
) {
  const {
    data: balance,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: walletKeys.balance(walletAddress || "", cluster),
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address");
      const response = await walletClient.getBalance(walletAddress, cluster);
      return response;
    },
    enabled: !!walletAddress && !!cluster,
  });

  return {
    balance: balance?.balance,
    isLoading,
    isRefetching,
    error,
    refreshBalance: () => refetch(),
  };
}

// Combined hook
export function useWallet() {
  const { wallet, walletAddress } = useWalletConnection();
  const { selectedCluster } = useClusterStore();
  const {
    balance,
    isLoading: isLoadingBalance,
    isRefetching: isRefetchingBalance,
    error,
    refreshBalance,
  } = useWalletBalance(walletAddress, selectedCluster);

  return {
    wallet,
    walletAddress,
    balance,
    isLoadingBalance,
    isRefetchingBalance,
    error,
    refreshBalance,
  };
}

export function useUserWallets() {
  return useQuery({
    queryKey: walletKeys.user(),
    queryFn: () => walletClient.getUserWallets(),
  });
}

export function useStoreWallet() {
  return useMutation({
    mutationFn: ({
      address,
      chainType = "solana",
    }: {
      address: string;
      chainType?: ChainType;
    }) => walletClient.storeWallet(address, chainType),
    onSuccess: () => {},
  });
}
