import { useState, useEffect, useCallback } from "react";
import {
  PublicKey,
  Transaction,
  VersionedTransaction,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import { useWallet } from "../hooks/wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Asset } from "../types/api/wallet";
import { walletClient } from "../clients/wallet";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountIdempotentInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useNotificationStore } from "../store/notificationStore";
import { usePriorityFees } from "../hooks/wallet";
import bs58 from "bs58";

interface AssetTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  onSuccess?: () => void;
}

// Add error type definitions
interface TokenError {
  code?: string;
  message: string;
  details?: {
    tokenAddress?: string;
    requiredBalance?: string;
    currentBalance?: string;
    [key: string]: unknown;
  };
}

function getErrorMessage(error: unknown): {
  message: string;
  details?: unknown;
} {
  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes("invalid address")) {
      return { message: "Invalid recipient address format" };
    }
    if (error.message.includes("insufficient")) {
      return { message: "Insufficient balance for this transfer" };
    }
    if (error.message.includes("recentBlockhash")) {
      return {
        message: "Network error, please try again",
        details: "Failed to get recent blockhash",
      };
    }
    if (error.message.includes("0x1")) {
      return {
        message: "Transaction failed - Account not found",
        details: "The recipient token account doesn't exist",
      };
    }
    // Handle specific token account errors
    if (error.message.includes("InvalidAccountData")) {
      return {
        message: "Invalid token account",
        details: "The recipient needs a token account for this token",
      };
    }
    if (error.message.includes("TokenAccountNotFoundError")) {
      return {
        message: "Token account not found",
        details: "Creating a new token account for the recipient",
      };
    }
    // Return the original error message if no specific handling
    return { message: error.message };
  }

  // Handle TokenError type
  const tokenError = error as TokenError;
  if (tokenError.code || tokenError.details) {
    return {
      message: tokenError.message,
      details: tokenError.details,
    };
  }

  // Default error message
  return { message: "Failed to transfer tokens" };
}

export function AssetTransferModal({
  isOpen,
  onClose,
  asset,
  onSuccess,
}: AssetTransferModalProps) {
  const { wallet, sendTransaction } = useWallet();
  const { addNotification } = useNotificationStore();
  const [serializedTx, setSerializedTx] = useState<string>();
  const { data: priorityFees } = usePriorityFees(serializedTx);

  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState("");

  const handleClose = () => {
    setTransferError("");
    setAmount("");
    setRecipientAddress("");
    onClose();
  };

  const handleSetMaxAmount = () => {
    if (asset.token_info?.balance) {
      const maxAmount =
        Number(asset.token_info.balance) /
        Math.pow(10, asset.token_info.decimals || 0);
      setAmount(maxAmount.toString());
      setTransferError("");
    }
  };

  // Create base transaction for fee estimation
  const createBaseTransaction = useCallback(
    async (
      recipientWallet: PublicKey,
      tokenAmount: number,
      senderATA: PublicKey,
      recipientATA: PublicKey,
      mintAddress: PublicKey
    ) => {
      const { blockhash } = await walletClient.getLatestBlockhash();
      const transaction = new Transaction();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(wallet!.address);

      // Add ATA creation instruction
      transaction.add(
        createAssociatedTokenAccountIdempotentInstruction(
          new PublicKey(wallet!.address),
          recipientATA,
          recipientWallet,
          mintAddress
        )
      );

      // Add token transfer instruction
      transaction.add(
        createTransferInstruction(
          senderATA,
          recipientATA,
          new PublicKey(wallet!.address),
          tokenAmount
        )
      );

      return transaction;
    },
    [wallet]
  );

  // Update serialized transaction when inputs change
  const updateTransactionForFees = useCallback(async () => {
    if (!wallet?.address || !recipientAddress || !amount || !asset.token_info) {
      setSerializedTx(undefined);
      return;
    }

    try {
      const recipientWallet = new PublicKey(recipientAddress);
      const mintAddress = new PublicKey(asset.id);
      const tokenAmount = Math.floor(
        parseFloat(amount) * Math.pow(10, asset.token_info.decimals || 0)
      );

      const senderATA = await getAssociatedTokenAddress(
        mintAddress,
        new PublicKey(wallet.address),
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const recipientATA = await getAssociatedTokenAddress(
        mintAddress,
        recipientWallet,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const transaction = await createBaseTransaction(
        recipientWallet,
        tokenAmount,
        senderATA,
        recipientATA,
        mintAddress
      );

      // Serialize the message for fee estimation using base58
      const serialized = bs58.encode(transaction.compileMessage().serialize());
      setSerializedTx(serialized);
    } catch (error) {
      console.error("Error updating transaction for fees:", error);
      setSerializedTx(undefined);
    }
  }, [
    wallet?.address,
    recipientAddress,
    amount,
    asset.token_info,
    asset.id,
    createBaseTransaction,
  ]);

  // Update transaction when inputs change
  useEffect(() => {
    updateTransactionForFees();
  }, [
    wallet?.address,
    recipientAddress,
    amount,
    asset.id,
    updateTransactionForFees,
  ]);

  const handleTransfer = async () => {
    if (!wallet?.address) {
      setTransferError("No wallet connected");
      return;
    }

    setTransferError("");
    setIsTransferring(true);

    try {
      // Only handle token transfers
      if (!asset.token_info) {
        throw new Error("Only token transfers are supported");
      }

      // Validate recipient address
      let recipientWallet: PublicKey;
      try {
        recipientWallet = new PublicKey(recipientAddress);
      } catch (error) {
        throw new Error(
          "Invalid recipient address format: " +
            (error instanceof Error ? error.message : String(error))
        );
      }

      // Get the mint address from the asset id (which is the mint address)
      const mintAddress = new PublicKey(asset.id);

      // Get the sender's associated token account
      const senderATA = await getAssociatedTokenAddress(
        mintAddress,
        new PublicKey(wallet.address),
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Find the recipient's associated token account
      const recipientATA = await getAssociatedTokenAddress(
        mintAddress,
        recipientWallet,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Validate amount with better error messages
      const transferAmount = parseFloat(amount);
      if (isNaN(transferAmount)) {
        throw new Error("Please enter a valid number");
      }
      if (transferAmount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      const tokenAmount = Math.floor(
        transferAmount * Math.pow(10, asset.token_info.decimals || 0)
      );
      if (tokenAmount > Number(asset.token_info.balance)) {
        throw new Error(
          `Insufficient ${asset.token_info.symbol || "token"} balance`
        );
      }

      // Create the transaction
      const transaction = await createBaseTransaction(
        recipientWallet,
        tokenAmount,
        senderATA,
        recipientATA,
        mintAddress
      );

      // Add priority fee instruction using medium priority from Helius
      if (priorityFees) {
        // Use medium priority fee, but ensure it's at least 10,000 microLamports
        const priorityFee = Math.max(priorityFees.high || 0, 10000);
        const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice(
          {
            microLamports: priorityFee,
          }
        );
        transaction.instructions = [
          priorityFeeInstruction,
          ...transaction.instructions,
        ];
      }

      // Convert to versioned transaction
      const versionedTransaction = new VersionedTransaction(
        transaction.compileMessage()
      );

      // Send transaction
      const { confirmation } = await sendTransaction(versionedTransaction, {
        commitment: "processed",
      });

      if (confirmation?.value.err) {
        throw new Error("Transaction failed to confirm");
      }

      addNotification(
        "success",
        `Successfully sent ${amount} ${asset.token_info.symbol || "tokens"}`,
        {
          recipient: recipientAddress,
          amount,
          symbol: asset.token_info.symbol,
        }
      );

      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Transfer error:", error);
      const { message, details } = getErrorMessage(error);
      setTransferError(message);
      addNotification(
        "error",
        message,
        details || {
          symbol: asset.token_info?.symbol,
          amount,
          recipient: recipientAddress,
        }
      );
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Transfer {asset.content?.metadata?.name || "Asset"}
          </DialogTitle>
          <DialogDescription>
            {asset.interface === "V1_NFT"
              ? "NFT transfers are currently not supported."
              : "Transfer this token to another address."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {asset.token_info && (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setTransferError("");
                  }}
                  placeholder="0.0"
                  step="0.000001"
                  min="0"
                />
                <Button
                  variant="outline"
                  onClick={handleSetMaxAmount}
                  disabled={!asset.token_info?.balance}
                  className="whitespace-nowrap"
                >
                  Max
                </Button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              type="text"
              value={recipientAddress}
              onChange={(e) => {
                setRecipientAddress(e.target.value);
                setTransferError("");
              }}
              placeholder="Solana address"
              disabled={asset.interface === "V1_NFT"}
            />
          </div>
          {transferError && (
            <p className="text-destructive text-sm">{transferError}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Available balance:{" "}
                {asset.token_info
                  ? `${(Number(asset.token_info.balance) / Math.pow(10, asset.token_info.decimals || 0)).toLocaleString()} ${asset.token_info.symbol || ""}`
                  : "1 NFT"}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isTransferring}
          >
            Cancel
          </Button>
          {asset.token_info ? (
            <Button
              onClick={handleTransfer}
              disabled={isTransferring || !recipientAddress || !amount}
            >
              {isTransferring ? "Processing..." : "Transfer"}
            </Button>
          ) : (
            <Button disabled>NFT Transfers Not Supported</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
