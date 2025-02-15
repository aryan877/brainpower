import { z } from "zod";
import { Action, HandlerResponse } from "../../types/index.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { ACTION_NAMES } from "../actionNames.js";
import { getTokenPriceData } from "../../tools/coingecko/index.js";

const schema = z.object({
  tokenAddresses: z
    .array(z.string())
    .describe("Array of token addresses to get price data for"),
});

export const tokenPriceAction: Action = {
  name: ACTION_NAMES.GET_COINGECKO_TOKEN_PRICE,
  similes: [
    "get token price from coingecko",
    "fetch token price data",
    "lookup token prices",
    "get token market data",
  ],
  description:
    "Get token price and market data from CoinGecko for multiple tokens",
  examples: [
    [
      {
        input: {
          tokenAddresses: ["So11111111111111111111111111111111111111112"],
        },
        output: {
          status: "success",
          data: {
            So11111111111111111111111111111111111111112: {
              usd: 100,
              usd_market_cap: 1000000000,
              usd_24h_vol: 50000000,
              usd_24h_change: 5.5,
            },
          },
          message: "Successfully fetched token price data from CoinGecko",
        },
        explanation: "Getting price data for Wrapped SOL",
      },
    ],
  ],
  schema,
  handler: async (
    agent: BrainPowerAgent,
    input: Record<string, any>,
  ): Promise<HandlerResponse<any>> => {
    try {
      const { tokenAddresses } = input;
      const data = await getTokenPriceData(agent, tokenAddresses);

      return {
        status: "success",
        data,
        message: "Successfully fetched token price data from CoinGecko",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get token price data: ${error.message}`,
        error: {
          code: error.code || "UNKNOWN_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};
