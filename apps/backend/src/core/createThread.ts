import OpenAI from "openai";
import { Thread } from "openai/resources/beta/threads/threads";

export async function createThread(
  client: OpenAI,
  message?: string
): Promise<Thread> {
  console.log("🧵 Initializing new conversation thread");

  // Create a new conversation context
  const conversationThread = await client.beta.threads.create();

  // Add initial message if provided
  if (message) {
    console.log("📝 Adding initial message to thread");
    await client.beta.threads.messages.create(conversationThread.id, {
      role: "user",
      content: message,
    });
  }

  return conversationThread;
}
