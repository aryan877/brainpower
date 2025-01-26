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
    <div
      className={cn(
        "w-full transition-colors",
        message.role === "assistant" ? "bg-muted/30" : "bg-background",
        // Only add border if previous message was from a different role
        previousMessageRole !== message.role && "border-t"
      )}
    >
      <div className="max-w-3xl mx-auto py-3 px-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1 w-8">
            {previousMessageRole !== message.role &&
              (message.role === "assistant" ? (
                <Avatar className="w-8 h-8 ring-2 ring-primary/10 shadow-md bg-primary/5 flex items-center justify-center">
                  <div className="text-primary font-medium text-lg">🧠</div>
                </Avatar>
              ) : (
                <Avatar className="w-8 h-8 ring-2 ring-primary/20 shadow-md bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </Avatar>
              ))}
          </div>
          <div className="flex-1 min-w-0">
            <div className={cn("p-1")}>
              <div
                className={cn(
                  "prose prose-base max-w-none break-words",
                  "dark:prose-invert",
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
                            className="relative group/code mt-2 mb-1"
                          >
                            <div className="absolute -top-4 left-0 right-0 h-6 bg-neutral-100 dark:bg-neutral-800 rounded-t-lg flex items-center px-4">
                              <span className="text-xs text-muted-foreground">
                                {match[1].toUpperCase()}
                              </span>
                            </div>
                            <div className="!bg-card !rounded-lg !rounded-tl-none !pt-4 text-sm !mt-0 !mb-0 whitespace-pre-wrap break-all">
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
                              "px-1.5 py-0.5 rounded text-[15px] break-all",
                              message.role === "assistant"
                                ? "bg-neutral-100 dark:bg-neutral-800"
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
                            className="mb-2 last:mb-0 space-y-1.5 text-[15px] list-disc pl-4"
                          >
                            {children}
                          </ul>
                        );
                      },
                      ol({ children }) {
                        return (
                          <ol
                            key={nanoid()}
                            className="mb-2 last:mb-0 space-y-1.5 text-[15px] list-decimal pl-4"
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
                        message.content?.trim() && "mt-4"
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
