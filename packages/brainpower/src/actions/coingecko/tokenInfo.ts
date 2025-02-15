import { z } from "zod";
import { Action, HandlerResponse } from "../../types/index.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { ACTION_NAMES } from "../actionNames.js";
import { getTokenInfo } from "../../tools/coingecko/index.js";

const schema = z.object({
  tokenAddress: z.string().describe("The token's address on Solana"),
});

export const tokenInfoAction: Action = {
  name: ACTION_NAMES.GET_COINGECKO_TOKEN_INFO,
  similes: [
    "get token info from coingecko",
    "fetch token details",
    "lookup token information",
    "get token data from coingecko",
  ],
  description:
    "Get detailed token information from CoinGecko using its address",
  examples: [
    [
      {
        input: {
          tokenAddress: "So11111111111111111111111111111111111111112",
        },
        output: {
          status: "success",
          data: {
            name: "Wrapped SOL",
            symbol: "SOL",
            address: "So11111111111111111111111111111111111111112",
          },
          message: "Successfully fetched token info from CoinGecko",
        },
        explanation:
          "Getting token information for Wrapped SOL using its address",
      },
    ],
  ],
  schema,
  handler: async (
    agent: BrainPowerAgent,
    input: Record<string, any>,
  ): Promise<HandlerResponse<any>> => {
    try {
      const { tokenAddress } = input;
      const data = await getTokenInfo(agent, tokenAddress);

      return {
        status: "success",
        data,
        message: "Successfully fetched token info from CoinGecko",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get token info: ${error.message}`,
        error: {
          code: error.code || "UNKNOWN_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};
