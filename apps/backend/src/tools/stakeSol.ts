import { ToolConfig } from "src/types";
import { createSolanaAgent } from "../agent/createAgent.js";

interface StakeSolArgs {
  amount: number;
}

export const stakeSolTool: ToolConfig<StakeSolArgs> = {
  definition: {
    type: "function",
    function: {
      name: "stake_sol",
      description:
        "Stake SOL via jupSOL or a similar staking protocol on Solana",
      parameters: {
        type: "object",
        properties: {
          amount: { type: "number" },
        },
        required: ["amount"],
      },
    },
  },
  handler: async ({ amount }) => {
    const agent = createSolanaAgent();
    const txSig = await agent.stake(amount);
    return { transactionSignature: txSig };
  },
};
