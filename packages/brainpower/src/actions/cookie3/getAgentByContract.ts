import { z } from "zod";
import { Action, HandlerResponse } from "../../types/action.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { ACTION_NAMES } from "../actionNames.js";
import { getAgentByContractAddress } from "../../tools/cookie3/get_agent_data.js";
import { AgentDetails, Interval } from "../../types/index.js";

export type GetAgentByContractInput = z.infer<typeof schema>;

const schema = z.object({
  contractAddress: z
    .string()
    .describe("Contract address of one of the agent's tokens"),
  interval: z
    .enum(["_3Days", "_7Days"] as const)
    .optional()
    .describe("Time interval for stats (_3Days or _7Days)"),
});

export const getAgentByContract: Action = {
  name: ACTION_NAMES.GET_AGENT_BY_CONTRACT,
  similes: [
    "get agent by contract",
    "find agent using contract",
    "lookup agent from contract address",
    "get agent info by token address",
    "search agent by contract",
  ],
  description:
    "Get detailed agent information and stats using one of their token contract addresses",
  examples: [
    [
      {
        input: {
          contractAddress: "0xc0041ef357b183448b235a8ea73ce4e4ec8c265f",
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
            "Successfully fetched agent data for contract address: 0xc0041ef357b183448b235a8ea73ce4e4ec8c265f",
        },
        explanation:
          "Getting agent data for Cookie using their token contract address",
      },
    ],
  ],
  schema,
  handler: async (
    agent: BrainPowerAgent,
    input: Record<string, any>,
  ): Promise<HandlerResponse<AgentDetails>> => {
    try {
      const { contractAddress, interval = "_7Days" } = input;
      const agentData = await getAgentByContractAddress(
        contractAddress,
        interval as Interval,
      );

      return {
        status: "success",
        data: agentData,
        message: `Successfully fetched agent data for contract address: ${contractAddress} (Don't reiterate the results as they are visible in the UI)`,
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

export default getAgentByContract;
