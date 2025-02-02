import { z } from "zod";
import { Action, HandlerResponse } from "../../types/action.js";
import { ACTION_NAMES } from "../actionNames.js";
import { fetchTokenDetailedReport } from "../../tools/rugcheck/rugcheck.js";
import { TokenCheck } from "../../types/index.js";

export type RugcheckInput = z.infer<typeof rugcheckSchema>;

const rugcheckSchema = z.object({
  mint: z.string().min(32).max(44),
});

const rugcheckAction: Action = {
  name: ACTION_NAMES.RUGCHECK_BY_ADDRESS,
  similes: [
    "check token safety",
    "analyze token risk",
    "verify token legitimacy",
    "token security check",
    "rugcheck",
  ],
  description:
    "Analyzes a token's safety and legitimacy using rugcheck.xyz API",
  examples: [
    [
      {
        input: {
          mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        output: {
          // Example response structure
          status: "success",
          data: {
            score: 85,
            risk_level: "low",
            warnings: [],
          },
        },
        explanation: "Checking the safety score of USDC token",
      },
    ],
  ],
  schema: rugcheckSchema,
  handler: async (
    BrainPowerAgent,
    input: Record<string, any>,
  ): Promise<HandlerResponse<TokenCheck>> => {
    try {
      const report = await fetchTokenDetailedReport(input.mint);
      return {
        status: "success",
        message:
          "Token safety analysis complete. Would you like me to explain any specific risk factors or analyze particular holder patterns?",
        data: report,
      };
    } catch (error: any) {
      return {
        status: "error",
        message:
          "Failed to fetch token safety report. Please try again or provide a different token address.",
        error: {
          code: "RUGCHECK_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};

export default rugcheckAction;
