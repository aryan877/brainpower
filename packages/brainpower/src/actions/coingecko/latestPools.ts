import { z } from "zod";
import { Action, HandlerResponse } from "../../types/index.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { ACTION_NAMES } from "../actionNames.js";
import { getLatestPools } from "../../tools/coingecko/index.js";

export const latestPoolsAction: Action = {
  name: ACTION_NAMES.GET_COINGECKO_LATEST_POOLS,
  similes: [
    "get latest pools from coingecko",
    "fetch new pools on solana",
    "show recent pools",
    "list new pools from coingecko",
  ],
  description: "Get the latest pools listed on Solana from CoinGecko",
  examples: [
    [
      {
        input: {},
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
              },
            ],
          },
          message: "Successfully fetched latest pools from CoinGecko",
        },
        explanation: "Getting the latest pools listed on Solana from CoinGecko",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (
    agent: BrainPowerAgent,
    input: Record<string, any>,
  ): Promise<HandlerResponse<any>> => {
    try {
      const data = await getLatestPools(agent);

      return {
        status: "success",
        data,
        message: "Successfully fetched latest pools from CoinGecko",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get latest pools: ${error.message}`,
        error: {
          code: error.code || "UNKNOWN_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};
