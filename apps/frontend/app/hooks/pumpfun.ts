import { useQuery } from "@tanstack/react-query";
import { pumpfunClient } from "../clients/pumpfun";

export const pumpfunKeys = {
  all: ["pumpfun"] as const,
  bundleAnalysis: (mintAddress: string) =>
    [...pumpfunKeys.all, "bundle-analysis", mintAddress] as const,
};

export function useBundleAnalysis(mintAddress: string) {
  return useQuery({
    queryKey: pumpfunKeys.bundleAnalysis(mintAddress),
    queryFn: () => pumpfunClient.getBundleAnalysis(mintAddress),
    enabled: !!mintAddress,
  });
}
