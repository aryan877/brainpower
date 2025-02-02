import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ArrowRightLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JupiterSwapResponse } from "@repo/brainpower-agent";
import { CopyAddress } from "../../CopyAddress";

interface SwapSuccessProps {
  data: JupiterSwapResponse;
}

interface InfoItemProps {
  label: string;
  children: React.ReactNode;
}

function InfoItem({ label, children }: InfoItemProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 bg-background/50 rounded-lg hover:bg-background/70 transition-colors gap-2">
      <span className="text-muted-foreground text-sm whitespace-nowrap">
        {label}
      </span>
      <div className="w-full md:w-auto break-all">{children}</div>
    </div>
  );
}

export function SwapSuccess({ data }: SwapSuccessProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-background w-full max-w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-primary">Swap Successful!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your token swap has been completed
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        <InfoItem label="Transaction">
          <div className="w-full break-all">
            <CopyAddress
              address={data.transaction}
              explorerUrl={`https://solscan.io/tx/${data.transaction}`}
            />
          </div>
        </InfoItem>

        <div className="flex flex-col gap-4 p-3 bg-background/50 rounded-lg">
          <div className="flex flex-col w-full gap-2">
            <div className="text-sm text-muted-foreground">From</div>
            <div className="flex flex-col w-full gap-2">
              <div className="font-mono text-sm break-all">
                {data.inputAmount} {data.inputToken}
              </div>
              <div className="w-full break-all">
                <CopyAddress
                  address={data.inputToken}
                  explorerUrl={`https://solscan.io/token/${data.inputToken}`}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="p-2 bg-background/50 rounded-full">
              <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-col w-full gap-2">
            <div className="text-sm text-muted-foreground">To</div>
            <div className="flex flex-col w-full gap-2">
              <div className="font-mono text-sm break-all">
                {data.outputToken}
              </div>
              <div className="w-full break-all">
                <CopyAddress
                  address={data.outputToken}
                  explorerUrl={`https://solscan.io/token/${data.outputToken}`}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          className="w-full text-sm hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={() =>
            window.open(`https://solscan.io/tx/${data.transaction}`, "_blank")
          }
        >
          <Search className="w-4 h-4 mr-2" />
          View Transaction Details
        </Button>
      </CardFooter>
    </Card>
  );
}
