import {
  AgentDetails,
  Interval,
  AgentsPagedResponse,
} from "src/types/index.js";
import Cookie3Client from "./client.js";

const API_KEY = process.env.COOKIE3_API_KEY || "";
const SOLANA_CHAIN_ID = -2;

/**
 * Filter agent details to only include Solana contracts
 * @param {AgentDetails} agent - Agent details to filter
 * @returns {AgentDetails} Agent details with only Solana contracts
 */
function filterSolanaContracts(agent: AgentDetails): AgentDetails {
  return {
    ...agent,
    contracts: agent.contracts.filter(
      (contract) => contract.chain === SOLANA_CHAIN_ID,
    ),
  };
}

/**
 * Get agent details by Twitter username
 * @param {string} twitterUsername - Twitter username of the agent
 * @param {Interval} interval - Time interval for stats (_3Days or _7Days)
 * @returns {Promise<AgentDetails>} Agent details and stats (Solana contracts only)
 */
export async function getAgentByTwitterUsername(
  twitterUsername: string,
  interval: Interval = "_7Days",
): Promise<AgentDetails> {
  try {
    if (!twitterUsername) {
      throw new Error("Twitter username is required");
    }

    const client = new Cookie3Client(API_KEY);
    const agent = await client.getAgentByTwitterUsername(
      twitterUsername,
      interval,
    );
    return filterSolanaContracts(agent);
  } catch (error: any) {
    throw new Error(`Error fetching agent data: ${error.message}`);
  }
}

/**
 * Get agent details by contract address
 * @param {string} contractAddress - Contract address of one of the agent's tokens
 * @param {Interval} interval - Time interval for stats (_3Days or _7Days)
 * @returns {Promise<AgentDetails>} Agent details and stats (Solana contracts only)
 */
export async function getAgentByContractAddress(
  contractAddress: string,
  interval: Interval = "_7Days",
): Promise<AgentDetails> {
  try {
    if (!contractAddress) {
      throw new Error("Contract address is required");
    }

    const client = new Cookie3Client(API_KEY);
    const agent = await client.getAgentByContractAddress(
      contractAddress,
      interval,
    );
    return filterSolanaContracts(agent);
  } catch (error: any) {
    throw new Error(`Error fetching agent data: ${error.message}`);
  }
}

/**
 * Get paged list of agents ordered by mindshare
 * @param {number} page - Page number (starts at 1)
 * @param {number} pageSize - Number of items per page (1-25)
 * @param {Interval} interval - Time interval for stats (_3Days or _7Days)
 * @returns {Promise<AgentsPagedResponse>} List of agents with their details and pagination data
 */
export async function getTopAgents(
  page: number = 1,
  pageSize: number = 10,
  interval: Interval = "_7Days",
): Promise<AgentsPagedResponse> {
  try {
    if (pageSize < 1 || pageSize > 25) {
      throw new Error("Page size must be between 1 and 25");
    }

    const client = new Cookie3Client(API_KEY);
    const response = await client.getAgentsPaged(interval, page, pageSize);

    return {
      data: response.data.map(filterSolanaContracts),
      currentPage: response.currentPage,
      totalPages: response.totalPages,
      totalCount: response.totalCount,
    };
  } catch (error: any) {
    throw new Error(`Error fetching top agents: ${error.message}`);
  }
}
