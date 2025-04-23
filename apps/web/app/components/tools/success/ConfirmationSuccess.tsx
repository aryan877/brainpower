import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

interface ConfirmationSuccessProps {
  data: {
    confirmed: boolean;
  };
}

export function ConfirmationSuccess({ data }: ConfirmationSuccessProps) {
  if (!data.confirmed) return null;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-background w-full max-w-full">
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col items-center gap-6">
          <div className="w-full flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Check className="w-6 h-6 text-green-500" />
                Action Confirmed
              </h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                The requested action has been confirmed and will proceed.
              </p>
            </div>
          </div>

          <div className="w-full px-4 py-3 bg-background/50 rounded-md border border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 flex-shrink-0 text-green-500/70" />
              <span>Your action has been successfully processed.</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
