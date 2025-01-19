import {
  Connection,
  // Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
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
import {
  // deploy_collection,
  // deploy_token,
  // get_balance,
  // get_balance_other,
  // getTPS,
  // resolveSolDomain,
  // getPrimaryDomain,
  launchPumpFunToken,
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
  getTokenDataByAddress,
  getTokenDataByTicker,
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
} from "../tools/index.js";
import {
  Config,
  // TokenCheck,
  // CollectionDeployment,
  // CollectionOptions,
  // GibworkCreateTaskReponse,
  JupiterTokenData,
  // MintCollectionNFTResponse,
  PumpfunLaunchResponse,
  PumpFunTokenOptions,
  // OrderParams,
  // HeliusWebhookIdResponse,
  // HeliusWebhookResponse,
  // PrivyWallet,
} from "../types/index.js";
import { PrivyClient } from "@privy-io/server-auth";
import { SolanaCaip2ChainId } from "@privy-io/server-auth";

interface PrivyConfig {
  privyClient: PrivyClient;
  walletId: string;
  caip2: SolanaCaip2ChainId;
  appId: string;
  appSecret: string;
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
    walletId: string,
    caip2: string,
    appId: string,
    appSecret: string,
  ) {
    this.connection = new Connection(
      rpc_url || "https://api.mainnet-beta.solana.com",
    );

    // Handle both old and new patterns
    if (typeof configOrKey === "string" || configOrKey === null) {
      this.config = { OPENAI_API_KEY: configOrKey || "" };
    } else {
      this.config = configOrKey;
    }

    // Store Privy client and wallet details
    this.privyConfig = {
      privyClient,
      walletId,
      caip2: caip2 as SolanaCaip2ChainId,
      appId,
      appSecret,
    };

    // Get wallet address from Privy client
    this.wallet_address = new PublicKey(walletId);
  }

  // Helper method to sign transaction
  async signTransaction(
    tx: Transaction | VersionedTransaction,
  ): Promise<Transaction | VersionedTransaction> {
    const response =
      await this.privyConfig.privyClient.walletApi.solana.signTransaction({
        walletId: this.privyConfig.walletId,
        transaction: tx,
      });

    return response.signedTransaction;
  }

  // Helper method to sign multiple transactions
  async signAllTransactions(
    txs: (Transaction | VersionedTransaction)[],
  ): Promise<(Transaction | VersionedTransaction)[]> {
    return Promise.all(txs.map((tx) => this.signTransaction(tx)));
  }

  // Helper method to sign and send transaction
  async signAndSendTransaction(
    tx: Transaction | VersionedTransaction,
    caip2?: SolanaCaip2ChainId,
  ): Promise<string> {
    const response =
      await this.privyConfig.privyClient.walletApi.solana.signAndSendTransaction(
        {
          walletId: this.privyConfig.walletId,
          transaction: tx,
          caip2: caip2 || this.privyConfig.caip2,
        },
      );

    if ("code" in response && response.code) {
      throw new Error(`Transaction failed: ${response.message}`);
    }

    if (!response.hash) {
      throw new Error("Transaction hash not found in response");
    }

    return response.hash;
  }

  // Helper method to check transaction status
  async checkTransactionStatus(transactionId: string): Promise<{
    transaction_id: string;
    status: "submitted" | "included" | "confirmed" | "error";
    hash?: string;
    error?: { code: string; message: string } | null;
  }> {
    const response = await fetch(
      `https://api.privy.io/v1/transactions/id/${transactionId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "privy-app-id": this.privyConfig.appId,
          Authorization: `Basic ${Buffer.from(`${this.privyConfig.privyClient}:${this.privyConfig.appSecret}`).toString("base64")}`,
        },
        body: JSON.stringify({ transaction_id: transactionId }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch transaction status: ${response.statusText}`,
      );
    }

    return await response.json();
  }

  // Helper method to wait for transaction confirmation
  async waitForTransaction(
    transactionId: string,
    timeout: number = 60000, // Default 60 seconds timeout
    checkInterval: number = 1000, // Check every second
  ): Promise<{ status: string; hash: string | undefined }> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const status = await this.checkTransactionStatus(transactionId);

      if (status.status === "confirmed") {
        return { status: "confirmed", hash: status.hash };
      }

      if (status.status === "error") {
        throw new Error(
          `Transaction failed: ${status.error?.message || "Unknown error"}`,
        );
      }

      // Wait for the check interval before checking again
      await new Promise((resolve) => setTimeout(resolve, checkInterval));
    }

    throw new Error("Transaction confirmation timeout");
  }

  async getTokenDataByAddress(
    mint: string,
  ): Promise<JupiterTokenData | undefined> {
    return getTokenDataByAddress(new PublicKey(mint));
  }

  async getTokenDataByTicker(
    ticker: string,
  ): Promise<JupiterTokenData | undefined> {
    return getTokenDataByTicker(ticker);
  }

  async launchPumpFunToken(
    tokenName: string,
    tokenTicker: string,
    description: string,
    imageUrl: string,
    options?: PumpFunTokenOptions,
  ): Promise<PumpfunLaunchResponse> {
    return launchPumpFunToken(
      this,
      tokenName,
      tokenTicker,
      description,
      imageUrl,
      options,
    );
  }
}
