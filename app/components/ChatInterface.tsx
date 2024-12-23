"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import api from "../lib/axios";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Message, ChatInterfaceProps } from "../types";

export default function ChatInterface({
  selectedChat,
  isAuthenticated,
  authSignature,
  onError,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { publicKey } = useWallet();

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(48, textarea.scrollHeight)}px`;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  useEffect(() => {
    if (!input.trim()) {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "48px";
      }
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        sendMessage(e);
      }
    }
  };

  const fetchMessages = useCallback(async () => {
    if (!isAuthenticated || !authSignature) return;

    try {
      const { data } = await api.get(`/api/chat/history/${selectedChat}`, {
        headers: {
          Authorization: `${publicKey?.toBase58()} ${authSignature}`,
        },
      });
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      await onError(error);
    }
  }, [selectedChat, publicKey, isAuthenticated, authSignature, onError]);

  useEffect(() => {
    if (selectedChat && publicKey && isAuthenticated && authSignature) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedChat, publicKey, fetchMessages, isAuthenticated, authSignature]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !input.trim() ||
      !selectedChat ||
      !publicKey ||
      !isAuthenticated ||
      !authSignature
    )
      return;

    const userMessage = input;
    setInput("");
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "48px";
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        createdAt: new Date(),
      },
      {
        role: "assistant",
        content: "...",
        createdAt: new Date(),
        isLoading: true,
      },
    ]);

    try {
      setIsLoading(true);
      const { data } = await api.post(
        "api/chat/message",
        {
          message: userMessage,
          threadId: selectedChat,
        },
        {
          headers: {
            Authorization: `${publicKey.toBase58()} ${authSignature}`,
          },
        }
      );

      if (data.response) {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages.pop();
          newMessages.push({
            role: "assistant",
            content: data.response,
            createdAt: new Date(),
          });
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages.pop();
        return newMessages;
      });
      await onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!publicKey) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--text-secondary)] text-lg">
          Please connect your wallet to chat
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--text-secondary)] text-lg">
          Please authenticate your wallet to chat
        </p>
      </div>
    );
  }

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--text-secondary)] text-lg">
          Select a chat or create a new one
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--background)] h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[var(--border-color)] scrollbar-track-transparent">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-4 message-bubble ${
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
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
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
      <form onSubmit={sendMessage} className="p-4 gradient-panel">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift + Enter for new line)"
              className="w-full p-3 rounded-xl modern-input text-[var(--text-primary)] focus:outline-none placeholder-[var(--text-secondary)] resize-none min-h-[48px] max-h-[200px] overflow-y-auto transition-all duration-200"
              disabled={isLoading}
              rows={1}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 gradient-button rounded-xl text-white font-medium focus:outline-none disabled:opacity-50 h-[48px] whitespace-nowrap"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
