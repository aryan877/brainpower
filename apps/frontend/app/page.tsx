"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Menu } from "lucide-react";
import Sidebar from "./components/Sidebar";
import ChatInterface from "./components/ChatInterface";
import Modal from "./components/Modal";
import api from "./lib/axios";
import { Thread } from "./types";
import { AuthGuard } from "./components/AuthGuard";
import { usePrivy } from "@privy-io/react-auth";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { useClusterStore } from "./store/clusterStore";
import { useWallet } from "./hooks/useWallet";
import { RefreshCw } from "lucide-react";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = usePrivy();
  const { wallets } = useSolanaWallets();
  const { getRpcUrl } = useClusterStore();
  const { wallet, balance, isLoadingBalance, refreshBalance } = useWallet();

  // Chat delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<Thread | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Wallet modal states
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

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
   * Fetch the list of threads
   */
  const fetchThreads = useCallback(async (): Promise<void> => {
    try {
      const { data } = await api.get("/api/chat/threads");
      if (data.threads) {
        setThreads(data.threads);
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
    }
  }, []);

  /**
   * Create a new thread
   */
  const createThread = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.post("/api/chat/thread");
      if (data.threadId) {
        await fetchThreads();
        // Update URL with new thread ID
        router.push(`/?chatId=${data.threadId}`);
      }
    } catch (error) {
      console.error("Error creating thread:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchThreads, router]);

  /**
   * Delete an existing thread
   */
  const deleteThread = useCallback(
    async (threadId: string) => {
      try {
        const response = await api.delete(`/api/chat/thread/${threadId}`);
        if (response.status === 200) {
          await fetchThreads();
          if (selectedThread === threadId) {
            // Remove chatId from URL if deleted thread is currently selected
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Error deleting thread:", error);
      }
    },
    [selectedThread, fetchThreads, router]
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

  /**
   * Initial fetch of threads
   */
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const handleDeleteClick = (thread: Thread) => {
    setThreadToDelete(thread);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!threadToDelete) return;

    setIsDeleting(true);
    try {
      await deleteThread(threadToDelete.threadId);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setThreadToDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setThreadToDelete(null);
    }
  };

  const formatThreadName = (thread: Thread) => {
    if (thread.title) {
      return thread.title;
    }
    const date = new Date(thread.createdAt);
    return `Chat ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoggingOut(false);
      setLogoutModalOpen(false);
    }
  };

  const handleCloseLogoutModal = () => {
    if (!isLoggingOut) {
      setLogoutModalOpen(false);
    }
  };

  const handleWithdrawClick = () => {
    setWithdrawModalOpen(true);
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

        setWithdrawModalOpen(false);
        setWithdrawAmount("");
        setRecipientAddress("");
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

  // Fetch balance when modal opens
  useEffect(() => {
    const solanaWallet = wallets[0];
    if (withdrawModalOpen && solanaWallet?.address) {
      refreshBalance();
    }
  }, [withdrawModalOpen, refreshBalance, wallets]);

  const handleRefreshBalance = () => {
    const solanaWallet = wallets[0];
    if (solanaWallet?.address) {
      refreshBalance();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
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
        <header className="absolute top-0 left-0 right-0 h-12 bg-[var(--background)] border-b border-[var(--border-color)] flex items-center px-4 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-[var(--hover-bg)] rounded-lg md:hidden"
            >
              <Menu className="h-5 w-5 text-[var(--text-primary)]" />
            </button>
            <h1 className="text-lg font-medium text-[var(--text-primary)]">
              BrainPower
            </h1>
          </div>
        </header>

        <div className="absolute inset-0 top-12">
          <ChatInterface selectedChat={selectedThread} threads={threads} />
        </div>
      </main>

      {/* Modals */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Delete Chat"
        footer={
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleCloseDeleteModal}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-all duration-200 text-sm md:text-base"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all duration-200 disabled:opacity-50 text-sm md:text-base"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        }
      >
        <p className="text-[var(--text-secondary)] text-sm md:text-base">
          Are you sure you want to delete{" "}
          <span className="text-[var(--text-primary)]">
            {threadToDelete ? formatThreadName(threadToDelete) : ""}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>

      <Modal
        isOpen={logoutModalOpen}
        onClose={handleCloseLogoutModal}
        title="Confirm Logout"
        footer={
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleCloseLogoutModal}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-all duration-200"
              disabled={isLoggingOut}
            >
              Cancel
            </button>
            <button
              onClick={handleLogoutConfirm}
              className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all duration-200 disabled:opacity-50"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        }
      >
        <div className="text-[var(--text-secondary)]">
          <p>Are you sure you want to log out?</p>
          {user?.wallet && (
            <p className="mt-2 text-sm">
              Note: This will not disconnect your wallet. You will need to
              reconnect to access your account again.
            </p>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={withdrawModalOpen}
        onClose={() => {
          if (!isWithdrawing) {
            setWithdrawModalOpen(false);
            setWithdrawError("");
            setWithdrawAmount("");
            setRecipientAddress("");
          }
        }}
        title="Withdraw SOL"
        footer={
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setWithdrawModalOpen(false);
                setWithdrawError("");
                setWithdrawAmount("");
                setRecipientAddress("");
              }}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-all duration-200"
              disabled={isWithdrawing}
            >
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-all duration-200 disabled:opacity-50"
              disabled={isWithdrawing || !withdrawAmount || !recipientAddress}
            >
              {isWithdrawing ? "Processing..." : "Withdraw"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Amount (SOL)
            </label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.0"
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
              step="0.000001"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="Solana address"
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
            />
          </div>
          {withdrawError && (
            <p className="text-red-500 text-sm">{withdrawError}</p>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--text-secondary)]">
              Available balance:{" "}
              {isLoadingBalance
                ? "Loading..."
                : `${balance?.toFixed(6) || "0"} SOL`}
            </p>
            <button
              onClick={handleRefreshBalance}
              disabled={isLoadingBalance}
              className="p-1.5 hover:bg-[var(--hover-bg)] rounded-md transition-colors disabled:opacity-50"
              title="Refresh balance"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  isLoadingBalance ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </Modal>
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
