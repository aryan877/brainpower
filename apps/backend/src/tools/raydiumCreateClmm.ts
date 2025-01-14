import { ToolConfig } from "../types/index.js";
import { createSolanaAgent } from "../agent/createAgent.js";
import { PublicKey } from "@solana/web3.js";
import pkg from "@coral-xyz/anchor";
const { BN } = pkg;
import { Decimal } from "decimal.js";

interface RaydiumCreateClmmArgs {
  tokenMintA: string;
  tokenMintB: string;
  configId: string;
  initialPrice: string;
  startTime?: number;
}

export const raydiumCreateClmmTool: ToolConfig<RaydiumCreateClmmArgs> = {
  definition: {
    type: "function",
    function: {
      name: "raydium_create_clmm",
      description:
        "Create a Concentrated Liquidity Market Maker (CLMM) pool on Raydium",
      parameters: {
        type: "object",
        properties: {
          tokenMintA: {
            type: "string",
            description: "Mint address of token A",
          },
          tokenMintB: {
            type: "string",
            description: "Mint address of token B",
          },
          configId: {
            type: "string",
            description: "CLMM config ID",
          },
          initialPrice: {
            type: "string",
            description: "Initial price of token A in terms of token B",
          },
          startTime: {
            type: "number",
            description:
              "Unix timestamp for pool start time (optional, defaults to now)",
          },
        },
        required: ["tokenMintA", "tokenMintB", "configId", "initialPrice"],
      },
    },
  },
  handler: async ({
    tokenMintA,
    tokenMintB,
    configId,
    initialPrice,
    startTime = Math.floor(Date.now() / 1000),
  }) => {
    console.log("🌊 Starting raydiumCreateClmm handler");

    try {
      const agent = createSolanaAgent();
      console.log("🔄 Creating CLMM pool");

      const signature = await agent.raydiumCreateClmm(
        new PublicKey(tokenMintA),
        new PublicKey(tokenMintB),
        new PublicKey(configId),
        new Decimal(initialPrice),
        new BN(startTime)
      );

      console.log("✅ CLMM pool created successfully");
      return {
        success: true,
        signature,
        pool_info: {
          token_a: tokenMintA,
          token_b: tokenMintB,
          config_id: configId,
          initial_price: initialPrice,
          start_time: startTime,
        },
      };
    } catch (error) {
      console.error("❌ Error in raydiumCreateClmm:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
