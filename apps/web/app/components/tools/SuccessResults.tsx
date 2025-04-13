import {
  ACTION_NAMES,
  AgentDetails,
  AgentsPagedResponse,
  BundleAnalysisResponse,
  ChartAddressResponse,
  JupiterSwapResponse,
  JupiterTokenData,
  PumpfunLaunchResponse,
  TokenBalancesResponse,
  TokenCheck,
  TokenHolder,
  TransferResponse,
  TrendingTokensResponse,
  TweetSearchResult,
  deBridgeEnhancedQuoteResponse,
  deBridgeSupportedChainsResponse,
} from "@repo/brainpower-agent";
import { AgentDetailsSuccess } from "./success/AgentDetailsSuccess";
import { BridgeQuoteSuccess } from "./success/BridgeQuoteSuccess";
import {
  BridgeStatusSuccess,
  type BridgeStatusSuccessProps,
} from "./success/BridgeStatusSuccess";
import {
  BridgeTransferSuccess,
  type BridgeTransferSuccessProps,
} from "./success/BridgeTransferSuccess";
import { BundleAnalysisSuccess } from "./success/BundleAnalysisSuccess";
import { ChartAddressSuccess } from "./success/ChartAddressSuccess";
import { ConfirmationSuccess } from "./success/ConfirmationSuccess";
import { PumpFunSuccess } from "./success/PumpFunSuccess";
import { RugcheckSuccess } from "./success/RugcheckSuccess";
import { SupportedChainsSuccess } from "./success/SupportedChainsSuccess";
import { SwapSuccess } from "./success/SwapSuccess";
import { TokenAddressSuccess } from "./success/TokenAddressSuccess";
import { TokenBalancesSuccess } from "./success/TokenBalancesSuccess";
import { TokenHoldersSuccess } from "./success/TokenHoldersSuccess";
import { TransferSuccess } from "./success/TransferSuccess";
import { TrendingTokensSuccess } from "./success/TrendingTokensSuccess";
import { TweetSearchSuccess } from "./success/TweetSearchSuccess";

// Define a mapping of tool names to their success result types
export type SuccessResultsMap = {
  [ACTION_NAMES.LAUNCH_PUMPFUN_TOKEN]: PumpfunLaunchResponse;
  [ACTION_NAMES.GET_BUNDLE_ANALYSIS_PUMPFUN]: BundleAnalysisResponse;
  [ACTION_NAMES.GET_TOKEN_DATA_BY_TICKER]: JupiterTokenData;
  [ACTION_NAMES.GET_TOKEN_TOP_HOLDERS]: { holders: TokenHolder[] };
  [ACTION_NAMES.GET_TOKEN_CHART_ADDRESS]: ChartAddressResponse;
  [ACTION_NAMES.JUPITER_SWAP]: JupiterSwapResponse;
  [ACTION_NAMES.RUGCHECK_BY_ADDRESS]: TokenCheck;
  [ACTION_NAMES.TRANSFER]: TransferResponse;
  [ACTION_NAMES.GET_TOKEN_BALANCES]: TokenBalancesResponse;
  [ACTION_NAMES.ASK_FOR_CONFIRMATION]: { confirmed: boolean };
  // Cookie3 Success Results
  [ACTION_NAMES.GET_AGENT_BY_TWITTER]: AgentDetails;
  [ACTION_NAMES.GET_AGENT_BY_CONTRACT]: AgentDetails;
  [ACTION_NAMES.GET_TOP_AGENTS]: AgentsPagedResponse;
  [ACTION_NAMES.SEARCH_TWEETS]: TweetSearchResult[];
  // Coingecko Success Results
  [ACTION_NAMES.GET_COINGECKO_TRENDING_TOKENS]: TrendingTokensResponse;
  // deBridge Success Results
  [ACTION_NAMES.GET_SUPPORTED_CHAINS]: deBridgeSupportedChainsResponse;
  [ACTION_NAMES.DEBRIDGE_FETCH_BRIDGE_QUOTE]: deBridgeEnhancedQuoteResponse;
  [ACTION_NAMES.DEBRIDGE_VERIFY_TX_STATUS]: BridgeStatusSuccessProps["data"];
  [ACTION_NAMES.DEBRIDGE_EXECUTE_BRIDGE_TRANSFER]: BridgeTransferSuccessProps["data"];
};

// Registry of tools that have success components
export const SUCCESS_COMPONENTS_REGISTRY = {
  [ACTION_NAMES.LAUNCH_PUMPFUN_TOKEN]: true,
  [ACTION_NAMES.GET_BUNDLE_ANALYSIS_PUMPFUN]: true,
  [ACTION_NAMES.GET_TOKEN_DATA_BY_TICKER]: true,
  [ACTION_NAMES.GET_TOKEN_TOP_HOLDERS]: true,
  [ACTION_NAMES.GET_TOKEN_CHART_ADDRESS]: true,
  [ACTION_NAMES.JUPITER_SWAP]: true,
  [ACTION_NAMES.RUGCHECK_BY_ADDRESS]: true,
  [ACTION_NAMES.TRANSFER]: true,
  [ACTION_NAMES.GET_TOKEN_BALANCES]: true,
  [ACTION_NAMES.ASK_FOR_CONFIRMATION]: true,
  // Cookie3 Components
  [ACTION_NAMES.GET_AGENT_BY_TWITTER]: true,
  [ACTION_NAMES.GET_AGENT_BY_CONTRACT]: true,
  [ACTION_NAMES.GET_TOP_AGENTS]: true,
  [ACTION_NAMES.SEARCH_TWEETS]: true,
  // Coingecko Components
  [ACTION_NAMES.GET_COINGECKO_TRENDING_TOKENS]: true,
  // deBridge Components
  [ACTION_NAMES.GET_SUPPORTED_CHAINS]: true,
  [ACTION_NAMES.DEBRIDGE_FETCH_BRIDGE_QUOTE]: true,
  [ACTION_NAMES.DEBRIDGE_VERIFY_TX_STATUS]: true,
  [ACTION_NAMES.DEBRIDGE_EXECUTE_BRIDGE_TRANSFER]: true,
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
    case ACTION_NAMES.GET_COINGECKO_TRENDING_TOKENS:
      return <TrendingTokensSuccess data={data as TrendingTokensResponse} />;
    case ACTION_NAMES.LAUNCH_PUMPFUN_TOKEN:
      return <PumpFunSuccess data={data as PumpfunLaunchResponse} />;
    case ACTION_NAMES.GET_BUNDLE_ANALYSIS_PUMPFUN:
      return <BundleAnalysisSuccess data={data as BundleAnalysisResponse} />;
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
    // Cookie3 Success Components
    case ACTION_NAMES.GET_AGENT_BY_TWITTER:
    case ACTION_NAMES.GET_AGENT_BY_CONTRACT:
      return <AgentDetailsSuccess data={data as AgentDetails} />;
    case ACTION_NAMES.GET_TOP_AGENTS:
      return (
        <AgentDetailsSuccess data={data as AgentsPagedResponse} isMultiple />
      );
    case ACTION_NAMES.SEARCH_TWEETS:
      return <TweetSearchSuccess data={data as TweetSearchResult[]} />;
    // deBridge Success Components
    case ACTION_NAMES.GET_SUPPORTED_CHAINS:
      return (
        <SupportedChainsSuccess
          data={data as deBridgeSupportedChainsResponse}
        />
      );
    case ACTION_NAMES.DEBRIDGE_FETCH_BRIDGE_QUOTE:
      return (
        <BridgeQuoteSuccess
          data={{ data: data as deBridgeEnhancedQuoteResponse }}
        />
      );
    case ACTION_NAMES.DEBRIDGE_VERIFY_TX_STATUS:
      return (
        <BridgeStatusSuccess data={data as BridgeStatusSuccessProps["data"]} />
      );
    case ACTION_NAMES.DEBRIDGE_EXECUTE_BRIDGE_TRANSFER:
      return (
        <BridgeTransferSuccess
          data={data as BridgeTransferSuccessProps["data"]}
        />
      );
    default:
      return null;
  }
}
