"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { usePrivy } from "@privy-io/react-auth";
import { useFundWallet, useSolanaWallets } from "@privy-io/react-auth/solana";
import { Cluster } from "@repo/brainpower-agent";
import {
  Copy,
  Download,
  LogOut,
  Plus,
  RefreshCw,
  Send,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useStoreWallet, useWallet } from "../hooks/wallet";
import { useWalletModal } from "../providers/WalletProvider";
import { useClusterStore } from "../store/clusterStore";
import { useNotificationStore } from "../store/notificationStore";

interface WalletInfoProps {
  onLogoutClick: () => void;
  isCollapsed?: boolean;
}

export function WalletInfo({
  onLogoutClick,
  isCollapsed = false,
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
  const { openWalletModal } = useWalletModal();
  const { addNotification } = useNotificationStore();

  const { fundWallet } = useFundWallet({
    onUserExited: ({ balance }) => {
      refreshBalance();
      if (balance && balance > 0) {
        addNotification("success", "Successfully funded wallet", {});
      }
    },
  });

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

  const handleFundWallet = async () => {
    if (!walletAddress) return;

    try {
      await fundWallet(walletAddress);
    } catch (error) {
      console.error("Error funding wallet:", error);
      addNotification("error", "Failed to open funding flow", {});
    }
  };

  if (isCollapsed) {
    return (
      <div className="p-2 flex flex-col items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onLogoutClick}
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Logout</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary flex-shrink-0" />
          <span className="font-semibold text-foreground text-base sm:text-lg">
            Solana Wallet
          </span>
        </div>
        {user && (
          <Button
            onClick={onLogoutClick}
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 text-xs sm:text-sm"
          >
            <LogOut className="h-3.5 w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
            Logout
          </Button>
        )}
      </div>

      <div>
        <Select
          value={selectedCluster}
          onValueChange={(value) => setSelectedCluster(value as Cluster)}
        >
          <SelectTrigger className="w-full bg-card border-border text-sm">
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
          <Card className="bg-card/50 border-border overflow-hidden">
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-foreground">
                  Address
                </span>
                <Tooltip open={copied}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={copyAddress}
                      variant="ghost"
                      size="sm"
                      className="p-1.5 h-auto flex-shrink-0"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {copied ? "Copied!" : "Copy address"}
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-xs break-all text-foreground/80 bg-background/50 p-2 rounded-md font-mono">
                {walletAddress}
              </div>
            </div>
            <Link
              href="/wallet"
              className="no-underline w-full block border-t border-border"
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full rounded-none h-10 font-medium text-sm"
              >
                Manage Wallet
              </Button>
            </Link>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-card/50 rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-sm font-medium whitespace-nowrap">
                Balance:
              </div>
              <div className="bg-background px-3 py-1.5 rounded-md font-medium text-sm flex-shrink-0">
                {isLoadingBalance ? (
                  <span className="flex items-center gap-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-t-transparent border-primary"></div>
                    Loading...
                  </span>
                ) : (
                  `${balance?.toFixed(4) || "0"} SOL`
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={refreshBalance}
                    disabled={isLoadingBalance || isRefetchingBalance}
                    variant="ghost"
                    size="sm"
                    className="p-1.5 h-auto rounded-full"
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
                    onClick={handleFundWallet}
                    variant="ghost"
                    size="sm"
                    className="p-1.5 h-auto rounded-full"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Fund wallet</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={openWalletModal}
                    variant="ghost"
                    size="sm"
                    className="p-1.5 h-auto rounded-full"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send SOL</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <Button
            onClick={handleFundWallet}
            variant="default"
            size="default"
            className="w-full font-medium text-sm"
          >
            <Download className="h-4 w-4 mr-2 flex-shrink-0" />
            Fund Wallet
          </Button>
        </div>
      ) : (
        <Card className="bg-card/50 border-border p-4 flex flex-col items-center text-center">
          {isCreating ? (
            <div className="flex flex-col items-center justify-center gap-3 py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent border-primary"></div>
              <span className="text-muted-foreground text-sm">
                Creating Solana wallet...
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-sm items-center">
              <Wallet className="h-8 w-8 text-primary/80" />
              <p className="text-muted-foreground">
                Create a Solana wallet to get started
              </p>
              <Button
                onClick={handleCreateWallet}
                disabled={isCreating}
                size="default"
                className="w-full mt-2 text-sm"
              >
                <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                {isCreating ? "Creating..." : "Create Solana Wallet"}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
