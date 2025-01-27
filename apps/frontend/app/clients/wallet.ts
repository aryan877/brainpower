import {
  ChainType,
  GetBalanceResponse,
  GetUserWalletsResponse,
  StoreWalletResponse,
  SendTransactionResponse,
  GetLatestBlockhashResponse,
  SimulateTransactionFeeResponse,
  GetTransactionHistoryResponse,
  GetAssetsResponse,
  GetAssetsOptions,
  PriorityFeeResponse,
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

async function getLatestBlockhash(
  commitment: Commitment = "processed"
): Promise<GetLatestBlockhashResponse> {
  const { data } = await api.get<GetLatestBlockhashResponse>(
    `/api/wallet/latest-blockhash?commitment=${commitment}`
  );
  return data;
}

async function simulateTransactionFee(
  serializedTransaction: string
): Promise<SimulateTransactionFeeResponse> {
  const { data } = await api.post<SimulateTransactionFeeResponse>(
    "/api/wallet/simulate-fee",
    {
      serializedTransaction,
    }
  );
  return data;
}

async function getTransactionHistory(
  address: string,
  options?: {
    before?: string;
  }
): Promise<GetTransactionHistoryResponse> {
  const { before } = options || {};
  let url = `/api/wallet/history?address=${address}`;
  if (before) url += `&before=${before}`;
  const { data } = await api.get<GetTransactionHistoryResponse>(url);
  return data;
}

async function getAssets(
  ownerAddress: string,
  options?: GetAssetsOptions
): Promise<GetAssetsResponse> {
  const response = await api.post<GetAssetsResponse>("/api/wallet/assets", {
    ownerAddress,
    ...options,
  });
  return response.data;
}

async function getTokenAccount(mint: string, owner: string) {
  const { data } = await api.get(
    `/api/wallet/token-account?mint=${mint}&owner=${owner}`
  );
  return { tokenAccount: data.tokenAccount, exists: data.exists };
}

async function getPriorityFees(
  serializedTransaction?: string
): Promise<PriorityFeeResponse> {
  const url = serializedTransaction
    ? `/api/wallet/priority-fees?serializedTransaction=${encodeURIComponent(serializedTransaction)}`
    : "/api/wallet/priority-fees";
  const { data } = await api.get<PriorityFeeResponse>(url);
  return data;
}

export const walletClient = {
  storeWallet,
  getUserWallets,
  getBalance,
  sendTransaction,
  getLatestBlockhash,
  simulateTransactionFee,
  getTransactionHistory,
  getAssets,
  getTokenAccount,
  getPriorityFees,
};
