import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Coins } from "lucide-react";
import { TokenBalancesResponse } from "@repo/brainpower-agent";
import { CopyAddress } from "../../CopyAddress";

interface TokenBalancesSuccessProps {
  data: TokenBalancesResponse;
}

export function TokenBalancesSuccess({ data }: TokenBalancesSuccessProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-background w-full max-w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
            <Coins className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-primary">Token Balances</h3>
            <p className="text-sm text-muted-foreground mt-1">
              SOL Balance: {data.sol} SOL
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {data.tokens.map((token) => (
          <div
            key={token.tokenAddress}
            className="flex flex-col gap-2 p-3 bg-background/50 rounded-md hover:bg-background/70 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium">
                  {token.name || token.symbol}
                </span>
                <span className="text-sm text-muted-foreground">
                  {token.balance} {token.symbol}
                </span>
              </div>
            </div>
            <div className="w-full break-all">
              <CopyAddress
                address={token.tokenAddress}
                explorerUrl={`https://solscan.io/token/${token.tokenAddress}`}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
