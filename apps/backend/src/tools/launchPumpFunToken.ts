import { ToolConfig } from "../types/index.js";
import { createSolanaAgent } from "../agent/createAgent.js";

interface LaunchPumpFunTokenArgs {
  tokenName: string;
  tokenTicker: string;
  description: string;
  imageUrl: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  initialLiquiditySOL?: number;
  slippageBps?: number;
  priorityFee?: number;
}

export const launchPumpFunTokenTool: ToolConfig<LaunchPumpFunTokenArgs> = {
  definition: {
    type: "function",
    function: {
      name: "launch_pumpfun_token",
      description: "Launch a token on Pump.fun with initial liquidity",
      parameters: {
        type: "object",
        properties: {
          tokenName: {
            type: "string",
            description: "Name of the token",
          },
          tokenTicker: {
            type: "string",
            description: "Ticker symbol of the token",
          },
          description: {
            type: "string",
            description: "Description of the token",
          },
          imageUrl: {
            type: "string",
            description: "URL of the token image",
          },
          twitter: {
            type: "string",
            description: "Twitter handle (optional)",
          },
          telegram: {
            type: "string",
            description: "Telegram group link (optional)",
          },
          website: {
            type: "string",
            description: "Website URL (optional)",
          },
          initialLiquiditySOL: {
            type: "number",
            description: "Initial liquidity in SOL (default: 0.0001)",
          },
          slippageBps: {
            type: "number",
            description: "Slippage in basis points (default: 5)",
          },
          priorityFee: {
            type: "number",
            description: "Priority fee in SOL (default: 0.00005)",
          },
        },
        required: ["tokenName", "tokenTicker", "description", "imageUrl"],
      },
    },
  },
  handler: async (args) => {
    console.log("🚀 Starting launchPumpFunToken handler");
    console.log(`📝 Token Name: ${args.tokenName}`);

    try {
      const agent = createSolanaAgent();
      const { tokenName, tokenTicker, description, imageUrl, ...options } =
        args;

      console.log("🔄 Launching token on Pump.fun");
      const result = await agent.launchPumpFunToken(
        tokenName,
        tokenTicker,
        description,
        imageUrl,
        options
      );

      console.log("✅ Token launched successfully");
      return {
        success: true,
        signature: result.signature,
        mint: result.mint,
        metadataUri: result.metadataUri,
      };
    } catch (error) {
      console.error("❌ Error in launchPumpFunToken:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
