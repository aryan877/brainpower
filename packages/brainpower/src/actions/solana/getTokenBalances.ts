import { Action, HandlerResponse } from "../../types/index.js";
import { z } from "zod";
import { ACTION_NAMES } from "../actionNames.js";
import { get_token_balance } from "../../tools/solana/get_token_balances.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { PublicKey } from "@solana/web3.js";
import { TokenBalancesResponse } from "../../types/index.js";

export type GetTokenBalancesInput = z.infer<typeof getTokenBalancesSchema>;

const getTokenBalancesSchema = z.object({
  walletAddress: z.string().optional(),
});

const getTokenBalancesAction: Action = {
  name: ACTION_NAMES.GET_TOKEN_BALANCES,
  similes: [
    "list all token balances",
    "show all tokens",
    "get all balances",
    "view all tokens",
    "check all token balances",
  ],
  description: "Get all token balances including SOL for a wallet address",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          data: {
            sol: 100,
            tokens: [
              {
                tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                name: "USD Coin",
                symbol: "USDC",
                balance: 1000,
                decimals: 6,
              },
            ],
          },
          message: "Successfully retrieved all token balances",
        },
        explanation: "Get all token balances for the agent's wallet",
      },
    ],
    [
      {
        input: {
          walletAddress: "7nxQB...",
        },
        output: {
          status: "success",
          data: {
            sol: 50,
            tokens: [
              {
                tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                name: "USD Coin",
                symbol: "USDC",
                balance: 500,
                decimals: 6,
              },
            ],
          },
          message: "Successfully retrieved all token balances",
        },
        explanation: "Get all token balances for a specific wallet address",
      },
    ],
  ],
  schema: getTokenBalancesSchema,
  handler: async (
    agent: BrainPowerAgent,
    input: Record<string, any>,
  ): Promise<HandlerResponse<TokenBalancesResponse>> => {
    try {
      const walletAddress = input.walletAddress
        ? new PublicKey(input.walletAddress)
        : undefined;

      const balances = await get_token_balance(agent, walletAddress);

      return {
        status: "success",
        message: "Successfully retrieved all token balances",
        data: balances,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get token balances: ${error.message}`,
        error: {
          code: "GET_TOKEN_BALANCES_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};

export default getTokenBalancesAction;
