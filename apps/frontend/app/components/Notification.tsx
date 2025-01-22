"use client";

import { useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface NotificationProps {
  type: NotificationType;
  message: string;
  details?: unknown;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const icons = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-destructive" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  info: <AlertCircle className="h-5 w-5 text-blue-500" />,
};

const variantStyles = {
  success:
    "border-green-200 bg-green-50 dark:border-green-500/20 dark:bg-green-950/50",
  error: "border-destructive/50 bg-destructive/10",
  warning:
    "border-yellow-200 bg-yellow-50 dark:border-yellow-500/20 dark:bg-yellow-950/50",
  info: "border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-950/50",
};

const textStyles = {
  success: "text-green-700 dark:text-green-400",
  error: "text-destructive dark:text-destructive",
  warning: "text-yellow-700 dark:text-yellow-400",
  info: "text-blue-700 dark:text-blue-400",
};

const formatDetails = (details: unknown): string => {
  if (!details) return "";

  // Handle validation errors
  const detailsObj = details as {
    errors?: Array<{ path: string; message: string }>;
  };
  if (detailsObj.errors?.length) {
    return detailsObj.errors
      .map((err) => `${err.path}: ${err.message}`)
      .join("\n");
  }

  // Handle string details
  if (typeof details === "string") return details;

  // Handle other object details
  return JSON.stringify(details, null, 2)
    .replace(/[{}"]/g, "")
    .replace(/,/g, "")
    .trim();
};

export const Notification = ({
  type,
  message,
  details,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000,
}: NotificationProps) => {
  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, isVisible, onClose]);

  if (!isVisible) return null;

  const formattedDetails = details ? formatDetails(details) : null;

  return (
    <div
      className={cn(
        "transform transition-all duration-300 ease-in-out",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      )}
    >
      <Card
        className={cn(
          "flex items-start gap-3 p-3 backdrop-blur-sm shadow-lg",
          variantStyles[type]
        )}
      >
        <div className="flex-shrink-0 mt-1">{icons[type]}</div>
        <div className="flex-1 mr-2">
          <p className={cn("text-sm font-medium", textStyles[type])}>
            {message}
          </p>
          {formattedDetails && (
            <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-background/50 p-2 rounded">
              {formattedDetails}
            </pre>
          )}
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </Card>
    </div>
  );
};
