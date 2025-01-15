import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { useNotificationStore } from "../store/notificationStore";

export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  NOT_FOUND = "NOT_FOUND",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
}

interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    if (axios.isCancel(error)) {
      return Promise.reject({
        isCancelled: true,
        message: "Request cancelled",
      });
    }

    // Type guard for AxiosError
    const axiosError = error as AxiosError<ErrorResponse>;

    // Get error message
    let errorMessage = "An unexpected error occurred";
    if (axiosError.response?.data?.error) {
      errorMessage = axiosError.response.data.error.message;
    } else if (axiosError.message) {
      errorMessage = axiosError.message;
    }

    // Show error notification
    const addNotification = useNotificationStore.getState().addNotification;
    addNotification("error", errorMessage);

    return Promise.reject(error);
  }
);

export default api;
