import axios, { AxiosInstance } from "axios";
import {
  AgentDetails,
  AgentsPagedResponse,
  Interval,
  TweetSearchResult,
} from "src/types/index.js";

export class Cookie3Client {
  private client: AxiosInstance;
  private baseUrl = "https://api.cookie.fun";

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "x-api-key": apiKey,
      },
    });
  }

  // Helper method to handle API responses
  private async handleResponse<T>(promise: Promise<any>): Promise<T> {
    try {
      const response = await promise;
      if (response.data.success) {
        return response.data.ok as T;
      }
      throw new Error(response.data.error?.errorMessage || "Unknown error");
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error("Rate limit exceeded");
      }
      throw error;
    }
  }

  // Check authorization status and quotas
  async checkAuthorization() {
    return this.handleResponse(this.client.get("/authorization"));
  }

  // Get agent by Twitter username
  async getAgentByTwitterUsername(
    twitterUsername: string,
    interval: Interval,
  ): Promise<AgentDetails> {
    return this.handleResponse(
      this.client.get(`/v2/agents/twitterUsername/${twitterUsername}`, {
        params: { interval },
      }),
    );
  }

  // Get agent by contract address
  async getAgentByContractAddress(
    contractAddress: string,
    interval: Interval,
  ): Promise<AgentDetails> {
    return this.handleResponse(
      this.client.get(`/v2/agents/contractAddress/${contractAddress}`, {
        params: { interval },
      }),
    );
  }

  // Get agents paged
  async getAgentsPaged(
    interval: Interval,
    page: number,
    pageSize: number,
  ): Promise<AgentsPagedResponse> {
    return this.handleResponse(
      this.client.get("/v2/agents/agentsPaged", {
        params: { interval, page, pageSize },
      }),
    );
  }

  // Search tweets
  async searchTweets(
    searchQuery: string,
    from: string,
    to: string,
  ): Promise<TweetSearchResult[]> {
    return this.handleResponse(
      this.client.get(
        `/v1/hackathon/search/${encodeURIComponent(searchQuery)}`,
        {
          params: { from, to },
        },
      ),
    );
  }
}

export default Cookie3Client;
