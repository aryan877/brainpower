import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, X } from "lucide-react";
import { ConfirmationToolResult } from "../../types/tools";
import { AskForConfirmationInput } from "@repo/brainpower-agent";

interface ConfirmationToolProps {
  args: AskForConfirmationInput;
  onSubmit: (result: ConfirmationToolResult) => void;
}

export function ConfirmationTool({ args, onSubmit }: ConfirmationToolProps) {
  const handleConfirm = () => {
    onSubmit({
      status: "success",
      message: "Action confirmed",
      data: {
        confirmed: true,
      },
    });
  };

  const handleCancel = () => {
    onSubmit({
      status: "cancelled",
      message: "Action cancelled by user",
      data: {
        confirmed: false,
      },
    });
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-background w-full max-w-full">
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col items-center gap-6">
          <div className="w-full flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-primary" />
                Confirmation Required
              </h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {args.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full">
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-primary hover:bg-primary/90 transition-colors duration-200"
              size="lg"
            >
              <Check className="mr-2 h-5 w-5" />
              Confirm
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              size="lg"
              className="flex-1 border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-colors duration-200"
            >
              <X className="mr-2 h-5 w-5" />
              Cancel
            </Button>
          </div>

          <div className="w-full px-4 py-3 bg-background/50 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-primary/70" />
              <span>
                Please review the details carefully before confirming.
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
