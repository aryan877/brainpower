import { z } from "zod";
import { Action } from "../../types/index.js";
import { getTokenDataByAddress } from "../../tools/dexscreener/get_token_data.js";
import { BrainPowerAgent } from "../../agent/index.js";
import { PublicKey } from "@solana/web3.js";

export type TokenDataByAddressInput = z.infer<typeof schema>;

const schema = z.object({
  address: z.string().describe("The token's mint address"),
});

export const tokenDataByAddress: Action = {
  name: "tokenDataByAddress",
  similes: [
    "get token data by address",
    "fetch token info using address",
    "lookup token details from address",
    "find token information by mint address",
  ],
  description: "Get detailed token information using its mint address",
  examples: [
    [
      {
        input: {
          address: "So11111111111111111111111111111111111111112",
        },
        output: {
          status: "success",
          tokenData: {
            address: "So11111111111111111111111111111111111111112",
            name: "Wrapped SOL",
            symbol: "SOL",
            decimals: 9,
            tags: ["wrapped-solana"],
            logoURI:
              "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
          },
          message:
            "Successfully fetched token data for address: So11111111111111111111111111111111111111112",
        },
        explanation:
          "Getting token data for Wrapped SOL using its mint address",
      },
    ],
  ],
  schema,
  handler: async (agent: BrainPowerAgent, input: Record<string, any>) => {
    try {
      const address = input.address as string;
      const tokenData = await getTokenDataByAddress(new PublicKey(address));

      if (!tokenData) {
        return {
          status: "error",
          message: `No token data found for address: ${address}`,
          code: "TOKEN_NOT_FOUND",
        };
      }

      return {
        status: "success",
        tokenData: tokenData,
        message: `Successfully fetched token data for address: ${address}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get token data: ${error.message}`,
        code: error.code || "UNKNOWN_ERROR",
      };
    }
  },
};
