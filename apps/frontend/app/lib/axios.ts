import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { useNotificationStore } from "../store/notificationStore";
import { useClusterStore } from "../store/clusterStore";
import { ErrorResponse } from "../types";

const api = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const selectedCluster = useClusterStore.getState().selectedCluster;
  config.headers["X-Solana-Cluster"] = selectedCluster;
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

    const axiosError = error as AxiosError<ErrorResponse>;
    const errorData = axiosError.response?.data;

    let errorMessage = "An unexpected error occurred";
    let details = undefined;

    if (errorData?.error) {
      errorMessage = errorData.error.message;
      details = errorData.error.details;
    } else if (axiosError.message) {
      errorMessage = axiosError.message;
    }

    const addNotification = useNotificationStore.getState().addNotification;
    addNotification("error", errorMessage, details);

    return Promise.reject(error);
  }
);

export default api;
