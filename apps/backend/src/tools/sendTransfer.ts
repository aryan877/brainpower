import { ToolConfig } from "src/types";
import { createSolanaAgent } from "../agent/createAgent.js";
import { PublicKey } from "@solana/web3.js";

interface TransferArgs {
  to: string;
  amount: number;
  mint?: string; // optional
}

export const transferTool: ToolConfig<TransferArgs> = {
  definition: {
    type: "function",
    function: {
      name: "send_transfer",
      description: "Transfer SOL or an SPL token to a given address",
      parameters: {
        type: "object",
        properties: {
          to: {
            type: "string",
            description: "Recipient wallet address",
            pattern: "^\\w+$",
          },
          amount: {
            type: "number",
            description:
              "Amount to transfer (decimal for SOL, or integer if SPL must be carefully handled)",
          },
          mint: {
            type: "string",
            description:
              "SPL token mint if transferring SPL tokens. Omit if transferring SOL.",
          },
        },
        required: ["to", "amount"],
      },
    },
  },
  handler: async ({ to, amount, mint }) => {
    const agent = createSolanaAgent();
    const toPubkey = new PublicKey(to);

    try {
      let resultSig: string;
      if (mint) {
        // transfer SPL token
        resultSig = await agent.transfer(toPubkey, amount, new PublicKey(mint));
      } else {
        // transfer native SOL
        resultSig = await agent.transfer(toPubkey, amount);
      }
      return { txSignature: resultSig };
    } catch (error: any) {
      throw new Error(`Transfer failed: ${error.message}`);
    }
  },
};
