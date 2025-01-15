import api from "../lib/axios";
import {
  SendMessageResponse,
  GetThreadsResponse,
  GetThreadHistoryResponse,
  CreateThreadResponse,
  DeleteThreadResponse,
} from "../types/api/chat";
import { Message, ThreadPreview } from "../types/models/chat";

export const chatClient = {
  sendMessage: async (
    message: string,
    threadId: string
  ): Promise<SendMessageResponse> => {
    const { data } = await api.post<SendMessageResponse>("/api/chat/message", {
      message,
      threadId,
    });
    return data;
  },

  getThreads: async (): Promise<ThreadPreview[]> => {
    const { data } = await api.get<GetThreadsResponse>("/api/chat/threads");
    return data.threads;
  },

  getHistory: async (threadId: string): Promise<Message[]> => {
    const { data } = await api.get<GetThreadHistoryResponse>(
      `/api/chat/history/${threadId}`
    );
    return data.messages;
  },

  createThread: async (): Promise<CreateThreadResponse> => {
    const { data } = await api.post<CreateThreadResponse>("/api/chat/thread");
    return data;
  },

  deleteThread: async (threadId: string): Promise<DeleteThreadResponse> => {
    const { data } = await api.delete<DeleteThreadResponse>(
      `/api/chat/thread/${threadId}`
    );
    return data;
  },
};
