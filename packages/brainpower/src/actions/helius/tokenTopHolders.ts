import { z } from "zod";
import { Action } from "../../types/index.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { PublicKey } from "@solana/web3.js";
import { getTokenTopHolders } from "../../tools/helius/getTokenTopHolders.js";
import { ACTION_NAMES } from "../actionNames.js";

const schema = z.object({
  address: z.string().describe("The token's mint address"),
  limit: z
    .number()
    .optional()
    .default(20)
    .describe("Number of top holders to fetch (1-20)"),
});

export const tokenTopHolders: Action = {
  name: ACTION_NAMES.GET_TOKEN_TOP_HOLDERS,
  similes: [
    "get top token holders",
    "fetch largest holders of token",
    "find biggest token holders",
    "lookup token whale addresses",
  ],
  description:
    "Shows token holder rankings in the UI. No need to repeat what you see - what would you like to know about these addresses?",
  examples: [
    [
      {
        input: {
          address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
          limit: 5,
        },
        output: {
          status: "success",
          holders: [
            {
              address: "H9sZ...",
              amount: 1500000,
              decimals: 5,
              owner: "B1pP...",
            },
          ],
          message:
            "Found 5 top holders for token DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        },
        explanation: "Fetching top 5 holders for BONK token",
      },
    ],
  ],
  schema,
  handler: async (agent: BrainPowerAgent, input: Record<string, any>) => {
    try {
      const { address, limit } = input;
      const holders = await getTokenTopHolders(
        new PublicKey(address),
        Math.min(limit, 20),
        agent.connection.rpcEndpoint,
      );

      if (!holders || holders.length === 0) {
        return {
          status: "error",
          message: "No holders found for this token",
          code: "NO_HOLDERS_FOUND",
        };
      }

      return {
        status: "success",
        data: { holders },
        message:
          "I can see the holder data in the UI. Please do not repeat what I can already see - what specific questions do you have about these addresses?",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch holders: ${error.message}`,
        code: error.code || "HOLDERS_FETCH_FAILED",
      };
    }
  },
};
