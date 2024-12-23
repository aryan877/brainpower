import { ToolConfig } from "../types/index.js";
import { createSolanaAgent } from "../agent/createAgent.js";

interface CreateImageArgs {
  prompt: string;
  size?: "256x256" | "512x512" | "1024x1024";
  n?: number;
}

export const createImageTool: ToolConfig<CreateImageArgs> = {
  definition: {
    type: "function",
    function: {
      name: "create_image",
      description: "Generate an image using OpenAI's DALL-E",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "Text description of the image to generate",
          },
          size: {
            type: "string",
            enum: ["256x256", "512x512", "1024x1024"],
            description: "Image size (default: '1024x1024')",
          },
          n: {
            type: "number",
            description: "Number of images to generate (default: 1)",
          },
        },
        required: ["prompt"],
      },
    },
  },
  handler: async ({ prompt, size = "1024x1024", n = 1 }) => {
    console.log("🎨 Starting createImage handler");
    console.log(`📝 Prompt: ${prompt}`);

    try {
      const agent = createSolanaAgent();
      console.log("🔄 Generating image with DALL-E");

      const result = await agent.createImage(prompt, size, n);
      console.log("✅ Image generation successful");

      return {
        success: true,
        images: result.images,
      };
    } catch (error) {
      console.error("❌ Error in createImage:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
