import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { CheckCircle2, ExternalLink, Wallet } from "lucide-react";
import type { PumpfunLaunchResponse } from "@repo/brainpower-agent";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface PumpFunSuccessProps {
  data: PumpfunLaunchResponse;
}

export function PumpFunSuccess({ data }: PumpFunSuccessProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/10 to-background">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0 flex items-center">
            <Image
              src="/tools/pump-fun.svg"
              alt="Pump.fun Logo"
              width={44}
              height={44}
              className="rounded-lg"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              Token Launch Successful!
              <CheckCircle2 className="w-6 h-6 text-green-500 stroke-[2.5]" />
            </h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        <InfoItem label="Token Mint" value={data.mint} isCode />
        <InfoItem
          label="Transaction"
          value="View on Solscan"
          link={`https://solscan.io/tx/${data.signature}`}
        />
        <InfoItem
          label="Metadata"
          value="View Metadata"
          link={data.metadataUri}
        />
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          className="w-full text-sm hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={() =>
            window.open(`https://pump.fun/coin/${data.mint}`, "_blank")
          }
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Pump.fun
        </Button>
        <Link href="/wallet" className="w-full sm:flex-1">
          <Button
            variant="outline"
            className="w-full text-sm hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Check Assets
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
  isCode?: boolean;
  link?: string;
}

function InfoItem({ label, value, isCode, link }: InfoItemProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 bg-background/50 rounded-md hover:bg-background/70 transition-colors gap-2">
      <span className="text-muted-foreground text-sm">{label}</span>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-primary hover:underline text-sm break-all"
        >
          {value}
          <ExternalLink className="w-4 h-4" />
        </a>
      ) : isCode ? (
        <code className="bg-background/80 px-3 py-1.5 rounded text-sm break-all font-mono">
          {value}
        </code>
      ) : (
        <span className="text-sm break-all">{value}</span>
      )}
    </div>
  );
}
