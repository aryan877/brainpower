import { Target, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { BundleAnalysisResponse } from "@repo/brainpower-agent";
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

interface BundleTypeIconProps {
  category: string;
  buyRatio: number;
}

function BundleTypeIcon({ buyRatio }: BundleTypeIconProps) {
  if (buyRatio > 0.7) {
    return <TrendingUp className="w-4 h-4 text-green-500" />;
  }
  if (buyRatio < 0.3) {
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  }
  return <Target className="w-4 h-4 text-yellow-500" />;
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "🎯 Snipers":
      return "rgb(234, 179, 8)";
    case "✅ Regular Buyers":
      return "rgb(34, 197, 94)";
    case "📉 Sellers":
      return "rgb(239, 68, 68)";
    default:
      return "rgb(147, 51, 234)";
  }
}

interface BubbleMapProps {
  bundles: BundleAnalysisResponse["bundles"];
  onSelectBundle: (index: number) => void;
  selectedBundle: number | null;
}

function BubbleMap({
  bundles,
  onSelectBundle,
  selectedBundle,
}: BubbleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredBundle, setHoveredBundle] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Constants for consistent sizing
  const BUBBLE_BASE_SIZE = 180;
  const MIN_SCALE_RATIO = 0.85;
  const SPACING_FACTOR = 1.5;

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        // Make bubbles smaller on mobile
        const mobileBubbleSize = Math.min(width * 0.8, BUBBLE_BASE_SIZE);
        const actualBubbleSize =
          width < 640 ? mobileBubbleSize : BUBBLE_BASE_SIZE;

        // Ensure height is enough to fit bubbles comfortably
        const minHeight = Math.max(500, actualBubbleSize * 2.5);
        const height = Math.max(minHeight, window.innerHeight * 0.7);
        setDimensions({
          width,
          height,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Handle touch/mouse interactions
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const pos = "touches" in e ? e.touches[0] : e;
    setStartPos({ x: pos.clientX - position.x, y: pos.clientY - position.y });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const pos = "touches" in e ? e.touches[0] : e;
    setPosition({
      x: pos.clientX - startPos.x,
      y: pos.clientY - startPos.y,
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Calculate bubble sizes with more consistency and mobile responsiveness
  const maxSolAmount = Math.max(...bundles.map((b) => b.totalSolAmount));

  const getBubbleSize = (solAmount: number) => {
    const sizeRatio =
      MIN_SCALE_RATIO + (solAmount / maxSolAmount) * (1 - MIN_SCALE_RATIO);
    const baseSize =
      dimensions.width < 640
        ? Math.min(dimensions.width * 0.8, BUBBLE_BASE_SIZE)
        : BUBBLE_BASE_SIZE;
    return baseSize * sizeRatio;
  };

  // Calculate positions with better spacing and mobile responsiveness
  const positions = bundles.map((bundle, index) => {
    const size = getBubbleSize(bundle.totalSolAmount);
    const angle = (index / bundles.length) * 2 * Math.PI;
    const baseRadius =
      Math.min(dimensions.width, dimensions.height) *
      (dimensions.width < 640 ? 0.25 : 0.35);
    const radius = Math.max(
      baseRadius,
      (size * bundles.length * SPACING_FACTOR) / (2 * Math.PI)
    );

    return {
      x: dimensions.width / 2 + Math.cos(angle) * radius,
      y: dimensions.height / 2 + Math.sin(angle) * radius,
      size,
    };
  });

  // Update the renderBubbleContent function
  const renderBubbleContent = (
    bundle: BundleAnalysisResponse["bundles"][0],
    buyRatio: number,
    size: number
  ) => {
    // Scale text and padding based on bubble size
    const isSmall = size < 120;
    const isTiny = size < 80;

    return (
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-1`}
        style={{
          padding: isTiny ? "0.5rem" : isSmall ? "0.75rem" : "1.5rem",
        }}
      >
        <span
          className={`font-bold uppercase tracking-wide ${
            isTiny ? "text-[8px]" : isSmall ? "text-[10px]" : "text-xs"
          }`}
          style={{ color: getCategoryColor(bundle.category) }}
        >
          {bundle.category.replace(/[^a-zA-Z]/g, "")}
        </span>
        <BundleTypeIcon category={bundle.category} buyRatio={buyRatio} />
        <span
          className={`font-bold ${
            isTiny ? "text-sm" : isSmall ? "text-base" : "text-lg"
          }`}
        >
          {bundle.totalSolAmount.toFixed(1)} SOL
        </span>
        <div className="flex gap-1">
          <span
            className={`bg-green-500/10 text-green-500 px-1.5 rounded-full ${
              isTiny ? "text-[8px]" : isSmall ? "text-[10px]" : "text-xs"
            }`}
          >
            {bundle.trades.filter((t) => t.is_buy).length}↑
          </span>
          {bundle.trades.filter((t) => !t.is_buy).length > 0 && (
            <span
              className={`bg-red-500/10 text-red-500 px-1.5 rounded-full ${
                isTiny ? "text-[8px]" : isSmall ? "text-[10px]" : "text-xs"
              }`}
            >
              {bundle.trades.filter((t) => !t.is_buy).length}↓
            </span>
          )}
        </div>
        {!isTiny && (
          <span
            className={`bg-black/20 text-muted-foreground px-1.5 rounded-full ${
              isSmall ? "text-[10px]" : "text-xs"
            }`}
          >
            {bundle.uniqueWallets}{" "}
            {bundle.uniqueWallets === 1 ? "wallet" : "wallets"}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className="w-full relative bg-gradient-to-br from-background/50 to-background rounded-xl overflow-hidden"
      style={{ height: dimensions.height }}
    >
      <div
        ref={containerRef}
        className="absolute inset-0 touch-none outline-none"
        tabIndex={0}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-4 opacity-5"
          style={{
            transform: `translate(${position.x * 0.15}px, ${position.y * 0.15}px) scale(1.1)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          {Array.from({ length: 84 }).map((_, i) => (
            <div key={i} className="border border-primary/20 rounded-sm" />
          ))}
        </div>

        {/* Bubbles container */}
        <motion.div
          className="absolute inset-0"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          {bundles.map((bundle, index) => {
            const { x, y, size } = positions[index];
            const buyRatio =
              bundle.trades.filter((t) => t.is_buy).length /
              bundle.trades.length;
            const isHovered = hoveredBundle === index;
            const isSelected = selectedBundle === index;

            return (
              <motion.div
                key={bundle.slot}
                initial={{ scale: 1 }}
                animate={{ scale: isHovered || isSelected ? 1.1 : 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: x, top: y }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBundle(index);
                  if (containerRef.current) {
                    containerRef.current.blur();
                    containerRef.current.tabIndex = -1;
                    setTimeout(() => {
                      if (containerRef.current) {
                        containerRef.current.tabIndex = 0;
                      }
                    }, 100);
                  }
                }}
                onMouseEnter={() => setHoveredBundle(index)}
                onMouseLeave={() => setHoveredBundle(null)}
              >
                <motion.div
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: `${getCategoryColor(bundle.category)}20`,
                    border: `2px solid ${getCategoryColor(bundle.category)}`,
                    boxShadow:
                      selectedBundle === index
                        ? `0 0 30px ${getCategoryColor(bundle.category)}`
                        : "none",
                    borderRadius: "50%",
                    backdropFilter: "blur(8px)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  className="flex items-center justify-center"
                >
                  {renderBubbleContent(bundle, buyRatio, size)}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={() => setScale(Math.min(scale + 0.2, 3))}
            className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-md border border-border/50 flex items-center justify-center text-primary hover:bg-background transition-colors shadow-lg"
          >
            +
          </button>
          <button
            onClick={() => setScale(Math.max(scale - 0.2, 0.5))}
            className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-md border border-border/50 flex items-center justify-center text-primary hover:bg-background transition-colors shadow-lg"
          >
            -
          </button>
        </div>
      </div>
    </div>
  );
}

export function BundleAnalysisSuccess({
  data: initialData,
}: BundleAnalysisSuccessProps) {
  const { data = initialData } = useBundleAnalysis(initialData.mint);
  const [selectedBundle, setSelectedBundle] = useState<number | null>(null);

  if (!data?.bundles || data.bundles.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-background to-background border-border">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            No trading bundles were detected.
          </p>
        </CardContent>
      </Card>
    );
  }

  const topBundles = data.bundles.slice(0, 5);
  const currentBundle =
    selectedBundle !== null ? topBundles[selectedBundle] : null;

  return (
    <Card className="bg-gradient-to-br from-background to-background border-border">
      <CardContent className="pt-6 space-y-6">
        {/* Disclaimer */}
        <div className="p-3 rounded-lg bg-card/5 border border-border/50">
          <p className="text-xs text-muted-foreground">
            Note: This analysis only includes trades from the bonding curve
            contract on Pump.fun. Post-graduation trading data is not included.
          </p>
        </div>

        {/* Bundle Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Top 5 Bundles</h3>
            <span className="text-sm text-muted-foreground">
              {data.totalTrades} total trades
            </span>
          </div>

          {/* Bubble Map Visualization */}
          <BubbleMap
            bundles={topBundles}
            onSelectBundle={setSelectedBundle}
            selectedBundle={selectedBundle}
          />
        </div>

        {/* Bundle Details Panel */}
        <AnimatePresence>
          {currentBundle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-4 pt-2"
            >
              <div className="flex items-center justify-between">
                <h2
                  className="text-xl font-semibold"
                  style={{ color: getCategoryColor(currentBundle.category) }}
                >
                  Bundle Details #
                  {selectedBundle !== null ? selectedBundle + 1 : ""}
                </h2>
                <span className="text-sm text-muted-foreground">
                  Slot {currentBundle.slot}
                </span>
              </div>

              {/* Token Flow */}
              <div className="rounded-lg border border-border/50 overflow-hidden bg-card/5">
                <div className="px-4 py-3 border-b border-border/50">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-sm font-medium truncate">
                        Token Flow
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        Slot {currentBundle.slot}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Supply Impact
                    </span>
                  </div>
                </div>
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-green-500">Buys</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-500">
                        +
                        {formatAmount(
                          currentBundle.trades
                            .filter((t) => t.is_buy)
                            .reduce((sum, t) => sum + t.token_amount, 0)
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          (currentBundle.trades
                            .filter((t) => t.is_buy)
                            .reduce((sum, t) => sum + t.token_amount, 0) /
                            1e15) *
                          100
                        ).toFixed(2)}
                        % of supply
                      </div>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-red-500">Sells</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-500">
                        -
                        {formatAmount(
                          currentBundle.trades
                            .filter((t) => !t.is_buy)
                            .reduce((sum, t) => sum + t.token_amount, 0)
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          (currentBundle.trades
                            .filter((t) => !t.is_buy)
                            .reduce((sum, t) => sum + t.token_amount, 0) /
                            1e15) *
                          100
                        ).toFixed(2)}
                        % of supply
                      </div>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-border/50">
                    <span className="text-sm">Net Flow</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatAmount(
                          currentBundle.trades.reduce(
                            (sum, t) =>
                              sum +
                              (t.is_buy ? t.token_amount : -t.token_amount),
                            0
                          )
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          (currentBundle.trades.reduce(
                            (sum, t) =>
                              sum +
                              (t.is_buy ? t.token_amount : -t.token_amount),
                            0
                          ) /
                            1e15) *
                          100
                        ).toFixed(2)}
                        % of supply
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trade History */}
              <div className="rounded-lg border border-border/50 overflow-hidden bg-card/5">
                <div className="px-4 py-3 border-b border-border/50">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-3 min-w-0">
                      <h3 className="text-sm font-medium truncate">
                        Trade History
                      </h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        Slot {currentBundle.slot}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {currentBundle.trades.length} transactions
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    {/* Table Header */}
                    <div className="px-4 py-2 border-b border-border/50 bg-card/5">
                      <div className="grid grid-cols-[2fr,1fr,1fr,auto] gap-3 items-center">
                        <div className="text-xs font-medium text-muted-foreground">
                          Wallet
                        </div>
                        <div className="text-xs font-medium text-muted-foreground text-right">
                          Amount
                        </div>
                        <div className="text-xs font-medium text-muted-foreground text-right">
                          SOL
                        </div>
                        <div className="text-xs font-medium text-muted-foreground text-right w-10">
                          Link
                        </div>
                      </div>
                    </div>
                    {/* Table Body */}
                    <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10">
                      {currentBundle.trades.map((trade, index) => (
                        <div
                          key={`${trade.signature}-${index}`}
                          className="px-4 py-2 grid grid-cols-[2fr,1fr,1fr,auto] gap-3 items-center hover:bg-card/5 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-1.5 h-1.5 flex-shrink-0 rounded-full ${
                                trade.is_buy ? "bg-green-500" : "bg-red-500"
                              }`}
                            />
                            <div className="flex items-center gap-1.5 min-w-0 truncate">
                              <span className="font-mono text-xs truncate">
                                {trade.user.slice(0, 6)}...
                                {trade.user.slice(-4)}
                              </span>
                              {trade.username && (
                                <span className="text-primary text-xs truncate hidden sm:inline">
                                  @{trade.username}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right whitespace-nowrap">
                            <span
                              className={`text-xs font-medium ${
                                trade.is_buy ? "text-green-500" : "text-red-500"
                              }`}
                            >
                              {trade.is_buy ? "+" : "-"}
                              {formatAmount(trade.token_amount)}
                            </span>
                          </div>
                          <div className="text-right whitespace-nowrap">
                            <span className="text-xs font-medium">
                              {(trade.sol_amount / 1e9).toFixed(2)} SOL
                            </span>
                          </div>
                          <div className="flex justify-end w-10">
                            <a
                              href={`https://solscan.io/tx/${trade.signature}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-muted-foreground/60 hover:text-primary rounded-md hover:bg-primary/10 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet Positions */}
              <div className="rounded-lg border border-border/50 overflow-hidden bg-card/5">
                <div className="px-4 py-3 border-b border-border/50">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-3 min-w-0">
                      <h3 className="text-sm font-medium truncate">
                        Wallet Positions
                      </h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {Object.keys(currentBundle.walletSummaries).length}{" "}
                        wallets
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground italic whitespace-nowrap">
                      * Holdings include non-bundled transactions
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[700px]">
                    {/* Table Header */}
                    <div className="px-4 py-2 border-b border-border/50 bg-card/5">
                      <div className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-3 items-center">
                        <div className="text-xs font-medium text-muted-foreground">
                          Wallet
                        </div>
                        <div className="text-xs font-medium text-muted-foreground text-right">
                          Current Holdings*
                        </div>
                        <div className="text-xs font-medium text-muted-foreground text-right">
                          Total Purchased
                        </div>
                        <div className="text-xs font-medium text-muted-foreground text-right">
                          Total Sold
                        </div>
                        <div className="text-xs font-medium text-muted-foreground text-right w-10">
                          Link
                        </div>
                      </div>
                    </div>
                    {/* Table Body */}
                    <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10">
                      {Object.entries(currentBundle.walletSummaries).map(
                        ([wallet, summary], index) => (
                          <div
                            key={`${wallet}-${index}`}
                            className="px-4 py-2 grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-3 items-center hover:bg-card/5 transition-colors group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-1.5 h-1.5 flex-shrink-0 rounded-full ${
                                  summary.currentBalance > 0
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              />
                              <div className="flex items-center gap-1.5 min-w-0 truncate">
                                <span className="font-mono text-xs truncate group-hover:text-primary transition-colors">
                                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                                </span>
                                {summary.username && (
                                  <span className="text-primary text-xs truncate hidden sm:inline">
                                    @{summary.username}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right whitespace-nowrap">
                              <span
                                className={`text-xs font-medium ${
                                  summary.currentBalance > 0
                                    ? "text-green-500"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {formatAmount(summary.currentBalance)}
                              </span>
                            </div>
                            <div className="text-right whitespace-nowrap">
                              <span className="text-xs font-medium text-green-500">
                                {formatAmount(summary.totalBought)}
                              </span>
                            </div>
                            <div className="text-right whitespace-nowrap">
                              <span className="text-xs font-medium text-red-500">
                                {formatAmount(summary.totalSold)}
                              </span>
                            </div>
                            <div className="flex justify-end w-10">
                              <a
                                href={`https://solscan.io/account/${wallet}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-muted-foreground/60 hover:text-primary rounded-md hover:bg-primary/10 transition-colors"
                                title="View on Solscan"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
