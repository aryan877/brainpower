import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Send, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransferResponse } from "@repo/brainpower-agent";
import { CopyAddress } from "../../CopyAddress";

interface TransferSuccessProps {
  data: TransferResponse;
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

export function TransferSuccess({ data }: TransferSuccessProps) {
  const { signature, amount, token, recipient } = data;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-background w-full max-w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Send className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-primary">
              Transfer Successful!
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Transferred {amount} {token || "SOL"} to recipient
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        <InfoItem label="Transaction">
          <div className="w-full break-all">
            <CopyAddress
              address={signature}
              explorerUrl={`https://solscan.io/tx/${signature}`}
            />
          </div>
        </InfoItem>

        <InfoItem label="Recipient">
          <div className="w-full break-all">
            <CopyAddress
              address={recipient}
              explorerUrl={`https://solscan.io/account/${recipient}`}
            />
          </div>
        </InfoItem>

        {token && (
          <InfoItem label="Token">
            <div className="w-full break-all">
              <CopyAddress
                address={token}
                explorerUrl={`https://solscan.io/token/${token}`}
              />
            </div>
          </InfoItem>
        )}
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          className="w-full text-sm hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={() =>
            window.open(`https://solscan.io/tx/${signature}`, "_blank")
          }
        >
          <Search className="w-4 h-4 mr-2" />
          View Transaction Details
        </Button>
      </CardFooter>
    </Card>
  );
}
