import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingTokensResponse } from "@repo/brainpower-agent";
import {
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";

interface TrendingTokensSuccessProps {
  data: TrendingTokensResponse;
}

const formatNumber = (num: number) => {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

export function TrendingTokensSuccess({ data }: TrendingTokensSuccessProps) {
  if (!data || !data.tokens || data.tokens.length === 0) {
    return (
      <Card className="w-full max-w-full overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background border-none shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0 flex items-center p-3 bg-primary/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Trending Tokens
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                No trending tokens found at the moment
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-full overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background border-none shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0 flex items-center p-3 bg-primary/10 rounded-xl">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Trending Tokens
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Most popular cryptocurrencies right now
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.tokens?.map((token) => (
            <div
              key={token.id}
              className="group relative bg-card hover:bg-card/90 rounded-xl border border-border/50 overflow-hidden transition-all duration-200 hover:shadow-lg"
            >
              {/* Main Content */}
              <div className="p-4 sm:p-6">
                {/* Token Header */}
                <div className="flex items-start gap-3 mb-4 sm:mb-6">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                    <Image
                      src={token.thumb}
                      alt={token.name}
                      width={48}
                      height={48}
                      className="rounded-xl ring-2 ring-border/50 w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0 max-w-[calc(100%-80px)]">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg sm:text-xl text-foreground truncate">
                          {token.name}
                        </h4>
                        <a
                          href={`https://www.coingecko.com/en/coins/${token.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary w-fit">
                        {token.symbol.toUpperCase()}
                      </span>
                    </div>
                    {token.marketCapRank > 0 && (
                      <div className="flex-shrink-0 bg-primary/5 px-2 sm:px-3 py-1.5 rounded-lg">
                        <span className="text-xs font-medium text-primary">
                          RANK
                        </span>
                        <div className="text-base sm:text-lg font-bold text-primary">
                          #{token.marketCapRank}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Section */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl font-bold">
                      $
                      {Number(token.price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </span>
                    <span
                      className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-sm font-bold ${
                        token.priceChange24h >= 0
                          ? "text-green-500 bg-green-500/10"
                          : "text-red-500 bg-red-500/10"
                      }`}
                    >
                      {token.priceChange24h >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {Math.abs(token.priceChange24h).toFixed(2)}%
                    </span>
                  </div>
                  {token.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {token.description}
                    </p>
                  )}
                </div>

                {/* Token Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-2 sm:p-3 space-y-1">
                    <div className="text-xs text-muted-foreground font-medium">
                      Market Cap
                    </div>
                    <div
                      className="font-bold text-sm sm:text-base truncate"
                      title={token.marketCap}
                    >
                      {formatNumber(
                        parseFloat(token.marketCap.replace(/[$,]/g, ""))
                      )}
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2 sm:p-3 space-y-1">
                    <div className="text-xs text-muted-foreground font-medium">
                      24h Volume
                    </div>
                    <div
                      className="font-bold text-sm sm:text-base truncate"
                      title={token.volume24h}
                    >
                      {formatNumber(
                        parseFloat(token.volume24h.replace(/[$,]/g, ""))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
