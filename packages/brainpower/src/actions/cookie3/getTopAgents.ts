import { z } from "zod";
import { Action, HandlerResponse } from "../../types/action.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { ACTION_NAMES } from "../actionNames.js";
import { getTopAgents } from "../../tools/cookie3/get_agent_data.js";
import { AgentsPagedResponse, Interval } from "../../types/index.js";

export type GetTopAgentsInput = z.infer<typeof schema>;

const schema = z.object({
  page: z.number().min(1).optional().describe("Page number (starts at 1)"),
  pageSize: z
    .number()
    .min(1)
    .max(25)
    .optional()
    .describe("Number of agents per page (1-25)"),
  interval: z
    .enum(["_3Days", "_7Days"] as const)
    .optional()
    .describe("Time interval for stats (_3Days or _7Days)"),
});

export const getTopAgentsAction: Action = {
  name: ACTION_NAMES.GET_TOP_AGENTS,
  similes: [
    "get top agents",
    "list top agents",
    "show best agents",
    "find leading agents",
    "get most popular agents",
  ],
  description:
    "Get a list of top AI agents ordered by mindshare with their stats and details",
  examples: [
    [
      {
        input: {
          page: 1,
          pageSize: 10,
          interval: "_7Days",
        },
        output: {
          status: "success",
          data: [
            {
              agentName: "aixbt",
              mindshare: 11.07,
              marketCap: 642555132,
              price: 0.64325315,
              holdersCount: 163630,
              followersCount: 408019,
            },
            // ... more agents
          ],
          message: "Successfully fetched top 10 agents",
        },
        explanation: "Getting the first page of top 10 agents by mindshare",
      },
    ],
  ],
  schema,
  handler: async (
    agent: BrainPowerAgent,
    input: Record<string, any>,
  ): Promise<HandlerResponse<AgentsPagedResponse>> => {
    try {
      const { page = 1, pageSize = 10, interval = "_7Days" } = input;
      const agentsData = await getTopAgents(
        page,
        pageSize,
        interval as Interval,
      );

      return {
        status: "success",
        data: agentsData,
        message: `Successfully fetched top ${pageSize} agents (Don't reiterate the results as they are visible in the UI)`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get top agents: ${error.message}`,
        error: {
          code: error.code || "UNKNOWN_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};

export default getTopAgentsAction;
