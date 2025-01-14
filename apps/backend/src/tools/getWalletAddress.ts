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
    console.log("🔍 Starting getWalletAddress handler");
    try {
      const agent = createSolanaAgent();
      const walletAddress = agent.wallet_address.toString();
      console.log(`✅ Wallet address retrieved: ${walletAddress}`);
      return { wallet: walletAddress };
    } catch (error) {
      console.error("❌ Error in getWalletAddress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
