import type { JupiterTokenData } from "@repo/brainpower-agent";
import Image from "next/image";
import { CopyAddress } from "../../CopyAddress";

interface TokenAddressSuccessProps {
  data: JupiterTokenData;
}

export function TokenAddressSuccess({ data }: TokenAddressSuccessProps) {
  const tokenAddress = data?.address || "Not available";
  const tokenName = data?.name || "Unknown";
  const tokenSymbol = data?.symbol || "???";

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
      <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
        {data?.logoURI && (
          <Image
            src={data.logoURI}
            alt={`${tokenName} logo`}
            width={18}
            height={18}
            className="rounded-full flex-shrink-0"
            unoptimized
          />
        )}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-medium truncate">{tokenName}</span>
          <span className="text-muted-foreground whitespace-nowrap">
            ({tokenSymbol})
          </span>
        </div>
      </div>
      <div className="w-full sm:flex-1 min-w-0">
        <CopyAddress
          address={tokenAddress}
          explorerUrl={`https://solscan.io/token/${tokenAddress}`}
          className="w-full"
        />
      </div>
    </div>
  );
}
