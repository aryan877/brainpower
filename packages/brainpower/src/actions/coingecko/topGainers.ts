import { z } from "zod";
import { Action, HandlerResponse } from "../../types/index.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { ACTION_NAMES } from "../actionNames.js";
import { getTopGainers } from "../../tools/coingecko/index.js";

const schema = z.object({
  duration: z
    .enum(["1h", "24h", "7d", "14d", "30d", "60d", "1y"])
    .default("24h")
    .describe("Time period for top gainers"),
  topCoins: z
    .union([z.literal(300), z.literal(500), z.literal(1000), z.literal("all")])
    .default("all")
    .describe("Number of top coins to consider"),
});

export const topGainersAction: Action = {
  name: ACTION_NAMES.GET_COINGECKO_TOP_GAINERS,
  similes: [
    "get top gainers from coingecko",
    "fetch best performing tokens",
    "show highest gaining coins",
    "list top performing tokens",
  ],
  description:
    "Get the top gaining tokens from CoinGecko over a specified time period",
  examples: [
    [
      {
        input: {
          duration: "24h",
          topCoins: "all",
        },
        output: {
          status: "success",
          data: {
            top_gainers: [
              {
                id: "example-token",
                symbol: "EX",
                name: "Example Token",
                price_change_percentage: 150.5,
              },
            ],
          },
          message: "Successfully fetched top gainers from CoinGecko",
        },
        explanation: "Getting top gaining tokens over the last 24 hours",
      },
    ],
  ],
  schema,
  handler: async (
    agent: BrainPowerAgent,
    input: Record<string, any>,
  ): Promise<HandlerResponse<any>> => {
    try {
      const { duration = "24h", topCoins = "all" } = input;
      const data = await getTopGainers(agent, duration, topCoins);

      return {
        status: "success",
        data,
        message: "Successfully fetched top gainers from CoinGecko",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get top gainers: ${error.message}`,
        error: {
          code: error.code || "UNKNOWN_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};
