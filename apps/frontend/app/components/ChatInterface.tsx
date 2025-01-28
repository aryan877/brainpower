"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState, FormEvent } from "react";
import {
  AlertCircle,
  RefreshCcw,
  ArrowUpCircle,
  StopCircle,
} from "lucide-react";
import { useClusterStore } from "../store/clusterStore";
import { useThreadMessages, useSaveAllMessages } from "../hooks/chat";
import ChatMessage from "./ChatMessage";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface ChatInterfaceProps {
  threadId: string | null;
}

export default function ChatInterface({ threadId }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: initialMessages = [] } = useThreadMessages(threadId);
  const { mutate: saveAllMessages } = useSaveAllMessages();
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [hasActiveToolCall, setHasActiveToolCall] = useState(false);

  const loadingMessages = [
    "Maximizing brain gains...",
    "Flexing neural networks...",
    "Channeling galaxy brain...",
    "Loading big brain energy...",
    "Powering up the genius...",
    "Brain.exe is processing...",
    "Charging mental capacity...",
    "IQ levels rising...",
  ];

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
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

  // Rotate through loading messages
  useEffect(() => {
    if (isWaitingForResponse) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isWaitingForResponse, loadingMessages.length]);

  // Wrap handleSubmit to set waiting state
  const wrappedHandleSubmit = (e: FormEvent<HTMLFormElement>) => {
    setIsWaitingForResponse(true);
    handleSubmit(e);
  };

  // Add handler for stopping
  const handleStop = () => {
    setIsWaitingForResponse(false);
    stop();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        const formEvent = new Event("submit", {
          bubbles: true,
          cancelable: true,
        }) as unknown as FormEvent<HTMLFormElement>;
        wrappedHandleSubmit(formEvent);
      }
    }
  };

  if (!threadId) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            Welcome to BrainPower
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-8">
            Start a new chat or select an existing one to begin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto brainpower-scrollbar">
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
          messages.map((message) => (
            <ChatMessage
              key={message.id}
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
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-auto w-full max-w-3xl px-4">
          <Card className="flex items-center gap-3 border-destructive/20 bg-neutral-100 dark:bg-neutral-800 p-3 md:p-4 my-2">
            <AlertCircle className="h-4 md:h-5 w-4 md:w-5 flex-shrink-0 text-destructive" />
            <p className="flex-1 text-sm md:text-[15px] text-foreground break-words line-clamp-3">
              {error.message}
            </p>
            <Button
              onClick={() => reload()}
              variant="outline"
              size="sm"
              className="flex-shrink-0 text-destructive hover:bg-destructive/20 border-destructive/20"
            >
              <RefreshCcw className="h-3 w-3 md:h-4 md:w-4 mr-1.5" />
              <span>Retry</span>
            </Button>
          </Card>
        </div>
      )}

      {/* Braining indicator */}
      {isWaitingForResponse && (
        <div className="mx-auto w-full max-w-3xl px-4">
          <div className="flex items-center gap-2 text-primary my-2">
            <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-primary border-t-transparent" />
            <span className="text-sm md:text-base font-medium animate-pulse">
              {loadingMessages[loadingMessageIndex]}
            </span>
          </div>
        </div>
      )}

      {/* Input form */}
      <div className="border-t bg-background mt-auto">
        <form
          onSubmit={wrappedHandleSubmit}
          className="max-w-3xl mx-auto px-4 py-3"
        >
          <div className="relative flex items-center">
            <Textarea
              value={input}
              onChange={(e) => {
                handleInputChange(e);
                e.target.style.height = "inherit";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
              }}
              placeholder={
                hasActiveToolCall
                  ? "Please complete/cancel action first..."
                  : "Type your message..."
              }
              rows={1}
              className="resize-none pr-14 text-sm md:text-[15px]"
              style={{ minHeight: "44px", maxHeight: "200px" }}
              disabled={isLoading || hasActiveToolCall}
              onKeyDown={handleKeyDown}
            />
            <div className="absolute right-3 flex items-center space-x-2">
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || hasActiveToolCall || !input.trim()}
                className="h-8 w-8 md:h-9 md:w-9 hover:-translate-y-0.5 active:translate-y-0"
              >
                <ArrowUpCircle className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              {isLoading && !hasActiveToolCall && (
                <Button
                  type="button"
                  size="icon"
                  variant="default"
                  onClick={handleStop}
                  className="h-8 w-8 md:h-9 md:w-9 bg-primary hover:bg-primary/90 transition-all duration-200"
                >
                  <StopCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-white fill-current" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
