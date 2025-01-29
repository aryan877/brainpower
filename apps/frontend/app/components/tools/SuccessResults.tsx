import {
  ACTION_NAMES,
  JupiterTokenData,
  PumpfunLaunchResponse,
} from "@repo/brainpower-agent";
import { PumpFunSuccess } from "./success/PumpFunSuccess";
import { TokenAddressSuccess } from "./success/TokenAddressSuccess";

// Define a mapping of tool names to their success result types
export type SuccessResultsMap = {
  [ACTION_NAMES.LAUNCH_PUMPFUN_TOKEN]: PumpfunLaunchResponse;
  [ACTION_NAMES.GET_TOKEN_DATA_BY_TICKER]: JupiterTokenData;
};

// Registry of tools that have success components
export const SUCCESS_COMPONENTS_REGISTRY = {
  [ACTION_NAMES.LAUNCH_PUMPFUN_TOKEN]: true,
  [ACTION_NAMES.GET_TOKEN_DATA_BY_TICKER]: true,
} as const;

// Type guard to check if a tool has success results
export function hasSuccessComponent(
  toolName: string
): toolName is keyof SuccessResultsMap {
  return toolName in SUCCESS_COMPONENTS_REGISTRY;
}

interface SuccessResultsProps<T extends keyof SuccessResultsMap> {
  toolName: T;
  data: SuccessResultsMap[T];
}

export function SuccessResults<T extends keyof SuccessResultsMap>({
  toolName,
  data,
}: SuccessResultsProps<T>) {
  switch (toolName) {
    case ACTION_NAMES.LAUNCH_PUMPFUN_TOKEN:
      return <PumpFunSuccess data={data as PumpfunLaunchResponse} />;
    case ACTION_NAMES.GET_TOKEN_DATA_BY_TICKER:
      return <TokenAddressSuccess data={data as JupiterTokenData} />;
    default:
      return null;
  }
}
