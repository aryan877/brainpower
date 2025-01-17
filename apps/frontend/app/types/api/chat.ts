import { Message, ThreadPreview } from "../models/chat";

export interface SendMessageResponse {
  message: string;
  threadId: string;
}

export interface CreateThreadResponse {
  threadId: string;
  createdAt: string;
}

export interface GetThreadHistoryResponse {
  threadId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface GetThreadsResponse {
  threads: ThreadPreview[];
}

export interface DeleteThreadResponse {
  message: string;
}

export interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  result?: unknown;
  state: "partial-call" | "call" | "result";
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  isLoading?: boolean;
  toolInvocations?: ToolInvocation[];
}
