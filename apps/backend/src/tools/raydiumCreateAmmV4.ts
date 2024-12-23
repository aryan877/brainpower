import { ToolConfig } from "../types/index.js";
import { createSolanaAgent } from "../agent/createAgent.js";
import { PublicKey } from "@solana/web3.js";
import pkg from "@coral-xyz/anchor";
const { BN } = pkg;

interface RaydiumCreateAmmV4Args {
  marketId: string;
  baseAmount: string;
  quoteAmount: string;
  startTime?: number;
}

export const raydiumCreateAmmV4Tool: ToolConfig<RaydiumCreateAmmV4Args> = {
  definition: {
    type: "function",
    function: {
      name: "raydium_create_ammv4",
      description: "Create an AMM V4 pool on Raydium",
      parameters: {
        type: "object",
        properties: {
          marketId: {
            type: "string",
            description: "OpenBook market ID",
          },
          baseAmount: {
            type: "string",
            description:
              "Amount of base token to provide (as string to handle large numbers)",
          },
          quoteAmount: {
            type: "string",
            description:
              "Amount of quote token to provide (as string to handle large numbers)",
          },
          startTime: {
            type: "number",
            description:
              "Unix timestamp for pool start time (optional, defaults to now)",
          },
        },
        required: ["marketId", "baseAmount", "quoteAmount"],
      },
    },
  },
  handler: async ({
    marketId,
    baseAmount,
    quoteAmount,
    startTime = Math.floor(Date.now() / 1000),
  }) => {
    console.log("🌊 Starting raydiumCreateAmmV4 handler");

    try {
      const agent = createSolanaAgent();
      console.log("🔄 Creating AMM V4 pool");

      const signature = await agent.raydiumCreateAmmV4(
        new PublicKey(marketId),
        new BN(baseAmount),
        new BN(quoteAmount),
        new BN(startTime)
      );

      console.log("✅ AMM V4 pool created successfully");
      return {
        success: true,
        signature,
        pool_info: {
          market_id: marketId,
          base_amount: baseAmount,
          quote_amount: quoteAmount,
          start_time: startTime,
        },
      };
    } catch (error) {
      console.error("❌ Error in raydiumCreateAmmV4:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
