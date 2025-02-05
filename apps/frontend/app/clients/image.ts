import api from "../lib/axios";
import {
  GenerateImageResponse,
  GenerateImageRequest,
} from "../types/api/image";

export const imageClient = {
  generateImage: async (prompt: string): Promise<GenerateImageResponse> => {
    const { data } = await api.post<GenerateImageResponse>(
      "/api/image/generate",
      {
        prompt,
      } as GenerateImageRequest
    );
    return data;
  },
};
