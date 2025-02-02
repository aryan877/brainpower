import { Action } from "../../types/index.js";
import { z } from "zod";
import { ACTION_NAMES } from "../actionNames.js";
import { get_balance } from "../../tools/solana/get_balance.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { PublicKey } from "@solana/web3.js";

export type GetBalanceInput = z.infer<typeof getBalanceSchema>;

const getBalanceSchema = z.object({
  tokenAddress: z.string().optional(),
});

const getBalanceAction: Action = {
  name: ACTION_NAMES.GET_BALANCE,
  similes: [
    "check balance",
    "get wallet balance",
    "view balance",
    "show balance",
    "check token balance",
  ],
  description: `Get the balance of SOL or an SPL token for the agent's wallet.
  If no tokenAddress is provided, the balance will be in SOL.`,
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          balance: 100,
          token: "SOL",
          message: "Current balance: 100 SOL",
        },
        explanation: "Get SOL balance of the wallet",
      },
    ],
    [
      {
        input: {
          tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        output: {
          status: "success",
          balance: 1000,
          token: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          message: "Current balance: 1000 USDC",
        },
        explanation: "Get USDC token balance",
      },
    ],
  ],
  schema: getBalanceSchema,
  handler: async (agent: BrainPowerAgent, input: Record<string, any>) => {
    try {
      const balance = await get_balance(
        agent,
        input.tokenAddress && new PublicKey(input.tokenAddress),
      );

      return {
        status: "success",
        message: `Current balance: ${balance} ${input.tokenAddress ? input.tokenAddress : "SOL"}`,
        data: {
          balance,
          token: input.tokenAddress || "SOL",
        },
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get balance: ${error.message}`,
        error: {
          code: "GET_BALANCE_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};

export default getBalanceAction;
