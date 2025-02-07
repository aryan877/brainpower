import { z } from "zod";
import { Action, HandlerResponse } from "../../types/action.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { ACTION_NAMES } from "../actionNames.js";
import { getAgentByTwitterUsername } from "../../tools/cookie3/get_agent_data.js";
import { AgentDetails, Interval } from "../../types/index.js";

export type GetAgentByTwitterInput = z.infer<typeof schema>;

const schema = z.object({
  twitterUsername: z.string().describe("Twitter username of the agent"),
  interval: z
    .enum(["_3Days", "_7Days"] as const)
    .optional()
    .describe("Time interval for stats (_3Days or _7Days)"),
});

export const getAgentByTwitter: Action = {
  name: ACTION_NAMES.GET_AGENT_BY_TWITTER,
  similes: [
    "get agent by twitter",
    "find agent using twitter",
    "lookup agent from twitter",
    "get agent info by twitter handle",
    "search agent by twitter username",
  ],
  description:
    "Get detailed agent information and stats using their Twitter username",
  examples: [
    [
      {
        input: {
          twitterUsername: "cookiedotfun",
          interval: "_7Days",
        },
        output: {
          status: "success",
          data: {
            agentName: "Cookie",
            mindshare: 1.86,
            marketCap: 177589915,
            price: 0.55419497,
            holdersCount: 72286,
            followersCount: 510516,
          },
          message:
            "Successfully fetched agent data for Twitter username: cookiedotfun (Don't reiterate the results as they are visible in the UI)",
        },
        explanation:
          "Getting agent data for Cookie using their Twitter username",
      },
    ],
  ],
  schema,
  handler: async (
    agent: BrainPowerAgent,
    input: Record<string, any>,
  ): Promise<HandlerResponse<AgentDetails>> => {
    try {
      const { twitterUsername, interval = "_7Days" } = input;
      const agentData = await getAgentByTwitterUsername(
        twitterUsername,
        interval as Interval,
      );

      return {
        status: "success",
        data: agentData,
        message: `Successfully fetched agent data for Twitter username: ${twitterUsername} (Don't reiterate the results as they are visible in the UI)`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get agent data: ${error.message}`,
        error: {
          code: error.code || "UNKNOWN_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};

export default getAgentByTwitter;
