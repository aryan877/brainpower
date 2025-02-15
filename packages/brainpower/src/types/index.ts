export * from "./input.js";
export * from "./cluster.js";
export * from "./action.js";

export interface Config {
  OPENAI_API_KEY?: string;
  JUPITER_REFERRAL_ACCOUNT?: string;
  JUPITER_FEE_BPS?: number;
  FLASH_PRIVILEGE?: string;
  HELIUS_API_KEY?: string;
  PRIORITY_LEVEL?: "low" | "medium" | "high";
}

export interface Creator {
  address: string;
  percentage: number;
}

export interface PumpFunTokenOptions {
  twitter?: string;
  telegram?: string;
  website?: string;
  initialLiquiditySOL?: number;
  slippageBps?: number;
  priorityFee?: number;
}

export interface PumpfunLaunchResponse {
  signature: string;
  mint: string;
  metadataUri?: string;
  error?: string;
}

export interface JupiterTokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  tags: string[];
  logoURI: string;
  daily_volume: number;
  freeze_authority: string | null;
  mint_authority: string | null;
  permanent_delegate: string | null;
  extensions: {
    coingeckoId?: string;
  };
}

export interface TokenHolder {
  address: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
  owner?: string | null;
  percentage?: number;
}

export interface JupiterFetchPriceResponse {
  price: string;
}

export interface JupiterSwapResponse {
  transaction: string;
  inputAmount: number;
  inputToken: string;
  outputToken: string;
  status?: "success" | "error";
  message?: string;
  error?: {
    code?: string;
    message?: string;
  };
}

export interface ChartAddressResponse {
  address: string;
}

export interface TokenCheck {
  tokenProgram: string;
  tokenType: string;
  risks: Array<{
    name: string;
    level: string;
    description: string;
    score: number;
    value?: string;
  }>;
  score: number;
}

// export interface CollectionOptions {
//   name: string;
//   uri: string;
//   royaltyBasisPoints?: number;
//   creators?: Creator[];
// }

// // Add return type interface
// export interface CollectionDeployment {
//   collectionAddress: PublicKey;
//   signature: Uint8Array;
// }

// export interface MintCollectionNFTResponse {
//   mint: PublicKey;
//   metadata: PublicKey;
// }

/**
 * Lulo Account Details response format
 */
// export interface LuloAccountDetailsResponse {
//   totalValue: number;
//   interestEarned: number;
//   realtimeApy: number;
//   settings: {
//     owner: string;
//     allowedProtocols: string | null;
//     homebase: string | null;
//     minimumRate: string;
//   };
// }

// export interface FetchPriceResponse {
//   status: "success" | "error";
//   tokenId?: string;
//   priceInUSDC?: string;
//   message?: string;
//   code?: string;
// }

// export interface PythFetchPriceResponse {
//   status: "success" | "error";
//   tokenSymbol: string;
//   priceFeedID?: string;
//   price?: string;
//   message?: string;
//   code?: string;
// }

// export interface GibworkCreateTaskReponse {
//   status: "success" | "error";
//   taskId?: string | undefined;
//   signature?: string | undefined;
// }

// export interface PythPriceFeedIDItem {
//   id: string;
//   attributes: {
//     asset_type: string;
//     base: string;
//   };
// }

// export interface PythPriceItem {
//   binary: {
//     data: string[];
//     encoding: string;
//   };
//   parsed: [
//     Array<{
//       id: string;
//       price: {
//         price: string;
//         conf: string;
//         expo: number;
//         publish_time: number;
//       };
//       ema_price: {
//         price: string;
//         conf: string;
//         expo: number;
//         publish_time: number;
//       };
//       metadata: {
//         slot: number;
//         proof_available_time: number;
//         prev_publish_time: number;
//       };
//     }>,
//   ];
// }

// export interface OrderParams {
//   quantity: number;
//   side: string;
//   price: number;
// }

// export interface BatchOrderPattern {
//   side: string;
//   totalQuantity?: number;
//   priceRange?: {
//     min?: number;
//     max?: number;
//   };
//   spacing?: {
//     type: "percentage" | "fixed";
//     value: number;
//   };
//   numberOfOrders?: number;
//   individualQuantity?: number;
// }

// export interface FlashTradeParams {
//   token: string;
//   side: "long" | "short";
//   collateralUsd: number;
//   leverage: number;
// }

// export interface FlashCloseTradeParams {
//   token: string;
//   side: "long" | "short";
// }

// export interface HeliusWebhookResponse {
//   webhookURL: string;
//   webhookID: string;
// }
// export interface HeliusWebhookIdResponse {
//   wallet: string;
//   webhookURL: string;
//   transactionTypes: string[];
//   accountAddresses: string[];
//   webhookType: string;
// }

// export interface PriorityFeeResponse {
//   jsonrpc: string;
//   id: string;
//   method: string;
//   params: Array<{
//     transaction: string;
//     options: { priorityLevel: string };
//   }>;
// }

export interface TokenBalancesResponse {
  sol: number;
  tokens: Array<{
    tokenAddress: string;
    name: string;
    symbol: string;
    balance: number;
    decimals: number;
  }>;
}

export interface TransferResponse {
  signature: string;
  amount: number;
  token?: string;
  recipient: string;
}

// Cookie3 API Types
// These types are used for interacting with the Cookie3 API which provides
// social media analytics and blockchain data for crypto projects
export interface Contract {
  chain: number;
  contractAddress: string;
}

export interface Tweet {
  tweetUrl: string;
  tweetAuthorProfileImageUrl: string;
  tweetAuthorDisplayName: string;
  smartEngagementPoints: number;
  impressionsCount: number;
}

export interface AgentDetails {
  agentName: string;
  contracts: Contract[];
  twitterUsernames: string[];
  mindshare: number;
  mindshareDeltaPercent: number;
  marketCap: number;
  marketCapDeltaPercent: number;
  price: number;
  priceDeltaPercent: number;
  liquidity: number;
  volume24Hours: number;
  volume24HoursDeltaPercent: number;
  holdersCount: number;
  holdersCountDeltaPercent: number;
  averageImpressionsCount: number;
  averageImpressionsCountDeltaPercent: number;
  averageEngagementsCount: number;
  averageEngagementsCountDeltaPercent: number;
  followersCount: number;
  smartFollowersCount: number;
  topTweets: Tweet[];
}

export interface AgentsPagedResponse {
  data: AgentDetails[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export interface TweetSearchResult {
  authorUsername: string;
  createdAt: string;
  engagementsCount: number;
  impressionsCount: number;
  isQuote: boolean;
  isReply: boolean;
  likesCount: number;
  quotesCount: number;
  repliesCount: number;
  retweetsCount: number;
  smartEngagementPoints: number;
  text: string;
  matchingScore: number;
}

export type Interval = "_3Days" | "_7Days";

// Pumpfun bundle analysis
export interface PumpFunTrade {
  slot: number;
  user: string;
  username?: string;
  token_amount: number;
  sol_amount: number;
  is_buy: boolean;
  signature: string;
  timestamp: number;
}

export interface WalletSummary {
  currentBalance: number;
  totalBought: number;
  totalSold: number;
  username?: string;
}

export interface BundleAnalysis {
  slot: number;
  uniqueWallets: number;
  trades: PumpFunTrade[];
  totalTokenAmount: number;
  totalSolAmount: number;
  supplyPercentage: string;
  holdingAmount: number;
  holdingPercentage: string;
  category: string;
  walletSummaries: Record<string, WalletSummary>;
}

export interface BundleAnalysisResponse {
  mint: string;
  totalTrades: number;
  bundles: BundleAnalysis[];
}

// Coingecko Types
export interface TrendingToken {
  id: string;
  name: string;
  symbol: string;
  marketCapRank: number;
  thumb: string;
  price: number;
  priceChange24h: number;
  marketCap: string;
  volume24h: string;
  description?: string;
}

export interface TrendingTokensResponse {
  tokens: TrendingToken[];
}
