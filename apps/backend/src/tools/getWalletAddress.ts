import { ToolConfig } from "src/types";
import { createSolanaAgent } from "../agent/createAgent.js";

export const getWalletAddressTool: ToolConfig = {
  definition: {
    type: "function",
    function: {
      name: "get_wallet_address",
      description: "Return the agent's Solana public key (wallet address).",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  handler: async () => {
    const agent = createSolanaAgent();
    return { wallet: agent.wallet_address.toString() };
  },
};
