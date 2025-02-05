export interface GenerateImageResponse {
  success: boolean;
  data: {
    imageData: string; // base64 image data
  };
}

export interface GenerateImageRequest {
  prompt: string;
}
