import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatClient } from "../clients/chat";

export const chatKeys = {
  all: ["chats"] as const,
  threads: () => [...chatKeys.all, "threads"] as const,
  thread: (threadId: string) => [...chatKeys.all, "thread", threadId] as const,
  messages: (threadId: string) =>
    [...chatKeys.thread(threadId), "messages"] as const,
};

export function useThreads() {
  return useQuery({
    queryKey: chatKeys.threads(),
    queryFn: () => chatClient.getThreads(),
  });
}

export function useThreadMessages(threadId: string | null) {
  return useQuery({
    queryKey: chatKeys.messages(threadId || ""),
    queryFn: () => chatClient.getHistory(threadId || ""),
    enabled: !!threadId,
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatClient.createThread,
    onSuccess: () => {
      // Invalidate threads list to trigger refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.threads() });
    },
  });
}

export function useDeleteThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (threadId: string) => chatClient.deleteThread(threadId),
    onSuccess: (_, threadId) => {
      // Remove the thread from cache with exact: true to prevent refetch
      queryClient.removeQueries({
        queryKey: chatKeys.thread(threadId),
        exact: true,
      });
      // Invalidate threads list to trigger refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.threads() });
    },
  });
}
