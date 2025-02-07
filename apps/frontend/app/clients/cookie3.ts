import api from "../lib/axios";
import { GetPagedAgentsResponse } from "../types/api/cookie3";

export const cookie3Client = {
  getPagedAgents: async (params: {
    page?: number;
    pageSize?: number;
    interval?: "_3Days" | "_7Days";
  }): Promise<GetPagedAgentsResponse> => {
    const { data } = await api.get<GetPagedAgentsResponse>(
      "/api/cookie3/agents",
      {
        params,
      }
    );
    return data;
  },
};
