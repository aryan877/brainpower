import { PublicKey, Connection } from "@solana/web3.js";
import { TokenHolder } from "../../types/index.js";
import { getAccount } from "@solana/spl-token";

export async function getTokenTopHolders(
  mint: PublicKey,
  limit: number = 20,
  rpcUrl: string,
): Promise<TokenHolder[]> {
  try {
    // First get largest token accounts using Helius RPC
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

    const connection = new Connection(rpcUrl);

    // Get total supply from mint info
    const mintInfo = await connection.getTokenSupply(mint);
    const totalSupply = Number(
      BigInt(mintInfo.value.amount) /
        BigInt(Math.pow(10, mintInfo.value.decimals)),
    );

    // Get owner info for each token account using SPL getAccount
    const accountInfos = await Promise.all(
      data.result.value.slice(0, limit).map(async (holder: any) => {
        // Calculate percentage regardless of owner info success/failure
        const percentage = parseFloat(
          ((holder.uiAmount / totalSupply) * 100).toFixed(2),
        );

        try {
          const tokenAccount = await getAccount(
            connection,
            new PublicKey(holder.address),
          );

          return {
            ...holder,
            owner: tokenAccount.owner.toString(),
            percentage,
          };
        } catch (err) {
          console.warn(
            `Failed to get account info for ${holder.address}:`,
            err,
          );
          // Return holder with percentage even if owner lookup fails
          return {
            ...holder,
            owner: null, // Indicate owner lookup failed
            percentage,
          };
        }
      }),
    );

    return accountInfos;
  } catch (error: any) {
    console.error("Failed to fetch token holders:", error);
    throw new Error(`Failed to fetch token holders: ${error.message}`);
  }
}
