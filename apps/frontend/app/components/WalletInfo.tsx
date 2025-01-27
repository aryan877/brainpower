"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import {
  Copy,
  Wallet,
  Plus,
  LogOut,
  Send,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { useClusterStore } from "../store/clusterStore";
import { useWallet, useStoreWallet } from "../hooks/wallet";
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
import { Cluster } from "@repo/brainpower-agent";
import Link from "next/link";
import { useWalletModal } from "../providers/WalletProvider";

interface WalletInfoProps {
  onLogoutClick: () => void;
}

export function WalletInfo({ onLogoutClick }: WalletInfoProps) {
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
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
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

      <div className="mb-3">
        <Select
          value={selectedCluster}
          onValueChange={(value) => setSelectedCluster(value as Cluster)}
        >
          <SelectTrigger className="w-full text-xs">
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mainnet-beta">Mainnet</SelectItem>
            <SelectItem value="devnet">Devnet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {wallet ? (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            <Card className="p-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Address</span>
                <Tooltip open={copied}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={copyAddress}
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {copied ? "Copied!" : "Copy address"}
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="break-all text-foreground">{walletAddress}</div>
              <div className="pt-1">
                <Link href="/wallet" className="no-underline w-full block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs h-7 flex items-center justify-between hover:bg-accent"
                  >
                    <span className="text-muted-foreground">Manage Wallet</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Status:</span>
            <Card className="px-2 py-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
              Connected
            </Card>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Balance:</span>
            <div className="flex items-center gap-2">
              <Card className="px-2 py-1">
                {isLoadingBalance
                  ? "Loading..."
                  : `${balance?.toFixed(4) || "0"} SOL`}
              </Card>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={refreshBalance}
                    disabled={isLoadingBalance || isRefetchingBalance}
                    variant="ghost"
                    size="sm"
                    className="p-1.5 h-auto"
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
                    onClick={openWalletModal}
                    variant="ghost"
                    size="sm"
                    className="p-1.5 h-auto"
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
        <Card className="p-3">
          {isCreating ? (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-primary" />
              <span>Creating Solana wallet...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <p>Create a Solana wallet to get started</p>
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
        </Card>
      )}
    </div>
  );
}
