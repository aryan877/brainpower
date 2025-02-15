import { z } from "zod";
import {
  Action,
  HandlerResponse,
  TrendingTokensResponse,
} from "../../types/index.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { ACTION_NAMES } from "../actionNames.js";
import { getTrendingTokens } from "../../tools/coingecko/index.js";

export const trendingTokensAction: Action = {
  name: ACTION_NAMES.GET_COINGECKO_TRENDING_TOKENS,
  similes: [
    "get trending tokens from coingecko",
    "fetch popular tokens",
    "show hot tokens",
    "list trending coins",
  ],
  description: "Get trending tokens from CoinGecko",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          data: {
            tokens: [
              {
                id: "example-token",
                name: "Example Token",
                symbol: "EX",
                marketCapRank: 1,
                thumb: "thumbnail_url",
                price: 100.0,
                priceChange24h: 5.5,
                marketCap: "$1B",
                volume24h: "$100M",
                description: "Example token description",
              },
            ],
          },
          message: "Successfully fetched trending tokens from CoinGecko",
        },
        explanation: "Getting currently trending tokens from CoinGecko",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (
    agent: BrainPowerAgent,
    input: Record<string, any>,
  ): Promise<HandlerResponse<TrendingTokensResponse>> => {
    try {
      const data = await getTrendingTokens(agent);

      // Transform the raw response into our clean format
      const transformedData: TrendingTokensResponse = {
        tokens: data.coins.map((coin) => ({
          id: coin.item.id,
          name: coin.item.name,
          symbol: coin.item.symbol,
          marketCapRank: coin.item.market_cap_rank || 0,
          thumb: coin.item.thumb,
          price: coin.item.data?.price || 0,
          priceChange24h: coin.item.data?.price_change_percentage_24h?.usd || 0,
          marketCap: coin.item.data?.market_cap || "N/A",
          volume24h: coin.item.data?.total_volume || "N/A",
          description: coin.item.data?.content?.description,
        })),
      };

      return {
        status: "success",
        data: transformedData,
        message:
          "Successfully fetched trending tokens from CoinGecko. User can now view the tokens in the UI. Do not re-iterate the tokens in the UI.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get trending tokens: ${error.message}`,
        error: {
          code: error.code || "UNKNOWN_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};
