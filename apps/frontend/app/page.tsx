"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "./components/Sidebar";
import ChatInterface from "./components/ChatInterface";
import api from "./lib/axios";
import { Thread } from "./types";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get chatId from URL query parameter
  const selectedThread = searchParams.get("chatId");

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

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <Sidebar
        threads={threads}
        selectedThread={selectedThread}
        onSelectThread={handleSelectThread}
        onCreateThread={createThread}
        onDeleteThread={deleteThread}
        isLoading={isLoading}
      />
      <main className="flex-1 flex flex-col">
        <header className="bg-[var(--secondary-bg)] border-b border-[var(--border-color)] p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            BrainPower
          </h1>
        </header>
        <ChatInterface selectedChat={selectedThread} threads={threads} />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
