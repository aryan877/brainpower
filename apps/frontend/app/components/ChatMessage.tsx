import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Message } from "../types";
import { nanoid } from "nanoid";
import { User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  // Return null for empty messages
  if (!message.content?.trim()) {
    return null;
  }

  return (
    <div className="flex w-full max-w-3xl mx-auto py-2 px-3 sm:px-0">
      <div
        className={`flex w-full gap-2 sm:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
      >
        {message.role === "assistant" && (
          <Avatar className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-primary/20 dark:border-neutral-700 shadow-lg flex items-center justify-center">
            <div className="text-primary-foreground text-sm sm:text-base font-medium">
              🧠
            </div>
          </Avatar>
        )}
        <Card
          className={cn(
            "relative group w-auto max-w-[85%] border-0",
            message.role === "assistant"
              ? "shadow-sm bg-neutral-50 dark:bg-muted"
              : "bg-primary text-white shadow-md",
            message.role === "assistant" ? "rounded-tl-sm" : "rounded-tr-sm"
          )}
        >
          <div
            className={cn("p-3 sm:p-4", message.isLoading && "py-2 sm:py-3")}
          >
            <div
              className={cn(
                "prose prose-sm sm:prose-base max-w-none break-words",
                message.role === "user" ? "prose-invert" : "dark:prose-invert"
              )}
            >
              {message.isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-primary-foreground border-t-transparent" />
                  <span className="text-sm sm:text-base font-medium">
                    Thinking...
                  </span>
                </div>
              ) : (
                <ReactMarkdown
                  components={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    code: ({ inline, className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <div
                          key={nanoid()}
                          className="relative group/code mt-2 mb-1"
                        >
                          <div className="absolute -top-4 left-0 right-0 h-5 sm:h-6 bg-neutral-100 dark:bg-neutral-800 rounded-t-lg flex items-center px-3 sm:px-4">
                            <span className="text-[11px] sm:text-xs text-muted-foreground">
                              {match[1].toUpperCase()}
                            </span>
                          </div>
                          <SyntaxHighlighter
                            {...props}
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            className="!bg-neutral-900 !rounded-lg !rounded-tl-none !pt-3 sm:!pt-4 text-xs sm:text-sm !mt-0 !mb-0 whitespace-pre-wrap break-all border-0"
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                String(children).replace(/\n$/, "")
                              )
                            }
                            className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity text-xs sm:text-sm"
                          >
                            Copy
                          </Button>
                        </div>
                      ) : (
                        <code
                          key={nanoid()}
                          {...props}
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[15px] break-all",
                            message.role === "assistant"
                              ? "bg-neutral-100 dark:bg-neutral-800"
                              : "bg-primary-foreground/20"
                          )}
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
        </Card>
        {message.role === "user" && (
          <Avatar className="w-6 h-6 sm:w-8 sm:h-8 bg-primary border-2 border-primary/20 dark:border-neutral-700 shadow-lg flex items-center justify-center">
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
          </Avatar>
        )}
      </div>
    </div>
  );
}
