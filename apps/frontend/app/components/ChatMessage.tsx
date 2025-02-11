import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Message } from "../types";
import { nanoid } from "nanoid";
import { User, XCircle, Copy, Check } from "lucide-react";
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
import { ToolNames } from "./ToolNames";
import { useState } from "react";

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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (message.content) {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  const toolNames =
    message.toolInvocations?.map((tool) => tool.toolName).filter(Boolean) || [];

  if (!isMessageReadyToRender(message)) {
    return (
      <div className="w-full">
        {toolNames.length > 0 && (
          <div className="max-w-3xl mx-auto px-4">
            <ToolNames toolNames={toolNames} className="py-2" />
          </div>
        )}
      </div>
    );
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
        <div key={toolCallId} className="flex items-start gap-3 py-0.5">
          <XCircle
            className={cn(
              "w-4 h-4 flex-shrink-0 mt-[2px]",
              isError ? "text-destructive" : "text-destructive/90"
            )}
          />
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-[0.9375rem] leading-normal m-0",
                isError ? "text-destructive" : "text-destructive/90"
              )}
            >
              {toolResult.message ||
                (isError ? "Operation failed" : "Operation cancelled")}
            </p>
            {isError && errorMessage && (
              <p className="text-[0.875rem] mt-1 text-destructive/80 leading-normal m-0">
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
    <div className="w-full">
      {toolNames.length > 0 && (
        <div className="max-w-3xl mx-auto px-4">
          <ToolNames toolNames={toolNames} className="py-2" />
        </div>
      )}
      {isMessageReadyToRender(message) && (
        <div className="max-w-3xl mx-auto py-3">
          <div className="relative">
            <div
              className={cn(
                "flex items-start gap-4",
                message.role === "user"
                  ? "bg-muted dark:bg-muted rounded-2xl p-4"
                  : "py-2 px-4"
              )}
            >
              {/* Avatar */}
              {message.role === "assistant" ? (
                <div className="flex-shrink-0">
                  <Avatar className="w-8 h-8 ring-1 ring-primary/30 bg-primary/20 flex items-center justify-center transition-all duration-200 hover:ring-primary/40 hover:bg-primary/30">
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
                  <Avatar className="w-8 h-8 ring-1 ring-border bg-background flex items-center justify-center transition-all duration-200 hover:ring-border/80 hover:bg-muted/50">
                    <User className="w-5 h-5 text-foreground/80" />
                  </Avatar>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "prose dark:prose-invert prose-p:mt-0 prose-p:mb-3 prose-p:leading-normal prose-p:text-[16px]",
                    isLoading && "opacity-60"
                  )}
                >
                  {/* Show tool results first */}
                  {message.toolInvocations &&
                    message.toolInvocations.length > 0 && (
                      <div className="space-y-3 mb-4 not-prose">
                        {message.toolInvocations.map((toolInvocation) =>
                          renderToolInvocation(toolInvocation)
                        )}
                      </div>
                    )}
                  {/* Then show message content */}
                  {message.content?.trim() && (
                    <div className="relative">
                      <ReactMarkdown
                        components={{
                          code({ className, children, ...props }) {
                            const isInline = (props as { inline?: boolean })
                              .inline;
                            const match = /language-(\w+)/.exec(
                              className || ""
                            );
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
                                  "px-1.5 py-0.5 rounded-md text-[16px] break-all",
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
                                className="mb-3 last:mb-0 break-words text-[16px] leading-relaxed"
                              >
                                {children}
                              </p>
                            );
                          },
                          ul({ children }) {
                            return (
                              <ul
                                key={nanoid()}
                                className="mb-3 last:mb-0 space-y-2 text-[16px] list-disc pl-4 marker:text-muted-foreground"
                              >
                                {children}
                              </ul>
                            );
                          },
                          ol({ children }) {
                            return (
                              <ol
                                key={nanoid()}
                                className="mb-3 last:mb-0 space-y-2 text-[16px] list-decimal pl-4 marker:text-muted-foreground"
                              >
                                {children}
                              </ol>
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
            </div>
            {message.content?.trim() && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-primary/10 rounded-md transition-colors"
                  title="Copy message"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
