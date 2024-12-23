"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import api from "../lib/axios";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Message, ChatInterfaceProps } from "../types";
import TemplatesPanel from "./TemplatesPanel";
import CommandPalette from "./CommandPalette";

export default function ChatInterface({
  selectedChat,
  threads,
  onUpdateThreads,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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

    // Show command palette when typing '/' at the start
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

  const fetchMessages = useCallback(async () => {
    if (!selectedChat) return;

    try {
      const { data } = await api.get(`/api/chat/history/${selectedChat}`);
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([
        {
          role: "assistant",
          content: "Failed to load chat history. Please try again later.",
          createdAt: new Date(),
        },
      ]);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedChat, fetchMessages]);

  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setMessages((prev) => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1]?.isLoading) {
          newMessages.pop();
        }
        return newMessages;
      });
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

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: messageText,
        createdAt: new Date(),
      },
      {
        role: "assistant",
        content: "...",
        createdAt: new Date(),
        isLoading: true,
      },
    ]);

    if (messages.length === 0 && threads) {
      const updatedThreads = threads.map((thread) =>
        thread.threadId === selectedChat
          ? { ...thread, title: messageText.slice(0, 100) }
          : thread
      );
      onUpdateThreads?.(updatedThreads);
    }

    try {
      setIsLoading(true);
      abortControllerRef.current = new AbortController();

      const { data } = await api.post(
        "/api/chat/message",
        {
          message: messageText,
          threadId: selectedChat,
        },
        {
          signal: abortControllerRef.current.signal,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setMessages((prev) => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1]?.isLoading) {
          newMessages.pop();
        }
        newMessages.push({
          role: "assistant",
          content: data.response || "Sorry, I couldn't process that request.",
          createdAt: new Date(),
        });
        return newMessages;
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1]?.isLoading) {
          newMessages.pop();
        }
        newMessages.push({
          role: "assistant",
          content:
            "Sorry, there was an error processing your request. Please try again.",
          createdAt: new Date(),
        });
        return newMessages;
      });
    } finally {
      setIsLoading(false);
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
      <div className="flex-1 flex items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--text-secondary)] text-lg">
          {threads?.length === 0
            ? "Create a new chat to get started"
            : "Select a chat or create a new one"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--background)] h-[calc(100vh-64px)] overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[var(--border-color)] scrollbar-track-transparent">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-4 message-bubble break-words overflow-hidden ${
                message.role === "user"
                  ? "message-bubble-user text-white"
                  : "message-bubble-assistant text-[var(--text-primary)]"
              }`}
            >
              {message.isLoading ? (
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 bg-white/40 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-white/40 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-white/40 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              ) : (
                <div className="prose prose-invert max-w-none overflow-x-auto">
                  <ReactMarkdown
                    components={{
                      code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <div className="max-w-full overflow-x-auto">
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                borderRadius: "0.5rem",
                              }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                      p: ({ children }) => (
                        <p className="whitespace-pre-wrap break-words">
                          {children}
                        </p>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Templates Panel */}
      <div className="relative">
        {showTemplates && (
          <TemplatesPanel
            onSelectTemplate={handleTemplateSelect}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </div>

      <form
        onSubmit={sendMessage}
        className="p-4 gradient-panel relative z-[1]"
      >
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-3 py-2 rounded-xl bg-[var(--background)] text-[var(--text-primary)] hover:bg-[var(--background-hover)] transition-colors"
            title="Show Templates"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </button>
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift + Enter for new line, type / for templates)"
              className="w-full p-3 rounded-xl modern-input text-[var(--text-primary)] focus:outline-none placeholder-[var(--text-secondary)] resize-none min-h-[48px] max-h-[200px] overflow-y-auto transition-all duration-200"
              disabled={isLoading}
              rows={1}
            />
            <CommandPalette
              isOpen={showCommandPalette}
              searchTerm={input}
              onSelectTemplate={handleTemplateSelect}
            />
          </div>
          {isLoading ? (
            <button
              type="button"
              onClick={cancelRequest}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-medium focus:outline-none h-[48px] whitespace-nowrap transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-3 gradient-button rounded-xl text-white font-medium focus:outline-none disabled:opacity-50 h-[48px] whitespace-nowrap"
              disabled={!input.trim()}
            >
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
