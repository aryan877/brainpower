import { useMutation } from "@tanstack/react-query";
import { imageClient } from "../clients/image";

export const imageKeys = {
  all: ["images"] as const,
  generations: () => [...imageKeys.all, "generations"] as const,
};

export function useImageGeneration() {
  return useMutation({
    mutationFn: (prompt: string) => imageClient.generateImage(prompt),
  });
}
