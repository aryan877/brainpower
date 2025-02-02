import { z } from "zod";
import { Action, HandlerResponse } from "../../types/index.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { PublicKey } from "@solana/web3.js";
import { ACTION_NAMES } from "../actionNames.js";
import { getTokenDataByAddress } from "../../tools/index.js";
import { JupiterTokenData } from "../../types/index.js";

export type TokenDataByAddressInput = z.infer<typeof schema>;

const schema = z.object({
  address: z.string().describe("The token's mint address"),
});

export const tokenDataByAddress: Action = {
  name: ACTION_NAMES.GET_TOKEN_DATA_BY_ADDRESS,
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
  handler: async (
    agent: BrainPowerAgent,
    input: Record<string, any>,
  ): Promise<HandlerResponse<JupiterTokenData>> => {
    try {
      const address = input.address as string;
      const tokenData = await getTokenDataByAddress(new PublicKey(address));

      if (!tokenData) {
        return {
          status: "error",
          message: `No token data found for address: ${address}`,
          error: {
            code: "TOKEN_NOT_FOUND",
            message: `No token data found for address: ${address}`,
          },
        };
      }

      return {
        status: "success",
        data: tokenData,
        message: `Successfully fetched token data for address: ${address}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get token data: ${error.message}`,
        error: {
          code: error.code || "UNKNOWN_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};
