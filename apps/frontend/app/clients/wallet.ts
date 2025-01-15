import axios from "../lib/axios";

interface WalletResponse {
  address: string;
  chainType: string;
}

export const walletClient = {
  storeWallet: async (
    address: string,
    chainType: string = "solana"
  ): Promise<WalletResponse> => {
    const { data } = await axios.post<WalletResponse>("/api/wallet/store", {
      address,
      chainType,
    });
    return data;
  },
};
