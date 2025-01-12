import axios from "axios";
import { config } from "dotenv";
config();

interface SignAndSendTransactionParams {
  // A base64-encoded serialized transaction from @solana/web3.js
  transactionBase64: string;
  // The CAIP2 chain ID if you need to specify a certain Solana cluster.
  caip2?: string;
}

export async function privySignAndSendTransaction({
  transactionBase64,
  caip2 = "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1", // example devnet/testnet cluster
}: SignAndSendTransactionParams) {
  try {
    const url = `https://api.privy.io/v1/wallets/${process.env.PRIVY_SOLANA_WALLET_ID}/rpc`;
    const response = await axios.post(
      url,
      {
        method: "signAndSendTransaction",
        caip2,
        params: {
          transaction: transactionBase64,
          encoding: "base64",
        },
      },
      {
        auth: {
          username: process.env.PRIVY_APP_ID || "",
          password: process.env.PRIVY_APP_SECRET || "",
        },
        headers: {
          "Content-Type": "application/json",
          "privy-app-id": process.env.PRIVY_APP_ID || "",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Privy signAndSendTransaction failed:", error);
    throw error;
  }
}
