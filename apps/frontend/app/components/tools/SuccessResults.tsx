import {
  ACTION_NAMES,
  JupiterTokenData,
  PumpfunLaunchResponse,
  TokenHolder,
  ChartAddressResponse,
} from "@repo/brainpower-agent";
import { PumpFunSuccess } from "./success/PumpFunSuccess";
import { TokenAddressSuccess } from "./success/TokenAddressSuccess";
import { TokenHoldersSuccess } from "./success/TokenHoldersSuccess";
import { ChartAddressSuccess } from "./success/ChartAddressSuccess";

// Define a mapping of tool names to their success result types
export type SuccessResultsMap = {
  [ACTION_NAMES.LAUNCH_PUMPFUN_TOKEN]: PumpfunLaunchResponse;
  [ACTION_NAMES.GET_TOKEN_DATA_BY_TICKER]: JupiterTokenData;
  [ACTION_NAMES.GET_TOKEN_TOP_HOLDERS]: { holders: TokenHolder[] };
  [ACTION_NAMES.GET_TOKEN_CHART_ADDRESS]: ChartAddressResponse;
};

// Registry of tools that have success components
export const SUCCESS_COMPONENTS_REGISTRY = {
  [ACTION_NAMES.LAUNCH_PUMPFUN_TOKEN]: true,
  [ACTION_NAMES.GET_TOKEN_DATA_BY_TICKER]: true,
  [ACTION_NAMES.GET_TOKEN_TOP_HOLDERS]: true,
  [ACTION_NAMES.GET_TOKEN_CHART_ADDRESS]: true,
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
    case ACTION_NAMES.GET_TOKEN_TOP_HOLDERS:
      return <TokenHoldersSuccess data={data as { holders: TokenHolder[] }} />;
    case ACTION_NAMES.GET_TOKEN_CHART_ADDRESS:
      return <ChartAddressSuccess data={data as ChartAddressResponse} />;
    default:
      return null;
  }
}
