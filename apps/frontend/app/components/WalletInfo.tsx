"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { Copy, Wallet, Plus, LogOut, Send, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useClusterStore } from "../store/clusterStore";
import { useWallet, useStoreWallet } from "../hooks/wallet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const {
    wallet,
    walletAddress,
    balance,
    isLoadingBalance,
    isRefetchingBalance,
    refreshBalance,
  } = useWallet();
  const { mutateAsync: storeWallet } = useStoreWallet();
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
      await storeWallet({
        address: wallet.address,
        chainType: wallet.chainType,
      });
    } catch (error) {
      console.error("Error creating Solana wallet:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Solana Wallet
          </span>
        </div>
        {user && (
          <Button
            onClick={onLogoutClick}
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
          >
            <LogOut className="h-3 w-3 mr-1" />
            Logout
          </Button>
        )}
      </div>

      <div>
        <Select
          value={selectedCluster}
          onValueChange={(value) =>
            setSelectedCluster(value as "mainnet-beta" | "devnet")
          }
        >
          <SelectTrigger className="w-full text-xs h-8 border-0 bg-muted/50">
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mainnet-beta">Mainnet</SelectItem>
            <SelectItem value="devnet">Devnet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {wallet ? (
        <div className="space-y-3">
          <div className="bg-muted/50 rounded-lg p-2.5 flex items-center justify-between gap-2 text-xs text-muted-foreground break-all">
            <span>{walletAddress}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={copyAddress}
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto hover:bg-muted"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {copied ? "Copied!" : "Copy address"}
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Status</span>
            <div className="bg-muted/50 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
              <span>Connected</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Balance</span>
            <div className="flex items-center gap-1.5">
              <div className="bg-muted/50 rounded-lg px-2.5 py-1.5">
                {isLoadingBalance
                  ? "Loading..."
                  : `${balance?.toFixed(4) || "0"} SOL`}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={refreshBalance}
                    disabled={isLoadingBalance || isRefetchingBalance}
                    variant="ghost"
                    size="sm"
                    className="p-1.5 h-auto hover:bg-muted"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${
                        isLoadingBalance || isRefetchingBalance
                          ? "animate-spin"
                          : ""
                      }`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh balance</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onWithdrawClick}
                    variant="ghost"
                    size="sm"
                    className="p-1.5 h-auto hover:bg-muted"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Withdraw</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-muted/50 rounded-lg p-4">
          {isCreating ? (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
              <span>Creating Solana wallet...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-xs">
              <p className="text-muted-foreground">
                Create a Solana wallet to get started
              </p>
              <Button
                onClick={handleCreateWallet}
                disabled={isCreating}
                size="sm"
                className="w-full"
              >
                <Plus className="h-3 w-3 mr-1" />
                {isCreating ? "Creating..." : "Create Solana Wallet"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
