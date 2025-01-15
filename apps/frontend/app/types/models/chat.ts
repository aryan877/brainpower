export interface Message {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  isLoading?: boolean;
}

export interface ChatThread {
  userId: string;
  threadId: string;
  title?: string;
  messages: Message[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ThreadPreview = Pick<
  ChatThread,
  "threadId" | "title" | "createdAt" | "updatedAt"
>;
