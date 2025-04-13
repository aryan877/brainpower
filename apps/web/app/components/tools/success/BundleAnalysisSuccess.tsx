import { Card, CardContent } from "@/components/ui/card";
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
      return "#FFD700"; // Gold color for snipers
    case "✅ Regular Buyers":
      return "#36D399"; // Green for buyers
    case "📉 Sellers":
      return "#F87272"; // Red for sellers
    default:
      return "#A78BFA"; // Purple for mixed
  }
}

function getCategoryTextColor(category: string): string {
  if (category === "🎯 Snipers") return "text-yellow-400";
  if (category === "✅ Regular Buyers") return "text-green-400";
  if (category === "📉 Sellers") return "text-red-400";
  return "text-purple-400";
}

function getCategoryBgColor(category: string): string {
  if (category === "🎯 Snipers") return "bg-yellow-400/10";
  if (category === "✅ Regular Buyers") return "bg-green-400/10";
  if (category === "📉 Sellers") return "bg-red-400/10";
  return "bg-purple-400/10";
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
  const categoryTextColor = getCategoryTextColor(bundle.category);
  const categoryBgColor = getCategoryBgColor(bundle.category);
  const label = getBundleLabel(bundle.category);

  return (
    <tr
      className={`border-b border-gray-800 cursor-pointer transition-all duration-200 ${
        isSelected ? "bg-gray-900" : "hover:bg-gray-900/50"
      }`}
      onClick={onClick}
    >
      <td className="py-3 pl-4 pr-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? "ring-2" : ""}`}
            style={{
              backgroundColor: `${categoryColor}20`,
              color: categoryColor,
              ...(isSelected
                ? { boxShadow: `0 0 0 1px ${categoryColor}` }
                : {}),
            }}
          >
            {getCategoryIcon(bundle.category)}
          </div>
          <span className="font-medium text-white">#{index + 1}</span>
        </div>
      </td>
      <td className="py-3 px-2 text-white">
        {bundle.totalSolAmount.toFixed(1)} SOL
      </td>
      <td className="py-3 px-2 text-white">{bundle.uniqueWallets}</td>
      <td className="py-3 px-2">
        <div className="flex gap-2 items-center">
          {buyCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
              <ArrowUpCircle className="w-3 h-3" />
              {buyCount}
            </div>
          )}
          {sellCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs">
              <ArrowDownCircle className="w-3 h-3" />
              {sellCount}
            </div>
          )}
        </div>
      </td>
      <td className="py-3 px-2">
        <div
          className={`px-2 py-1 rounded-full text-xs ${categoryBgColor} ${categoryTextColor} inline-block`}
        >
          {label}
        </div>
      </td>
      <td className="py-3 px-2 text-gray-400 text-right">SLOT {bundle.slot}</td>
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
            ? "text-gray-600 cursor-not-allowed"
            : "text-gray-400 hover:bg-gray-800"
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
              ? "bg-blue-500/20 text-blue-400"
              : "text-gray-400 hover:bg-gray-800"
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
            ? "text-gray-600 cursor-not-allowed"
            : "text-gray-400 hover:bg-gray-800"
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
    primary: "bg-blue-500/10",
    green: "bg-green-500/10",
    red: "bg-red-500/10",
    purple: "bg-purple-500/10",
  };

  const textColorMap = {
    primary: "text-blue-400",
    green: "text-green-400",
    red: "text-red-400",
    purple: "text-purple-400",
  };

  return (
    <div className="flex flex-col bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`p-2 rounded-full ${bgColorMap[color]} ${textColorMap[color]}`}
        >
          {icon}
        </div>
        <div className="text-sm text-gray-400">{title}</div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
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
  const categoryTextColor = getCategoryTextColor(bundle.category);
  const categoryBgColor = getCategoryBgColor(bundle.category);

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
      className="space-y-5 pt-6 mt-4 border-t border-gray-800"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">Bundle Details</h3>
          <div
            className={`px-2 py-1 text-xs rounded-full ${categoryBgColor} ${categoryTextColor}`}
          >
            {bundle.category}
          </div>
        </div>
        <div className="text-xs text-gray-400">Slot {bundle.slot}</div>
      </div>

      {/* Token Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Buy Volume</span>
          </div>
          <div className="text-lg font-semibold text-green-400">
            +{formatAmount(buySum)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {((buySum / 1e15) * 100).toFixed(4)}% of supply
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <ArrowDownCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-gray-400">Sell Volume</span>
          </div>
          <div className="text-lg font-semibold text-red-400">
            -{formatAmount(sellSum)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {((sellSum / 1e15) * 100).toFixed(4)}% of supply
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Net Flow</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {formatAmount(netFlow)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {((netFlow / 1e15) * 100).toFixed(4)}% of supply
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-white">Transactions</h4>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400">
            {bundle.trades.length} total
          </span>
        </div>
        <div className="overflow-x-auto bg-gray-900 rounded-lg border border-gray-800">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr className="bg-gray-850">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">
                  Wallet
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">
                  SOL
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 w-10">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {bundle.trades.slice(0, 5).map((trade, i) => (
                <tr
                  key={`${trade.signature}-${i}`}
                  className="hover:bg-gray-850"
                >
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${trade.is_buy ? "bg-green-400" : "bg-red-400"}`}
                      />
                      <span className="font-mono text-xs text-gray-300">
                        {trade.user.slice(0, 6)}...{trade.user.slice(-4)}
                      </span>
                      {trade.username && (
                        <span className="text-blue-400 text-xs hidden sm:inline">
                          @{trade.username}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-xs font-medium ${trade.is_buy ? "text-green-400" : "text-red-400"}`}
                    >
                      {trade.is_buy ? "+" : "-"}
                      {formatAmount(trade.token_amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-medium text-gray-300">
                      {(trade.sol_amount / 1e9).toFixed(2)} SOL
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`https://solscan.io/tx/${trade.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex p-1 text-gray-400 hover:text-blue-400"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bundle.trades.length > 5 && (
            <div className="p-2 text-center text-xs text-gray-400 border-t border-gray-800">
              + {bundle.trades.length - 5} more transactions
            </div>
          )}
        </div>
      </div>

      {/* Wallets Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-white">Wallet Positions</h4>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400">
            {Object.keys(bundle.walletSummaries).length} wallets
          </span>
        </div>
        <div className="overflow-x-auto bg-gray-900 rounded-lg border border-gray-800">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr className="bg-gray-850">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">
                  Wallet
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">
                  Current Holdings*
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">
                  Total Purchased
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">
                  Total Sold
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 w-10">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {Object.entries(bundle.walletSummaries)
                .slice(0, 5)
                .map(([wallet, summary], i) => (
                  <tr key={`${wallet}-${i}`} className="hover:bg-gray-850">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${summary.currentBalance > 0 ? "bg-green-400" : "bg-red-400"}`}
                        />
                        <span className="font-mono text-xs text-gray-300">
                          {wallet.slice(0, 6)}...{wallet.slice(-4)}
                        </span>
                        {summary.username && (
                          <span className="text-blue-400 text-xs hidden sm:inline">
                            @{summary.username}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-xs font-medium ${summary.currentBalance > 0 ? "text-green-400" : "text-gray-400"}`}
                      >
                        {formatAmount(summary.currentBalance)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-medium text-green-400">
                        {formatAmount(summary.totalBought)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-medium text-red-400">
                        {formatAmount(summary.totalSold)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`https://solscan.io/account/${wallet}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex p-1 text-gray-400 hover:text-blue-400"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {Object.keys(bundle.walletSummaries).length > 5 && (
            <div className="p-2 text-center text-xs text-gray-400 border-t border-gray-800">
              + {Object.keys(bundle.walletSummaries).length - 5} more wallets
            </div>
          )}
          <div className="p-2 text-xs text-gray-400 border-t border-gray-800">
            * Holdings include non-bundled transactions
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Main component
export function BundleAnalysisSuccess({
  data: initialData,
}: BundleAnalysisSuccessProps) {
  const { data = initialData } = useBundleAnalysis(initialData.mint);
  const [selectedBundle, setSelectedBundle] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const BUNDLES_PER_PAGE = 10;

  if (!data?.bundles || data.bundles.length === 0) {
    return (
      <Card className="w-full bg-gray-950 border-gray-800 text-white">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-400">
            No trading bundles were detected.
          </p>
        </CardContent>
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
    <Card className="w-full bg-gray-950 border-gray-800 text-white overflow-hidden">
      <CardContent className="pt-6 space-y-6">
        {/* Header with icon */}
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-red-500/10 rounded-md" />
            <BarChart3 className="w-7 h-7 text-red-500 relative z-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Trading Analysis</h3>
            <p className="text-sm text-gray-400">
              Analyzing {data.totalTrades} trades across {bundles.length}{" "}
              trading bundles
            </p>
          </div>
        </div>

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
        <div className="p-3 rounded bg-red-500/5 border border-red-500/20 text-sm text-gray-400">
          Note: This analysis only includes trades from the bonding curve
          contract on Pump.fun. Post-graduation trading data is not included.
        </div>

        {/* Bundle Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-white">Trading Bundles</h4>
            <div className="text-xs text-gray-400">
              Showing {currentPage * BUNDLES_PER_PAGE + 1}-
              {Math.min((currentPage + 1) * BUNDLES_PER_PAGE, bundles.length)}{" "}
              of {bundles.length}
            </div>
          </div>

          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-900/50">
                  <tr className="border-b border-gray-800">
                    <th className="py-3 pl-4 pr-2 text-left text-xs font-medium text-gray-400">
                      Bundle
                    </th>
                    <th className="py-3 px-2 text-left text-xs font-medium text-gray-400">
                      Value
                    </th>
                    <th className="py-3 px-2 text-left text-xs font-medium text-gray-400">
                      Wallets
                    </th>
                    <th className="py-3 px-2 text-left text-xs font-medium text-gray-400">
                      Transactions
                    </th>
                    <th className="py-3 px-2 text-left text-xs font-medium text-gray-400">
                      Type
                    </th>
                    <th className="py-3 px-2 text-right text-xs font-medium text-gray-400">
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
