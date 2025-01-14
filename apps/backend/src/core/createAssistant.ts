import OpenAI from "openai";
import { Assistant } from "openai/resources/beta/assistants";
import { tools } from "../tools/allTools.js";
import { assistantPrompt } from "../const/prompt.js";

export async function createAssistant(client: OpenAI): Promise<Assistant> {
  const assistantConfig = {
    model: "gpt-4o-mini",
    name: "SolanaAI",
    instructions: assistantPrompt,
    tools: Object.values(tools).map((toolConfig) => toolConfig.definition),
  };

  console.log("🤖 Initializing AI assistant with configured capabilities");
  return await client.beta.assistants.create(assistantConfig);
}
