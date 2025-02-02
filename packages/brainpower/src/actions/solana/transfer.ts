import { Action, HandlerResponse } from "../../types/index.js";
import { z } from "zod";
import { ACTION_NAMES } from "../actionNames.js";
import { transfer } from "../../tools/solana/transfer.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { PublicKey } from "@solana/web3.js";
import { TransferResponse } from "../../types/index.js";

export type TransferInput = z.infer<typeof transferSchema>;

const transferSchema = z.object({
  to: z.string().min(32, "Invalid recipient address"),
  amount: z.number().positive("Amount must be positive"),
  mint: z.string().optional(),
});

const transferAction: Action = {
  name: ACTION_NAMES.TRANSFER,
  similes: [
    "send sol",
    "transfer tokens",
    "send tokens",
    "transfer sol",
    "send funds",
  ],
  description: "Transfer SOL or SPL tokens to another wallet",
  requiresConfirmation: true,
  examples: [
    [
      {
        input: {
          to: "7nxQB...",
          amount: 1,
        },
        output: {
          status: "success",
          data: {
            signature: "2ZE7Rz...",
            amount: 1,
            recipient: "7nxQB...",
          },
          message: "Successfully transferred 1 SOL",
        },
        explanation: "Transfer 1 SOL to another wallet",
      },
    ],
    [
      {
        input: {
          to: "7nxQB...",
          amount: 100,
          mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        output: {
          status: "success",
          data: {
            signature: "2ZE7Rz...",
            amount: 100,
            recipient: "7nxQB...",
            token: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          },
          message: "Successfully transferred 100 USDC",
        },
        explanation: "Transfer 100 USDC to another wallet",
      },
    ],
  ],
  schema: transferSchema,
  handler: async (
    agent: BrainPowerAgent,
    input: Record<string, any>,
  ): Promise<HandlerResponse<TransferResponse>> => {
    try {
      const result = await transfer(
        agent,
        new PublicKey(input.to),
        input.amount,
        input.mint ? new PublicKey(input.mint) : undefined,
      );

      return {
        status: "success",
        message: `Successfully transferred ${input.amount} ${input.mint ? "tokens" : "SOL"}`,
        data: result,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to transfer funds: ${error.message}`,
        error: {
          code: "TRANSFER_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};

export default transferAction;
