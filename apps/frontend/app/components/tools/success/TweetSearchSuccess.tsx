import type { TweetSearchResult } from "@repo/brainpower-agent";
import { MessageCircle, Heart, Repeat2, Reply, BarChart3 } from "lucide-react";
import { formatNumber } from "@/app/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TweetSearchSuccessProps {
  data: TweetSearchResult[];
}

export function TweetSearchSuccess({ data }: TweetSearchSuccessProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Tweet Search Results</h2>
        <p className="text-sm text-muted-foreground">
          Found {data.length} relevant tweets sorted by matching score
        </p>
      </div>
      <div className="space-y-3">
        {data.map((tweet, index) => (
          <div key={index} className="p-4 rounded-lg border bg-card">
            {/* Tweet Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <a
                  href={`https://twitter.com/${tweet.authorUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline text-sm text-foreground hover:text-foreground/90"
                >
                  @{tweet.authorUsername}
                </a>
                <span className="text-sm text-muted-foreground">
                  {new Date(tweet.createdAt).toLocaleDateString()}
                </span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <BarChart3 className="w-4 h-4" />
                    <span>Score: {tweet.matchingScore.toFixed(1)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Relevance score for this tweet</TooltipContent>
              </Tooltip>
            </div>

            {/* Tweet Content */}
            <div className="text-sm mb-3 text-foreground">{tweet.text}</div>

            {/* Tweet Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    <span>{formatNumber(tweet.likesCount)} likes</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Number of likes on this tweet</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Repeat2 className="w-4 h-4" />
                    <span>{formatNumber(tweet.retweetsCount)} retweets</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Number of retweets</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Reply className="w-4 h-4" />
                    <span>{formatNumber(tweet.repliesCount)} replies</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Number of replies to this tweet</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    <span>
                      {formatNumber(tweet.engagementsCount)} engagements
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Total number of interactions with this tweet
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Tweet Footer */}
            <div className="mt-2 text-sm text-muted-foreground flex items-center justify-between">
              <div>
                {tweet.isReply && <span className="mr-2">Reply Tweet</span>}
                {tweet.isQuote && <span>Quote Tweet</span>}
              </div>
              <div>
                {formatNumber(tweet.impressionsCount)} impressions •{" "}
                {tweet.smartEngagementPoints} smart points
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
