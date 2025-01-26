"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState, FormEvent } from "react";
import { AlertCircle, RefreshCcw, Square, ArrowUpCircle } from "lucide-react";
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
    const hasActiveTool = messages.some(
      (message) => message?.toolInvocations?.some((t) => t.state === "call")
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

  // Wrap handleSubmit to set waiting state
  const wrappedHandleSubmit = (e: FormEvent<HTMLFormElement>) => {
    setIsWaitingForResponse(true);
    handleSubmit(e);
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
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Welcome to BrainPower
          </h2>
          <p className="text-muted-foreground mb-8">
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
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            previousMessageRole={index > 0 ? messages[index - 1].role : null}
            isLoading={
              isLoading &&
              messages.length > 0 &&
              message.id === messages[messages.length - 1].id &&
              message.role === "assistant"
            }
            isWaitingForResponse={isWaitingForResponse}
            addToolResult={addToolResult}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Error display */}
      {error && (
        <div className="mx-auto w-full max-w-3xl px-4 py-2">
          <Card className="flex items-center gap-3 border-destructive/20 bg-neutral-100 dark:bg-neutral-800 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
            <p className="flex-1 text-[15px] text-foreground break-words line-clamp-3">
              {error.message}
            </p>
            <Button
              onClick={() => reload()}
              variant="outline"
              className="flex-shrink-0 text-destructive hover:bg-destructive/20 border-destructive/20"
            >
              <RefreshCcw className="h-4 w-4 mr-1.5" />
              <span>Retry</span>
            </Button>
          </Card>
        </div>
      )}

      {/* Braining indicator */}
      {isWaitingForResponse && (
        <div className="mx-auto w-full max-w-3xl px-4 py-2">
          <div className="flex items-center gap-2 text-primary">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
            <span className="text-base font-medium">
              BrainPower is braining...
            </span>
          </div>
        </div>
      )}

      {/* Input form */}
      <div className="border-t bg-background">
        <form
          onSubmit={wrappedHandleSubmit}
          className="max-w-3xl mx-auto px-4 py-3"
        >
          <div className="relative flex items-center">
            <Textarea
              value={input}
              onChange={(e) => {
                handleInputChange(e);
                // Auto-resize
                e.target.style.height = "inherit";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
              }}
              placeholder={
                hasActiveToolCall
                  ? "Please complete/cancel action first..."
                  : "Type your message..."
              }
              rows={1}
              className="resize-none pr-14 text-[15px]"
              style={{ minHeight: "52px", maxHeight: "200px" }}
              disabled={isLoading || hasActiveToolCall}
              onKeyDown={handleKeyDown}
            />
            <div className="absolute right-3 flex items-center space-x-2">
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || hasActiveToolCall || !input.trim()}
                className="hover:-translate-y-0.5 active:translate-y-0"
              >
                <ArrowUpCircle className="h-5 w-5" />
              </Button>
              {isLoading && !hasActiveToolCall && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => stop()}
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                >
                  <Square className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
