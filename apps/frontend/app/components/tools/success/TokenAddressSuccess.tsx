import { ExternalLink } from "lucide-react";
import type { JupiterTokenData } from "@repo/brainpower-agent";
import Image from "next/image";

interface TokenAddressSuccessProps {
  data: JupiterTokenData;
}

export function TokenAddressSuccess({ data }: TokenAddressSuccessProps) {
  const tokenAddress = data?.address || "Not available";
  const tokenName = data?.name || "Unknown";
  const tokenSymbol = data?.symbol || "???";

  return (
    <div className="flex items-start gap-1.5 text-sm">
      {data?.logoURI && (
        <Image
          src={data.logoURI}
          alt={`${tokenName} logo`}
          width={18}
          height={18}
          className="rounded-full shrink-0 mt-0.5"
          unoptimized
        />
      )}
      <div className="flex items-start gap-1 min-w-0">
        <span className="font-medium whitespace-nowrap">{tokenName}</span>
        <span className="text-muted-foreground whitespace-nowrap">
          ({tokenSymbol})
        </span>
        <span className="text-muted-foreground hidden sm:inline">•</span>
        <a
          href={`https://solscan.io/token/${tokenAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-start gap-0.5 text-primary hover:underline truncate"
        >
          <code className="font-mono bg-muted/30 px-1 py-0.5 rounded truncate">
            {tokenAddress}
          </code>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      </div>
    </div>
  );
}
