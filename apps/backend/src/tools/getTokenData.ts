import { ToolConfig } from "../types/index.js";
import { createSolanaAgent } from "../agent/createAgent.js";

interface GetTokenDataArgs {
  tokenAddress?: string;
  ticker?: string;
}

export const getTokenDataTool: ToolConfig<GetTokenDataArgs> = {
  definition: {
    type: "function",
    function: {
      name: "get_token_data",
      description:
        "Get token data from Jupiter or DexScreener by address or ticker",
      parameters: {
        type: "object",
        properties: {
          tokenAddress: {
            type: "string",
            description: "Token mint address (optional if ticker provided)",
          },
          ticker: {
            type: "string",
            description:
              "Token ticker symbol (optional if tokenAddress provided)",
          },
        },
        required: [],
      },
    },
  },
  handler: async ({ tokenAddress, ticker }) => {
    console.log("🔍 Starting getTokenData handler");

    try {
      if (!tokenAddress && !ticker) {
        throw new Error("Either tokenAddress or ticker must be provided");
      }

      const agent = createSolanaAgent();
      let tokenData;

      if (ticker) {
        console.log(`🔄 Fetching token data for ticker: ${ticker}`);
        tokenData = await agent.getTokenDataByTicker(ticker);
      } else if (tokenAddress) {
        console.log(`🔄 Fetching token data for address: ${tokenAddress}`);
        tokenData = await agent.getTokenDataByAddress(tokenAddress);
      }

      if (!tokenData) {
        throw new Error(
          `Token data not found for ${
            ticker ? `ticker: ${ticker}` : `address: ${tokenAddress}`
          }`
        );
      }

      console.log("✅ Token data fetched successfully");
      return {
        success: true,
        token: {
          address: tokenData.address,
          symbol: tokenData.symbol,
          name: tokenData.name,
          decimals: tokenData.decimals,
          logoURI: tokenData.logoURI,
          tags: tokenData.tags,
        },
      };
    } catch (error) {
      console.error("❌ Error in getTokenData:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
