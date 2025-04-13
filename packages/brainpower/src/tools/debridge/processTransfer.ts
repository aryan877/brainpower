import { VersionedTransaction } from "@solana/web3.js";
import axios from "axios";
import { BrainPowerAgent } from "../../agent/index.js";
import { DEBRIDGE_API } from "../../constants/index.js";
import { deBridgeOrderInput } from "../../types/index.js";

const REFERRAL_CODE = "21064";

/**
 * Helper function to encode a number to a little-endian Uint8Array
 * Using non-null assertion to address TypeScript type issues
 */
function encodeNumberToArrayLE(num: number, arraySize: number): Uint8Array {
  const result = new Uint8Array(arraySize);
  let value = num;
  for (let i = 0; i < arraySize; i++) {
    result[i] = Number(value & 0xff);
    value = value >> 8;
  }
  return result;
}

/**
 * Update the priority fee settings in a transaction
 */
function updatePriorityFee(
  tx: VersionedTransaction,
  computeUnitPrice: number,
  computeUnitLimit?: number,
) {
  const computeBudgetOffset = 1;

  // Update compute unit price
  if (tx.message?.compiledInstructions?.[1]?.data) {
    const computeUnitPriceData = tx.message.compiledInstructions[1].data;
    const encodedPrice = encodeNumberToArrayLE(computeUnitPrice, 8);
    for (let i = 0; i < encodedPrice.length; i++) {
      computeUnitPriceData[i + computeBudgetOffset] = encodedPrice[i]!;
    }
  }

  // Update compute unit limit if provided
  if (computeUnitLimit && tx.message?.compiledInstructions?.[0]?.data) {
    const computeUnitLimitData = tx.message.compiledInstructions[0].data;
    const encodedLimit = encodeNumberToArrayLE(computeUnitLimit, 4);
    for (let i = 0; i < encodedLimit.length; i++) {
      computeUnitLimitData[i + computeBudgetOffset] = encodedLimit[i]!;
    }
  }
}

/**
 * Process and execute a bridge transfer for cross-chain token movement
 * Currently only supports bridging FROM Solana TO other chains
 */
export async function processTransfer(
  agent: BrainPowerAgent,
  params: deBridgeOrderInput,
): Promise<string> {
  // Validate required parameters
  if (typeof params.srcChainId !== "string" || !params.srcChainId) {
    throw new Error(
      "Source chain ID is required and must be a non-empty string",
    );
  }

  if (params.srcChainId !== "7565164") {
    throw new Error(
      "This implementation only supports bridging FROM Solana (chain ID: 7565164)",
    );
  }

  if (typeof params.dstChainId !== "string" || !params.dstChainId) {
    throw new Error(
      "Destination chain ID is required and must be a non-empty string",
    );
  }

  if (
    typeof params.dstChainTokenOutRecipient !== "string" ||
    !params.dstChainTokenOutRecipient
  ) {
    throw new Error(
      "Destination chain token recipient is required and must be a non-empty string",
    );
  }

  if (params.srcChainId === params.dstChainId) {
    throw new Error("Source and destination chains must be different");
  }

  // Use the agent's existing connection
  // const connection = new Connection(SOLANA_RPC_URL, "confirmed"); // Removed this line

  // Prepare API query parameters
  const queryParams = new URLSearchParams({
    srcChainId: params.srcChainId, // Still required by the API
    srcChainTokenIn: params.srcChainTokenIn,
    srcChainTokenInAmount: params.srcChainTokenInAmount,
    dstChainId: params.dstChainId,
    dstChainTokenOut: params.dstChainTokenOut,
    dstChainTokenOutAmount: "auto", // Always get the best rate
    dstChainTokenOutRecipient: params.dstChainTokenOutRecipient,
    senderAddress: params.account,
    srcChainOrderAuthorityAddress: params.account,
    srcChainRefundAddress: params.account,
    dstChainOrderAuthorityAddress: params.dstChainTokenOutRecipient,
    referralCode: params.referralCode?.toString() || REFERRAL_CODE,
    prependOperatingExpenses: "true", // Include all fees
  });

  try {
    // Get transaction from DeBridge API
    const response = await axios.get(
      `${DEBRIDGE_API}/dln/order/create-tx?${queryParams}`,
    );
    const data = response.data;

    if (data.error) {
      throw new Error(`DeBridge API Error: ${data.error}`);
    }

    if (!data.tx?.data) {
      throw new Error("No transaction data returned from DeBridge API");
    }

    // Decode transaction data
    const txData = data.tx.data.toString();
    const hexString = txData.startsWith("0x") ? txData.slice(2) : txData;
    const transactionBuf = Buffer.from(hexString, "hex");

    // Deserialize the transaction
    const transaction = VersionedTransaction.deserialize(transactionBuf);

    // Set priority fees
    const computeUnitPrice =
      agent.config.PRIORITY_LEVEL === "high" ? 1000000 : 100000;
    const computeUnitLimit = 1400000; // Reasonable limit for complex transactions
    updatePriorityFee(transaction, computeUnitPrice, computeUnitLimit);

    // Update blockhash using the agent's connection
    const { blockhash } =
      await agent.connection.getLatestBlockhash("confirmed");
    if (transaction.message) {
      transaction.message.recentBlockhash = blockhash;
    }

    // Sign and send transaction
    const signature = await agent.signAndSendTransaction(transaction, {
      skipPreflight: false,
      maxRetries: 3,
      commitment: "confirmed",
    });

    return signature;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data
        ? JSON.stringify(error.response.data)
        : "";
      throw new Error(
        `Failed to execute bridge transfer: ${error.message}. ${responseData}`,
      );
    }
    throw error;
  }
}
