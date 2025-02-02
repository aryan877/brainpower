import { Action } from "../../types/index.js";
import { z } from "zod";
import { ACTION_NAMES } from "../actionNames.js";
import { get_balance_other } from "../../tools/solana/get_balance_other.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { PublicKey } from "@solana/web3.js";

export type GetBalanceOtherInput = z.infer<typeof getBalanceOtherSchema>;

const getBalanceOtherSchema = z.object({
  walletAddress: z.string().min(32, "Invalid wallet address"),
  tokenAddress: z.string().optional(),
});

const getBalanceOtherAction: Action = {
  name: ACTION_NAMES.GET_BALANCE_OTHER,
  similes: [
    "check other wallet balance",
    "get balance of address",
    "view other wallet balance",
    "check balance of wallet",
    "get token balance of address",
  ],
  description: `Get the balance of SOL or an SPL token for a specified wallet address.
  If no tokenAddress is provided, the balance will be in SOL.`,
  examples: [
    [
      {
        input: {
          walletAddress: "7nxQB...",
        },
        output: {
          status: "success",
          balance: 100,
          token: "SOL",
          message: "Current balance: 100 SOL",
        },
        explanation: "Get SOL balance of another wallet",
      },
    ],
    [
      {
        input: {
          walletAddress: "7nxQB...",
          tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        output: {
          status: "success",
          balance: 1000,
          token: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          message: "Current balance: 1000 USDC",
        },
        explanation: "Get USDC token balance of another wallet",
      },
    ],
  ],
  schema: getBalanceOtherSchema,
  handler: async (agent: BrainPowerAgent, input: Record<string, any>) => {
    try {
      const balance = await get_balance_other(
        agent,
        new PublicKey(input.walletAddress),
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
          code: "GET_BALANCE_OTHER_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};

export default getBalanceOtherAction;
