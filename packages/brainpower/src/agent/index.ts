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
// import { BN } from "@coral-xyz/anchor";
// import bs58 from "bs58";
// import Decimal from "decimal.js";
// import {
//   CreateCollectionOptions,
//   CreateSingleOptions,
//   StoreInitOptions,
// } from "@3land/listings-sdk/dist/types/implementation/implementationTypes";
// import { DEFAULT_OPTIONS } from "../constants";
import {} from // deploy_collection,
// deploy_token,
// get_balance,
// get_balance_other,
// getTPS,
// resolveSolDomain,
// getPrimaryDomain,
// launchPumpFunToken,
// lendAsset,
// mintCollectionNFT,
// openbookCreateMarket,
// manifestCreateMarket,
// raydiumCreateAmmV4,
// raydiumCreateClmm,
// raydiumCreateCpmm,
// registerDomain,
// request_faucet_funds,
// trade,
// limitOrder,
// batchOrder,
// cancelAllOrders,
// withdrawAll,
// transfer,
// getTokenDataByAddress,
// getTokenDataByTicker,
// stakeWithJup,
// stakeWithSolayer,
// sendCompressedAirdrop,
// orcaCreateSingleSidedLiquidityPool,
// orcaCreateCLMM,
// orcaOpenCenteredPositionWithLiquidity,
// orcaOpenSingleSidedPosition,
// FEE_TIERS,
// fetchPrice,
// getAllDomainsTLDs,
// getAllRegisteredAllDomains,
// getOwnedDomainsForTLD,
// getMainAllDomainsDomain,
// getOwnedAllDomains,
// resolveAllDomains,
// create_gibwork_task,
// orcaClosePosition,
// orcaFetchPositions,
// rock_paper_scissor,
// create_TipLink,
// listNFTForSale,
// cancelListing,
// closeEmptyTokenAccounts,
// fetchTokenReportSummary,
// fetchTokenDetailedReport,
// fetchPythPrice,
// fetchPythPriceFeedID,
// createCollection,
// createSingle,
// multisig_transfer_from_treasury,
// create_squads_multisig,
// multisig_create_proposal,
// multisig_deposit_to_treasury,
// multisig_reject_proposal,
// multisig_approve_proposal,
// multisig_execute_proposal,
// parseTransaction,
// sendTransactionWithPriorityFee,
// getAssetsByOwner,
// getHeliusWebhook,
// create_HeliusWebhook,
// deleteHeliusWebhook,
// createDriftUserAccount,
// createVault,
// depositIntoVault,
// depositToDriftUserAccount,
// getVaultAddress,
// doesUserHaveDriftAccount,
// driftUserAccountInfo,
// requestWithdrawalFromVault,
// tradeDriftVault,
// driftPerpTrade,
// updateVault,
// getVaultInfo,
// withdrawFromDriftUserAccount,
// withdrawFromDriftVault,
// updateVaultDelegate,
// get_token_balance,
"../tools/index.js";
import {
  Config,
  // TokenCheck,
  // CollectionDeployment,
  // CollectionOptions,
  // GibworkCreateTaskReponse,
  // JupiterTokenData,
  // MintCollectionNFTResponse,
  // PumpfunLaunchResponse,
  // PumpFunTokenOptions,
  // OrderParams,
  // HeliusWebhookIdResponse,
  // HeliusWebhookResponse,
  // PrivyWallet,
} from "../types/index.js";
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

      // Wait for confirmation using the new method
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
