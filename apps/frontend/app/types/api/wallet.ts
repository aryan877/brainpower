import { TransactionError } from "@solana/web3.js";

export type ChainType = "solana" | "ethereum";

export type StoreWalletResponse = {
  address: string;
  chainType: ChainType;
};

export type GetUserWalletsResponse = {
  wallets: {
    address: string;
    chainType: ChainType;
    isActive: boolean;
  }[];
};

export type GetBalanceResponse = {
  balance: number;
};

export interface SendTransactionResponse {
  signature: string;
  confirmation?: {
    value: {
      err: TransactionError | null;
    };
  };
}

export interface GetLatestBlockhashResponse {
  blockhash: string;
  lastValidBlockHeight: number;
}

export interface PriorityFeeLevels {
  min: number;
  low: number;
  medium: number;
  high: number;
  veryHigh: number;
  unsafeMax: number;
}

export interface SimulateTransactionFeeResponse {
  simulation: {
    logs: string[];
    error: TransactionError | null;
    unitsConsumed: number;
  };
}

export interface NativeTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  amount: number; // In SOL
}

export interface TokenTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  fromTokenAccount: string;
  toTokenAccount: string;
  tokenAmount: number;
  mint: string;
}

export interface TokenBalanceChange {
  userAccount: string;
  tokenAccount: string;
  mint: string;
  rawTokenAmount: {
    tokenAmount: string;
    decimals: number;
  };
}

export interface AccountData {
  account: string;
  nativeBalanceChange: number;
  tokenBalanceChanges: TokenBalanceChange[];
}

export interface InnerInstruction {
  accounts: string[];
  data: string;
  programId: string;
}

export interface Instruction {
  accounts: string[];
  data: string;
  programId: string;
  innerInstructions?: InnerInstruction[];
}

export interface NFTEvent {
  description: string;
  type: string;
  source: string;
  amount: number;
  fee: number;
  feePayer: string;
  signature: string;
  slot: number;
  timestamp: number;
  saleType: string;
  buyer: string;
  seller: string;
  staker?: string;
  nfts: Array<{
    mint: string;
    tokenStandard: string;
  }>;
}

export interface Transaction {
  signature: string;
  timestamp: number;
  type: string;
  source: string;
  description: string;
  nftAction?: string;
  fee: number;
  feePayer: string;
  status: "success" | "failed";
  error?: string;
  nativeTransfers: {
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }[];
  events?: {
    nft?: {
      type: string;
      amount: number;
      buyer?: string;
      seller?: string;
    };
  };
}

export interface TransactionPagination {
  hasMore: boolean;
  beforeCursor?: string;
  afterCursor?: string;
}

export interface GetTransactionHistoryResponse {
  transactions: Transaction[];
  lastSignature?: string;
  hasMore: boolean;
  warning?: string;
}

export interface Asset {
  interface: string;
  id: string;
  content?: {
    files?: { uri: string; cdn_uri: string }[];
    json_uri?: string;
    metadata?: {
      name?: string;
      symbol?: string;
      description?: string;
    };
  };
  token_info?: {
    balance: string;
    decimals: number;
    symbol?: string;
    name?: string;
  };
  ownership: {
    owner: string;
    frozen: boolean;
    delegated: boolean;
  };
}

export interface GetAssetsResponse {
  result: {
    items: Asset[];
    total: number;
    limit: number;
    page: number;
  };
}

export interface GetAssetsOptions {
  page?: number;
  limit?: number;
  displayOptions?: {
    showFungible?: boolean;
    showNativeBalance?: boolean;
    showInscription?: boolean;
  };
}

export interface SendTransactionOptions {
  skipPreflight?: boolean;
  maxRetries?: number;
  commitment?: string;
}

export interface PriorityFeeResponse {
  min: number;
  low: number;
  medium: number;
  high: number;
  veryHigh: number;
  unsafeMax: number;
}

export interface WalletApi {
  storeWallet: (
    address: string,
    chainType: ChainType
  ) => Promise<StoreWalletResponse>;
  getUserWallets: () => Promise<GetUserWalletsResponse>;
  getBalance: (address: string) => Promise<GetBalanceResponse>;
  getLatestBlockhash: () => Promise<GetLatestBlockhashResponse>;
  sendTransaction: (
    serializedTransaction: string,
    options?: SendTransactionOptions
  ) => Promise<SendTransactionResponse>;
  simulateTransactionFee: (
    serializedTransaction: string
  ) => Promise<SimulateTransactionFeeResponse>;
  getTransactionHistory: (
    address: string,
    before?: string
  ) => Promise<GetTransactionHistoryResponse>;
  getAssets: (
    ownerAddress: string,
    options?: GetAssetsOptions
  ) => Promise<GetAssetsResponse>;
  getPriorityFees: () => Promise<PriorityFeeResponse>;
}
