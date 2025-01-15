"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { Copy, Wallet, Plus, LogOut, Send, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useClusterStore } from "../store/clusterStore";
import { useWallet } from "../hooks/useWallet";
import { walletClient } from "../clients/wallet";

interface WalletInfoProps {
  onLogoutClick: () => void;
  onWithdrawClick: () => void;
}

export function WalletInfo({
  onLogoutClick,
  onWithdrawClick,
}: WalletInfoProps) {
  const { user, ready } = usePrivy();
  const { createWallet } = useSolanaWallets();
  const { selectedCluster, setSelectedCluster } = useClusterStore();
  const { wallet, walletAddress, balance, isLoadingBalance, refreshBalance } =
    useWallet();
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  if (!ready) return null;

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateWallet = async () => {
    try {
      setIsCreating(true);
      const wallet = await createWallet();
      await walletClient.storeWallet(wallet.address, wallet.chainType);
    } catch (error) {
      console.error("Error creating Solana wallet:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-[var(--text-secondary)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Solana Wallet
          </span>
        </div>
        {user && (
          <button
            onClick={onLogoutClick}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg hover:bg-[var(--hover-bg)] text-red-400 hover:text-red-300 transition-colors"
            title="Logout"
          >
            <LogOut className="h-3 w-3" />
            Logout
          </button>
        )}
      </div>

      <div className="mb-3">
        <select
          value={selectedCluster}
          onChange={(e) =>
            setSelectedCluster(e.target.value as "mainnet-beta" | "devnet")
          }
          className="w-full px-2 py-1 text-xs rounded-lg bg-[var(--background)] border border-[var(--border-color)] text-[var(--text-primary)]"
        >
          <option value="mainnet-beta">Mainnet</option>
          <option value="devnet">Devnet</option>
        </select>
      </div>

      {wallet ? (
        <div className="space-y-2">
          <div className="text-xs text-[var(--text-secondary)] break-all">
            <div className="bg-[var(--background)] p-2 rounded-lg flex items-center justify-between gap-2">
              <span>{walletAddress}</span>
              <button
                onClick={copyAddress}
                className="p-1 hover:bg-[var(--hover-bg)] rounded-md transition-colors relative"
                title="Copy address"
              >
                <Copy className="h-3 w-3" />
                {copied && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Status:</span>
            <span className="px-2 py-1 bg-[var(--background)] rounded-md flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Balance:</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-[var(--background)] rounded-md">
                {isLoadingBalance
                  ? "Loading..."
                  : `${balance?.toFixed(4) || "0"} SOL`}
              </span>
              <button
                onClick={refreshBalance}
                disabled={isLoadingBalance}
                className="p-1.5 hover:bg-[var(--hover-bg)] rounded-md transition-colors disabled:opacity-50"
                title="Refresh balance"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    isLoadingBalance ? "animate-spin" : ""
                  }`}
                />
              </button>
              <button
                onClick={onWithdrawClick}
                className="p-1.5 hover:bg-[var(--hover-bg)] rounded-md transition-colors"
                title="Withdraw"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-[var(--text-secondary)] bg-[var(--background)] p-3 rounded-lg">
          {isCreating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-[var(--primary)]" />
              <span>Creating Solana wallet...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p>Create a Solana wallet to get started</p>
              <button
                onClick={handleCreateWallet}
                disabled={isCreating}
                className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white transition-colors w-full"
              >
                <Plus className="h-3 w-3" />
                {isCreating ? "Creating..." : "Create Solana Wallet"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
