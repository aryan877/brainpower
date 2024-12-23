import { ToolConfig } from "../types/index.js";
import { createSolanaAgent } from "../agent/createAgent.js";
import { PriceServiceConnection } from "@pythnetwork/price-service-client";
import pkg from "@coral-xyz/anchor";
const { BN } = pkg;

interface PythFetchPriceArgs {
  priceFeedID: string;
}

export const pythFetchPriceTool: ToolConfig<PythFetchPriceArgs> = {
  definition: {
    type: "function",
    function: {
      name: "pyth_fetch_price",
      description: "Fetch the price of a given price feed from Pyth Network",
      parameters: {
        type: "object",
        properties: {
          priceFeedID: {
            type: "string",
            description:
              "Price feed ID from Pyth Network (see https://pyth.network/developers/price-feed-ids#stable)",
          },
        },
        required: ["priceFeedID"],
      },
    },
  },
  handler: async ({ priceFeedID }) => {
    console.log("🔍 Starting pythFetchPrice handler");
    console.log(`📝 Price Feed ID: ${priceFeedID}`);

    try {
      const agent = createSolanaAgent();
      const stableHermesServiceUrl = "https://hermes.pyth.network";
      const connection = new PriceServiceConnection(stableHermesServiceUrl);

      console.log("🔄 Fetching price feed");
      const currentPrice = await connection.getLatestPriceFeeds([priceFeedID]);

      if (!currentPrice || currentPrice.length === 0) {
        throw new Error("Price data not available for the given token.");
      }

      const price = new BN(currentPrice[0].getPriceUnchecked().price);
      const exponent = new BN(currentPrice[0].getPriceUnchecked().expo);
      const scaledPrice = price.div(new BN(10).pow(exponent));

      console.log(`✅ Price fetched: ${scaledPrice.toString()}`);
      return {
        success: true,
        price: scaledPrice.toString(),
        feed_id: priceFeedID,
        confidence: currentPrice[0].getPriceUnchecked().conf,
        timestamp: currentPrice[0].getPriceUnchecked().publishTime,
      };
    } catch (error) {
      console.error("❌ Error in pythFetchPrice:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
