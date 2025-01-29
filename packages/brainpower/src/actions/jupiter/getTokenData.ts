import { Action } from "../../types/action.js";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { JupiterTokenData } from "../../types/index.js";
import {
  getTokenAddressFromTicker,
  getTokenDataByAddress,
} from "../../tools/index.js";
import { BrainPowerAgent } from "../../agent/index.js";

export type GetTokenDataInput = z.infer<typeof getTokenDataSchema>;

const getTokenDataSchema = z
  .object({
    address: z.string().optional().describe("The token's mint address"),
    ticker: z.string().optional().describe("The token's ticker symbol"),
  })
  .refine((data) => data.address || data.ticker, {
    message: "Either address or ticker must be provided",
  });

const getTokenDataAction: Action = {
  name: "GET_TOKEN_DATA",
  similes: [
    "get token info",
    "token details",
    "lookup token",
    "find token",
    "token data",
  ],
  description: "Get token data from either a token address or ticker symbol",
  examples: [
    [
      {
        input: {
          address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        output: {
          status: "success",
          token: {
            name: "USD Coin",
            symbol: "USDC",
            address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            decimals: 6,
          },
        },
        explanation: "Get token data using the token's address",
      },
    ],
    [
      {
        input: {
          ticker: "SOL",
        },
        output: {
          status: "success",
          token: {
            name: "Wrapped SOL",
            symbol: "SOL",
            address: "So11111111111111111111111111111111111111112",
            decimals: 9,
          },
        },
        explanation: "Get token data using the token's ticker symbol",
      },
    ],
  ],
  schema: getTokenDataSchema,
  handler: async (agent: BrainPowerAgent, input: Record<string, any>) => {
    try {
      let tokenData: JupiterTokenData | undefined;
      if (input.address) {
        tokenData = await getTokenDataByAddress(new PublicKey(input.address));
      } else if (input.ticker) {
        const address = await getTokenAddressFromTicker(input.ticker);
        if (address) {
          tokenData = await getTokenDataByAddress(new PublicKey(address));
        }
      }
      if (!tokenData) {
        return {
          status: "error",
          message: "Token not found or not verified",
        };
      }
      return {
        status: "success",
        message: "Successfully retrieved token data",
        data: {
          name: tokenData.name,
          symbol: tokenData.symbol,
          address: tokenData.address,
          decimals: tokenData.decimals,
          logoURI: tokenData.logoURI,
        },
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get token data: ${error.message}`,
      };
    }
  },
};

export default getTokenDataAction;
