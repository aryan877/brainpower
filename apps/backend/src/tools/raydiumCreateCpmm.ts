import { ToolConfig } from "../types/index.js";
import { createSolanaAgent } from "../agent/createAgent.js";
import { PublicKey } from "@solana/web3.js";
import pkg from "@coral-xyz/anchor";
const { BN } = pkg;

interface RaydiumCreateCpmmArgs {
  tokenMintA: string;
  tokenMintB: string;
  configId: string;
  amountA: string;
  amountB: string;
  startTime?: number;
}

export const raydiumCreateCpmmTool: ToolConfig<RaydiumCreateCpmmArgs> = {
  definition: {
    type: "function",
    function: {
      name: "raydium_create_cpmm",
      description:
        "Create a Constant Product Market Maker (CPMM) pool on Raydium",
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
            description: "CPMM config ID",
          },
          amountA: {
            type: "string",
            description:
              "Amount of token A to provide (as string to handle large numbers)",
          },
          amountB: {
            type: "string",
            description:
              "Amount of token B to provide (as string to handle large numbers)",
          },
          startTime: {
            type: "number",
            description:
              "Unix timestamp for pool start time (optional, defaults to now)",
          },
        },
        required: [
          "tokenMintA",
          "tokenMintB",
          "configId",
          "amountA",
          "amountB",
        ],
      },
    },
  },
  handler: async ({
    tokenMintA,
    tokenMintB,
    configId,
    amountA,
    amountB,
    startTime = Math.floor(Date.now() / 1000),
  }) => {
    console.log("🌊 Starting raydiumCreateCpmm handler");

    try {
      const agent = createSolanaAgent();
      console.log("🔄 Creating CPMM pool");

      const signature = await agent.raydiumCreateCpmm(
        new PublicKey(tokenMintA),
        new PublicKey(tokenMintB),
        new PublicKey(configId),
        new BN(amountA),
        new BN(amountB),
        new BN(startTime)
      );

      console.log("✅ CPMM pool created successfully");
      return {
        success: true,
        signature,
        pool_info: {
          token_a: tokenMintA,
          token_b: tokenMintB,
          config_id: configId,
          amount_a: amountA,
          amount_b: amountB,
          start_time: startTime,
        },
      };
    } catch (error) {
      console.error("❌ Error in raydiumCreateCpmm:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
