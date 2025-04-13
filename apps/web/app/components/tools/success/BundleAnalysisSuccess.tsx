import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BundleAnalysisResponse } from "@repo/brainpower-agent";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  CircleDollarSign,
  Crosshair,
  ExternalLink,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useBundleAnalysis } from "../../../hooks/pumpfun";

interface BundleAnalysisSuccessProps {
  data: BundleAnalysisResponse;
}

function formatAmount(amount: number, decimals: number = 6): string {
  const value = amount / Math.pow(10, decimals);
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "🎯 Snipers":
      return <Crosshair className="w-4 h-4" />;
    case "✅ Regular Buyers":
      return <TrendingUp className="w-4 h-4" />;
    case "📉 Sellers":
      return <TrendingDown className="w-4 h-4" />;
    default:
      return <CircleDollarSign className="w-4 h-4" />;
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "🎯 Snipers":
      return "text-yellow-500 bg-yellow-500/10";
    case "✅ Regular Buyers":
      return "text-green-500 bg-green-500/10";
    case "📉 Sellers":
      return "text-red-500 bg-red-500/10";
    default:
      return "text-primary bg-primary/10";
  }
}

function getBundleLabel(category: string): string {
  if (category === "🎯 Snipers") return "Snipers";
  if (category === "✅ Regular Buyers") return "Regular";
  if (category === "📉 Sellers") return "Sellers";
  return "Mixed";
}

// Compact bundle row component that works better for many bundles
function BundleRow({
  bundle,
  index,
  isSelected,
  onClick,
}: {
  bundle: BundleAnalysisResponse["bundles"][0];
  index: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const buyCount = bundle.trades.filter((t) => t.is_buy).length;
  const sellCount = bundle.trades.filter((t) => !t.is_buy).length;
  const categoryColor = getCategoryColor(bundle.category);
  const label = getBundleLabel(bundle.category);

  return (
    <tr
      className={`border-b border-border/50 cursor-pointer transition-all duration-200 ${
        isSelected ? "bg-primary/5" : "hover:bg-card/90"
      }`}
      onClick={onClick}
    >
      <td className="py-3 pl-4 pr-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${categoryColor}`}
          >
            {getCategoryIcon(bundle.category)}
          </div>
          <span className="font-medium">#{index + 1}</span>
        </div>
      </td>
      <td className="py-3 px-2">{bundle.totalSolAmount.toFixed(1)} SOL</td>
      <td className="py-3 px-2">{bundle.uniqueWallets}</td>
      <td className="py-3 px-2">
        <div className="flex gap-2 items-center">
          {buyCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs">
              <ArrowUpCircle className="w-3 h-3" />
              {buyCount}
            </div>
          )}
          {sellCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs">
              <ArrowDownCircle className="w-3 h-3" />
              {sellCount}
            </div>
          )}
        </div>
      </td>
      <td className="py-3 px-2">
        <div
          className={`px-2 py-1 rounded-full text-xs ${categoryColor} inline-block`}
        >
          {label}
        </div>
      </td>
      <td className="py-3 px-2 text-muted-foreground text-right">
        SLOT {bundle.slot}
      </td>
    </tr>
  );
}

// Pagination controls component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={`p-2 rounded-md ${
          currentPage === 0
            ? "text-muted-foreground/30 cursor-not-allowed"
            : "text-muted-foreground hover:bg-muted/50"
        }`}
      >
        ← Prev
      </button>

      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-8 h-8 rounded-md ${
            i === currentPage
              ? "bg-primary/20 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted/50"
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className={`p-2 rounded-md ${
          currentPage === totalPages - 1
            ? "text-muted-foreground/30 cursor-not-allowed"
            : "text-muted-foreground hover:bg-muted/50"
        }`}
      >
        Next →
      </button>
    </div>
  );
}

// Stats card for overview
function StatsCard({
  title,
  value,
  icon,
  color = "primary",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color?: "primary" | "green" | "red" | "purple";
}) {
  const bgColorMap = {
    primary: "bg-primary/10",
    green: "bg-green-500/10",
    red: "bg-red-500/10",
    purple: "bg-purple-500/10",
  };

  const textColorMap = {
    primary: "text-primary",
    green: "text-green-500",
    red: "text-red-500",
    purple: "text-purple-500",
  };

  return (
    <div className="bg-card rounded-md p-4 border border-border/50 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`p-2 rounded-md ${bgColorMap[color]} ${textColorMap[color]}`}
        >
          {icon}
        </div>
        <div className="text-sm text-muted-foreground">{title}</div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

// Detailed section with animated transitions
function BundleDetails({
  bundle,
  index,
}: {
  bundle: BundleAnalysisResponse["bundles"][0];
  index: number;
}) {
  const categoryColor = getCategoryColor(bundle.category);

  // Calculate buy/sell sums
  const buySum = bundle.trades
    .filter((t) => t.is_buy)
    .reduce((sum, t) => sum + t.token_amount, 0);

  const sellSum = bundle.trades
    .filter((t) => !t.is_buy)
    .reduce((sum, t) => sum + t.token_amount, 0);

  const netFlow = bundle.trades.reduce(
    (sum, t) => sum + (t.is_buy ? t.token_amount : -t.token_amount),
    0
  );

  return (
    <motion.div
      key={`details-${index}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-5 pt-6 mt-4 border-t border-border/50"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Bundle Details
          </h3>
          <div className={`px-2 py-1 text-xs rounded-full ${categoryColor}`}>
            {bundle.category}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">Slot {bundle.slot}</div>
      </div>

      {/* Token Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-md p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Buy Volume</span>
          </div>
          <div className="text-lg font-bold text-green-500">
            +{formatAmount(buySum)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {((buySum / 1e15) * 100).toFixed(4)}% of supply
          </div>
        </div>

        <div className="bg-card rounded-md p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <ArrowDownCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-muted-foreground">Sell Volume</span>
          </div>
          <div className="text-lg font-bold text-red-500">
            -{formatAmount(sellSum)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {((sellSum / 1e15) * 100).toFixed(4)}% of supply
          </div>
        </div>

        <div className="bg-card rounded-md p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Net Flow</span>
          </div>
          <div className="text-lg font-bold">{formatAmount(netFlow)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {((netFlow / 1e15) * 100).toFixed(4)}% of supply
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Transactions</h4>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
            {bundle.trades.length} total
          </span>
        </div>
        <div className="overflow-x-auto bg-card rounded-lg border border-border/50">
          <table className="min-w-full">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Wallet
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  SOL
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground w-10">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {bundle.trades.slice(0, 5).map((trade, i) => (
                <tr
                  key={`${trade.signature}-${i}`}
                  className="hover:bg-muted/20"
                >
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${trade.is_buy ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span className="font-mono text-xs">
                        {trade.user.slice(0, 6)}...{trade.user.slice(-4)}
                      </span>
                      {trade.username && (
                        <span className="text-primary text-xs hidden sm:inline">
                          @{trade.username}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-xs font-medium ${trade.is_buy ? "text-green-500" : "text-red-500"}`}
                    >
                      {trade.is_buy ? "+" : "-"}
                      {formatAmount(trade.token_amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-medium">
                      {(trade.sol_amount / 1e9).toFixed(2)} SOL
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`https://solscan.io/tx/${trade.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex p-1 text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bundle.trades.length > 5 && (
            <div className="p-2 text-center text-xs text-muted-foreground bg-muted/10 border-t border-border/50">
              + {bundle.trades.length - 5} more transactions
            </div>
          )}
        </div>
      </div>

      {/* Wallets Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Wallet Positions</h4>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
            {Object.keys(bundle.walletSummaries).length} wallets
          </span>
        </div>
        <div className="overflow-x-auto bg-card rounded-lg border border-border/50">
          <table className="min-w-full">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Wallet
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Current Holdings*
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Total Purchased
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Total Sold
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground w-10">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {Object.entries(bundle.walletSummaries)
                .slice(0, 5)
                .map(([wallet, summary], i) => (
                  <tr key={`${wallet}-${i}`} className="hover:bg-muted/20">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${summary.currentBalance > 0 ? "bg-green-500" : "bg-red-500"}`}
                        />
                        <span className="font-mono text-xs">
                          {wallet.slice(0, 6)}...{wallet.slice(-4)}
                        </span>
                        {summary.username && (
                          <span className="text-primary text-xs hidden sm:inline">
                            @{summary.username}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-xs font-medium ${summary.currentBalance > 0 ? "text-green-500" : "text-muted-foreground"}`}
                      >
                        {formatAmount(summary.currentBalance)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-medium text-green-500">
                        {formatAmount(summary.totalBought)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-medium text-red-500">
                        {formatAmount(summary.totalSold)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`https://solscan.io/account/${wallet}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex p-1 text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {Object.keys(bundle.walletSummaries).length > 5 && (
            <div className="p-2 text-center text-xs text-muted-foreground bg-muted/10 border-t border-border/50">
              + {Object.keys(bundle.walletSummaries).length - 5} more wallets
            </div>
          )}
          <div className="p-2 text-xs text-muted-foreground bg-muted/10 border-t border-border/50">
            * Holdings include non-bundled transactions
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function BundleAnalysisSuccess({
  data: initialData,
}: BundleAnalysisSuccessProps) {
  const { data = initialData } = useBundleAnalysis(initialData.mint);
  const [selectedBundle, setSelectedBundle] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const BUNDLES_PER_PAGE = 10;

  if (!data?.bundles || data.bundles.length === 0) {
    return (
      <Card className="w-full max-w-full overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background border-none shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0 flex items-center p-3 bg-primary/10 rounded-md">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Trading Analysis
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                No trading bundles were detected.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Use all bundles instead of just top 5
  const bundles = data.bundles;
  const totalPages = Math.ceil(bundles.length / BUNDLES_PER_PAGE);
  const currentBundles = bundles.slice(
    currentPage * BUNDLES_PER_PAGE,
    (currentPage + 1) * BUNDLES_PER_PAGE
  );

  const currentBundle =
    selectedBundle !== null ? bundles[selectedBundle] : null;

  // Calculate totals for overview stats
  const totalSolVolume = bundles.reduce((sum, b) => sum + b.totalSolAmount, 0);
  const totalBuys = bundles.reduce(
    (sum, b) => sum + b.trades.filter((t) => t.is_buy).length,
    0
  );
  const totalSells = bundles.reduce(
    (sum, b) => sum + b.trades.filter((t) => !t.is_buy).length,
    0
  );
  const uniqueWallets = new Set(
    bundles.flatMap((b) => Object.keys(b.walletSummaries))
  ).size;

  return (
    <Card className="w-full max-w-full overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background border-none shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0 flex items-center p-3 bg-primary/10 rounded-md">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Trading Analysis
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Analyzing {data.totalTrades} trades across {bundles.length}{" "}
              trading bundles
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard
            title="Total Volume"
            value={`${totalSolVolume.toFixed(2)} SOL`}
            icon={<CircleDollarSign className="w-5 h-5" />}
            color="primary"
          />
          <StatsCard
            title="Buy Transactions"
            value={totalBuys.toString()}
            icon={<ArrowUpCircle className="w-5 h-5" />}
            color="green"
          />
          <StatsCard
            title="Sell Transactions"
            value={totalSells.toString()}
            icon={<ArrowDownCircle className="w-5 h-5" />}
            color="red"
          />
          <StatsCard
            title="Unique Wallets"
            value={uniqueWallets.toString()}
            icon={<Users className="w-5 h-5" />}
            color="purple"
          />
        </div>

        {/* Disclaimer Note */}
        <div className="p-3 rounded bg-primary/5 border border-primary/10 text-sm text-muted-foreground">
          Note: This analysis only includes trades from the bonding curve
          contract on Pump.fun. Post-graduation trading data is not included.
        </div>

        {/* Bundle Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Trading Bundles</h4>
            <div className="text-xs text-muted-foreground">
              Showing {currentPage * BUNDLES_PER_PAGE + 1}-
              {Math.min((currentPage + 1) * BUNDLES_PER_PAGE, bundles.length)}{" "}
              of {bundles.length}
            </div>
          </div>

          <div className="border border-border/50 rounded-lg overflow-hidden bg-card/50">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-muted/30">
                  <tr className="border-b border-border/50">
                    <th className="py-3 pl-4 pr-2 text-left text-xs font-medium text-muted-foreground">
                      Bundle
                    </th>
                    <th className="py-3 px-2 text-left text-xs font-medium text-muted-foreground">
                      Value
                    </th>
                    <th className="py-3 px-2 text-left text-xs font-medium text-muted-foreground">
                      Wallets
                    </th>
                    <th className="py-3 px-2 text-left text-xs font-medium text-muted-foreground">
                      Transactions
                    </th>
                    <th className="py-3 px-2 text-left text-xs font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="py-3 px-2 text-right text-xs font-medium text-muted-foreground">
                      Slot
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentBundles.map((bundle, idx) => (
                    <BundleRow
                      key={bundle.slot}
                      bundle={bundle}
                      index={currentPage * BUNDLES_PER_PAGE + idx}
                      isSelected={
                        selectedBundle === currentPage * BUNDLES_PER_PAGE + idx
                      }
                      onClick={() =>
                        setSelectedBundle(currentPage * BUNDLES_PER_PAGE + idx)
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {/* Bundle Details Section */}
        <AnimatePresence mode="wait">
          {currentBundle && (
            <BundleDetails bundle={currentBundle} index={selectedBundle!} />
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
