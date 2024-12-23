import { ToolConfig } from "../types/index.js";
import { createSolanaAgent } from "../agent/createAgent.js";

export const getTPSTool: ToolConfig = {
  definition: {
    type: "function",
    function: {
      name: "get_tps",
      description: "Get the current Transactions Per Second (TPS) on Solana",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  handler: async () => {
    console.log("🔍 Starting getTPS handler");

    try {
      const agent = createSolanaAgent();
      console.log("🔄 Fetching TPS");

      const tps = await agent.getTPS();
      console.log(`✅ Current TPS: ${tps}`);

      return {
        success: true,
        tps: tps,
        formatted_tps: `${tps.toFixed(2)} TPS`,
      };
    } catch (error) {
      console.error("❌ Error in getTPS:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
