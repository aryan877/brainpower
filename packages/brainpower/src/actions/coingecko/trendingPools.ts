import { z } from "zod";
import { Action, HandlerResponse } from "../../types/index.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { ACTION_NAMES } from "../actionNames.js";
import { getTrendingPools } from "../../tools/coingecko/index.js";

const schema = z.object({
  duration: z
    .enum(["5m", "1h", "6h", "24h"])
    .default("24h")
    .describe("Time period for trending pools"),
});

export const trendingPoolsAction: Action = {
  name: ACTION_NAMES.GET_COINGECKO_TRENDING_POOLS,
  similes: [
    "get trending pools from coingecko",
    "fetch popular pools",
    "show hot pools",
    "list trending pools",
  ],
  description:
    "Get trending pools on Solana from CoinGecko over a specified time period",
  examples: [
    [
      {
        input: {
          duration: "24h",
        },
        output: {
          status: "success",
          data: {
            pools: [
              {
                pool_address: "example_pool_address",
                base_token: {
                  name: "Example Token",
                  symbol: "EX",
                  address: "example_token_address",
                },
                volume_24h: 1000000,
              },
            ],
          },
          message: "Successfully fetched trending pools from CoinGecko",
        },
        explanation: "Getting trending pools over the last 24 hours",
      },
    ],
  ],
  schema,
  handler: async (
    agent: BrainPowerAgent,
    input: Record<string, any>,
  ): Promise<HandlerResponse<any>> => {
    try {
      const { duration = "24h" } = input;
      const data = await getTrendingPools(agent, duration);

      return {
        status: "success",
        data,
        message: "Successfully fetched trending pools from CoinGecko",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get trending pools: ${error.message}`,
        error: {
          code: error.code || "UNKNOWN_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};
