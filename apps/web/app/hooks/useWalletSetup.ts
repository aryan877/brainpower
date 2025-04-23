import { useHeadlessDelegatedActions, usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { useEffect, useState } from "react";
import { useStoreWallet } from "./wallet";

interface WalletSetupState {
  isCreatingWallet: boolean;
  isDelegatingWallet: boolean;
  error: string | null;
  needsDelegation: boolean;
  hasWallet: boolean;
  isDelegated: boolean;
}

interface WalletSetupActions {
  createAndDelegateWallet: () => Promise<void>;
  delegateExistingWallet: () => Promise<void>;
  resetError: () => void;
}

export const useWalletSetup = (): WalletSetupState & WalletSetupActions => {
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [isDelegatingWallet, setIsDelegatingWallet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newlyCreatedWalletAddress, setNewlyCreatedWalletAddress] = useState<
    string | null
  >(null);

  const { createWallet } = useSolanaWallets();
  const { delegateWallet } = useHeadlessDelegatedActions();
  const { mutateAsync: storeWallet } = useStoreWallet();
  const { user } = usePrivy();

  // Wallet states
  const hasWallet = !!user?.wallet;
  const isDelegated = hasWallet && !!user?.wallet?.delegated;
  const needsDelegation = hasWallet && !isDelegated;

  const resetError = () => setError(null);

  const delegateExistingWallet = async () => {
    if (!user?.wallet?.address) {
      throw new Error("No wallet found to delegate");
    }

    try {
      setIsDelegatingWallet(true);
      setError(null);

      // Delegate the wallet
      await delegateWallet({
        address: user.wallet.address,
        chainType: "solana",
      });

      // Store the wallet after delegation
      await storeWallet({
        address: user.wallet.address,
        chainType: "solana",
      });
    } catch (err) {
      console.error("Error delegating wallet:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delegate wallet"
      );
      throw err;
    } finally {
      setIsDelegatingWallet(false);
    }
  };

  const createAndDelegateWallet = async () => {
    try {
      setIsCreatingWallet(true);
      setError(null);

      // If user has a wallet but it's not delegated, just delegate it
      if (needsDelegation) {
        return delegateExistingWallet();
      }

      // If user already has a delegated wallet, prevent creation
      if (isDelegated) {
        throw new Error("User already has a delegated wallet");
      }

      // Create new wallet
      const wallet = await createWallet();
      if (!wallet?.address) {
        throw new Error("Failed to create wallet");
      }

      // Instead, set the address to trigger the useEffect for delegation
      setNewlyCreatedWalletAddress(wallet.address);
    } catch (err) {
      console.error("Error in wallet setup:", err);
      setError(err instanceof Error ? err.message : "Failed to setup wallet");
      // Reset pending delegation state on error
      setNewlyCreatedWalletAddress(null);
      throw err;
    } finally {
      // Only stop the creation loading state here
      setIsCreatingWallet(false);
      // Delegation loading state is handled by the effect
    }
  };

  // Effect to handle delegation after a new wallet is created and user state potentially updates
  useEffect(() => {
    const attemptDelegation = async () => {
      if (
        !newlyCreatedWalletAddress ||
        !user?.wallet ||
        user.wallet.address !== newlyCreatedWalletAddress
      ) {
        // Conditions not met: either no pending address, user object not ready, or wallet address doesn't match
        return;
      }

      // Wallet address matches the newly created one, proceed with delegation
      try {
        console.log(
          `User object updated, attempting delegation for: ${newlyCreatedWalletAddress}`
        );
        setIsDelegatingWallet(true);
        setError(null);

        // Delegate the new wallet
        await delegateWallet({
          address: newlyCreatedWalletAddress,
          chainType: "solana",
        });

        // Store the wallet
        await storeWallet({
          address: newlyCreatedWalletAddress,
          chainType: "solana",
        });

        console.log(
          `Successfully delegated and stored: ${newlyCreatedWalletAddress}`
        );
      } catch (err) {
        console.error("Error delegating newly created wallet in effect:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to delegate newly created wallet"
        );
        // Rethrow to allow calling components to catch if needed
        throw err;
      } finally {
        // Reset state regardless of success or failure
        setNewlyCreatedWalletAddress(null);
        setIsDelegatingWallet(false);
      }
    };

    attemptDelegation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, newlyCreatedWalletAddress]); // Dependencies: user state and the pending address

  return {
    // States
    isCreatingWallet,
    isDelegatingWallet,
    error,
    needsDelegation,
    hasWallet,
    isDelegated,
    // Actions
    createAndDelegateWallet,
    delegateExistingWallet,
    resetError,
  };
};
