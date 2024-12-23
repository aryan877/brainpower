import readline from "readline";
import OpenAI from "openai";
import { Thread } from "openai/resources/beta/threads/threads";
import { Assistant } from "openai/resources/beta/assistants";
import { createRun } from "../core/createRun.js";
import { performRun } from "../core/performRun.js";

// Create interface for reading from command line
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Type-safe promise-based question function
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

export async function startTerminalChat(
  thread: Thread,
  assistant: Assistant,
  client: OpenAI
): Promise<void> {
  while (true) {
    // Get user input
    const userInput = await question("\nYou: ");

    // Allow user to exit
    if (userInput.toLowerCase() === "exit") {
      rl.close();
      break;
    }

    try {
      // Add the user's message to the thread
      await client.beta.threads.messages.create(thread.id, {
        role: "user",
        content: userInput,
      });

      // Create and perform the run
      const run = await createRun(client, thread, assistant.id);
      const result = await performRun(run, client, thread);

      if (result?.type === "text") {
        console.log("\nAgent:", result.text.value);
      }
    } catch (error) {
      console.error(
        "Error during chat:",
        error instanceof Error ? error.message : "Unknown error"
      );
      rl.close();
      break;
    }
  }
}
