import { BrainPowerAgent } from "src/agent/index.js";

export async function getTPS(agent: BrainPowerAgent): Promise<number> {
  const perfSamples = await agent.connection.getRecentPerformanceSamples();

  if (
    !perfSamples.length ||
    !perfSamples[0]?.numTransactions ||
    !perfSamples[0]?.samplePeriodSecs
  ) {
    throw new Error("No performance samples available");
  }

  const tps = perfSamples[0].numTransactions / perfSamples[0].samplePeriodSecs;

  return tps;
}
