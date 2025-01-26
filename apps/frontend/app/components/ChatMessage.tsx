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
import Image from "next/image";

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
    <div className="w-full py-3">
      <div className="max-w-3xl mx-auto px-4">
        {previousMessageRole !== message.role && (
          <div className="w-full h-px bg-border/30 dark:bg-border/20 mb-3" />
        )}
        
        <div className={cn(
          "rounded-2xl",
          message.role === "assistant" 
            ? "bg-primary/5 dark:bg-primary/[0.07] border border-primary/20" 
            : "bg-muted/50 dark:bg-muted/20 border border-border/50",
          "transition-all duration-200",
          "hover:border-primary/30"
        )}>
          <div className="flex items-start gap-4 p-4">
            {/* Avatar */}
            {message.role === "assistant" ? (
              <div className="flex-shrink-0">
                <Avatar className="w-8 h-8 ring-1 ring-primary/20 bg-primary/5 flex items-center justify-center transition-all duration-200 hover:ring-primary/40 hover:bg-primary/10">
                  <div className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="BrainPower Logo" width={24} height={24} />
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
              <div className={cn(
                "prose prose-base max-w-none break-words",
                "prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:my-1 dark:prose-p:text-foreground/95",
                "prose-code:bg-muted/60 prose-code:text-foreground/90 prose-code:rounded-md dark:prose-code:bg-muted/30", 
                "dark:prose-invert dark:prose-pre:bg-muted/20",
                isLoading && "opacity-60"
              )}>
                {message.content?.trim() && (
                  <ReactMarkdown
                    components={{
                      code({ className, children, ...props }) {
                        const isInline = (props as { inline?: boolean }).inline;
                        const match = /language-(\w+)/.exec(className || "");
                        return !isInline && match ? (
                          <div key={nanoid()} className="relative group/code mt-4 mb-1">
                            <div className="absolute -top-4 left-0 right-0 h-6 bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-muted/30 rounded-t-lg flex items-center px-4">
                              <span className="text-xs font-medium text-foreground/70">
                                {match[1].toUpperCase()}
                              </span>
                            </div>
                            <div className="!bg-muted/30 dark:!bg-muted/20 !rounded-lg !rounded-tl-none !pt-4 text-sm !mt-0 !mb-0 whitespace-pre-wrap break-all">
                              <SyntaxHighlighter style={vscDarkPlus} language={match[1]}>
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            </div>
                          </div>
                        ) : (
                          <code key={nanoid()} {...props} className={cn(
                            "px-1.5 py-0.5 rounded-md text-[15px] break-all",
                            message.role === "assistant" 
                              ? "bg-muted/40 dark:bg-muted/30"
                              : "bg-primary/10"
                          )}>
                            {children}
                          </code>
                        );
                      },
                      p({ children }) {
                        return (
                          <p key={nanoid()} className="mb-3 last:mb-0 break-words text-[15px] leading-relaxed">
                            {children}
                          </p>
                        );
                      },
                      ul({ children }) {
                        return (
                          <ul key={nanoid()} className="mb-3 last:mb-0 space-y-2 text-[15px] list-disc pl-4 marker:text-muted-foreground">
                            {children}
                          </ul>
                        );
                      },
                      ol({ children }) {
                        return (
                          <ol key={nanoid()} className="mb-3 last:mb-0 space-y-2 text-[15px] list-decimal pl-4 marker:text-muted-foreground">
                            {children}
                          </ol>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
                {message.toolInvocations && message.toolInvocations.length > 0 && (
                  <div className={cn(
                    "space-y-3",
                    message.content?.trim() && "mt-4 pt-4 border-t border-border/20"
                  )}>
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
