import { Action } from "../../types/index.js";
import { z } from "zod";
import { ACTION_NAMES } from "../actionNames.js";
import { getTPS } from "../../tools/solana/get_tps.js";
import { BrainPowerAgent } from "src/agent/index.js";

export type GetTPSInput = z.infer<typeof getTPSSchema>;

const getTPSSchema = z.object({});

const getTPSAction: Action = {
  name: ACTION_NAMES.GET_TPS,
  similes: [
    "check network speed",
    "get transactions per second",
    "view network tps",
    "check tps",
    "network performance",
  ],
  description:
    "Get the current transactions per second (TPS) of the Solana network",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          tps: 3500,
          message: "Current network TPS: 3,500",
        },
        explanation: "Get the current Solana network TPS",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: BrainPowerAgent) => {
    try {
      const tps = await getTPS(agent);

      return {
        status: "success",
        message: `Current network TPS: ${tps.toLocaleString()}`,
        data: { tps },
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get network TPS: ${error.message}`,
        error: {
          code: "GET_TPS_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};

export default getTPSAction;
