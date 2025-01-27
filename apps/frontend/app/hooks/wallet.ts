import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { useClusterStore } from "../store/clusterStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { walletClient } from "../clients/wallet";
import { ChainType, GetTransactionHistoryResponse } from "../types/api/wallet";
import {
  LAMPORTS_PER_SOL,
  Transaction,
  VersionedTransaction,
  Commitment,
  TransactionSignature,
  TransactionError,
  PublicKey,
} from "@solana/web3.js";
import { Cluster } from "@repo/brainpower-agent";

/**
 * Query key factory for wallet-related queries
 *
 *
 * This object provides consistent query keys for React Query caching.
 * - all: Base key for all wallet queries
 * - user: Key for user-specific wallet queries
 * - balance: Key for wallet balance queries, includes address and cluster
 * - history: Key for wallet transaction history queries, includes address
 * - priorityFees: Key for priority fees queries
 */
export const walletKeys = {
  all: ["wallets"] as const,
  user: () => [...walletKeys.all, "user"] as const,
  balance: (address: string, cluster: string) =>
    [...walletKeys.all, "balance", address, cluster] as const,
  history: (address: string) =>
    [...walletKeys.all, "history", address] as const,
  priorityFees: () => [...walletKeys.all, "priorityFees"] as const,
};

/**
 * Options for sending Solana transactions
 *
 *
 * These options control how transactions are processed:
 * - commitment: How many confirmations to wait for (processed, confirmed, finalized)
 * - skipPreflight: Skip simulation check before sending (not recommended)
 * - maxRetries: Number of times to retry failed transactions
 */
interface SendTransactionOptions {
  commitment?: Commitment;
  skipPreflight?: boolean;
  maxRetries?: number;
}

/**
 * Response format for transaction operations
 *
 *
 * This defines what we get back after sending a transaction:
 * - signature: Unique ID for the transaction
 * - confirmation: Contains error info if transaction failed
 */
interface TransactionResponse {
  signature: TransactionSignature;
  confirmation?: {
    value: {
      err: TransactionError | null;
    };
  };
}

/**
 * Hook to access the connected Solana wallet
 *
 * Uses hooks:
 * - useSolanaWallets
 *
 *
 * This hook gets the user's connected Solana wallet from Privy.
 * We take the first wallet since we only support one connection.
 * Returns both the wallet object and its address for convenience.
 */
export function useWalletConnection() {
  const { wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];

  return {
    wallet: solanaWallet,
    walletAddress: solanaWallet?.address,
  };
}

/**
 * Hook for sending Solana transactions
 *
 * Uses hooks:
 * - useWalletConnection
 *
 * This hook provides a function to send transactions on Solana.
 * It handles both legacy Transaction and newer VersionedTransaction types.
 * The hook sets up the connection and handles signing/sending/confirming.
 */
export function useSendTransaction() {
  const { wallet } = useWalletConnection();

  const sendTransaction = async (
    transaction: Transaction | VersionedTransaction,
    options: SendTransactionOptions = {}
  ): Promise<TransactionResponse> => {
    if (!wallet?.address) {
      throw new Error("Wallet not connected");
    }

    try {
      // Convert legacy transaction to versioned transaction if needed
      let versionedTx: VersionedTransaction;
      if (transaction instanceof Transaction) {
        const { blockhash } = await walletClient.getLatestBlockhash(
          options.commitment
        );
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new PublicKey(wallet.address);

        // Convert to versioned transaction
        versionedTx = new VersionedTransaction(transaction.compileMessage());
      } else {
        versionedTx = transaction;
      }

      // Sign and send the transaction
      const signedTx = await wallet.signTransaction(versionedTx);
      const serializedTransaction = Buffer.from(signedTx.serialize()).toString(
        "base64"
      );

      return await walletClient.sendTransaction(serializedTransaction, {
        commitment: options.commitment || "processed",
        skipPreflight: options.skipPreflight || false,
        maxRetries: options.maxRetries || 3,
      });
    } catch (error) {
      console.error("Transaction error:", error);
      throw error;
    }
  };

  return { sendTransaction };
}

/**
 * Hook to fetch and monitor wallet balance
 *
 * Uses hooks:
 * - useQuery
 *
 *
 * This hook keeps track of a wallet's SOL balance.
 * It automatically converts from lamports (smallest unit) to SOL.
 * Provides loading states and error handling.
 * Use refreshBalance() to manually update the balance.
 */
export function useWalletBalance(
  walletAddress: string | undefined,
  cluster: Cluster
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

/**
 * Hook to fetch transaction history for a wallet
 *
 * Uses hooks:
 * - useQuery
 *
 * This hook fetches and caches the transaction history for a wallet address.
 * It automatically handles loading states and errors.
 */
export function useTransactionHistory(
  walletAddress: string | undefined,
  options?: {
    before?: string;
  }
) {
  const { before } = options || {};

  return useQuery<GetTransactionHistoryResponse>({
    queryKey: [...walletKeys.history(walletAddress || ""), { before }],
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address");
      return walletClient.getTransactionHistory(walletAddress, { before });
    },
    enabled: !!walletAddress,
    staleTime: 30 * 1000,
  });
}

/**
 * Main wallet hook that combines connection, balance and transaction functionality
 *
 * Uses hooks:
 * - useWalletConnection
 * - useClusterStore
 * - useWalletBalance
 * - useSendTransaction
 *
 *
 * This is the primary hook you should use for wallet interactions.
 * It combines all wallet functionality in one place:
 * - Wallet connection status
 * - SOL balance with loading states
 * - Transaction sending capability
 */
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

/**
 * Hook to fetch all wallets associated with the user
 *
 * Uses hooks:
 * - useQuery
 *
 *
 * This hook gets all wallets the user has connected.
 * Uses React Query for automatic caching and refetching.
 */
export function useUserWallets() {
  return useQuery({
    queryKey: walletKeys.user(),
    queryFn: () => walletClient.getUserWallets(),
  });
}

/**
 * Hook to store a new wallet address for the user
 *
 * Uses hooks:
 * - useMutation
 *
 *
 * This hook saves a wallet address to our backend.
 * Uses React Query's mutation for handling the API call.
 * Default chain is Solana but supports other chains too.
 */
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

/**
 * Hook to fetch current priority fees
 *
 * Uses hooks:
 * - useQuery
 *
 * This hook fetches the current priority fee levels from Helius.
 * It automatically caches and refreshes the data.
 * Optionally accepts a serialized transaction for more accurate fee estimates.
 */
export function usePriorityFees(serializedTransaction?: string) {
  return useQuery({
    queryKey: [...walletKeys.priorityFees(), serializedTransaction],
    queryFn: () => walletClient.getPriorityFees(serializedTransaction),
    refetchInterval: 60000, // Refresh every 60 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}
