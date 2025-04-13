import { Card, CardHeader } from "@/components/ui/card";
import { Check } from "lucide-react";

interface ConfirmationSuccessProps {
  data: {
    confirmed: boolean;
  };
}

export function ConfirmationSuccess({ data }: ConfirmationSuccessProps) {
  if (!data.confirmed) return null;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-background w-full max-w-full p-0">
      <CardHeader className="p-4 space-y-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-500/10 rounded-md flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-green-500">
              Action Confirmed
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              The requested action has been confirmed and will proceed.
            </p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
