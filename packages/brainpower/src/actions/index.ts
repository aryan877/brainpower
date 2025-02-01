import launchPumpfunTokenAction from "./pumpfun/launchPumpfunToken.js";
import tokenDataByTickerAction from "./dexscreener/tokenDataByTicker.js";
import { tokenTopHolders as tokenTopHoldersAction } from "./helius/tokenTopHolders.js";
import { tokenDataByAddress as tokenDataByAddressAction } from "./dexscreener/tokenDataByAddress.js";
import tradeAction from "./jupiter/trade.js";
import { ACTION_NAMES } from "./actionNames.js";
import getTokenChartAddressAction from "./dexscreener/getTokenChartAddress.js";
import rugcheckAction from "./rugcheck/rugcheck.js";

export { ACTION_NAMES };

export const ACTIONS = {
  [ACTION_NAMES.LAUNCH_PUMPFUN_TOKEN]: launchPumpfunTokenAction,
  [ACTION_NAMES.GET_TOKEN_DATA_BY_TICKER]: tokenDataByTickerAction,
  [ACTION_NAMES.GET_TOKEN_DATA_BY_ADDRESS]: tokenDataByAddressAction,
  [ACTION_NAMES.JUPITER_SWAP]: tradeAction,
  [ACTION_NAMES.GET_TOKEN_TOP_HOLDERS]: tokenTopHoldersAction,
  [ACTION_NAMES.GET_TOKEN_CHART_ADDRESS]: getTokenChartAddressAction,
  [ACTION_NAMES.RUGCHECK_BY_ADDRESS]: rugcheckAction,
};

export type { Action, ActionExample, Handler } from "../types/action.js";
