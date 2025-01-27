import {
  ChainType,
  GetBalanceResponse,
  GetUserWalletsResponse,
  StoreWalletResponse,
  SendTransactionResponse,
} from "../types/api/wallet";
import api from "../lib/axios";
import { Cluster } from "@repo/brainpower-agent";
import { Commitment } from "@solana/web3.js";

async function storeWallet(
  address: string,
  chainType: ChainType
): Promise<StoreWalletResponse> {
  const { data } = await api.post<StoreWalletResponse>("/api/wallet/store", {
    address,
    chainType,
  });
  return data;
}

async function getUserWallets(): Promise<GetUserWalletsResponse> {
  const { data } = await api.get<GetUserWalletsResponse>("/api/wallet");
  return data;
}

async function getBalance(
  address: string,
  cluster: Cluster = "mainnet-beta"
): Promise<GetBalanceResponse> {
  const { data } = await api.get<GetBalanceResponse>(
    `/api/wallet/balance?address=${address}`,
    {
      headers: {
        "x-solana-cluster": cluster,
      },
    }
  );
  return data;
}

async function sendTransaction(
  serializedTransaction: string,
  options?: {
    commitment?: Commitment;
    skipPreflight?: boolean;
    maxRetries?: number;
  }
): Promise<SendTransactionResponse> {
  const { data } = await api.post<SendTransactionResponse>(
    "/api/wallet/send-transaction",
    {
      serializedTransaction,
      options,
    }
  );
  return data;
}

export const walletClient = {
  storeWallet,
  getUserWallets,
  getBalance,
  sendTransaction,
};
