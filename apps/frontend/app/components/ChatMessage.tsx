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
} from "./tools/registry";
import { isToolResult } from "../types/tools";
import Image from "next/image";
import {
  SuccessResults,
  hasSuccessComponent,
  SuccessResultsMap,
} from "./tools/SuccessResults";

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  isWaitingForResponse?: boolean;
  addToolResult: (result: { toolCallId: string; result: unknown }) => void;
}

const isMessageReadyToRender = (message: Message): boolean => {
  const hasContent = Boolean(message.content?.trim());
  const toolInvocations = message.toolInvocations ?? [];

  if (!hasContent && !toolInvocations.length) {
    return false;
  }

  const hasValidTools = toolInvocations.some((tool) => {
    // Check for pending tool calls
    if (tool.state === "call") {
      return Boolean(getToolComponent(tool));
    }

    // Check for completed tool results
    if (tool.state === "result") {
      const toolResult = (tool as { result?: unknown }).result;
      if (!isToolResult(toolResult)) return false;

      const { status } = toolResult;
      return (
        status === "error" ||
        status === "cancelled" ||
        (status === "success" && hasSuccessComponent(tool.toolName))
      );
    }

    return false;
  });

  return hasContent || hasValidTools;
};

export default function ChatMessage({
  message,
  isLoading,
  addToolResult,
}: ChatMessageProps) {
  if (!isMessageReadyToRender(message)) {
    return null;
  }

  const renderToolInvocation = (toolInvocation: ToolInvocation) => {
    if (!toolInvocation) return null;

    const { state, toolCallId, toolName } = toolInvocation;
    const toolResult = (toolInvocation as { result?: unknown }).result;

    // Handle successful tool execution
    if (
      state === "result" &&
      isToolResult(toolResult) &&
      toolResult.status === "success"
    ) {
      if (hasSuccessComponent(toolName)) {
        return (
          <div key={toolCallId} className="mt-4">
            <SuccessResults
              toolName={toolName as keyof SuccessResultsMap}
              data={
                toolResult.data as SuccessResultsMap[keyof SuccessResultsMap]
              }
            />
          </div>
        );
      }
      return null;
    }

    // Handle error or cancelled states
    if (
      state === "result" &&
      isToolResult(toolResult) &&
      (toolResult.status === "error" || toolResult.status === "cancelled")
    ) {
      const isError = toolResult.status === "error";
      const errorMessage = toolResult.error?.message;

      return (
        <div key={toolCallId} className="flex items-center gap-3 py-2">
          <XCircle
            className={cn(
              "w-4 h-4 flex-shrink-0",
              isError ? "text-[#ff4444]" : "text-[#ff4444]/90"
            )}
          />
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-[0.9375rem] leading-none",
                isError ? "text-[#ff4444]" : "text-[#ff4444]/90"
              )}
            >
              {toolResult.message ||
                (isError ? "Operation failed" : "Operation cancelled")}
            </p>
            {isError && errorMessage && (
              <p className="text-[0.875rem] mt-1 text-[#ff4444]/80">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      );
    }

    // Handle pending tool calls
    if (state === "call") {
      const ToolComponent = getToolComponent(toolInvocation);
      if (!ToolComponent) return null;

      try {
        return (
          <ToolComponent
            key={toolCallId}
            args={toolInvocation.args}
            onSubmit={(toolResult) => {
              const processedResult = preprocessToolResult(
                toolName as ValidToolName,
                toolResult
              );
              addToolResult({
                toolCallId,
                result: processedResult,
              });
            }}
          />
        );
      } catch (error) {
        console.error("Error rendering tool invocation:", error);
        return (
          <div
            key={toolCallId}
            className="text-destructive text-sm p-2 bg-destructive/10 rounded"
          >
            Failed to render tool invocation:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="w-full py-3">
      <div className="max-w-3xl mx-auto px-4">
        <div
          className={cn(
            "rounded-2xl",
            message.role === "assistant"
              ? "bg-[#ff4444]/20 border-none"
              : "bg-muted/10 dark:bg-muted/5 border-none",
            "transition-all duration-200"
          )}
        >
          <div className="flex items-start gap-4 p-4">
            {/* Avatar */}
            {message.role === "assistant" ? (
              <div className="flex-shrink-0">
                <Avatar className="w-8 h-8 ring-1 ring-[#ff4444]/30 bg-[#ff4444]/20 flex items-center justify-center transition-all duration-200 hover:ring-[#ff4444]/40 hover:bg-[#ff4444]/30">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/logo.svg"
                      alt="BrainPower Logo"
                      width={24}
                      height={24}
                    />
                  </div>
                </Avatar>
              </div>
            ) : (
              <div className="flex-shrink-0">
                <Avatar className="w-8 h-8 ring-1 ring-primary/30 bg-primary/10 flex items-center justify-center transition-all duration-200 hover:ring-primary/50 hover:bg-primary/20">
                  <User className="w-5 h-5 text-primary" />
                </Avatar>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  "prose prose-base max-w-none break-words",
                  "prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:my-1 dark:prose-p:text-foreground/95",
                  "prose-code:bg-muted/60 prose-code:text-foreground/90 prose-code:rounded-md dark:prose-code:bg-muted/30",
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
                            <div className="absolute -top-4 left-0 right-0 h-6 bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-muted/30 rounded-t-lg flex items-center px-4">
                              <span className="text-xs font-medium text-foreground/70">
                                {match[1].toUpperCase()}
                              </span>
                            </div>
                            <div className="!bg-muted/30 dark:!bg-muted/20 !rounded-lg !rounded-tl-none !pt-4 text-sm !mt-0 !mb-0 whitespace-pre-wrap break-all">
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
                                ? "bg-muted/40 dark:bg-muted/30"
                                : "bg-primary/10"
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
                        "space-y-3",
                        message.content?.trim() &&
                          "mt-4 pt-4 border-t border-border/20"
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
