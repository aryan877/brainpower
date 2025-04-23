"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { useChat } from "ai/react";
import { Loader2, LogIn, Mic, SendIcon, StopCircle } from "lucide-react";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import React, {
  FormEvent,
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
import { useSpeechRecognition } from "../hooks/use-speech-recognition";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useClusterStore } from "../store/clusterStore";
import { AuthContext } from "./AuthGuard";
import ChatMessage from "./ChatMessage";
import FeatureSuggestions from "./FeatureSuggestions";
import { ScrollDownIcon } from "./icons/ScrollDownIcon";
import { StopIcon } from "./icons/StopIcon";

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
  const { authenticated, login } = useContext(AuthContext);
  const { user } = usePrivy();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Speech recognition hook
  const {
    isRecording,
    isProcessingSpeech,
    startRecording,
    stopRecording: stopSpeechRecording,
  } = useSpeechRecognition();

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
    setInput,
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

  // Handle speech recording toggle
  const handleMicClick = async () => {
    if (!authenticated || needsWalletSetup) return;

    if (isRecording) {
      const text = await stopSpeechRecording();
      if (text) {
        setInput((prevInput) => (prevInput ? `${prevInput} ${text}` : text));
      }
    } else {
      startRecording();
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
      if (!isRecording && !isProcessingSpeech) {
        wrappedHandleSubmit(e as unknown as FormEvent<HTMLFormElement>);
      }
    }
  }

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
              isRecording
                ? "Recording... speak now!"
                : isProcessingSpeech
                  ? "Processing speech..."
                  : hasActiveToolCall
                    ? "Please complete/cancel action or wait for response..."
                    : !authenticated
                      ? "Login to start chatting..."
                      : needsWalletSetup
                        ? "Set up your wallet in sidebar to start chatting..."
                        : "Ask anything about Solana..."
            }
            rows={3}
            className={cn(
              "resize-none pr-24 text-sm text-foreground placeholder:text-muted-foreground/60",
              "border border-border rounded-lg focus:border-primary focus:ring-0 shadow-sm",
              "bg-background dark:bg-background/90",
              (!authenticated || needsWalletSetup) &&
                "cursor-pointer hover:bg-muted/10"
            )}
            style={{ minHeight: "64px", maxHeight: "160px" }}
            disabled={
              isLoading ||
              hasActiveToolCall ||
              needsWalletSetup ||
              isRecording ||
              isProcessingSpeech
            }
            onKeyDown={handleKeyDown}
            onFocus={handleTextareaFocus}
            readOnly={
              !authenticated ||
              needsWalletSetup ||
              isRecording ||
              isProcessingSpeech
            }
          />
          <div className="absolute right-3 flex items-center gap-2">
            {authenticated && !needsWalletSetup && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handleMicClick}
                disabled={isLoading || hasActiveToolCall || isProcessingSpeech}
                className={cn(
                  "h-8 w-8 rounded-full text-muted-foreground hover:text-foreground transition-colors",
                  isRecording
                    ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-600"
                    : "bg-muted/30 hover:bg-muted/50 dark:bg-muted/10 dark:hover:bg-muted/20"
                )}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                {isProcessingSpeech ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isRecording ? (
                  <StopCircle className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            )}

            {isLoading ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={stop}
                className="h-8 w-8 bg-muted/30 hover:bg-muted/50 dark:bg-muted/10 dark:hover:bg-muted/20 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <StopIcon />
              </Button>
            ) : !authenticated ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setShowLoginModal(true)}
                className="h-8 w-8 bg-muted/30 hover:bg-muted/50 dark:bg-muted/10 dark:hover:bg-muted/20 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogIn className="h-4 w-4" />
              </Button>
            ) : needsWalletSetup ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled
                className="h-8 w-8 bg-muted/30 hover:bg-muted/50 dark:bg-muted/10 dark:hover:bg-muted/20 rounded-full text-muted-foreground hover:text-foreground transition-colors opacity-50"
              >
                <SendIcon />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                disabled={
                  isLoading ||
                  hasActiveToolCall ||
                  !input.trim() ||
                  isRecording ||
                  isProcessingSpeech
                }
                className="h-8 w-8 bg-muted/30 hover:bg-muted/50 dark:bg-muted/10 dark:hover:bg-muted/20 rounded-full text-muted-foreground hover:text-foreground transition-colors"
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
            <div>
              <FeatureSuggestions
                handleInputChange={handleInputChange}
                authenticated={authenticated}
                needsWalletSetup={needsWalletSetup}
                login={login}
              />
            </div>
          ) : (
            <div className="space-y-2 mb-3 max-w-3xl mx-auto">
              {/* Show errors at the top of chat if they exist */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
                  <p className="text-sm font-medium">
                    Error:{" "}
                    {error.message || "An error occurred during the chat."}
                  </p>
                </div>
              )}
              {messages.reduce((groups: React.ReactElement[], message) => {
                return [
                  ...groups,
                  <div key={message.id} className="py-1">
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
