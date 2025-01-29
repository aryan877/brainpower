import { Action } from "../../types/action.js";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { fetchPrice } from "../../tools/jupiter/fetch_price.js";
import { BrainPowerAgent } from "../../agent/index.js";

export type FetchPriceInput = z.infer<typeof fetchPriceSchema>;

const fetchPriceSchema = z.object({
  tokenAddress: z
    .string()
    .min(32)
    .describe("The mint address of the token to fetch the price for"),
});

const fetchPriceAction: Action = {
  name: "FETCH_PRICE",
  similes: [
    "get token price",
    "check price",
    "token value",
    "price check",
    "get price in usd",
  ],
  description:
    "Fetch the current price of a Solana token in USDC using Jupiter API",
  examples: [
    [
      {
        input: {
          tokenAddress: "So11111111111111111111111111111111111111112",
        },
        output: {
          status: "success",
          price: "23.45",
          message: "Current price: $23.45 USDC",
        },
        explanation: "Get the current price of SOL token in USDC",
      },
    ],
  ],
  schema: fetchPriceSchema,
  handler: async (agent: BrainPowerAgent, input: Record<string, any>) => {
    try {
      const tokenId = new PublicKey(input.tokenAddress);
      const { price } = await fetchPrice(tokenId);

      return {
        status: "success",
        data: { price },
        message: `Current price: $${price} USDC`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch price: ${error.message}`,
        data: null,
      };
    }
  },
};

export default fetchPriceAction;
