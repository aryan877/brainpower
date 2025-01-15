"use client";

import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

export type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationProps {
  type: NotificationType;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const icons = {
  success: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
  error: <ExclamationCircleIcon className="h-5 w-5 text-red-400" />,
  warning: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />,
  info: <InformationCircleIcon className="h-5 w-5 text-blue-400" />,
};

const bgColors = {
  success: "bg-green-950/50",
  error: "bg-red-950/50",
  warning: "bg-yellow-950/50",
  info: "bg-blue-950/50",
};

const borderColors = {
  success: "border-green-500/20",
  error: "border-red-500/20",
  warning: "border-yellow-500/20",
  info: "border-blue-500/20",
};

const textColors = {
  success: "text-green-400",
  error: "text-red-400",
  warning: "text-yellow-400",
  info: "text-blue-400",
};

export const Notification = ({
  type,
  message,
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

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border backdrop-blur-sm ${bgColors[type]} ${borderColors[type]} shadow-lg shadow-black/10`}
      >
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="flex-1 mr-2">
          <p className={`text-sm ${textColors[type]}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300 transition-colors duration-150"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
