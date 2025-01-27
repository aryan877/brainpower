"use client";

import { usePrivy, type WalletWithMetadata } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { Copy, Send, RefreshCw, Download } from "lucide-react";
import { useState } from "react";
import { useClusterStore } from "../store/clusterStore";
import { useWallet } from "../hooks/wallet";
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
import { AuthGuard } from "../components/AuthGuard";
import { AppLayout } from "../components/AppLayout";
import { useWalletModal } from "../providers/WalletProvider";

function WalletContent() {
  const { user, ready } = usePrivy();
  const { exportWallet } = useSolanaWallets();
  const { selectedCluster, setSelectedCluster } = useClusterStore();
  const {
    wallet,
    walletAddress,
    balance,
    isLoadingBalance,
    isRefetchingBalance,
    refreshBalance,
  } = useWallet();
  const [copied, setCopied] = useState(false);
  const { openWalletModal } = useWalletModal();

  const hasEmbeddedWallet = !!user?.linkedAccounts?.find(
    (account): account is WalletWithMetadata =>
      account.type === "wallet" &&
      account.walletClientType === "privy" &&
      account.chainType === "solana"
  );

  if (!ready) return null;

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!wallet) {
    return (
      <div className="p-4 md:p-8">
        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-4">No Wallet Connected</h1>
          <p className="text-muted-foreground">
            Please connect or create a wallet from the chat interface.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">My Wallet</h1>

          <div className="space-y-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Network
              </label>
              <Select
                value={selectedCluster}
                onValueChange={(value) => setSelectedCluster(value as Cluster)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mainnet-beta">Mainnet</SelectItem>
                  <SelectItem value="devnet">Devnet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Wallet Address
              </label>
              <Card className="p-4 flex items-center justify-between gap-2">
                <code className="text-sm break-all">{walletAddress}</code>
                <Tooltip open={copied}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={copyAddress}
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {copied ? "Copied!" : "Copy address"}
                  </TooltipContent>
                </Tooltip>
              </Card>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Actions
              </label>
              <Card className="p-4">
                <div className="flex gap-3">
                  <Button
                    onClick={() =>
                      walletAddress
                        ? exportWallet({ address: walletAddress })
                        : null
                    }
                    variant="outline"
                    size="default"
                    className="flex-1"
                    disabled={!walletAddress || !hasEmbeddedWallet}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    onClick={openWalletModal}
                    variant="default"
                    size="default"
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </Card>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Balance
              </label>
              <div className="flex items-center gap-2">
                <Card className="p-4 flex-1">
                  <span className="text-lg font-medium">
                    {isLoadingBalance
                      ? "Loading..."
                      : `${balance?.toFixed(4) || "0"} SOL`}
                  </span>
                </Card>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={refreshBalance}
                      disabled={isLoadingBalance || isRefetchingBalance}
                      variant="outline"
                      size="icon"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          isLoadingBalance || isRefetchingBalance
                            ? "animate-spin"
                            : ""
                        }`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh balance</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <p className="text-muted-foreground text-sm">
            Transaction history coming soon...
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <AuthGuard>
      <AppLayout selectedThread={null}>
        <WalletContent />
      </AppLayout>
    </AuthGuard>
  );
}
