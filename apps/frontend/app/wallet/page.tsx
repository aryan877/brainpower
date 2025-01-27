"use client";

import { usePrivy, type WalletWithMetadata } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import {
  Copy,
  ArrowUpRight,
  RefreshCw,
  Download,
  ExternalLink,
  Coins,
  FileIcon,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useClusterStore } from "../store/clusterStore";
import { useWallet, useTransactionHistory } from "../hooks/wallet";
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
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Transaction } from "../types/api/wallet";
import { useInfiniteQuery } from "@tanstack/react-query";
import { walletClient } from "../clients/wallet";
import { Asset } from "../types/api/wallet";
import { AssetTransferModal } from "../components/AssetTransferModal";
import Image from "next/image";

function TransactionList({
  transactions,
  isLoading,
  walletAddress,
  onLoadMore,
  hasMore,
  isLoadingMore,
  error,
}: {
  transactions: Transaction[];
  isLoading: boolean;
  walletAddress: string | undefined;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  error?: Error | null;
}) {
  // Helper function to get badge variant and label
  const getBadgeInfo = (tx: Transaction) => {
    // NFT transactions
    if (tx.events?.nft) {
      return {
        variant: "default" as const,
        label: tx.events.nft.type.replace("NFT_", ""),
        icon: "🎨",
      };
    }

    // Jupiter (DEX) transactions
    if (tx.source === "JUPITER") {
      return {
        variant: "outline" as const,
        label: "SWAP",
        icon: "🔄",
      };
    }

    // SPL Token transactions
    if (tx.source === "SOLANA_PROGRAM_LIBRARY") {
      return {
        variant: "default" as const,
        label: tx.type === "UNKNOWN" ? "TRANSFER" : tx.type.replace(/_/g, " "),
        icon: "💎",
      };
    }

    // Default/Unknown transactions
    return {
      variant: "secondary" as const,
      label: tx.type === "UNKNOWN" ? "TRANSFER" : tx.type.replace(/_/g, " "),
      icon: "💰",
    };
  };

  if (isLoading && !transactions.length) {
    return (
      <div className="space-y-2 min-h-[400px]">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 mb-2">{error.message}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!transactions?.length) {
    return (
      <p className="text-muted-foreground text-sm text-center">
        No transactions found for this wallet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
        Note: Only NFT, Jupiter, and SPL related transactions are shown. Some
        transactions may be missing due to data retrieval limitations.
      </div>

      <div className="space-y-2">
        {transactions.map((tx) => {
          const badgeInfo = getBadgeInfo(tx);
          return (
            <Card
              key={tx.signature}
              className="p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={badgeInfo.variant}
                    className="min-w-[100px] justify-center font-medium"
                  >
                    <span className="mr-1">{badgeInfo.icon}</span>
                    {badgeInfo.label}
                  </Badge>
                  {tx.nativeTransfers?.[0] && (
                    <span
                      className={
                        tx.nativeTransfers[0].fromUserAccount === walletAddress
                          ? "text-red-500"
                          : "text-green-500"
                      }
                    >
                      {tx.nativeTransfers[0].fromUserAccount === walletAddress
                        ? "-"
                        : "+"}
                      {(
                        tx.nativeTransfers[0].amount / LAMPORTS_PER_SOL
                      ).toFixed(4)}{" "}
                      SOL
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(tx.timestamp * 1000), {
                      addSuffix: true,
                    })}
                  </span>
                  <a
                    href={`https://solscan.io/tx/${tx.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={onLoadMore}
            variant="outline"
            size="sm"
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function AssetCard({ asset }: { asset: Asset }) {
  const { content, token_info } = asset;
  const name = token_info?.name || content?.metadata?.name || "Unknown Asset";
  const symbol = token_info?.symbol || content?.metadata?.symbol;
  const balance = token_info?.balance;
  const decimals = token_info?.decimals || 0;
  const imageUrl = content?.files?.[0]?.cdn_uri || content?.files?.[0]?.uri;
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <>
      <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
            {imageUrl && !imageError ? (
              <Image
                src={imageUrl}
                alt={name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="text-muted-foreground">
                {token_info ? (
                  <Coins className="w-6 h-6" />
                ) : (
                  <FileIcon className="w-6 h-6" />
                )}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium truncate">{name}</h3>
              {balance && (
                <p className="text-sm font-medium">
                  {(Number(balance) / Math.pow(10, decimals)).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between mt-1">
              {symbol && (
                <p className="text-sm text-muted-foreground">{symbol}</p>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTransferModal(true)}
                className="ml-auto"
              >
                Transfer
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AssetTransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        asset={asset}
        onSuccess={() => {
          setShowTransferModal(false);
          // Optionally trigger a refresh of the assets list
        }}
      />
    </>
  );
}

function AssetList({
  walletAddress,
  cluster,
}: {
  walletAddress: string;
  cluster: Cluster;
}) {
  const pageSize = 50;

  const {
    data,
    isLoading,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["assets", walletAddress, cluster],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      return walletClient.getAssets(walletAddress, {
        page: pageParam,
        limit: pageSize,
        displayOptions: {
          showFungible: true,
          showNativeBalance: true,
        },
      });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.result) return undefined;
      const { total, limit, page } = lastPage.result;
      const hasMore = total > page * limit;
      return hasMore ? page + 1 : undefined;
    },
    enabled: Boolean(walletAddress),
  });

  const allAssets = useMemo(() => {
    return data?.pages.flatMap((page) => page.result.items || []) || [];
  }, [data?.pages]);

  // Add refetch function
  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 mb-2">
          {error instanceof Error ? error.message : "Failed to load assets"}
        </p>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!allAssets?.length) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No assets found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {allAssets.length} {allAssets.length === 1 ? "asset" : "assets"} found
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleRefresh}
              disabled={isRefetching}
              variant="outline"
              size="icon"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh assets</TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-2">
        {allAssets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
            size="sm"
          >
            {isFetchingNextPage ? (
              <>
                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

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

  // Keep track of all loaded transactions
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [lastSignature, setLastSignature] = useState<string>();

  // Use transaction history hook directly
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isRefetching: isRefetching,
    refetch: refreshHistory,
    error: historyError,
  } = useTransactionHistory(walletAddress, { before: lastSignature });

  // Update allTransactions when new data comes in
  useEffect(() => {
    if (historyData?.transactions) {
      if (lastSignature) {
        // Append new transactions
        setAllTransactions((prev) => [...prev, ...historyData.transactions]);
      } else {
        // Reset transactions on fresh load
        setAllTransactions(historyData.transactions);
      }
    }
  }, [historyData?.transactions, lastSignature]);

  const [copied, setCopied] = useState(false);
  const { openWalletModal } = useWalletModal();

  const hasEmbeddedWallet = !!user?.linkedAccounts?.find(
    (account): account is WalletWithMetadata =>
      account.type === "wallet" &&
      account.walletClientType === "privy" &&
      account.chainType === "solana"
  );

  const hasMore = Boolean(historyData?.transactions?.length);

  const handleLoadMore = async () => {
    if (!historyData?.transactions?.length) return;
    const lastTx =
      historyData.transactions[historyData.transactions.length - 1];
    if (lastTx) {
      setLastSignature(lastTx.signature);
    }
  };

  const handleRefresh = async () => {
    setLastSignature(undefined);
    await refreshHistory();
  };

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
      <div className="space-y-6 max-w-4xl mx-auto">
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
                    <ArrowUpRight className="h-4 w-4 mr-2" />
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
          <h2 className="text-xl font-semibold mb-6">Assets</h2>
          <AssetList walletAddress={walletAddress} cluster={selectedCluster} />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Transaction History</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleRefresh}
                  disabled={isLoadingHistory || isRefetching}
                  variant="outline"
                  size="icon"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      isLoadingHistory || isRefetching ? "animate-spin" : ""
                    }`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh history</TooltipContent>
            </Tooltip>
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <TransactionList
              transactions={allTransactions}
              isLoading={isLoadingHistory}
              walletAddress={walletAddress}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              isLoadingMore={isRefetching}
              error={historyError instanceof Error ? historyError : null}
            />
          </ScrollArea>
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
