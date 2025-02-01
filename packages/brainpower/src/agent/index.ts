import {
  Connection,
  // Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  ComputeBudgetProgram,
  TransactionMessage,
  AddressLookupTableAccount,
} from "@solana/web3.js";
import { Config } from "../types/index.js";
import { PrivyClient } from "@privy-io/server-auth";
import { SolanaCaip2ChainId } from "@privy-io/server-auth";

interface PrivyConfig {
  privyClient: PrivyClient;
  address: string;
  caip2: SolanaCaip2ChainId;
  appId: string;
  appSecret: string;
}

export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

export interface TransferWithMemoParams {
  to: string;
  amount: number;
  memo: string;
}

export class BrainPowerAgent {
  public connection: Connection;
  public wallet_address: PublicKey;
  public config: Config;
  private privyConfig: PrivyConfig;

  constructor(
    rpc_url: string,
    configOrKey: Config | string | null,
    privyClient: PrivyClient,
    address: string,
    caip2: string,
    appId: string,
    appSecret: string,
  ) {
    this.connection = new Connection(
      rpc_url || "https://api.mainnet-beta.solana.com",
      "confirmed",
    );

    if (configOrKey === null) {
      throw new Error("Config is required");
    }

    if (typeof configOrKey === "string") {
      if (!configOrKey) {
        throw new Error("OPENAI_API_KEY is required if passing string config");
      }
      this.config = { OPENAI_API_KEY: configOrKey };
    } else {
      this.config = configOrKey;
    }

    this.privyConfig = {
      privyClient,
      address,
      caip2: caip2 as SolanaCaip2ChainId,
      appId,
      appSecret,
    };

    this.wallet_address = new PublicKey(address);
  }

  async signTransaction(
    tx: Transaction | VersionedTransaction,
  ): Promise<Transaction | VersionedTransaction> {
    try {
      const { data } = await this.privyConfig.privyClient.walletApi.rpc({
        address: this.privyConfig.address,
        chainType: "solana",
        method: "signTransaction",
        params: {
          transaction: tx,
        },
      });
      return data.signedTransaction;
    } catch (error) {
      throw new Error(
        `Failed to sign transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async signAllTransactions(
    txs: (Transaction | VersionedTransaction)[],
  ): Promise<(Transaction | VersionedTransaction)[]> {
    try {
      return Promise.all(txs.map((tx) => this.signTransaction(tx)));
    } catch (error) {
      throw new Error(
        `Failed to sign transactions: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async waitForTransactionConfirmation(
    signature: string,
    commitment: "processed" | "confirmed" | "finalized" = "confirmed",
  ): Promise<void> {
    try {
      // Get latest blockhash for confirmation
      const { blockhash, lastValidBlockHeight } =
        await this.connection.getLatestBlockhash();

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        commitment,
      );

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }
    } catch (error: any) {
      throw new Error(`Transaction confirmation failed: ${error.message}`);
    }
  }

  async signAndSendTransaction(
    tx: Transaction | VersionedTransaction,
    options: {
      skipPreflight?: boolean;
      maxRetries?: number;
      commitment?: "processed" | "confirmed" | "finalized";
    } = {},
  ): Promise<string> {
    try {
      const signedTx = await this.signTransaction(tx);
      const signature = await this.connection.sendRawTransaction(
        signedTx.serialize(),
        {
          skipPreflight: options.skipPreflight || false,
          maxRetries: options.maxRetries || 3,
          preflightCommitment: options.commitment || "confirmed",
        },
      );

      await this.waitForTransactionConfirmation(signature, options.commitment);

      return signature;
    } catch (error) {
      console.error("Error signing and sending transaction", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async sendTransferWithMemo(params: TransferWithMemoParams): Promise<string> {
    const { to, amount, memo } = params;
    const fromPubkey = this.wallet_address;
    const toPubkey = new PublicKey(to);

    // Check balance
    const balance = await this.connection.getBalance(fromPubkey);
    const requiredAmount = amount * LAMPORTS_PER_SOL;
    if (balance < requiredAmount) {
      throw new Error(
        `Insufficient balance. You have ${balance / LAMPORTS_PER_SOL} SOL but need ${amount} SOL`,
      );
    }

    try {
      const transaction = new Transaction();
      transaction.feePayer = fromPubkey;

      // Add transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: requiredAmount,
      });

      // Add memo instruction
      const memoInstruction = new TransactionInstruction({
        keys: [{ pubkey: fromPubkey, isSigner: true, isWritable: true }],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(memo, "utf-8"),
      });

      transaction.add(transferInstruction, memoInstruction);

      // Get latest blockhash
      const { blockhash } =
        await this.connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;

      // Sign and send transaction
      return await this.signAndSendTransaction(transaction, {
        skipPreflight: false,
        maxRetries: 5,
      });
    } catch (error) {
      console.error("Transaction error:", error);
      if (error instanceof Error) {
        if (error.toString().includes("insufficient lamports")) {
          throw new Error(
            "Insufficient balance. Please make sure you have enough SOL to cover the transaction.",
          );
        }
        if (error.toString().includes("Transaction simulation failed")) {
          throw new Error("Transaction failed. Please try again.");
        }
      }
      throw error;
    }
  }
}
