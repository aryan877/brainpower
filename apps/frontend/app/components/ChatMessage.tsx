import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Message } from "../types";
import { nanoid } from "nanoid";
import { User, XCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ToolInvocation } from "ai";
import {
  getToolComponent,
  preprocessToolResult,
  ValidToolName,
  VALID_TOOL_NAMES,
} from "./tools/registry";
import { isToolResult } from "../types/tools";

interface ChatMessageProps {
  message: Message;
  previousMessageRole: "user" | "assistant" | "system" | "data" | null;
  isLoading?: boolean;
  isWaitingForResponse?: boolean;
  addToolResult: (result: { toolCallId: string; result: unknown }) => void;
}

// Type guard to check if a tool name is valid
function isValidToolName(name: string): name is ValidToolName {
  return VALID_TOOL_NAMES.includes(name as ValidToolName);
}

export default function ChatMessage({
  message,
  previousMessageRole,
  isLoading,
  addToolResult,
}: ChatMessageProps) {
  // Determine if we have any tool results we always want to show (cancelled or errors)
  const hasImportantToolResults = message.toolInvocations?.some(
    (t) =>
      t.state === "result" &&
      isToolResult(t.result) &&
      (t.result.status === "cancelled" || t.result.status === "error")
  );

  // Show if:
  // 1. Has any content, OR
  // 2. Has any tool waiting for input, OR
  // 3. Has any cancelled/error results
  if (
    !message.content?.trim() &&
    !message.toolInvocations?.some((t) => t.state === "call") &&
    !hasImportantToolResults
  ) {
    return null;
  }

  const renderToolInvocation = (toolInvocation: ToolInvocation) => {
    if (!toolInvocation) return null;

    // Show cancelled or error states if the tool invocation has such results
    if (
      toolInvocation.state === "result" &&
      isToolResult(toolInvocation.result) &&
      (toolInvocation.result.status === "cancelled" ||
        toolInvocation.result.status === "error")
    ) {
      const isError = toolInvocation.result.status === "error";
      const error = toolInvocation.result.error;

      return (
        <div
          key={toolInvocation.toolCallId}
          className={cn(
            "relative overflow-hidden rounded-lg border",
            isError
              ? "bg-destructive/5 border-destructive/20"
              : "bg-muted/10 border-muted/30"
          )}
        >
          <div className="px-4 py-3.5 flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-full",
                isError ? "bg-destructive/10" : "bg-muted/20"
              )}
            >
              <XCircle
                className={cn(
                  "w-4 h-4",
                  isError ? "text-destructive" : "text-muted-foreground/80"
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "font-medium text-[0.9375rem]",
                  isError ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {toolInvocation.result.message ||
                  (isError ? "Operation failed" : "Operation cancelled")}
              </p>
              {isError && error?.message && (
                <p className="text-[0.875rem] mt-1 text-destructive/90">
                  {error.message}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    const ToolComponent = getToolComponent(toolInvocation);

    try {
      if (toolInvocation.state === "call" && ToolComponent) {
        if (!isValidToolName(toolInvocation.toolName)) {
          throw new Error(`Invalid tool name: ${toolInvocation.toolName}`);
        }

        const validToolName = toolInvocation.toolName as ValidToolName;

        return (
          <ToolComponent
            key={toolInvocation.toolCallId}
            args={toolInvocation.args}
            onSubmit={(result) => {
              const processedResult = preprocessToolResult(
                validToolName,
                result
              );
              addToolResult({
                toolCallId: toolInvocation.toolCallId,
                result: processedResult,
              });
            }}
          />
        );
      }
    } catch (error) {
      console.error("Error rendering tool invocation:", error);
      return (
        <div
          key={toolInvocation.toolCallId}
          className="text-destructive text-sm p-2 bg-destructive/10 rounded"
        >
          Failed to render tool invocation:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      );
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto px-4 py-4 group/message">
        <div className="flex items-start gap-4 relative">
          <div className="flex-shrink-0">
            {(previousMessageRole !== message.role || !previousMessageRole) && (
              <div className="sticky top-0 pt-1">
                {message.role === "assistant" ? (
                  <div className="relative">
                    <div className="absolute -left-1 -right-1 -top-1 -bottom-1 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/5 blur-lg rounded-full dark:from-primary/20 dark:via-primary/10" />
                    <Avatar className="relative w-8 h-8 ring-1 ring-primary/30 bg-gradient-to-br from-primary/20 via-background to-background flex items-center justify-center transition-all duration-300 hover:scale-110 hover:ring-primary/50 dark:from-primary/20">
                      <div className="text-primary font-medium text-lg">🧠</div>
                    </Avatar>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute -left-1 -right-1 -top-1 -bottom-1 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 blur-lg rounded-full" />
                    <Avatar className="relative w-8 h-8 ring-1 ring-primary/40 bg-gradient-to-br from-primary/10 via-background to-background flex items-center justify-center transition-all duration-300 hover:scale-110 hover:ring-primary/60">
                      <User className="w-4 h-4 text-primary" />
                    </Avatar>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {previousMessageRole !== message.role && (
              <div className="w-[calc(100%-2rem)] mb-3 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent dark:via-border/20" />
            )}
            <div 
              className={cn(
                "rounded-2xl px-4 py-3 relative group",
                message.role === "assistant" 
                  ? "bg-gradient-to-r from-primary/[0.08] via-primary/[0.03] to-background/40 border border-primary/20 dark:from-primary/10 dark:via-primary/5 dark:to-background/60 dark:border-primary/30" 
                  : "bg-gradient-to-r from-muted/20 via-muted/10 to-background/40 border border-border/40 dark:from-primary/5 dark:to-background/60",
                "transition-all duration-300",
                "hover:shadow-[0_0_1.5rem_-0.5rem] hover:shadow-primary/10",
                "hover:border-primary/30 dark:hover:border-primary/40"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl dark:from-primary/[0.05]" />
              <div
                className={cn(
                  "prose prose-base max-w-none break-words relative",
                  "prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:my-1 dark:prose-p:text-foreground/95",
                  "prose-code:bg-muted/60 prose-code:text-foreground/90 prose-code:rounded-md dark:prose-code:bg-muted/40",
                  "dark:prose-invert dark:prose-pre:bg-muted/20",
                  isLoading && "opacity-60"
                )}
              >
                {message.content?.trim() && (
                  <ReactMarkdown
                    components={{
                      code({ className, children, ...props }) {
                        const isInline = (props as { inline?: boolean }).inline;
                        const match = /language-(\w+)/.exec(className || "");
                        return !isInline && match ? (
                          <div
                            key={nanoid()}
                            className="relative group/code mt-4 mb-1"
                          >
                            <div className="absolute -top-4 left-0 right-0 h-6 bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/40 rounded-t-lg flex items-center px-4 dark:bg-muted/30">
                              <span className="text-xs font-medium text-foreground/70 dark:text-foreground/80">
                                {match[1].toUpperCase()}
                              </span>
                            </div>
                            <div className="!bg-muted/40 dark:!bg-muted/20 !rounded-lg !rounded-tl-none !pt-4 text-sm !mt-0 !mb-0 whitespace-pre-wrap break-all">
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            </div>
                          </div>
                        ) : (
                          <code
                            key={nanoid()}
                            {...props}
                            className={cn(
                              "px-1.5 py-0.5 rounded-md text-[15px] break-all",
                              message.role === "assistant"
                                ? "bg-muted/50 dark:bg-muted/30"
                                : "bg-primary/20 dark:bg-primary/10"
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
                            className="mb-3 last:mb-0 break-words text-[15px] leading-relaxed"
                          >
                            {children}
                          </p>
                        );
                      },
                      ul({ children }) {
                        return (
                          <ul
                            key={nanoid()}
                            className="mb-3 last:mb-0 space-y-2 text-[15px] list-disc pl-4 marker:text-muted-foreground"
                          >
                            {children}
                          </ul>
                        );
                      },
                      ol({ children }) {
                        return (
                          <ol
                            key={nanoid()}
                            className="mb-3 last:mb-0 space-y-2 text-[15px] list-decimal pl-4 marker:text-muted-foreground"
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
                {message.toolInvocations &&
                  message.toolInvocations.length > 0 && (
                    <div
                      className={cn(
                        "relative space-y-3",
                        message.content?.trim() && "mt-4 pt-4 border-t border-border/30"
                      )}
                    >
                      {message.toolInvocations.map((toolInvocation) =>
                        renderToolInvocation(toolInvocation)
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
