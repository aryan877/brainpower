import { ToolConfig } from "../types/index.js";
import { createSolanaAgent } from "../agent/createAgent.js";
import { PublicKey } from "@solana/web3.js";
import pkg from "@coral-xyz/anchor";
const { BN } = pkg;
import { Decimal } from "decimal.js";

type FeeTier = 0.01 | 0.02 | 0.04 | 0.05 | 0.16 | 0.3 | 0.65 | 1.0 | 2.0;

interface CreateOrcaWhirlpoolArgs {
  depositTokenAmount: string;
  depositTokenMint: string;
  otherTokenMint: string;
  initialPrice: string;
  maxPrice: string;
  feeTier: FeeTier;
}

export const createOrcaWhirlpoolTool: ToolConfig<CreateOrcaWhirlpoolArgs> = {
  definition: {
    type: "function",
    function: {
      name: "create_orca_whirlpool",
      description:
        "Create a single-sided Orca Whirlpool with initial liquidity",
      parameters: {
        type: "object",
        properties: {
          depositTokenAmount: {
            type: "string",
            description:
              "Amount of deposit token (as string to handle large numbers)",
          },
          depositTokenMint: {
            type: "string",
            description: "Mint address of the token being deposited",
          },
          otherTokenMint: {
            type: "string",
            description: "Mint address of the other token in the pool",
          },
          initialPrice: {
            type: "string",
            description:
              "Initial price of deposit token in terms of other token",
          },
          maxPrice: {
            type: "string",
            description: "Maximum price at which liquidity is added",
          },
          feeTier: {
            type: "number",
            enum: [0.01, 0.02, 0.04, 0.05, 0.16, 0.3, 0.65, 1.0, 2.0],
            description: "Fee tier percentage for the pool",
          },
        },
        required: [
          "depositTokenAmount",
          "depositTokenMint",
          "otherTokenMint",
          "initialPrice",
          "maxPrice",
          "feeTier",
        ],
      },
    },
  },
  handler: async ({
    depositTokenAmount,
    depositTokenMint,
    otherTokenMint,
    initialPrice,
    maxPrice,
    feeTier,
  }) => {
    console.log("🌊 Starting createOrcaWhirlpool handler");

    try {
      const agent = createSolanaAgent();
      console.log("🔄 Creating Whirlpool");

      const signature = await agent.createOrcaSingleSidedWhirlpool(
        new BN(depositTokenAmount),
        new PublicKey(depositTokenMint),
        new PublicKey(otherTokenMint),
        new Decimal(initialPrice),
        new Decimal(maxPrice),
        feeTier
      );

      console.log("✅ Whirlpool created successfully");
      return {
        success: true,
        signature,
        pool_info: {
          deposit_token: depositTokenMint,
          other_token: otherTokenMint,
          initial_price: initialPrice,
          max_price: maxPrice,
          fee_tier: feeTier,
        },
      };
    } catch (error) {
      console.error("❌ Error in createOrcaWhirlpool:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
