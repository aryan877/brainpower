import { Message, ThreadPreview } from "../models/chat";

export interface SendMessageResponse {
  response: string;
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
