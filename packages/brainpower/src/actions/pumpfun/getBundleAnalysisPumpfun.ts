import { Action, HandlerResponse } from "../../types/index.js";
import { z } from "zod";
import { ACTION_NAMES } from "../actionNames.js";
import { analyzePumpFunBundles } from "../../tools/pumpfun/bundle_analysis.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { BundleAnalysisResponse } from "../../types/index.js";

export type GetBundleAnalysisPumpFunInput = z.infer<
  typeof getBundleAnalysisSchema
>;

const getBundleAnalysisSchema = z.object({
  mintAddress: z.string().min(32, "Invalid mint address"),
});

const getBundleAnalysisPumpFunAction: Action = {
  name: ACTION_NAMES.GET_BUNDLE_ANALYSIS_PUMPFUN,
  similes: [
    "analyze pump.fun bundles",
    "check pump token bundles",
    "get bundle analysis",
    "pump.fun bundle status",
    "check pump.fun bundles",
  ],
  description:
    "Analyze top 5 trading bundles and patterns for a token on Pump.fun",
  examples: [
    [
      {
        input: {
          mintAddress: "GjSn1XHncttWZtx9u6JB9BNM3QYqiumXfGbtkm4ypump",
        },
        output: {
          status: "success",
          data: {
            mint: "GjSn1XHncttWZtx9u6JB9BNM3QYqiumXfGbtkm4ypump",
            totalTrades: 150,
            bundles: [
              {
                slot: 12345,
                uniqueWallets: 3,
                trades: [],
                totalTokenAmount: 1000000000,
                totalSolAmount: 1.5,
                supplyPercentage: "0.1000",
                holdingAmount: 500000000,
                holdingPercentage: "0.0500",
                category: "🎯 Snipers",
                walletSummaries: {},
              },
              // ... up to 5 bundles total
            ],
          },
          message: "Found top 5 bundles from total trades: 150",
        },
        explanation: "Get top 5 bundle analysis for a token on Pump.fun",
      },
    ],
  ],
  schema: getBundleAnalysisSchema,
  handler: async (
    agent: BrainPowerAgent,
    input: Record<string, any>,
  ): Promise<HandlerResponse<BundleAnalysisResponse>> => {
    try {
      const analysis = await analyzePumpFunBundles(input.mintAddress);
      return {
        status: "success",
        message: `Found top 5 bundles from total trades: ${analysis.totalTrades}. User can see the bundle details in the UI. Do not re-iterate this message.`,
        data: analysis,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get bundle analysis: ${error.message}`,
        error: {
          code: "GET_PUMPFUN_BUNDLES_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};

export default getBundleAnalysisPumpFunAction;
