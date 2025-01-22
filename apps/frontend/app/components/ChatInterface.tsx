"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
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

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
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
    initialMessages,
    generateId: () => `msg_${nanoid()}`,
    sendExtraMessageFields: true,
  });

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

  if (!threadId) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
            Welcome to BrainPower 🧠⚡
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            Start a new chat or select an existing one to begin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent hover:scrollbar-thumb-muted/80">
        {messages
          .filter((message) => message.content?.trim())
          .map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-auto w-full max-w-3xl px-3 sm:px-4 py-2">
          <Card className="flex items-center space-x-2 sm:space-x-3 border-destructive/20 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 p-2 sm:p-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
            <p className="flex-1 text-sm sm:text-[15px] text-foreground">
              {error.message}
            </p>
            <Button
              onClick={() => reload()}
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/20 border-destructive/20 dark:border-neutral-700"
            >
              <RefreshCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
              <span className="text-sm">Retry</span>
            </Button>
          </Card>
        </div>
      )}

      {/* Input form */}
      <div className="border-t dark:border-neutral-800 bg-background">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto px-3 sm:px-4 py-2 sm:py-3"
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
              placeholder="Type your message..."
              rows={1}
              className="resize-none pr-12 sm:pr-14 text-sm sm:text-[15px]"
              style={{ minHeight: "44px", maxHeight: "200px" }}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) {
                    handleSubmit(e);
                  }
                }
              }}
            />
            <div className="absolute right-2 sm:right-3 flex items-center space-x-1.5 sm:space-x-2">
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="h-8 w-8 sm:h-9 sm:w-9 hover:-translate-y-0.5 active:translate-y-0"
              >
                <ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              {isLoading && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => stop()}
                  className="h-8 w-8 sm:h-9 sm:w-9 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                >
                  <Square className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
