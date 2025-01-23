import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Message } from "../types";
import { nanoid } from "nanoid";
import { User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ToolInvocation } from "ai";
import { getToolComponent, preprocessToolResult } from "./tools/registry";

// Define valid tool names as a const array
const VALID_TOOL_NAMES = ["LAUNCH_PUMPFUN_TOKEN_ACTION"] as const;
type ValidToolName = (typeof VALID_TOOL_NAMES)[number];

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  addToolResult: (result: { toolCallId: string; result: unknown }) => void;
}

// Type guard to check if a tool name is valid
function isValidToolName(name: string): name is ValidToolName {
  return VALID_TOOL_NAMES.includes(name as ValidToolName);
}

export default function ChatMessage({
  message,
  isLoading,
  addToolResult,
}: ChatMessageProps) {
  if (
    !message.content?.trim() &&
    (!message.toolInvocations?.length ||
      message.toolInvocations.every((t) => t.state !== "call"))
  ) {
    return null;
  }

  const renderToolInvocation = (toolInvocation: ToolInvocation) => {
    if (!toolInvocation) return null;

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
        "w-full border-b transition-colors",
        message.role === "assistant"
          ? "bg-muted/30"
          : "bg-background hover:bg-muted/10"
      )}
    >
      <div className="max-w-3xl mx-auto py-6 px-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {message.role === "assistant" ? (
              <Avatar className="w-8 h-8 ring-2 ring-primary/10 shadow-md bg-primary/5 flex items-center justify-center">
                <div className="text-primary font-medium text-lg">🧠</div>
              </Avatar>
            ) : (
              <Avatar className="w-8 h-8 ring-2 ring-primary/20 shadow-md bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </Avatar>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Card
              className={cn(
                "border shadow-sm",
                message.role === "assistant" ? "bg-card" : "bg-primary/5"
              )}
            >
              <div className={cn("p-4", isLoading && "py-3")}>
                <div
                  className={cn(
                    "prose prose-base max-w-none break-words",
                    "dark:prose-invert"
                  )}
                >
                  {isLoading &&
                  message.toolInvocations?.some((t) => t.state === "call") ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                      <span className="text-base font-medium text-primary">
                        BrainPower is braining...
                      </span>
                    </div>
                  ) : (
                    <>
                      {message.content?.trim() && (
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
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
