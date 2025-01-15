"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, X, ArrowRight } from "lucide-react";
import { ThreadPreview } from "../types";
import TemplatesPanel from "./TemplatesPanel";
import CommandPalette from "./CommandPalette";
import ChatMessage from "./ChatMessage";
import { useThreadMessages, useSendMessage } from "../hooks/chat";

export interface ChatInterfaceProps {
  selectedChat: string | null;
  threads?: ThreadPreview[];
  onUpdateThreads?: (threads: ThreadPreview[]) => void;
}

export default function ChatInterface({
  selectedChat,
  threads,
  onUpdateThreads,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { data: messages = [], isLoading: isLoadingMessages } =
    useThreadMessages(selectedChat);
  const { mutate: sendMessageMutation, isPending: isSending } =
    useSendMessage();

  const isLoading = isLoadingMessages || isSending;

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(48, textarea.scrollHeight)}px`;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    if (value === "/") {
      setShowCommandPalette(true);
    } else if (!value.startsWith("/")) {
      setShowCommandPalette(false);
    }

    adjustTextareaHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        requestAnimationFrame(adjustTextareaHeight);
        return;
      }
      e.preventDefault();
      if (!isLoading && input.trim()) {
        sendMessage(e);
      }
    } else if (e.key === "Escape" && showCommandPalette) {
      setShowCommandPalette(false);
    }
  };

  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedChat || isLoading) return;

    // Close both template panels when sending message
    setShowTemplates(false);
    setShowCommandPalette(false);

    if (abortControllerRef.current) {
      cancelRequest();
    }

    const messageText = input.trim();
    setInput("");
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "48px";
    }

    if (messages.length === 0 && threads) {
      const updatedThreads = threads.map((thread) =>
        thread.threadId === selectedChat
          ? { ...thread, title: messageText.slice(0, 100) }
          : thread
      );
      onUpdateThreads?.(updatedThreads);
    }

    try {
      abortControllerRef.current = new AbortController();
      sendMessageMutation(
        { message: messageText, threadId: selectedChat },
        {
          onError: (error) => {
            console.error("Error sending message:", error);
          },
        }
      );
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleTemplateSelect = (template: string) => {
    setInput((prev) => {
      // If there's existing text, add a newline before the template
      const prefix = prev.length > 0 ? prev + "\n" : "";
      return prefix + template;
    });
    setShowCommandPalette(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Adjust height after appending template
      requestAnimationFrame(adjustTextareaHeight);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px";
    }
  }, [messages.length]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (!selectedChat) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--text-secondary)] text-center text-base md:text-lg px-4">
          {threads?.length === 0
            ? "Create a new chat to get started"
            : "Select a chat or create a new one"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="py-2 space-y-4">
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              {isSending && (
                <ChatMessage
                  message={{
                    role: "assistant",
                    content: "...",
                    createdAt: new Date(),
                    isLoading: true,
                  }}
                />
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-[var(--border-color)] bg-[var(--background)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <form onSubmit={sendMessage} className="relative">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-full min-h-[48px] max-h-[200px] p-3 pr-24 bg-[var(--secondary-bg)] rounded-xl resize-none text-sm md:text-base placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowTemplates(true)}
                  className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
                {isSending ? (
                  <button
                    type="button"
                    onClick={cancelRequest}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-1.5 text-[var(--primary)] hover:text-[var(--primary-hover)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {showTemplates && (
        <TemplatesPanel
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {showCommandPalette && (
        <CommandPalette
          isOpen={showCommandPalette}
          searchTerm={input}
          onSelectTemplate={handleTemplateSelect}
        />
      )}
    </div>
  );
}
