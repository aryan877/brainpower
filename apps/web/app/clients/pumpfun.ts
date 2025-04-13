import api from "../lib/axios";
import { BundleAnalysisResponse } from "@repo/brainpower-agent";

export const pumpfunClient = {
  getBundleAnalysis: async (
    mintAddress: string
  ): Promise<BundleAnalysisResponse> => {
    const { data } = await api.get<BundleAnalysisResponse>(
      "/api/pumpfun/bundle-analysis",
      {
        params: { mintAddress },
      }
    );
    return data;
  },
};
