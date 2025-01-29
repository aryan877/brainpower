import { PublicKey } from "@solana/web3.js";
import { TokenHolder } from "src/types/index.js";
import { struct, u32, u8 } from "@solana/buffer-layout";
import { publicKey, u64 } from "@solana/buffer-layout-utils";

// Define the interface for decoded token account data
interface TokenAccountData {
  mint: PublicKey;
  owner: PublicKey;
  amount: bigint;
  delegateOption: number;
  delegate: PublicKey;
  state: number;
  isNativeOption: number;
  isNative: bigint;
  delegatedAmount: bigint;
  closeAuthorityOption: number;
  closeAuthority: PublicKey;
}

// Token Account Layout from @solana/spl-token
const TokenAccountLayout = struct<TokenAccountData>([
  publicKey("mint"),
  publicKey("owner"),
  u64("amount"),
  u32("delegateOption"),
  publicKey("delegate"),
  u8("state"),
  u32("isNativeOption"),
  u64("isNative"),
  u64("delegatedAmount"),
  u32("closeAuthorityOption"),
  publicKey("closeAuthority"),
]);

export async function getTokenTopHolders(
  mint: PublicKey,
  limit: number = 20,
): Promise<TokenHolder[]> {
  try {
    // First get largest token accounts
    const response = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTokenLargestAccounts",
          params: [mint.toBase58()],
        }),
      },
    );

    if (!response.ok) {
      console.error(`Helius API error: ${response.statusText}`);
      throw new Error(`Helius API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data?.result?.value) {
      console.error("Invalid response format from Helius API", data);
      throw new Error("Invalid response format from Helius API");
    }

    // Calculate total supply from all accounts
    const totalSupply = data.result.value.reduce((acc: number, holder: any) => {
      return acc + parseFloat(holder.uiAmountString);
    }, 0);

    // Get owner info for each token account using getAccountInfo
    const accountInfos = await Promise.all(
      data.result.value.slice(0, limit).map(async (holder: any) => {
        try {
          const accountResponse = await fetch(
            `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getAccountInfo",
                params: [
                  holder.address,
                  {
                    encoding: "base64",
                    commitment: "confirmed",
                  },
                ],
              }),
            },
          );

          const accountData = await accountResponse.json();

          if (!accountData?.result?.value?.data) {
            console.warn(`No data found for account ${holder.address}`);
            return holder;
          }

          // Decode base64 data
          const buffer = Buffer.from(
            accountData.result.value.data[0],
            "base64",
          );

          // Deserialize the account data
          const decodedData = TokenAccountLayout.decode(buffer);

          // Calculate percentage
          const percentage =
            (parseFloat(holder.uiAmountString) / totalSupply) * 100;

          return {
            ...holder,
            owner: decodedData.owner.toString(),
            percentage: parseFloat(percentage.toFixed(2)),
          };
        } catch (err) {
          console.warn(`Failed to get owner for ${holder.address}:`, err);
          return holder;
        }
      }),
    );

    return accountInfos;
  } catch (error: any) {
    console.error("Failed to fetch token holders:", error);
    throw new Error(`Failed to fetch token holders: ${error.message}`);
  }
}
