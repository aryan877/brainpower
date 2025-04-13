import { AgentDetails } from "@repo/brainpower-agent";

export interface GetPagedAgentsResponse {
  data: AgentDetails[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}
