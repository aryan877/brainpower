// import { PublicKey } from "@solana/web3.js";
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

/**
 * Response format for Jupiter token data lookup
 * Contains token metadata and market information from Jupiter
 */
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

/**
 * Token holder interface
 */
export interface TokenHolder {
  address: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
  owner?: string | null;
  percentage?: number; // Percentage of total supply held
}

export interface JupiterFetchPriceResponse {
  price: string;
}

export interface JupiterTradeResponse {
  signature: string;
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

/**
 * Example of an action with input and output
 */

// export interface TokenCheck {
//   tokenProgram: string;
//   tokenType: string;
//   risks: Array<{
//     name: string;
//     level: string;
//     description: string;
//     score: number;
//   }>;
//   score: number;
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
