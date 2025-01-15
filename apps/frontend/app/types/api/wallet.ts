export type ChainType = "solana" | "ethereum";

export interface StoreWalletResponse {
  address: string;
  chainType: ChainType;
}

export interface GetUserWalletsResponse {
  wallets: Array<{
    address: string;
    chainType: ChainType;
    isActive: boolean;
  }>;
}
