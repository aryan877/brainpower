"use client";

import { useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  X,
} from "lucide-react";

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
  success: (
    <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
  ),
  error: <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />,
  warning: (
    <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
  ),
  info: <AlertCircle className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
};

const bgColors = {
  success: "bg-green-50 dark:bg-green-950/50",
  error: "bg-red-50 dark:bg-red-950/50",
  warning: "bg-yellow-50 dark:bg-yellow-950/50",
  info: "bg-blue-50 dark:bg-blue-950/50",
};

const borderColors = {
  success: "border-green-200 dark:border-green-500/20",
  error: "border-red-200 dark:border-red-500/20",
  warning: "border-yellow-200 dark:border-yellow-500/20",
  info: "border-blue-200 dark:border-blue-500/20",
};

const textColors = {
  success: "text-green-700 dark:text-green-400",
  error: "text-red-700 dark:text-red-400",
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
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      <div
        className={`flex items-start gap-3 p-3 rounded-lg border backdrop-blur-sm ${bgColors[type]} ${borderColors[type]} shadow-lg shadow-black/5 dark:shadow-black/10`}
      >
        <div className="flex-shrink-0 mt-1">{icons[type]}</div>
        <div className="flex-1 mr-2">
          <p className={`text-sm font-medium ${textColors[type]}`}>{message}</p>
          {formattedDetails && (
            <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono bg-black/5 dark:bg-black/20 p-2 rounded">
              {formattedDetails}
            </pre>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-150"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
