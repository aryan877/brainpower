import { Action } from "../../types/action.js";
import { BrainPowerAgent } from "../../agent/index.js";
import { z } from "zod";
import { getTokenDataByTicker } from "../../tools/dexscreener/index.js";
import { ACTION_NAMES } from "../actionNames.js";

export type TokenDataByTickerInput = z.infer<typeof tokenDataByTickerSchema>;

const tokenDataByTickerSchema = z.object({
  ticker: z.string().min(1).describe("Ticker of the token, e.g. 'USDC'"),
});

const tokenDataByTickerAction: Action = {
  name: ACTION_NAMES.GET_TOKEN_DATA_BY_TICKER,
  similes: [
    "token data by ticker",
    "fetch token info by ticker",
    "lookup token ticker info",
    "get token info by ticker",
  ],
  description: "Get the token data for a given token ticker",
  examples: [
    [
      {
        input: {
          ticker: "USDC",
        },
        output: {
          status: "success",
          tokenData: {
            // Some placeholder example data
            symbol: "USDC",
            name: "USD Coin",
            decimals: 6,
            mintAddress: "FhRg...",
          },
        },
        explanation: "Fetches metadata for the USDC token by its ticker.",
      },
    ],
  ],
  schema: tokenDataByTickerSchema,
  handler: async (agent: BrainPowerAgent, input: Record<string, any>) => {
    try {
      const ticker = input.ticker as string;

      // Use agent's method to get token data by ticker
      const tokenData = await getTokenDataByTicker(ticker);

      return {
        status: "success",
        data: tokenData,
        message: `Successfully fetched token data for ticker: ${ticker}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch token data for ticker: ${input.ticker || ""}. ${error.message}`,
        code: error.code || "UNKNOWN_ERROR",
      };
    }
  },
};

export default tokenDataByTickerAction;
