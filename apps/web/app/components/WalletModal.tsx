import { useState } from "react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
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
} from "@/components/ui/dialog";
import { walletClient } from "../clients/wallet";
import { useNotificationStore } from "../store/notificationStore";
import { ArrowUpRight } from "lucide-react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { wallet, balance, refreshBalance, sendTransaction } = useWallet();
  const { addNotification } = useNotificationStore();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  const RENT_EXEMPT_MINIMUM = 890880; // 0.00089088 SOL in lamports

  // Clear state when modal closes
  const handleClose = () => {
    setWithdrawError("");
    setWithdrawAmount("");
    setRecipientAddress("");
    onClose();
  };

  const handleWithdraw = async () => {
    if (!wallet?.address) {
      setWithdrawError("No wallet connected");
      return;
    }

    if (!recipientAddress) {
      setWithdrawError("Please enter a recipient address");
      return;
    }

    setWithdrawError("");
    setIsWithdrawing(true);

    try {
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      // Verify we have enough balance including fees and rent exemption
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      if (balance) {
        const availableLamports = Math.floor(balance * LAMPORTS_PER_SOL);
        const remainingAfterTransfer = availableLamports - lamports;

        if (remainingAfterTransfer < RENT_EXEMPT_MINIMUM) {
          throw new Error(
            `Insufficient balance. Must keep ${(RENT_EXEMPT_MINIMUM / LAMPORTS_PER_SOL).toFixed(6)} SOL for rent exemption`
          );
        }

        if (lamports > availableLamports) {
          throw new Error("Insufficient balance for this transfer");
        }
      }

      // Create the transaction
      const { blockhash } = await walletClient.getLatestBlockhash();
      const transaction = new Transaction();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(wallet.address);

      // Add transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(wallet.address),
          toPubkey: new PublicKey(recipientAddress),
          lamports,
        })
      );

      // Convert to versioned transaction
      const versionedTransaction = new VersionedTransaction(
        transaction.compileMessage()
      );
      const { confirmation } = await sendTransaction(versionedTransaction);
      if (confirmation?.value.err) {
        throw new Error("Transaction failed");
      }

      addNotification("success", `Successfully sent ${withdrawAmount} SOL`, {
        recipient: recipientAddress,
        amount: withdrawAmount,
      });

      handleClose();
      refreshBalance();
    } catch (error) {
      console.error("Withdrawal error:", error);
      setWithdrawError(
        error instanceof Error ? error.message : "Failed to withdraw"
      );
      addNotification("error", "Failed to send SOL", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send SOL</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (SOL)</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => {
                  setWithdrawAmount(e.target.value);
                  setWithdrawError("");
                }}
                placeholder="0.0"
                step="0.000001"
                min="0"
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (balance) {
                    // Leave some SOL for fees and rent
                    const maxAmount = Math.max(
                      (balance * LAMPORTS_PER_SOL - RENT_EXEMPT_MINIMUM * 1.1) /
                        LAMPORTS_PER_SOL,
                      0
                    );
                    setWithdrawAmount(maxAmount.toFixed(9));
                  }
                }}
                disabled={!balance}
                className="whitespace-nowrap"
              >
                Max
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              type="text"
              value={recipientAddress}
              onChange={(e) => {
                setRecipientAddress(e.target.value);
                setWithdrawError("");
              }}
              placeholder="Solana address"
            />
          </div>
          {withdrawError && (
            <p className="text-destructive text-sm">{withdrawError}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Available balance: {balance?.toFixed(6) || "0"} SOL
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isWithdrawing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleWithdraw}
            disabled={isWithdrawing || !withdrawAmount || !recipientAddress}
          >
            {isWithdrawing ? (
              "Sending..."
            ) : (
              <>
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
