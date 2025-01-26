import { useState } from "react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useWallet } from "../hooks/wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RefreshCw } from "lucide-react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const {
    wallet,
    balance,
    isLoadingBalance,
    refreshBalance,
    isRefetchingBalance,
    sendTransaction,
  } = useWallet();

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  const handleClose = () => {
    setWithdrawError("");
    setWithdrawAmount("");
    setRecipientAddress("");
    onClose();
  };

  const handleWithdraw = async () => {
    if (!wallet?.address) {
      setWithdrawError("No Solana wallet connected");
      return;
    }

    setWithdrawError("");
    setIsWithdrawing(true);

    try {
      // Validate amount
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      if (lamports > (balance || 0) * LAMPORTS_PER_SOL) {
        throw new Error("Insufficient balance");
      }

      // Validate recipient address
      let recipientPubkey;
      try {
        recipientPubkey = new PublicKey(recipientAddress);
      } catch {
        throw new Error("Invalid recipient address");
      }

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(wallet.address),
          toPubkey: recipientPubkey,
          lamports,
        })
      );

      // Send transaction using the hook
      const { confirmation } = await sendTransaction(transaction);

      if (confirmation?.value.err) {
        throw new Error("Transaction failed to confirm");
      }

      handleClose();
      refreshBalance();
    } catch (error) {
      console.error("Withdrawal error:", error);
      setWithdrawError(error instanceof Error ? error.message : "Failed to withdraw");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw SOL</DialogTitle>
          <DialogDescription>
            Transfer SOL from your wallet to another address.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (SOL)</Label>
            <Input
              id="amount"
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.0"
              step="0.000001"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="Solana address"
            />
          </div>
          {withdrawError && <p className="text-destructive text-sm">{withdrawError}</p>}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Available balance: {isLoadingBalance ? "Loading..." : `${balance?.toFixed(6) || "0"} SOL`}
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshBalance}
              disabled={isLoadingBalance || isRefetchingBalance}
              title="Refresh balance"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isLoadingBalance || isRefetchingBalance ? "animate-spin" : ""
                }`}
              />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isWithdrawing}>
            Cancel
          </Button>
          <Button
            onClick={handleWithdraw}
            disabled={isWithdrawing || !withdrawAmount || !recipientAddress}
          >
            {isWithdrawing ? "Processing..." : "Withdraw"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 