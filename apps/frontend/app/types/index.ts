import { ReactNode } from "react";

// ChatInterface types
export interface Message {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  isLoading?: boolean;
}

export interface ChatInterfaceProps {
  selectedChat: string | null;
  threads?: Thread[];
  onUpdateThreads?: (threads: Thread[]) => void;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

// Sidebar types
export interface Thread {
  threadId: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SidebarProps {
  threads: Thread[];
  selectedThread: string | null;
  onSelectThread: (threadId: string) => void;
  onCreateThread: () => void;
  isLoading: boolean;
  onDeleteClick: (thread: Thread) => void;
  onLogoutClick: () => void;
  onWithdrawClick: () => void;
}

// API Error types
export interface ApiError {
  error: string;
  details?: string;
}
