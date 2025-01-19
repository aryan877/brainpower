"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Menu, RefreshCw } from "lucide-react";
import Sidebar from "./components/Sidebar";
import ChatInterface from "./components/ChatInterface";
import { AuthGuard } from "./components/AuthGuard";
import { usePrivy } from "@privy-io/react-auth";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useClusterStore } from "./store/clusterStore";
import { useWallet } from "./hooks/wallet";
import { ThreadPreview } from "./types";
import { useThreads, useCreateThread, useDeleteThread } from "./hooks/chat";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = usePrivy();
  const { getRpcUrl } = useClusterStore();
  const {
    wallet,
    balance,
    isLoadingBalance,
    refreshBalance,
    isRefetchingBalance,
  } = useWallet();

  // Use hooks for thread operations
  const { data: threads = [], isLoading } = useThreads();
  const { mutateAsync: createThreadMutation } = useCreateThread();
  const { mutateAsync: deleteThreadMutation } = useDeleteThread();

  // Withdraw modal states
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);

  // Get chatId from URL query parameter
  const selectedThread = searchParams.get("chatId");

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar on mobile when a thread is selected
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [selectedThread]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  // Set initial sidebar state based on screen size
  useEffect(() => {
    setIsSidebarOpen(window.innerWidth >= 768);

    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * Create a new thread
   */
  const createThread = useCallback(async () => {
    try {
      const response = await createThreadMutation();
      // Update URL with new thread ID
      router.push(`/?chatId=${response.threadId}`);
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  }, [createThreadMutation, router]);

  /**
   * Delete an existing thread
   */
  const deleteThread = useCallback(
    async (threadId: string) => {
      try {
        await deleteThreadMutation(threadId);
        if (selectedThread === threadId) {
          // Remove chatId from URL if deleted thread is currently selected
          router.push("/");
        }
      } catch (error) {
        console.error("Error deleting thread:", error);
      }
    },
    [selectedThread, deleteThreadMutation, router]
  );

  /**
   * Handle thread selection
   */
  const handleSelectThread = useCallback(
    (threadId: string | null) => {
      if (threadId) {
        router.push(`/?chatId=${threadId}`);
      } else {
        router.push("/");
      }
    },
    [router]
  );

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    title: string;
    content: React.ReactNode;
    onConfirm: () => Promise<void>;
  } | null>(null);

  const showConfirmDialog = (config: {
    title: string;
    content: React.ReactNode;
    onConfirm: () => Promise<void>;
  }) => {
    setConfirmDialogConfig(config);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDialogClose = () => {
    setIsConfirmDialogOpen(false);
    setConfirmDialogConfig(null);
  };

  const handleDeleteClick = (thread: ThreadPreview) => {
    showConfirmDialog({
      title: "Delete Chat",
      content: (
        <p className="text-[var(--text-secondary)] text-sm md:text-base">
          Are you sure you want to delete{" "}
          <span className="text-[var(--text-primary)]">
            {formatThreadName(thread)}
          </span>
          ? This action cannot be undone.
        </p>
      ),
      onConfirm: async () => {
        try {
          await deleteThread(thread.threadId);
        } catch (error) {
          console.error("Error deleting thread:", error);
        }
      },
    });
  };

  const formatThreadName = (thread: ThreadPreview) => {
    if (thread.title) {
      return thread.title;
    }
    const date = new Date(thread.createdAt);
    return `Chat ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const handleLogoutClick = () => {
    showConfirmDialog({
      title: "Confirm Logout",
      content: (
        <div className="text-[var(--text-secondary)]">
          <p>Are you sure you want to log out?</p>
          {user?.wallet && (
            <p className="mt-2 text-sm">
              Note: This will not disconnect your wallet. You will need to
              reconnect to access your account again.
            </p>
          )}
        </div>
      ),
      onConfirm: async () => {
        try {
          await logout();
        } catch (error) {
          console.error("Error logging out:", error);
        }
      },
    });
  };

  const handleWithdrawClick = () => {
    setIsWithdrawDialogOpen(true);
  };

  const closeWithdrawDialog = () => {
    setIsWithdrawDialogOpen(false);
    setWithdrawError("");
    setWithdrawAmount("");
    setRecipientAddress("");
  };

  const handleRefreshBalance = () => {
    if (wallet?.address) {
      refreshBalance();
    }
  };

  const handleWithdraw = async () => {
    if (!wallet?.address) {
      setWithdrawError("No Solana wallet found");
      return;
    }

    setWithdrawError("");
    setIsWithdrawing(true);

    try {
      // Create connection
      const connection = new Connection(getRpcUrl(), "confirmed");

      // Get current balance
      const balance = await connection.getBalance(
        new PublicKey(wallet.address)
      );

      // Validate amount
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      if (lamports > balance) {
        throw new Error("Insufficient balance");
      }

      // Validate recipient address
      let recipientPubkey;
      try {
        recipientPubkey = new PublicKey(recipientAddress);
      } catch {
        throw new Error("Invalid recipient address");
      }

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");

      // Create transaction
      const transaction = new Transaction({
        feePayer: new PublicKey(wallet.address),
        recentBlockhash: blockhash,
      }).add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(wallet.address),
          toPubkey: recipientPubkey,
          lamports,
        })
      );

      // Sign and send transaction
      try {
        const signedTx = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(
          signedTx.serialize()
        );

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        });

        if (confirmation.value.err) {
          throw new Error("Transaction failed to confirm");
        }

        closeWithdrawDialog();
        refreshBalance();
      } catch (error) {
        console.error("Transaction error:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to send transaction"
        );
      }
    } catch (error: unknown) {
      console.error("Withdrawal error:", error);
      setWithdrawError(
        error instanceof Error ? error.message : "Failed to withdraw"
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Confirm Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialogConfig?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">{confirmDialogConfig?.content}</div>
          <DialogFooter>
            <button
              onClick={handleConfirmDialogClose}
              className="px-4 py-2 rounded-xl border text-foreground hover:bg-muted/50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (confirmDialogConfig) {
                  await confirmDialogConfig.onConfirm();
                  handleConfirmDialogClose();
                }
              }}
              className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-200"
            >
              Confirm
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog
        open={isWithdrawDialogOpen}
        onOpenChange={setIsWithdrawDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw SOL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Amount (SOL)
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.0"
                className="w-full px-3 py-2 bg-background border rounded-lg text-foreground placeholder-muted-foreground"
                step="0.000001"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Solana address"
                className="w-full px-3 py-2 bg-background border rounded-lg text-foreground placeholder-muted-foreground"
              />
            </div>
            {withdrawError && (
              <p className="text-destructive text-sm">{withdrawError}</p>
            )}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Available balance:{" "}
                {isLoadingBalance
                  ? "Loading..."
                  : `${balance?.toFixed(6) || "0"} SOL`}
              </p>
              <button
                onClick={handleRefreshBalance}
                disabled={isLoadingBalance || isRefetchingBalance}
                className="p-1.5 hover:bg-muted/50 rounded-md transition-colors disabled:opacity-50"
                title="Refresh balance"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    isLoadingBalance || isRefetchingBalance
                      ? "animate-spin"
                      : ""
                  }`}
                />
              </button>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={closeWithdrawDialog}
              className="px-4 py-2 rounded-xl border text-foreground hover:bg-muted/50 transition-all duration-200"
              disabled={isWithdrawing}
            >
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-50"
              disabled={isWithdrawing || !withdrawAmount || !recipientAddress}
            >
              {isWithdrawing ? "Processing..." : "Withdraw"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar container */}
      <div
        className={`fixed md:static w-[260px] h-full z-30 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <Sidebar
          threads={threads}
          selectedThread={selectedThread}
          onSelectThread={handleSelectThread}
          onCreateThread={createThread}
          onDeleteClick={handleDeleteClick}
          isLoading={isLoading}
          onLogoutClick={handleLogoutClick}
          onWithdrawClick={handleWithdrawClick}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 relative h-full">
        {/* Header with burger menu */}
        <header className="absolute top-0 left-0 right-0 h-12 bg-background border-b flex items-center px-4 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-muted/50 rounded-lg md:hidden"
            >
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-lg font-medium text-foreground">
              BrainPower 🧠⚡
            </h1>
          </div>
        </header>

        <div className="absolute inset-0 top-12">
          <ChatInterface threadId={selectedThread} />
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthGuard>
        <HomeContent />
      </AuthGuard>
    </Suspense>
  );
}
