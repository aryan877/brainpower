import { ToolConfig } from "src/types";
import { createSolanaAgent } from "../agent/createAgent.js";
import { PublicKey } from "@solana/web3.js";

interface TradeArgs {
  outputMint: string;
  inputAmount: number;
  inputMint?: string;
  slippageBps?: number;
}

export const tradeTool: ToolConfig<TradeArgs> = {
  definition: {
    type: "function",
    function: {
      name: "trade_tokens",
      description: "Swap tokens using Jupiter via solana-agent-kit",
      parameters: {
        type: "object",
        properties: {
          outputMint: { type: "string" },
          inputAmount: { type: "number" },
          inputMint: { type: "string" },
          slippageBps: { type: "number" },
        },
        required: ["outputMint", "inputAmount"],
      },
    },
  },
  handler: async ({ outputMint, inputAmount, inputMint, slippageBps }) => {
    const agent = createSolanaAgent();

    const txSig = await agent.trade(
      new PublicKey(outputMint),
      inputAmount,
      inputMint ? new PublicKey(inputMint) : undefined,
      slippageBps
    );

    return { transactionSignature: txSig };
  },
};
