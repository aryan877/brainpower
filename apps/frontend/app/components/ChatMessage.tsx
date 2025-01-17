import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Message } from "../types";
import { nanoid } from "nanoid";
import { User } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className="flex w-full max-w-3xl mx-auto py-2">
      <div
        className={`flex w-full gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
      >
        {message.role === "assistant" && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium flex-shrink-0 border-2 border-blue-400/20 shadow-lg">
            🧠
          </div>
        )}
        <div
          className={`relative group w-auto max-w-[85%] ${
            message.role === "assistant"
              ? "bg-gradient-to-br from-[#1E1E1E] via-[#242424] to-[#2A2A2A] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]"
              : "bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white shadow-md"
          } rounded-2xl ${
            message.role === "assistant" ? "rounded-tl-sm" : "rounded-tr-sm"
          }`}
        >
          <div className={`p-4 ${message.isLoading ? "py-3" : ""}`}>
            <div
              className={`prose prose-base max-w-none break-words ${
                message.role === "user" ? "prose-invert" : "dark:prose-invert"
              }`}
            >
              {message.isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span className="text-base font-medium">Thinking...</span>
                </div>
              ) : (
                <ReactMarkdown
                  components={{
                    code: ({
                      inline,
                      className,
                      children,
                      ...props
                    }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    any) => {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <div
                          key={nanoid()}
                          className="relative group/code mt-2 mb-1"
                        >
                          <div className="absolute -top-4 left-0 right-0 h-6 bg-[#2D2D2D] rounded-t-lg flex items-center px-4">
                            <span className="text-xs text-[var(--text-secondary)]">
                              {match[1].toUpperCase()}
                            </span>
                          </div>
                          <SyntaxHighlighter
                            {...props}
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            className="!bg-[#1E1E1E] !rounded-lg !rounded-tl-none !pt-4 text-sm !mt-0 !mb-0 whitespace-pre-wrap break-all"
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(
                                String(children).replace(/\n$/, "")
                              )
                            }
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#2D2D2D] text-[var(--text-secondary)] opacity-0 group-hover/code:opacity-100 transition-opacity hover:text-[var(--text-primary)]"
                          >
                            Copy
                          </button>
                        </div>
                      ) : (
                        <code
                          key={nanoid()}
                          {...props}
                          className={`px-1.5 py-0.5 rounded text-[15px] break-all ${
                            message.role === "assistant"
                              ? "bg-black/10 dark:bg-white/10"
                              : "bg-black/20"
                          }`}
                        >
                          {children}
                        </code>
                      );
                    },
                    p({ children }) {
                      return (
                        <p
                          key={nanoid()}
                          className="mb-2 last:mb-0 break-words text-[15px] leading-relaxed"
                        >
                          {children}
                        </p>
                      );
                    },
                    ul({ children }) {
                      return (
                        <ul
                          key={nanoid()}
                          className="mb-2 last:mb-0 space-y-1.5 text-[15px]"
                        >
                          {children}
                        </ul>
                      );
                    },
                    ol({ children }) {
                      return (
                        <ol
                          key={nanoid()}
                          className="mb-2 last:mb-0 space-y-1.5 text-[15px]"
                        >
                          {children}
                        </ol>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        </div>
        {message.role === "user" && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white flex-shrink-0 border-2 border-indigo-400/20 shadow-lg">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
}
