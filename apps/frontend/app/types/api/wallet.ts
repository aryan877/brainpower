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
