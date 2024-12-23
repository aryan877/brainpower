"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import Sidebar from "./components/Sidebar";
import ChatInterface from "./components/ChatInterface";
import api from "./lib/axios";
import { AxiosError } from "axios";
import { Thread, ApiError } from "./types";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authSignature, setAuthSignature] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const { publicKey, signMessage } = useWallet();

  /**
   * Handle user authentication
   */
  const handleAuthentication = useCallback(async (): Promise<void> => {
    if (!publicKey || !signMessage) return;

    try {
      setAuthError(null);
      setIsLoading(true);

      const nonceResponse = await api.post<{ message: string; nonce: string }>(
        "/api/auth/nonce",
        {
          walletAddress: publicKey.toBase58(),
        }
      );

      if (!nonceResponse.data.message) {
        throw new Error("Failed to get nonce");
      }

      const messageBytes = new TextEncoder().encode(nonceResponse.data.message);
      const signature = await signMessage(messageBytes);
      const signatureBase58 = bs58.encode(signature);

      const verifyResponse = await api.post("/api/auth/verify", {
        walletAddress: publicKey.toBase58(),
        signature: signatureBase58,
      });

      if (verifyResponse.status === 200) {
        setAuthSignature(signatureBase58);
        setIsAuthenticated(true);
        setAuthError(null);

        // Fetch threads immediately after successful authentication
        try {
          const { data } = await api.get("/api/chat/threads", {
            headers: {
              Authorization: `${publicKey.toBase58()} ${signatureBase58}`,
            },
          });
          if (data.threads) {
            setThreads(data.threads);
          }
        } catch (error) {
          console.error("Error fetching initial threads:", error);
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setIsAuthenticated(false);
      setAuthSignature(null);

      const axiosError = error as AxiosError<ApiError>;
      const errorMessage =
        axiosError.response?.data?.error || "Authentication failed";
      setAuthError(errorMessage);

      if (errorMessage.includes("nonce")) {
        setTimeout(() => {
          handleAuthentication();
        }, 1000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, signMessage]);

  /**
   *  Handle API error (e.g., nonce / 401 => re-authenticate)
   */
  const handleApiError = useCallback(
    async (error: unknown): Promise<void> => {
      const axiosError = error as AxiosError<ApiError>;
      if (
        axiosError.response?.data?.error?.includes("nonce") ||
        axiosError.response?.status === 401
      ) {
        setIsAuthenticated(false);
        setAuthSignature(null);

        await handleAuthentication();
      }
    },
    [handleAuthentication]
  );

  /**
   * Fetch the list of threads
   */
  const fetchThreads = useCallback(async (): Promise<void> => {
    if (!publicKey || !isAuthenticated || !authSignature) return;

    try {
      const { data } = await api.get("/api/chat/threads", {
        headers: {
          Authorization: `${publicKey.toBase58()} ${authSignature}`,
        },
      });
      if (data.threads) {
        setThreads(data.threads);
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
      // We call handleApiError, but to avoid circular dependencies,
      // we won't add handleApiError to the dependency array below.

      handleApiError(error);
    }
  }, [publicKey, isAuthenticated, authSignature, handleApiError]);

  /**
   * Create a new thread
   */
  const createThread = useCallback(async () => {
    if (!publicKey || !isAuthenticated || !authSignature) return;

    try {
      setIsLoading(true);
      const { data } = await api.post(
        "/api/chat/thread",
        {},
        {
          headers: {
            Authorization: `${publicKey.toBase58()} ${authSignature}`,
          },
        }
      );
      if (data.threadId) {
        // After creation, refresh thread list
        await fetchThreads();
        setSelectedThread(data.threadId);
      }
    } catch (error) {
      console.error("Error creating thread:", error);

      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
    // We omit handleApiError / fetchThreads from dependencies to avoid cycles
  }, [publicKey, isAuthenticated, authSignature, fetchThreads, handleApiError]);

  /**
   * Delete an existing thread
   */
  const deleteThread = useCallback(
    async (threadId: string) => {
      if (!publicKey || !isAuthenticated || !authSignature) return;

      try {
        const response = await api.delete(`/api/chat/thread/${threadId}`, {
          headers: {
            Authorization: `${publicKey.toBase58()} ${authSignature}`,
          },
        });
        if (response.status === 200) {
          await fetchThreads();
          if (selectedThread === threadId) {
            setSelectedThread(null);
          }
        }
      } catch (error) {
        console.error("Error deleting thread:", error);

        handleApiError(error);
      }
    },
    [
      publicKey,
      isAuthenticated,
      authSignature,
      selectedThread,
      fetchThreads,
      handleApiError,
    ]
  );

  /**
   * Reset auth state if user disconnects their wallet
   */
  useEffect(() => {
    if (!publicKey) {
      setIsAuthenticated(false);
      setAuthSignature(null);
      setThreads([]); // Clear threads when wallet disconnects
    }
  }, [publicKey]);

  /**
   * Initiate authentication flow whenever user connects wallet
   * and fetch threads if already authenticated
   */
  useEffect(() => {
    if (publicKey && signMessage && !isAuthenticated) {
      handleAuthentication();
    } else if (publicKey && isAuthenticated && authSignature) {
      fetchThreads();
    }
  }, [
    publicKey,
    signMessage,
    isAuthenticated,
    authSignature,
    fetchThreads,
    handleAuthentication,
  ]);

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <Sidebar
        threads={threads}
        selectedThread={selectedThread}
        onSelectThread={setSelectedThread}
        onCreateThread={createThread}
        onDeleteThread={deleteThread}
        isLoading={isLoading}
      />
      <main className="flex-1 flex flex-col">
        <header className="bg-[var(--secondary-bg)] border-b border-[var(--border-color)] p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            BrainPower
          </h1>
          <div className="flex items-center gap-4">
            {publicKey && !isAuthenticated && (
              <>
                <button
                  onClick={handleAuthentication}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Authenticating..." : "Authenticate"}
                </button>
                {authError && (
                  <span className="text-red-500 text-sm">{authError}</span>
                )}
              </>
            )}
            <WalletMultiButtonDynamic />
          </div>
        </header>
        <ChatInterface
          selectedChat={selectedThread}
          isAuthenticated={isAuthenticated}
          authSignature={authSignature}
          onError={handleApiError}
        />
      </main>
    </div>
  );
}
