"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState, FormEvent, useCallback } from "react";
import React from "react";
import { useClusterStore } from "../store/clusterStore";
import {
  useThreadMessages,
  useSaveAllMessages,
  useCreateThread,
} from "../hooks/chat";
import ChatMessage from "./ChatMessage";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "../hooks/useLocalStorage";
import Image from "next/image";

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

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    addToolResult,
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

  // Use a single input form component for both cases
  const InputForm = (
    <div className="bg-background mt-auto w-full max-w-3xl mx-auto relative">
      {showScrollDown && messages.length > 0 && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <Button
            size="icon"
            variant="secondary"
            onClick={scrollToBottom}
            className="h-8 w-8 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <ScrollDownIcon />
          </Button>
        </div>
      )}
      <form onSubmit={wrappedHandleSubmit} className="px-4 py-3">
        <div className="relative flex items-center">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder={
              hasActiveToolCall
                ? "Please complete/cancel action or wait for response..."
                : "Type your message..."
            }
            rows={2}
            className="resize-none pr-14 text-sm md:text-[15px] text-foreground placeholder:text-muted-foreground/70"
            style={{ minHeight: "60px", maxHeight: "200px" }}
            disabled={isLoading || hasActiveToolCall}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute right-3 flex items-center space-x-2">
            {isLoading ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => window.location.reload()}
                className="h-8 w-8 md:h-9 md:w-9 hover:bg-destructive/90 hover:text-destructive-foreground transition-colors"
              >
                <StopIcon />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || hasActiveToolCall || !input.trim()}
                className="h-8 w-8 md:h-9 md:w-9 bg-primary hover:bg-primary/90 transition-colors"
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
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center w-full max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image
                src="/logo.svg"
                alt="BrainPower Logo"
                width={48}
                height={48}
              />
            </div>
            <p className="text-sm md:text-base text-muted-foreground mb-8">
              Start a new chat by typing your message below
            </p>
            {InputForm}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto brainpower-scrollbar divide-border/40 relative"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center p-4">
            <div className="text-center max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Start a New Conversation
              </h3>
              <p className="text-sm text-muted-foreground">
                Ask me anything about blockchain research, Solana transactions,
                or how I can help you analyze and interact with the ecosystem!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {messages.reduce((groups: React.ReactElement[], message) => {
              return [
                ...groups,
                <div key={message.id} className="max-w-3xl mx-auto py-3">
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

      {InputForm}
    </div>
  );
}
