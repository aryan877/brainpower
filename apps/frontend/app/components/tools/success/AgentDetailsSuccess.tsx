import type { AgentDetails, AgentsPagedResponse } from "@repo/brainpower-agent";
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageCircle,
  DollarSign,
  Droplet,
  Wallet,
  BarChart2,
  Clock,
  ChevronDown,
} from "lucide-react";
import { formatNumber, formatPercentage } from "@/app/lib/utils";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyAddress } from "../../CopyAddress";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { cookie3Client } from "@/app/clients/cookie3";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface AgentDetailsSuccessProps {
  data: AgentDetails | AgentsPagedResponse;
  isMultiple?: boolean;
}

function MetricItem({
  label,
  value,
  delta,
  prefix = "",
  icon: Icon,
  tooltip,
}: {
  label: string;
  value: number;
  delta?: number;
  prefix?: string;
  icon: React.ElementType;
  tooltip?: string;
}) {
  const MetricContent = (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-sm font-medium truncate">
          {prefix}
          {formatNumber(value)}
          {delta !== undefined && (
            <span
              className={`ml-1 ${delta >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {formatPercentage(delta)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">{MetricContent}</div>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return MetricContent;
}

function AgentCard({ agent }: { agent: AgentDetails }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSolanaContracts = agent.contracts.length > 0;

  return (
    <div className="w-full border rounded-lg bg-card overflow-hidden transition-all duration-200 hover:shadow-sm">
      {/* Header - Always Visible */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-6 py-4 cursor-pointer hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8 flex-1 min-w-0">
            {/* Name and Twitter */}
            <div className="min-w-[220px] shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold leading-none text-left truncate">
                  {agent.agentName}
                </h3>
                {hasSolanaContracts && (
                  <div className="shrink-0 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium">
                    Solana
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground text-left truncate mt-2">
                {agent.twitterUsernames.map((username, idx) => (
                  <a
                    key={idx}
                    href={`https://twitter.com/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    @{username}
                    {idx < agent.twitterUsernames.length - 1 ? ", " : ""}
                  </a>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="flex items-center gap-6 flex-1 min-w-0 overflow-x-auto pb-2">
              {/* Mindshare */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 bg-background/50 px-3 py-2 rounded-md shrink-0">
                    {agent.mindshareDeltaPercent >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <div>
                      <div className="text-sm text-muted-foreground font-medium">
                        Mindshare
                      </div>
                      <div
                        className={`text-sm font-semibold ${agent.mindshareDeltaPercent >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {formatNumber(agent.mindshare)}
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Overall influence score based on social activity and market
                  impact
                </TooltipContent>
              </Tooltip>

              {/* Market Cap */}
              <div className="flex items-center gap-3 bg-background/50 px-3 py-2 rounded-md shrink-0">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Market Cap
                  </div>
                  <div className="text-sm font-semibold">
                    ${formatNumber(agent.marketCap)}
                    <span
                      className={`ml-1 ${agent.marketCapDeltaPercent >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {formatPercentage(agent.marketCapDeltaPercent)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 bg-background/50 px-3 py-2 rounded-md shrink-0">
                <BarChart2 className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Price
                  </div>
                  <div className="text-sm font-semibold">
                    ${formatNumber(agent.price)}
                    <span
                      className={`ml-1 ${agent.priceDeltaPercent >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {formatPercentage(agent.priceDeltaPercent)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expand/Collapse Icon */}
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 ml-4",
              isExpanded && "transform rotate-180"
            )}
          />
        </div>
      </div>

      {/* Expandable Content */}
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-6 py-5 border-t bg-accent/5">
            {/* Contracts */}
            {agent.contracts.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-sm font-semibold">Contracts</div>
                </div>
                <div className="grid gap-2">
                  {agent.contracts.map((contract, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm group hover:bg-accent/50 rounded-md px-3 py-2 transition-colors bg-background/80"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Wallet className="w-3.5 h-3.5 text-purple-500" />
                        <CopyAddress
                          address={contract.contractAddress}
                          explorerUrl={`https://solscan.io/token/${contract.contractAddress}`}
                          className="flex-1 min-w-0"
                        />
                      </div>
                      <a
                        href={`https://solscan.io/token/${contract.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View on Solscan
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Market Metrics */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Market Metrics</h4>
                <div className="grid gap-y-4 bg-background/80 rounded-lg p-4">
                  <MetricItem
                    label="24h Volume"
                    value={agent.volume24Hours}
                    delta={agent.volume24HoursDeltaPercent}
                    prefix="$"
                    icon={Clock}
                    tooltip="Trading volume in the last 24 hours"
                  />
                  <MetricItem
                    label="Liquidity"
                    value={agent.liquidity}
                    prefix="$"
                    icon={Droplet}
                    tooltip="Available trading liquidity in the pool"
                  />
                  <MetricItem
                    label="Holders"
                    value={agent.holdersCount}
                    delta={agent.holdersCountDeltaPercent}
                    icon={Users}
                    tooltip="Number of unique addresses holding the token"
                  />
                </div>
              </div>

              {/* Social Metrics */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Social Metrics</h4>
                <div className="grid gap-y-4 bg-background/80 rounded-lg p-4">
                  <MetricItem
                    label="Avg Engagements"
                    value={agent.averageEngagementsCount}
                    delta={agent.averageEngagementsCountDeltaPercent}
                    icon={MessageCircle}
                    tooltip="Average engagement per tweet (likes + retweets + replies)"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-3 cursor-help">
                        <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Smart Followers
                          </div>
                          <div className="text-sm font-medium">
                            {formatNumber(agent.smartFollowersCount)}
                            <span className="text-muted-foreground">
                              /{formatNumber(agent.followersCount)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              (
                              {formatPercentage(
                                (agent.smartFollowersCount /
                                  agent.followersCount) *
                                  100
                              )}
                              %)
                            </span>
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">
                        Smart Followers are high-value accounts that actively
                        engage with content. This ratio shows quality of the
                        follower base: {formatNumber(agent.smartFollowersCount)}{" "}
                        smart followers out of{" "}
                        {formatNumber(agent.followersCount)} total followers.
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Top Tweets */}
            {agent.topTweets.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold mb-3">Top Tweets</div>
                <div className="grid gap-3">
                  {agent.topTweets.slice(0, 2).map((tweet, index) => (
                    <a
                      key={index}
                      href={tweet.tweetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg bg-background/80 hover:bg-accent/50 transition-colors overflow-hidden"
                    >
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Image
                            src={tweet.tweetAuthorProfileImageUrl}
                            alt={tweet.tweetAuthorDisplayName}
                            width={24}
                            height={24}
                            className="rounded-full shrink-0"
                          />
                          <span className="text-sm font-medium truncate">
                            {tweet.tweetAuthorDisplayName}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span>
                            {formatNumber(tweet.impressionsCount)} impressions
                          </span>
                          <span>
                            {tweet.smartEngagementPoints} smart points
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AgentDetailsSuccess({
  data,
  isMultiple = false,
}: AgentDetailsSuccessProps) {
  const [currentData, setCurrentData] = useState<
    AgentDetails | AgentsPagedResponse
  >(data);
  const [isLoading, setIsLoading] = useState(false);

  // Handle both single agent and paged response
  const agents: AgentDetails[] = isMultiple
    ? (currentData as AgentsPagedResponse).data
    : [currentData as AgentDetails];

  const pagination = isMultiple
    ? {
        currentPage: (currentData as AgentsPagedResponse).currentPage,
        totalPages: (currentData as AgentsPagedResponse).totalPages,
        totalCount: (currentData as AgentsPagedResponse).totalCount,
      }
    : undefined;

  const fetchPage = async (page: number) => {
    if (!isMultiple) return;

    setIsLoading(true);
    try {
      const response = await cookie3Client.getPagedAgents({
        page,
        pageSize: agents.length,
      });
      setCurrentData(response);
    } catch (error) {
      console.error("Failed to fetch page:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // For now, hardcoding the interval as 7 days since that's the default in get_agent_data.ts
  const interval = "_7Days";
  const intervalDisplay = interval === "_7Days" ? "7 Days" : "3 Days";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">
            {isMultiple ? "Top Crypto Agents" : "Agent Details"}
          </h2>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {isMultiple
                ? `Showing ${agents.length} influential agents ranked by mindshare${
                    pagination
                      ? ` (Page ${pagination.currentPage} of ${pagination.totalPages})`
                      : ""
                  }`
                : "Detailed analytics and metrics for the selected agent"}
            </p>
            <p className="text-sm text-muted-foreground">
              Data shown for last {intervalDisplay}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {agents.map((agent: AgentDetails, index: number) => (
          <AgentCard key={`agent-${agent.agentName}-${index}`} agent={agent} />
        ))}
      </div>

      {isMultiple && pagination && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (!isLoading && pagination.currentPage > 1) {
                    fetchPage(pagination.currentPage - 1);
                  }
                }}
                className={cn(
                  pagination.currentPage <= 1 &&
                    "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>

            {pagination.currentPage > 2 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      fetchPage(1);
                    }}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              </>
            )}

            {pagination.currentPage > 1 && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    fetchPage(pagination.currentPage - 1);
                  }}
                >
                  {pagination.currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationLink href="#" isActive>
                {pagination.currentPage}
              </PaginationLink>
            </PaginationItem>

            {pagination.currentPage < pagination.totalPages && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    fetchPage(pagination.currentPage + 1);
                  }}
                >
                  {pagination.currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {pagination.currentPage < pagination.totalPages - 1 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      fetchPage(pagination.totalPages);
                    }}
                  >
                    {pagination.totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (
                    !isLoading &&
                    pagination.currentPage < pagination.totalPages
                  ) {
                    fetchPage(pagination.currentPage + 1);
                  }
                }}
                className={cn(
                  pagination.currentPage >= pagination.totalPages &&
                    "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
