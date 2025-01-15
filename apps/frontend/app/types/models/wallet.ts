export interface Wallet {
  address: string;
  chainType: "solana" | "ethereum";
  isActive: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}
