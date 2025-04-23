import api from "../lib/axios";
import { TranscribeSpeechResponse } from "../types/api/speech";

export const speechClient = {
  transcribeSpeech: async (
    formData: FormData
  ): Promise<TranscribeSpeechResponse> => {
    const { data } = await api.post<TranscribeSpeechResponse>(
      "/api/speech/speech-to-text",
      formData,
      {
        headers: {
          // Ensure correct headers for file upload
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  },
};
