import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { useClusterStore } from "../store/clusterStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { walletClient } from "../clients/wallet";
import { ChainType } from "../types/api/wallet";
import {
  LAMPORTS_PER_SOL,
  Connection,
  Transaction,
  VersionedTransaction,
  Commitment,
  TransactionSignature,
  PublicKey,
  TransactionError,
} from "@solana/web3.js";

export const walletKeys = {
  all: ["wallets"] as const,
  user: () => [...walletKeys.all, "user"] as const,
  balance: (address: string, cluster: string) =>
    [...walletKeys.all, "balance", address, cluster] as const,
};

interface SendTransactionOptions {
  commitment?: Commitment;
  skipPreflight?: boolean;
  maxRetries?: number;
}

interface TransactionResponse {
  signature: TransactionSignature;
  confirmation?: {
    value: {
      err: TransactionError | null;
    };
  };
}

// wallet connection hook
export function useWalletConnection() {
  const { wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];

  return {
    wallet: solanaWallet,
    walletAddress: solanaWallet?.address,
  };
}

// hook for sending transactions
export function useSendTransaction() {
  const { getRpcUrl } = useClusterStore();
  const { wallet } = useWalletConnection();

  const sendTransaction = async (
    transaction: Transaction | VersionedTransaction,
    options: SendTransactionOptions = {}
  ): Promise<TransactionResponse> => {
    if (!wallet?.address) {
      throw new Error("Wallet not connected");
    }

    const {
      commitment = "confirmed",
      skipPreflight = false,
      maxRetries = 3,
    } = options;

    try {
      // Create connection
      const connection = new Connection(getRpcUrl(), commitment);

      // Get latest blockhash if it's a regular transaction
      if (transaction instanceof Transaction) {
        const { blockhash } = await connection.getLatestBlockhash(commitment);
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new PublicKey(wallet.address);
      }

      // Sign transaction
      const signedTx = await wallet.signTransaction(transaction);

      // Send transaction
      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
        {
          skipPreflight,
          maxRetries,
        }
      );

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature);

      return {
        signature,
        confirmation,
      };
    } catch (error) {
      console.error("Transaction error:", error);
      throw error;
    }
  };

  return { sendTransaction };
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
      return {
        balance: response.balance / LAMPORTS_PER_SOL,
      };
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
  const { sendTransaction } = useSendTransaction();

  return {
    wallet,
    walletAddress,
    balance,
    isLoadingBalance,
    isRefetchingBalance,
    error,
    refreshBalance,
    sendTransaction,
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
