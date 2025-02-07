import { z } from "zod";
import { Action, HandlerResponse } from "../../types/action.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { ACTION_NAMES } from "../actionNames.js";
import {
  searchTweets,
  searchRecentTweets,
} from "../../tools/cookie3/search_tweets.js";
import { TweetSearchResult } from "../../types/index.js";

export type SearchTweetsInput = z.infer<typeof schema>;

const schema = z.object({
  searchQuery: z
    .string()
    .describe("Word or phrase to search for in tweet text"),
  fromDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe("Start date in YYYY-MM-DD format"),
  toDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe("End date in YYYY-MM-DD format"),
  recentOnly: z
    .boolean()
    .optional()
    .describe("If true, only search last 7 days of tweets"),
});

export const searchTweetsAction: Action = {
  name: ACTION_NAMES.SEARCH_TWEETS,
  similes: [
    "search tweets",
    "find tweets",
    "look up tweets",
    "search twitter content",
    "find twitter posts",
  ],
  description:
    "Search for tweets matching a query with engagement metrics and smart filtering",
  examples: [
    [
      {
        input: {
          searchQuery: "cookie token utility",
          fromDate: "2024-01-01",
          toDate: "2024-01-20",
        },
        output: {
          status: "success",
          data: [
            {
              authorUsername: "aixbt_agent",
              text: "$COOKIE market stats: 76m mcap, 102m volume last 24h\n\ntoken utility driving price discovery through data api access model",
              engagementsCount: 152,
              impressionsCount: 39787,
              smartEngagementPoints: 1,
            },
            // ... more tweets
          ],
          message: "Successfully found 3 matching tweets",
        },
        explanation:
          "Searching for tweets about Cookie token utility in January 2024",
      },
    ],
    [
      {
        input: {
          searchQuery: "aixbt mindshare",
          recentOnly: true,
        },
        output: {
          status: "success",
          data: [
            {
              authorUsername: "nobrainflip",
              text: "aixbt mindshare keeps growing, now at 11.07 with 163k holders",
              engagementsCount: 487,
              impressionsCount: 46339,
              smartEngagementPoints: 1,
            },
          ],
          message: "Successfully found 1 matching tweet in the last 7 days",
        },
        explanation: "Searching for recent tweets about aixbt mindshare",
      },
    ],
  ],
  schema,
  handler: async (
    agent: BrainPowerAgent,
    input: Record<string, any>,
  ): Promise<HandlerResponse<TweetSearchResult[]>> => {
    try {
      let tweets: TweetSearchResult[];

      if (input.recentOnly) {
        tweets = await searchRecentTweets(input.searchQuery);
      } else if (input.fromDate && input.toDate) {
        tweets = await searchTweets(
          input.searchQuery,
          input.fromDate,
          input.toDate,
        );
      } else {
        // Default to recent tweets if no dates provided
        tweets = await searchRecentTweets(input.searchQuery);
      }

      return {
        status: "success",
        data: tweets,
        message: `Successfully found ${tweets.length} matching tweet${tweets.length === 1 ? "" : "s"}${input.recentOnly ? " in the last 7 days" : ""} (Don't reiterate the results as they are visible in the UI)`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to search tweets: ${error.message}`,
        error: {
          code: error.code || "UNKNOWN_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};

export default searchTweetsAction;
