import {
  ACTION_NAMES,
  JupiterTokenData,
  PumpfunLaunchResponse,
  TokenHolder,
  ChartAddressResponse,
  JupiterSwapResponse,
  TokenCheck,
  TransferResponse,
  TokenBalancesResponse,
} from "@repo/brainpower-agent";
import { PumpFunSuccess } from "./success/PumpFunSuccess";
import { TokenAddressSuccess } from "./success/TokenAddressSuccess";
import { TokenHoldersSuccess } from "./success/TokenHoldersSuccess";
import { ChartAddressSuccess } from "./success/ChartAddressSuccess";
import { SwapSuccess } from "./success/SwapSuccess";
import { RugcheckSuccess } from "./success/RugcheckSuccess";
import { TransferSuccess } from "./success/TransferSuccess";
import { TokenBalancesSuccess } from "./success/TokenBalancesSuccess";
import { ConfirmationSuccess } from "./success/ConfirmationSuccess";

// Define a mapping of tool names to their success result types
export type SuccessResultsMap = {
  [ACTION_NAMES.LAUNCH_PUMPFUN_TOKEN]: PumpfunLaunchResponse;
  [ACTION_NAMES.GET_TOKEN_DATA_BY_TICKER]: JupiterTokenData;
  [ACTION_NAMES.GET_TOKEN_TOP_HOLDERS]: { holders: TokenHolder[] };
  [ACTION_NAMES.GET_TOKEN_CHART_ADDRESS]: ChartAddressResponse;
  [ACTION_NAMES.JUPITER_SWAP]: JupiterSwapResponse;
  [ACTION_NAMES.RUGCHECK_BY_ADDRESS]: TokenCheck;
  [ACTION_NAMES.TRANSFER]: TransferResponse;
  [ACTION_NAMES.GET_TOKEN_BALANCES]: TokenBalancesResponse;
  [ACTION_NAMES.ASK_FOR_CONFIRMATION]: { confirmed: boolean };
};

// Registry of tools that have success components
export const SUCCESS_COMPONENTS_REGISTRY = {
  [ACTION_NAMES.LAUNCH_PUMPFUN_TOKEN]: true,
  [ACTION_NAMES.GET_TOKEN_DATA_BY_TICKER]: true,
  [ACTION_NAMES.GET_TOKEN_TOP_HOLDERS]: true,
  [ACTION_NAMES.GET_TOKEN_CHART_ADDRESS]: true,
  [ACTION_NAMES.JUPITER_SWAP]: true,
  [ACTION_NAMES.RUGCHECK_BY_ADDRESS]: true,
  [ACTION_NAMES.TRANSFER]: true,
  [ACTION_NAMES.GET_TOKEN_BALANCES]: true,
  [ACTION_NAMES.ASK_FOR_CONFIRMATION]: true,
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
    case ACTION_NAMES.JUPITER_SWAP:
      return <SwapSuccess data={data as JupiterSwapResponse} />;
    case ACTION_NAMES.RUGCHECK_BY_ADDRESS:
      return <RugcheckSuccess data={data as TokenCheck} />;
    case ACTION_NAMES.TRANSFER:
      return <TransferSuccess data={data as TransferResponse} />;
    case ACTION_NAMES.GET_TOKEN_BALANCES:
      return <TokenBalancesSuccess data={data as TokenBalancesResponse} />;
    case ACTION_NAMES.ASK_FOR_CONFIRMATION:
      return <ConfirmationSuccess data={data as { confirmed: boolean }} />;
    default:
      return null;
  }
}
