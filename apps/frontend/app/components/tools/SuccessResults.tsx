import { ACTION_NAMES, PumpfunLaunchResponse } from "@repo/brainpower-agent";
import { PumpFunSuccess } from "./success/PumpFunSuccess";

interface SuccessResultsProps {
  toolName: string;
  data: unknown;
}

export function SuccessResults({ toolName, data }: SuccessResultsProps) {
  if (toolName === ACTION_NAMES.LAUNCH_PUMPFUN_TOKEN && data) {
    return <PumpFunSuccess data={data as PumpfunLaunchResponse} />;
  }

  // Return null for other tools
  return null;
}
