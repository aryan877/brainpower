import { z } from "zod";
import { fetchBridgeQuote } from "../../tools/debridge/fetchBridgeQuote.js";
import type { Action } from "../../types/action.js";
import { ACTION_NAMES } from "../actionNames.js";

const fetchBridgeQuoteSchema = z.object({
  srcChainId: z.string().describe("Source chain ID (e.g., '1' for Ethereum)"),
  srcChainTokenIn: z.string().describe("Token address on source chain"),
  srcChainTokenInAmount: z
    .string()
    .describe("Amount to bridge (in token's smallest unit)"),
  dstChainId: z.string().describe("Destination chain ID"),
  dstChainTokenOut: z.string().describe("Token address on destination chain"),
  dstChainTokenOutRecipient: z
    .string()
    .min(1, { message: "Recipient address is required" })
    .describe(
      "REQUIRED: Recipient wallet address on destination chain - must be specified for all bridge transfers",
    ),
  account: z.string().describe("Sender's wallet address"),
  slippage: z
    .number()
    .optional()
    .describe("Optional slippage tolerance in percentage"),
  referralCode: z.string().optional().describe("Optional referral code"),
});

export type FetchBridgeQuoteInput = z.infer<typeof fetchBridgeQuoteSchema>;

export const fetchBridgeQuoteAction: Action = {
  name: ACTION_NAMES.DEBRIDGE_FETCH_BRIDGE_QUOTE,
  similes: [
    "fetch bridge quote",
    "estimate bridge cost",
    "check bridge fees",
    "calculate bridge amount",
    "get cross-chain transfer quote",
  ],
  description:
    "Fetch a quote for bridging tokens between chains including fees and estimated output. Always requires a valid recipient address on the destination chain.",
  examples: [
    [
      {
        input: {
          srcChainId: "1",
          srcChainTokenIn: "0x...",
          srcChainTokenInAmount: "1000000000000000000",
          dstChainId: "56",
          dstChainTokenOut: "0x...",
          dstChainTokenOutRecipient: "0x...", // Always required
          account: "0x...",
          slippage: 0.5,
        },
        output: {
          estimatedGas: "500000",
          fee: "0.001",
          estimatedOutput: "990000000000000000",
        },
        explanation:
          "Gets a quote for bridging 1 ETH from Ethereum to BSC, sending to the specified recipient",
      },
    ],
  ],
  schema: fetchBridgeQuoteSchema,
  handler: async (agent, input) => {
    const params = input as FetchBridgeQuoteInput;

    // Double-check recipient address
    if (
      !params.dstChainTokenOutRecipient ||
      params.dstChainTokenOutRecipient.trim() === ""
    ) {
      return {
        status: "error",
        message: "Recipient address is required for bridge transfers",
        error: {
          code: "MISSING_RECIPIENT",
          message:
            "You must specify a valid recipient address on the destination chain",
          details: {
            parameter: "dstChainTokenOutRecipient",
            value: params.dstChainTokenOutRecipient || null,
          },
        },
      };
    }

    try {
      const quote = await fetchBridgeQuote({
        srcChainId: params.srcChainId,
        srcChainTokenIn: params.srcChainTokenIn,
        srcChainTokenInAmount: params.srcChainTokenInAmount,
        dstChainId: params.dstChainId,
        dstChainTokenOut: params.dstChainTokenOut,
        dstChainTokenOutRecipient: params.dstChainTokenOutRecipient,
        account: params.account,
        slippage: params.slippage,
        referralCode: params.referralCode
          ? Number(params.referralCode)
          : undefined,
      });
      return {
        status: "success",
        message: "Successfully retrieved bridge quote",
        data: quote,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to get bridge quote",
        error: {
          code: error.code || "UNKNOWN_ERROR",
          message: error.message || "An unknown error occurred",
          details: error.details || {},
        },
      };
    }
  },
};
