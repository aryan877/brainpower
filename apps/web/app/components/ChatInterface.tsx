"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import React, {
  FormEvent,
  TouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useCreateThread,
  useSaveAllMessages,
  useThreadMessages,
} from "../hooks/chat";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useClusterStore } from "../store/clusterStore";
import ChatMessage from "./ChatMessage";

const SendIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
  >
    <path
      d="M12 20V4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 11L12 4L19 11"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StopIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
  >
    <path
      d="M18 6L6 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 6L18 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ScrollDownIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface ChatInterfaceProps {
  threadId: string | null;
}

export default function ChatInterface({ threadId }: ChatInterfaceProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const { data: initialMessages = [] } = useThreadMessages(threadId);
  const { mutate: saveAllMessages } = useSaveAllMessages();
  const { mutateAsync: createThread } = useCreateThread();
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [hasActiveToolCall, setHasActiveToolCall] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    addToolResult,
    stop,
  } = useChat({
    api: "/api/chat/message",
    id: threadId || undefined,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Solana-Cluster": useClusterStore.getState().selectedCluster,
    },
    body: {
      threadId,
    },
    onResponse: () => {
      setIsWaitingForResponse(false);
    },
    initialMessages,
    generateId: () => `msg_${nanoid()}`,
    sendExtraMessageFields: true,
  });

  // Add local storage hook for pending message
  const [pendingMessage, setPendingMessage, removePendingMessage] =
    useLocalStorage<string | null>("pendingMessage", null);

  // Check for active tool calls in any message
  useEffect(() => {
    const hasActiveTool = messages.some((message) =>
      message?.toolInvocations?.some((t) => t.state === "call")
    );
    setHasActiveToolCall(hasActiveTool);
  }, [messages]);

  // Save messages when they change and not loading
  useEffect(() => {
    if (!isLoading && threadId && messages.length > 0) {
      saveAllMessages({ messages, threadId });
    }
  }, [messages, isLoading, threadId, saveAllMessages]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add scroll handler to check if we're at bottom
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      // Only show scroll button if there's actually scrollable content AND we're not at bottom
      const hasScrollableContent = scrollHeight > clientHeight;
      const isAtBottom =
        Math.abs(scrollHeight - clientHeight - scrollTop) < 100;
      setShowScrollDown(!isAtBottom && hasScrollableContent);
    }
  }, []);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) {
      messagesContainer.addEventListener("scroll", handleScroll);
      return () =>
        messagesContainer.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Auto scroll to bottom on new messages if already at bottom
  useEffect(() => {
    if (!showScrollDown) {
      scrollToBottom();
    }
  }, [messages, showScrollDown, scrollToBottom]);

  // Modify wrappedHandleSubmit to handle storing message
  const wrappedHandleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!threadId) {
        try {
          // Store the current input before creating thread
          setPendingMessage(input);

          // Create new thread using the mutation
          const newThread = await createThread();

          // Update the URL without full page reload
          router.replace(`/chat?chatId=${newThread.threadId}`);

          return;
        } catch (error) {
          console.error("Error creating thread:", error);
          removePendingMessage();
          return;
        }
      }

      // Normal message submission flow
      setIsWaitingForResponse(true);
      handleSubmit(e);
    },
    [
      threadId,
      router,
      handleSubmit,
      createThread,
      input,
      setPendingMessage,
      removePendingMessage,
    ]
  );

  // Effect to send pending message when component loads with a threadId
  useEffect(() => {
    if (threadId && pendingMessage) {
      // Set the input value to the pending message
      handleInputChange({
        target: { value: pendingMessage },
      } as React.ChangeEvent<HTMLTextAreaElement>);

      // Create a synthetic form event
      const formEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      }) as unknown as FormEvent<HTMLFormElement>;

      // Submit the message
      wrappedHandleSubmit(formEvent);

      // Clear the pending message
      removePendingMessage();
    }
  }, [
    threadId,
    pendingMessage,
    handleInputChange,
    wrappedHandleSubmit,
    removePendingMessage,
  ]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      wrappedHandleSubmit(e as unknown as FormEvent<HTMLFormElement>);
    }
  }

  // Add this function to handle category navigation
  const handleCategoryChange = (direction: "next" | "prev") => {
    if (direction === "next") {
      setActiveCategoryIndex((prev) => (prev === 4 ? 0 : prev + 1));
    } else {
      setActiveCategoryIndex((prev) => (prev === 0 ? 4 : prev - 1));
    }
  };

  // Add these states and refs for touch handling
  const touchStartX = useRef<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const suggestionContainerRef = useRef<HTMLDivElement>(null);

  // Add this touch handler function
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setSwipeDirection(null);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (touchStartX.current === null) return;

    const currentX = e.touches[0].clientX;
    const diff = touchStartX.current - currentX;

    if (Math.abs(diff) > 20) {
      setSwipeDirection(diff > 0 ? "left" : "right");
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    // Detect swipe (threshold of 50px)
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left
        handleCategoryChange("next");
      } else {
        // Swipe right
        handleCategoryChange("prev");
      }
    }

    touchStartX.current = null;
    setSwipeDirection(null);
  };

  // Add this effect to make the suggestion container height consistent
  useEffect(() => {
    const updateSuggestionHeight = () => {
      if (suggestionContainerRef.current) {
        // Set a minimum height for the suggestion container
        const minHeight = 180; // px
        suggestionContainerRef.current.style.minHeight = `${minHeight}px`;
      }
    };

    updateSuggestionHeight();
    window.addEventListener("resize", updateSuggestionHeight);

    return () => {
      window.removeEventListener("resize", updateSuggestionHeight);
    };
  }, []);

  // Use a single input form component for both cases
  const InputForm = (
    <div className="bg-background mt-auto w-full max-w-3xl mx-auto pt-2 pb-4 px-3">
      {showScrollDown && messages.length > 0 && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <Button
            size="icon"
            variant="outline"
            onClick={scrollToBottom}
            className="h-7 w-7"
          >
            <ScrollDownIcon />
          </Button>
        </div>
      )}
      <form onSubmit={wrappedHandleSubmit} className="px-2 py-2">
        <div className="relative flex items-center">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder={
              hasActiveToolCall
                ? "Please complete/cancel action or wait for response..."
                : "Type your message..."
            }
            rows={3}
            className={cn(
              "resize-none pr-14 text-sm text-foreground placeholder:text-muted-foreground/60",
              "border border-white/20 rounded-md focus:border-white focus:ring-0 shadow-sm",
              "bg-muted/30 dark:bg-background/90"
            )}
            style={{ minHeight: "64px", maxHeight: "160px" }}
            disabled={isLoading || hasActiveToolCall}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute right-3">
            {isLoading ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={stop}
                className="h-8 w-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-gray-100 transition-colors"
              >
                <StopIcon />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                disabled={isLoading || hasActiveToolCall || !input.trim()}
                className="h-8 w-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-gray-100 transition-colors"
              >
                <SendIcon />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );

  if (!threadId) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="h-full pt-10">
            <div className="text-center max-w-lg mx-auto space-y-3 px-4">
              <h3 className="text-base font-medium mb-1">
                Your intelligent assistant for Solana blockchain interactions
              </h3>

              {/* Category navigation buttons */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => handleCategoryChange("prev")}
                  className="p-2 rounded-full hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary flex items-center justify-center"
                  aria-label="Previous category"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-sm font-medium bg-muted/30 px-4 py-1.5 rounded-full">
                  {activeCategoryIndex === 0 && "Market Data & Analysis"}
                  {activeCategoryIndex === 1 && "Trading & Swaps"}
                  {activeCategoryIndex === 2 && "Wallet & Account Management"}
                  {activeCategoryIndex === 3 && "Token Creation & Analysis"}
                  {activeCategoryIndex === 4 &&
                    "Cross-Chain Bridging (deBridge)"}
                </div>

                <button
                  onClick={() => handleCategoryChange("next")}
                  className="p-2 rounded-full hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary flex items-center justify-center"
                  aria-label="Next category"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Category content - only show active one */}
              <div
                ref={suggestionContainerRef}
                className={cn(
                  "bg-muted/20 p-5 rounded-lg border border-border/10 shadow-sm transition-all duration-300 transform",
                  swipeDirection === "left" && "translate-x-[-10px] opacity-90",
                  swipeDirection === "right" && "translate-x-[10px] opacity-90"
                )}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {activeCategoryIndex === 0 && (
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Show me trending tokens on CoinGecko",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Show me trending tokens on CoinGecko
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "What's the price of SOL right now?",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • What&apos;s the price of SOL right now?
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Get me a price chart for BONK",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Get me a price chart for BONK
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Run a rugcheck on a token address",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Run a rugcheck on a token address
                    </li>
                  </ul>
                )}

                {activeCategoryIndex === 1 && (
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Find the best rate to swap 10 USDC to BONK",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Find the best rate to swap 10 USDC to BONK
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "I want to trade 0.5 SOL for JUP",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • I want to trade 0.5 SOL for JUP
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Get token data for PYTH",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Get token data for PYTH
                    </li>
                  </ul>
                )}

                {activeCategoryIndex === 2 && (
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: { value: "Show my wallet balance" },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Show my wallet balance
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Get token balances in my wallet",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Get token balances in my wallet
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Close my empty token accounts",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Close my empty token accounts
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Transfer SOL to another wallet",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Transfer SOL to another wallet
                    </li>
                  </ul>
                )}

                {activeCategoryIndex === 3 && (
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Help me launch a token with PumpFun",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Help me launch a token with PumpFun
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Analyze a PumpFun bundle",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Analyze a PumpFun bundle
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Show me the top holders of JUP token",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Show me the top holders of JUP token
                    </li>
                  </ul>
                )}

                {activeCategoryIndex === 4 && (
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value:
                              "Get a quote to bridge 1 SOL from Solana to Ethereum",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Get a bridge quote (e.g., SOL to ETH)
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Show me which chains deBridge supports",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • List supported chains for bridging
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Find USDC token info on Solana",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Find token info on a specific chain
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Bridge my 0.5 SOL from Solana to Base",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Execute a bridge transfer
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value:
                              "Check the status of my bridge transaction 0x...",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Verify bridge transaction status
                    </li>
                  </ul>
                )}
              </div>

              {/* Category indicator pills for threaded chat view */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {["Market", "Trading", "Wallet", "Tokens", "deBridge"].map(
                  (label, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveCategoryIndex(index)}
                      className={cn(
                        "px-3 py-1 text-xs rounded-full transition-all duration-300",
                        activeCategoryIndex === index
                          ? "bg-primary text-primary-foreground font-medium shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted-foreground/20"
                      )}
                      aria-label={`Go to category ${index + 1}`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
                <ChevronLeft className="w-3 h-3" />
                <span>Swipe or tap a pill to explore options</span>
                <ChevronRight className="w-3 h-3" />
              </p>
            </div>
          </div>
        </div>
        <div
          className="fixed bottom-0 right-0 z-10 bg-background"
          style={{
            width: "calc(100% - var(--sidebar-width, 0px))",
            left: "var(--sidebar-width, 0px)",
          }}
        >
          <div className="max-w-3xl mx-auto">{InputForm}</div>
        </div>
      </div>
    );
  }

  const isLoadingChat =
    threadId &&
    initialMessages.length === 0 &&
    messages.length === 0 &&
    isLoading;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto brainpower-scrollbar px-3 sm:px-4 pb-4"
      >
        {isLoadingChat ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-pulse">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Loading chat...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full pt-10">
            <div className="text-center max-w-lg mx-auto space-y-3 px-4">
              <h3 className="text-base font-medium mb-1">
                Your intelligent assistant for Solana blockchain interactions
              </h3>

              {/* Category navigation buttons */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => handleCategoryChange("prev")}
                  className="p-2 rounded-full hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary flex items-center justify-center"
                  aria-label="Previous category"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-sm font-medium bg-muted/30 px-4 py-1.5 rounded-full">
                  {activeCategoryIndex === 0 && "Market Data & Analysis"}
                  {activeCategoryIndex === 1 && "Trading & Swaps"}
                  {activeCategoryIndex === 2 && "Wallet & Account Management"}
                  {activeCategoryIndex === 3 && "Token Creation & Analysis"}
                  {activeCategoryIndex === 4 &&
                    "Cross-Chain Bridging (deBridge)"}
                </div>

                <button
                  onClick={() => handleCategoryChange("next")}
                  className="p-2 rounded-full hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary flex items-center justify-center"
                  aria-label="Next category"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Category content - only show active one */}
              <div
                ref={suggestionContainerRef}
                className={cn(
                  "bg-muted/20 p-5 rounded-lg border border-border/10 shadow-sm transition-all duration-300 transform",
                  swipeDirection === "left" && "translate-x-[-10px] opacity-90",
                  swipeDirection === "right" && "translate-x-[10px] opacity-90"
                )}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {activeCategoryIndex === 0 && (
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Show me trending tokens on CoinGecko",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Show me trending tokens on CoinGecko
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "What's the price of SOL right now?",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • What&apos;s the price of SOL right now?
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Get me a price chart for BONK",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Get me a price chart for BONK
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Run a rugcheck on a token address",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Run a rugcheck on a token address
                    </li>
                  </ul>
                )}

                {activeCategoryIndex === 1 && (
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Find the best rate to swap 10 USDC to BONK",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Find the best rate to swap 10 USDC to BONK
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "I want to trade 0.5 SOL for JUP",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • I want to trade 0.5 SOL for JUP
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Get token data for PYTH",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Get token data for PYTH
                    </li>
                  </ul>
                )}

                {activeCategoryIndex === 2 && (
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: { value: "Show my wallet balance" },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Show my wallet balance
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Get token balances in my wallet",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Get token balances in my wallet
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Close my empty token accounts",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Close my empty token accounts
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Transfer SOL to another wallet",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Transfer SOL to another wallet
                    </li>
                  </ul>
                )}

                {activeCategoryIndex === 3 && (
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Help me launch a token with PumpFun",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Help me launch a token with PumpFun
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Analyze a PumpFun bundle",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Analyze a PumpFun bundle
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Show me the top holders of JUP token",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Show me the top holders of JUP token
                    </li>
                  </ul>
                )}

                {activeCategoryIndex === 4 && (
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value:
                              "Get a quote to bridge 1 SOL from Solana to Ethereum",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Get a bridge quote (e.g., SOL to ETH)
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Show me which chains deBridge supports",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • List supported chains for bridging
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Find USDC token info on Solana",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Find token info on a specific chain
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value: "Bridge my 0.5 SOL from Solana to Base",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Execute a bridge transfer
                    </li>
                    <li
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value:
                              "Check the status of my bridge transaction 0x...",
                          },
                        } as React.ChangeEvent<HTMLTextAreaElement>)
                      }
                    >
                      • Verify bridge transaction status
                    </li>
                  </ul>
                )}
              </div>

              {/* Category indicator pills for threaded chat view */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {["Market", "Trading", "Wallet", "Tokens", "deBridge"].map(
                  (label, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveCategoryIndex(index)}
                      className={cn(
                        "px-3 py-1 text-xs rounded-full transition-all duration-300",
                        activeCategoryIndex === index
                          ? "bg-primary text-primary-foreground font-medium shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted-foreground/20"
                      )}
                      aria-label={`Go to category ${index + 1}`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
                <ChevronLeft className="w-3 h-3" />
                <span>Swipe or tap a pill to explore options</span>
                <ChevronRight className="w-3 h-3" />
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 mb-3">
            {messages.reduce((groups: React.ReactElement[], message) => {
              return [
                ...groups,
                <div key={message.id} className="max-w-3xl mx-auto py-1">
                  <ChatMessage
                    message={message}
                    isLoading={
                      isLoading &&
                      messages.length > 0 &&
                      message.id === messages[messages.length - 1].id &&
                      message.role === "assistant"
                    }
                    isWaitingForResponse={isWaitingForResponse}
                    addToolResult={addToolResult}
                  />
                </div>,
              ];
            }, [])}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-background">
        <div className="max-w-3xl mx-auto">{InputForm}</div>
      </div>
    </div>
  );
}
