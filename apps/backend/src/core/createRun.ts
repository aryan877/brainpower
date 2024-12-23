import OpenAI from "openai";
import { Run } from "openai/resources/beta/threads/runs/runs";
import { Thread } from "openai/resources/beta/threads/threads";

export async function createRun(
  client: OpenAI,
  thread: Thread,
  assistantId: string
): Promise<Run> {
  console.log(
    `🚀 Initializing new execution context - Thread: ${thread.id}, Assistant: ${assistantId}`
  );

  // Initialize execution context
  let executionContext = await client.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId,
  });

  // Monitor execution status
  const POLLING_INTERVAL = 1000; // 1 second
  const ACTIVE_STATES = ["in_progress", "queued"];

  while (ACTIVE_STATES.includes(executionContext.status)) {
    console.log(
      `⏳ Execution ${executionContext.id} - Current state: ${executionContext.status}`
    );
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
    executionContext = await client.beta.threads.runs.retrieve(
      thread.id,
      executionContext.id
    );
  }

  return executionContext;
}
