import { PublicKey } from "@solana/web3.js";
import { Action, HandlerResponse } from "../../types/action.js";
import { BrainPowerAgent } from "../../agent/index.js";
import { z } from "zod";
import { trade } from "../../tools/index.js";
import { ACTION_NAMES } from "../actionNames.js";

export type TradeInput = z.infer<typeof tradeSchema>;

interface TradeData {
  transaction: string;
  inputAmount: number;
  inputToken: string;
  outputToken: string;
}

const tradeSchema = z.object({
  outputMint: z.string().min(32, "Invalid output mint address"),
  inputAmount: z.number().positive("Input amount must be positive"),
  inputMint: z.string().min(32, "Invalid input mint address").optional(),
  slippageBps: z.number().min(0).max(10000).optional(),
});

const tradeAction: Action = {
  name: ACTION_NAMES.JUPITER_SWAP,
  similes: [
    "swap tokens",
    "exchange tokens",
    "trade tokens",
    "convert tokens",
    "swap sol",
  ],
  description: `${ACTION_NAMES.JUPITER_SWAP} can be used to swap tokens using Jupiter Exchange. You can provide either mint addresses (e.g. \`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\`) or token symbols (e.g. \`USDC\`, \`SOL\`, \`BONK\`). When a token symbol is provided, the system will use the \`${ACTION_NAMES.GET_TOKEN_DATA_BY_TICKER}\` action to automatically look up the corresponding mint address using DexScreener.`,
  examples: [
    [
      {
        input: {
          outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          inputAmount: 1,
        },
        output: {
          status: "success",
          message: "Trade executed successfully",
          transaction:
            "5UfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
          inputAmount: 1,
          inputToken: "SOL",
          outputToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        explanation: "Swap 1 SOL for USDC",
      },
    ],
    [
      {
        input: {
          outputMint: "So11111111111111111111111111111111111111112",
          inputAmount: 100,
          inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          slippageBps: 100,
        },
        output: {
          status: "success",
          message: "Trade executed successfully",
          transaction:
            "4VfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
          inputAmount: 100,
          inputToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          outputToken: "So11111111111111111111111111111111111111112",
        },
        explanation: "Swap 100 USDC for SOL with 1% slippage",
      },
    ],
  ],
  schema: tradeSchema,
  handler: async (
    agent: BrainPowerAgent,
    input: Record<string, any>,
  ): Promise<HandlerResponse<TradeData>> => {
    try {
      // Validate and create PublicKeys first
      const outputMint = new PublicKey(input.outputMint);
      const inputMint = input.inputMint
        ? new PublicKey(input.inputMint)
        : new PublicKey("So11111111111111111111111111111111111111112");

      // Now pass the validated PublicKeys to trade function
      const { transaction } = await trade(
        agent,
        outputMint,
        input.inputAmount,
        inputMint,
        input.slippageBps,
      );

      return {
        status: "success",
        message:
          "I can see the swap details in the UI. Would you like to perform another swap or check your updated balances?",
        data: {
          transaction,
          inputAmount: input.inputAmount,
          inputToken: input.inputMint || "SOL",
          outputToken: input.outputMint,
        },
      };
    } catch (error: any) {
      console.error("Trade error:", error);
      return {
        status: "error",
        message: `Failed to execute trade: ${error.message}`,
      };
    }
  },
};

export default tradeAction;
