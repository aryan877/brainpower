import { TokenHolder } from "@repo/brainpower-agent";
import { ExternalLink, Users } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TokenHoldersSuccessProps {
  data: {
    holders: TokenHolder[];
  };
}

// Helper function to format numbers with commas
const formatNumber = (numStr: string) => {
  const [whole, decimal] = numStr.split(".");
  return `${Number(whole).toLocaleString()}${decimal ? `.${decimal}` : ""}`;
};

export function TokenHoldersSuccess({ data }: TokenHoldersSuccessProps) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-3">
        <div className="p-2 bg-muted rounded-md flex items-center justify-center">
          <Users className="w-5 h-5 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold leading-none text-foreground">
          Top Token Holders
        </h3>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Token Account</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">% of Supply</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.holders.map((holder, index) => (
                <TableRow key={holder.address}>
                  <TableCell className="text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://solscan.io/account/${holder.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-foreground hover:text-muted-foreground flex items-center gap-1.5"
                    >
                      {holder.address.slice(0, 4)}...{holder.address.slice(-4)}
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  </TableCell>
                  <TableCell>
                    {holder.owner && (
                      <a
                        href={`https://solscan.io/account/${holder.owner}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-foreground hover:text-muted-foreground flex items-center gap-1.5"
                      >
                        {holder.owner.slice(0, 4)}...{holder.owner.slice(-4)}
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-foreground">
                    {formatNumber(holder.uiAmountString)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-foreground">
                    {holder.percentage?.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
