import launchPumpfunTokenAction from "./pumpfun/launchPumpfunToken.js";
import tokenDataByTickerAction from "./dexscreener/tokenDataByTicker.js";
import { tokenTopHolders as tokenTopHoldersAction } from "./helius/tokenTopHolders.js";
import { tokenDataByAddress as tokenDataByAddressAction } from "./dexscreener/tokenDataByAddress.js";
import tradeAction from "./jupiter/trade.js";
import { ACTION_NAMES } from "./actionNames.js";
import getTokenChartAddressAction from "./dexscreener/getTokenChartAddress.js";
import rugcheckAction from "./rugcheck/rugcheck.js";
import {
  closeEmptyTokenAccountsAction,
  getBalanceAction,
  getBalanceOtherAction,
  getTokenBalancesAction,
  getTPSAction,
  requestFaucetFundsAction,
  transferAction,
} from "./solana/index.js";
import askForConfirmationAction from "./confirmation/askForConfirmation.js";
import getAgentByTwitter from "./cookie3/getAgentByTwitter.js";
import getAgentByContract from "./cookie3/getAgentByContract.js";
import getTopAgents from "./cookie3/getTopAgents.js";
import searchTweets from "./cookie3/searchTweets.js";
import getBundleAnalysisPumpFunAction from "./pumpfun/getBundleAnalysisPumpfun.js";

export { ACTION_NAMES };

export const ACTIONS = {
  [ACTION_NAMES.LAUNCH_PUMPFUN_TOKEN]: launchPumpfunTokenAction,
  [ACTION_NAMES.GET_BUNDLE_ANALYSIS_PUMPFUN]: getBundleAnalysisPumpFunAction,
  [ACTION_NAMES.GET_TOKEN_DATA_BY_TICKER]: tokenDataByTickerAction,
  [ACTION_NAMES.GET_TOKEN_DATA_BY_ADDRESS]: tokenDataByAddressAction,
  [ACTION_NAMES.JUPITER_SWAP]: tradeAction,
  [ACTION_NAMES.GET_TOKEN_TOP_HOLDERS]: tokenTopHoldersAction,
  [ACTION_NAMES.GET_TOKEN_CHART_ADDRESS]: getTokenChartAddressAction,
  [ACTION_NAMES.RUGCHECK_BY_ADDRESS]: rugcheckAction,
  [ACTION_NAMES.CLOSE_EMPTY_TOKEN_ACCOUNTS]: closeEmptyTokenAccountsAction,
  [ACTION_NAMES.GET_BALANCE]: getBalanceAction,
  [ACTION_NAMES.GET_BALANCE_OTHER]: getBalanceOtherAction,
  [ACTION_NAMES.GET_TOKEN_BALANCES]: getTokenBalancesAction,
  [ACTION_NAMES.GET_TPS]: getTPSAction,
  [ACTION_NAMES.REQUEST_FAUCET_FUNDS]: requestFaucetFundsAction,
  [ACTION_NAMES.TRANSFER]: transferAction,
  [ACTION_NAMES.ASK_FOR_CONFIRMATION]: askForConfirmationAction,
  // Cookie3 Actions
  [ACTION_NAMES.GET_AGENT_BY_TWITTER]: getAgentByTwitter,
  [ACTION_NAMES.GET_AGENT_BY_CONTRACT]: getAgentByContract,
  [ACTION_NAMES.GET_TOP_AGENTS]: getTopAgents,
  [ACTION_NAMES.SEARCH_TWEETS]: searchTweets,
};

export type { Action, ActionExample, Handler } from "../types/action.js";
