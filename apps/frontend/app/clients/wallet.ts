import api from "../lib/axios";
import {
  ChainType,
  StoreWalletResponse,
  GetUserWalletsResponse,
} from "../types/api/wallet";

export const walletClient = {
  storeWallet: async (
    address: string,
    chainType: ChainType = "solana"
  ): Promise<StoreWalletResponse> => {
    const { data } = await api.post<StoreWalletResponse>("/api/wallet/store", {
      address,
      chainType,
    });
    return data;
  },

  getUserWallets: async (): Promise<GetUserWalletsResponse> => {
    const { data } = await api.get<GetUserWalletsResponse>("/api/wallet");
    return data;
  },
};
