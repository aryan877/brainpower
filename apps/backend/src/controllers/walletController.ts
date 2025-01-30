import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth/index.js";
import { BadRequestError } from "../middleware/errors/types.js";
import { User } from "../models/User.js";
import { getUserId } from "../utils/userIdentification.js";
import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { getRpcUrl } from "../utils/getRpcUrl.js";

export const storeWallet = async (req: AuthenticatedRequest, res: Response) => {
  const { address, chainType = "solana" } = req.body;
  const userId = getUserId(req);

  if (!address || !chainType) {
    throw new BadRequestError("Address and chain type are required");
  }

  await User.findOneAndUpdate(
    { userId },
    {
      $push: {
        wallets: {
          address,
          chainType,
          isActive: true,
        },
      },
    },
    { upsert: true }
  );

  res.json({
    address,
    chainType,
  });
};

export const getUserWallets = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = getUserId(req);
  const user = await User.findOne({ userId });

  res.json({
    wallets: user?.wallets || [],
  });
};

export const getBalance = async (req: AuthenticatedRequest, res: Response) => {
  const { address } = req.query;
  const cluster = req.user.cluster;

  if (!address || typeof address !== "string") {
    throw new BadRequestError("Address is required");
  }

  try {
    const rpcUrl = getRpcUrl(cluster);
    const connection = new Connection(rpcUrl, "processed");
    const pubkey = new PublicKey(address);
    const balance = await connection.getBalance(pubkey);

    res.json({ balance });
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw new BadRequestError("Failed to fetch balance");
  }
};

export const getLatestBlockhash = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const cluster = req.user.cluster;
  const commitment = req.query.commitment || "processed";

  try {
    const rpcUrl = getRpcUrl(cluster);
    const connection = new Connection(rpcUrl, commitment as any);
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash(commitment as any);

    res.json({ blockhash, lastValidBlockHeight });
  } catch (error) {
    console.error("Error getting latest blockhash:", error);
    throw new BadRequestError("Failed to get latest blockhash");
  }
};

export const sendTransaction = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { serializedTransaction, options } = req.body;
  const cluster = req.user.cluster;

  if (!serializedTransaction) {
    throw new BadRequestError("Serialized transaction is required");
  }

  try {
    const rpcUrl = getRpcUrl(cluster);
    const connection = new Connection(
      rpcUrl,
      options?.commitment || "processed"
    );

    // Decode the base64 serialized transaction
    const decodedTx = Buffer.from(serializedTransaction, "base64");

    // Always try to deserialize as VersionedTransaction first
    let transaction: VersionedTransaction;
    try {
      transaction = VersionedTransaction.deserialize(decodedTx);
    } catch (error) {
      console.error("Failed to deserialize as VersionedTransaction:", error);
      throw new BadRequestError("Invalid transaction format");
    }

    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      {
        preflightCommitment: "processed",
        skipPreflight: options?.skipPreflight || false,
        maxRetries: options?.maxRetries || 3,
      }
    );

    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash: transaction.message.recentBlockhash || "",
      lastValidBlockHeight: (
        await connection.getLatestBlockhash({ commitment: "processed" })
      ).lastValidBlockHeight,
    });

    res.json({
      signature,
      confirmation,
      transaction: {
        message: transaction.message,
        signatures: transaction.signatures,
      },
    });
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw new BadRequestError("Failed to send transaction", error);
  }
};

export const simulateTransactionFee = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { serializedTransaction } = req.body;
  const cluster = req.user.cluster;

  // Handle case where serializedTransaction is not provided
  if (!serializedTransaction) {
    // Return default simulation values
    return res.json({
      simulation: {
        logs: [],
        error: null,
        unitsConsumed: 200000, // Default compute units
        accounts: [],
        returnData: null,
      },
    });
  }

  try {
    const rpcUrl = getRpcUrl(cluster);
    const connection = new Connection(rpcUrl, "processed");

    // Decode the base64 serialized transaction
    const decodedTx = Buffer.from(serializedTransaction, "base64");

    // Always try to deserialize as VersionedTransaction first
    let transaction: VersionedTransaction;
    try {
      transaction = VersionedTransaction.deserialize(decodedTx);
    } catch (error) {
      console.error("Failed to deserialize as VersionedTransaction:", error);
      throw new BadRequestError("Invalid transaction format");
    }

    // Simulate the transaction
    const simulationResponse = await connection.simulateTransaction(
      transaction,
      {
        sigVerify: false,
        replaceRecentBlockhash: true,
        commitment: "processed",
      }
    );

    if (!simulationResponse.value) {
      throw new Error("Invalid simulation response");
    }

    res.json({
      simulation: {
        logs: simulationResponse.value.logs || [],
        error: simulationResponse.value.err,
        unitsConsumed: simulationResponse.value.unitsConsumed,
        accounts: simulationResponse.value.accounts,
        returnData: simulationResponse.value.returnData,
      },
    });
  } catch (error) {
    console.error("Error simulating transaction:", error);
    throw new BadRequestError("Failed to simulate transaction", error);
  }
};

async function fetchWithRetry(url: string, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export const getTransactionHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { address, before, limit = 20 } = req.query;
  const cluster = req.user.cluster;

  if (!address || typeof address !== "string") {
    throw new BadRequestError("Address is required");
  }

  try {
    const apiUrl =
      cluster === "mainnet-beta"
        ? "https://api.helius.xyz/v0/addresses"
        : "https://api-devnet.helius.xyz/v0/addresses";

    // Build the URL with pagination parameters
    let url = `${apiUrl}/${address}/transactions?api-key=${process.env.HELIUS_API_KEY}&limit=${limit}`;
    if (before) url += `&before=${before}`;

    // Try to fetch with retries
    const heliusResponse = await fetchWithRetry(url);
    const transactions = await heliusResponse.json();

    // Validate response
    if (!Array.isArray(transactions)) {
      console.error("Invalid response format from Helius:", transactions);
      throw new Error("Invalid response from Helius API");
    }

    // Get the last signature for pagination
    const lastSignature = transactions[transactions.length - 1]?.signature;
    const hasMore = transactions.length === limit;

    res.json({
      transactions,
      lastSignature,
      hasMore,
      warning:
        "This endpoint may return incomplete data. For critical applications, use getSignaturesForAddress and fetch transactions individually.",
    });
  } catch (error) {
    console.error("Error fetching transaction history:", error);

    // Check if it's an API key issue
    if (error instanceof Error && error.message.includes("401")) {
      throw new BadRequestError("Invalid API key or unauthorized access");
    }

    // Check if it's a rate limit issue
    if (error instanceof Error && error.message.includes("429")) {
      throw new BadRequestError("Rate limit exceeded. Please try again later");
    }

    // For other errors, return a generic message
    throw new BadRequestError(
      "Unable to fetch transaction history. Please try again later"
    );
  }
};

export const getAssets = async (req: AuthenticatedRequest, res: Response) => {
  const { ownerAddress, page = 1, limit = 1000, displayOptions } = req.body;
  const cluster = req.user.cluster;

  if (!ownerAddress) {
    throw new BadRequestError("Owner address is required");
  }

  try {
    const apiUrl =
      cluster === "mainnet-beta"
        ? "https://mainnet.helius-rpc.com"
        : "https://devnet.helius-rpc.com";

    // Make RPC call to getAssetsByOwner
    const response = await fetch(
      `${apiUrl}/addresses/${ownerAddress}/assets?api-key=${process.env.HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "helius-test",
          method: "getAssetsByOwner",
          params: {
            ownerAddress,
            page,
            limit,
            displayOptions: {
              ...displayOptions,
              showFungible: true,
              showNativeBalance: true,
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Helius API error:");
      console.error(data.error);
      throw new Error(
        data.error.message || "Failed to fetch assets from Helius"
      );
    }

    // Validate response
    if (!data.result) {
      console.error("Invalid response format from Helius:");
      console.error(data);
      throw new Error("Invalid response from Helius API");
    }

    res.json({
      result: {
        items: data.result.items || [],
        total: data.result.total || 0,
        limit: data.result.limit || limit,
        page: data.result.page || page,
      },
    });
  } catch (error) {
    console.error("Error fetching assets:");
    console.error(error);

    // Check if it's an API key issue
    if (error instanceof Error && error.message.includes("401")) {
      throw new BadRequestError("Invalid API key or unauthorized access");
    }

    // Check if it's a rate limit issue
    if (error instanceof Error && error.message.includes("429")) {
      throw new BadRequestError("Rate limit exceeded. Please try again later");
    }

    // For other errors, return a generic message
    throw new BadRequestError("Failed to fetch assets. Please try again later");
  }
};

interface TokenAccountResponse {
  address: string;
  mint: string;
  owner: string;
  amount: number;
  delegated_amount: number;
  frozen: boolean;
}

interface GetTokenAccountsResponse {
  total: number;
  limit: number;
  cursor?: string;
  token_accounts: TokenAccountResponse[];
}

export const getTokenAccount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { mint, owner } = req.query;
  const cluster = req.user.cluster;

  if (
    !mint ||
    !owner ||
    typeof mint !== "string" ||
    typeof owner !== "string"
  ) {
    throw new BadRequestError("Mint and owner addresses are required");
  }

  try {
    const apiUrl =
      cluster === "mainnet-beta"
        ? "https://mainnet.helius-rpc.com"
        : "https://devnet.helius-rpc.com";

    // Get token accounts from Helius
    const response = await fetch(
      `${apiUrl}/?api-key=${process.env.HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "helius-test",
          method: "getTokenAccounts",
          params: {
            mint,
            owner,
            displayOptions: {
              showZeroBalance: true,
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Helius API error:", data.error);
      throw new Error(data.error.message || "Failed to fetch token accounts");
    }

    const result = data.result as GetTokenAccountsResponse;
    const tokenAccount = result.token_accounts[0];

    // Add token account existence check
    const exists = tokenAccount !== undefined;

    res.json({ tokenAccount, exists });
  } catch (error) {
    console.error("Error fetching token account:", error);
    throw new BadRequestError("Failed to fetch token account");
  }
};

export const getPriorityFees = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const cluster = req.user.cluster;
  const { serializedTransaction, transactionEncoding = "base58" } = req.body;

  try {
    const apiUrl =
      cluster === "mainnet-beta"
        ? "https://mainnet.helius-rpc.com"
        : "https://devnet.helius-rpc.com";

    const requestBody = {
      jsonrpc: "2.0",
      id: "helius-priority-fee",
      method: "getPriorityFeeEstimate",
      params: [
        {
          ...(serializedTransaction
            ? {
                transaction: serializedTransaction,
                transactionEncoding,
              }
            : {}),
          options: {
            includeAllPriorityFeeLevels: true,
          },
        },
      ],
    };

    const response = await fetch(
      `${apiUrl}/?api-key=${process.env.HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error("Helius API error:", data.error);
      throw new Error(data.error.message || "Failed to fetch priority fees");
    }

    // Return both the priority fee levels and a recommended value
    // Calculate recommended as the medium level or 10000, whichever is higher
    const priorityFeeLevels = data.result.priorityFeeLevels;
    const recommended = Math.max(priorityFeeLevels?.medium || 0, 10000);

    res.json({
      ...priorityFeeLevels,
      recommended,
    });
  } catch (error) {
    console.error("Error fetching priority fees:", error);
    throw new BadRequestError("Failed to fetch priority fees");
  }
};
