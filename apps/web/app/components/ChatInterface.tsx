"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { useChat } from "ai/react";
import { ChevronLeft, ChevronRight, LogIn } from "lucide-react";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import React, {
  FormEvent,
  TouchEvent,
  useCallback,
  useContext,
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
import { AuthContext } from "./AuthGuard";
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
  const { authenticated, login } = useContext(AuthContext);
  const { user } = usePrivy();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check if wallet is properly delegated
  const isWalletDelegated = authenticated && user?.wallet?.delegated;
  const needsWalletSetup =
    authenticated && (!user?.wallet || !user.wallet.delegated);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    addToolResult,
    stop,
    error,
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

  // Handle textarea focus to show login modal if not authenticated
  const handleTextareaFocus = () => {
    if (!authenticated) {
      setShowLoginModal(true);
    }
  };

  // Modify wrappedHandleSubmit to handle authentication and wallet delegation
  const wrappedHandleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // If not authenticated, show login prompt
      if (!authenticated) {
        setShowLoginModal(true);
        return;
      }

      // If authenticated but wallet not delegated, do nothing
      if (!isWalletDelegated) {
        return;
      }

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
      authenticated,
      isWalletDelegated,
    ]
  );

  // Effect to send pending message when component loads with a threadId and user is authenticated
  useEffect(() => {
    if (threadId && pendingMessage && authenticated) {
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
    authenticated,
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

  // Login modal component
  const LoginModal = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity ${
        showLoginModal ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => setShowLoginModal(false)}
    >
      <div
        className="bg-card border border-border rounded-lg shadow-lg p-6 max-w-md w-full m-4 transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-medium mb-4">Login Required</h3>
        <p className="text-muted-foreground mb-6">
          Please log in to send messages and interact with the chat assistant.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowLoginModal(false)}>
            Cancel
          </Button>
          <Button onClick={login} className="gap-2">
            <LogIn className="h-4 w-4" />
            Login
          </Button>
        </div>
      </div>
    </div>
  );

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
      {error && (
        <div className="mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
          <p>
            Error:{" "}
            {error.message || "Failed to send message. Please try again."}
          </p>
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
                : !authenticated
                  ? "Login to start chatting..."
                  : needsWalletSetup
                    ? "Set up your wallet in sidebar to start chatting..."
                    : "Type your message..."
            }
            rows={3}
            className={cn(
              "resize-none pr-14 text-sm text-foreground placeholder:text-muted-foreground/60",
              "border border-white/20 rounded-md focus:border-white focus:ring-0 shadow-sm",
              "bg-muted/30 dark:bg-background/90",
              (!authenticated || needsWalletSetup) &&
                "cursor-pointer hover:bg-muted/50"
            )}
            style={{ minHeight: "64px", maxHeight: "160px" }}
            disabled={isLoading || hasActiveToolCall || needsWalletSetup}
            onKeyDown={handleKeyDown}
            onFocus={handleTextareaFocus}
            readOnly={!authenticated || needsWalletSetup}
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
            ) : !authenticated ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setShowLoginModal(true)}
                className="h-8 w-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-gray-100 transition-colors"
              >
                <LogIn className="h-4 w-4" />
              </Button>
            ) : needsWalletSetup ? (
              // Just show a disabled button when wallet setup is needed
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled
                className="h-8 w-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-gray-100 transition-colors opacity-50"
              >
                <SendIcon />
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

  return (
    <>
      {LoginModal}
      <div className="flex flex-col h-full">
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto brainpower-scrollbar px-3 sm:px-4 pb-4"
        >
          {threadId === null || messages.length === 0 ? (
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
                    swipeDirection === "left" &&
                      "translate-x-[-10px] opacity-90",
                    swipeDirection === "right" &&
                      "translate-x-[10px] opacity-90"
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
                              value:
                                "Find the best rate to swap 10 USDC to BONK",
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

                {/* Category indicator pills */}
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

                {/* Add login prompt if not authenticated, but no wallet setup button */}
                {!authenticated ? (
                  <div className="mt-6 px-4">
                    <Button
                      onClick={login}
                      className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80"
                    >
                      <LogIn className="h-4 w-4" />
                      Login to Start Chatting
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      You will need to login to interact with the agent.
                    </p>
                  </div>
                ) : needsWalletSetup ? (
                  <div className="mt-6 px-4">
                    <p className="text-sm text-muted-foreground">
                      Please set up your wallet in the sidebar to start
                      chatting.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="space-y-2 mb-3">
              {/* Show errors at the top of chat if they exist */}
              {error && (
                <div className="max-w-3xl mx-auto p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
                  <p className="text-sm font-medium">
                    Error:{" "}
                    {error.message || "An error occurred during the chat."}
                  </p>
                </div>
              )}
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

        <div className="bg-background border-t border-border">
          <div className="max-w-3xl mx-auto">{InputForm}</div>
        </div>
      </div>
    </>
  );
}
