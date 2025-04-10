import { z } from "zod";
import { Action, HandlerResponse } from "../../types/index.js";
import { getTokenAddressFromTicker } from "../../tools/index.js";
import { ACTION_NAMES } from "../actionNames.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { ChartAddressResponse } from "../../types/index.js";

export type GetTokenChartAddressInput = z.infer<typeof schema>;

const schema = z.object({
  ticker: z
    .string()
    .min(1)
    .describe("Ticker of the token to get chart address for"),
});

const getTokenChartAddressAction: Action = {
  name: ACTION_NAMES.GET_TOKEN_CHART_ADDRESS,
  similes: [
    "get token chart address",
    "fetch token chart contract",
    "get token chart contract",
    "get chart address",
  ],
  description: "Get the contract address for a token to display its chart",
  examples: [
    [
      {
        input: {
          ticker: "BONK",
        },
        output: {
          status: "success",
          data: {
            address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
          } as ChartAddressResponse,
          message: "Successfully retrieved chart address for BONK",
        },
        explanation: "Gets the contract address for BONK token chart",
      },
    ],
  ],
  schema,
  handler: async (
    agent: BrainPowerAgent,
    input: Record<string, any>,
  ): Promise<HandlerResponse<ChartAddressResponse>> => {
    try {
      const ticker = input.ticker as string;
      const address = await getTokenAddressFromTicker(ticker);

      if (!address) {
        return {
          status: "error",
          message: `No chart address found for ticker: ${ticker}`,
          error: {
            code: "ADDRESS_NOT_FOUND",
            message: `No chart address found for ticker: ${ticker}`,
          },
        };
      }

      return {
        status: "success",
        data: {
          address,
        },
        message: `Successfully retrieved chart address for ${ticker}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get chart address: ${error.message}`,
        error: {
          code: error.code || "UNKNOWN_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};

export default getTokenChartAddressAction;
