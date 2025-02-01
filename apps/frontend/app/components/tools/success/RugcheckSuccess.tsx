import type { TokenCheck } from "@repo/brainpower-agent";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface RugcheckSuccessProps {
  data: TokenCheck;
}

function getRiskColor(score: number): string {
  if (score >= 8000) return "bg-green-500";
  if (score >= 6000) return "bg-yellow-500";
  if (score >= 4000) return "bg-orange-500";
  return "bg-red-500";
}

function getRiskBadge(score: number) {
  if (score >= 8000)
    return { label: "Safe", color: "bg-green-500/10 text-green-500" };
  if (score >= 6000)
    return { label: "Medium Risk", color: "bg-yellow-500/10 text-yellow-500" };
  if (score >= 4000)
    return { label: "High Risk", color: "bg-orange-500/10 text-orange-500" };
  return { label: "Very High Risk", color: "bg-red-500/10 text-red-500" };
}

export function RugcheckSuccess({ data }: RugcheckSuccessProps) {
  const score = data.score || 0;
  const riskBadge = getRiskBadge(score);
  const warnRisks = data.risks.filter((risk) => risk.level === "warn");
  const lowRisks = data.risks.filter((risk) => risk.level === "low");

  return (
    <div className="flex flex-col gap-4 max-w-full overflow-hidden">
      {/* Token Info Section */}
      <div className="flex flex-col gap-3">
        {/* Program & Type Info */}
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="text-muted-foreground shrink-0">Program:</span>
              <span className="font-medium truncate" title={data.tokenProgram}>
                {data.tokenProgram}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground shrink-0">Type:</span>
              <span className="font-medium">{data.tokenType || "Unknown"}</span>
            </div>
          </div>
          <div
            className={`self-start px-2 py-0.5 rounded text-sm ${riskBadge.color}`}
          >
            {riskBadge.label}
          </div>
        </div>

        {/* Safety Score */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Safety Score</span>
            <span className="text-sm font-medium">{score}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${getRiskColor(score)}`}
              style={{ width: `${(score / 10000) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Risk Analysis Section */}
      <div className="grid grid-cols-1 gap-4">
        {/* Warning Risk Factors */}
        {warnRisks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Warning Risk Factors
            </h3>
            <div className="space-y-2">
              {warnRisks.map((risk, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border bg-yellow-500/5 border-yellow-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm text-yellow-500">
                      {risk.name}
                    </div>
                    {risk.value && (
                      <div className="text-sm text-yellow-500/80">
                        {risk.value}
                      </div>
                    )}
                  </div>
                  <p className="text-sm mt-1.5 text-muted-foreground">
                    {risk.description}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Risk Score: {risk.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low Risk / Positive Signals */}
        {lowRisks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Positive Signals
            </h3>
            <div className="space-y-2">
              {lowRisks.map((risk, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border bg-green-500/5 border-green-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm text-green-500">
                      {risk.name}
                    </div>
                    {risk.value && (
                      <div className="text-sm text-green-500/80">
                        {risk.value}
                      </div>
                    )}
                  </div>
                  <p className="text-sm mt-1.5 text-muted-foreground">
                    {risk.description}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Risk Score: {risk.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
