"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { useThreads, useCreateThread, useDeleteThread } from "../hooks/chat";
import { ThreadPreview } from "../types";
import Navbar from "./Navbar";
import { usePrivy } from "@privy-io/react-auth";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WalletProvider } from "../providers/WalletProvider";

interface AppLayoutProps {
  children: React.ReactNode;
  selectedThread: string | null;
  showNavbar?: boolean;
}

export function AppLayout({
  children,
  selectedThread,
  showNavbar = true,
}: AppLayoutProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: threads = [], isLoading } = useThreads();
  const { mutateAsync: createThreadMutation } = useCreateThread();
  const { mutateAsync: deleteThreadMutation } = useDeleteThread();
  const { user, logout } = usePrivy();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    title: string;
    content: React.ReactNode;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Set initial sidebar state based on screen size
  useEffect(() => {
    setIsSidebarOpen(window.innerWidth >= 768);

    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  const createThread = async () => {
    try {
      const response = await createThreadMutation();
      router.push(`/?chatId=${response.threadId}`);
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };

  const handleDeleteClick = async (thread: ThreadPreview) => {
    try {
      await deleteThreadMutation(thread.threadId);
      if (selectedThread === thread.threadId) {
        router.push("/");
      }
    } catch (error) {
      console.error("Error deleting thread:", error);
    }
  };

  const handleSelectThread = (threadId: string) => {
    router.push(`/?chatId=${threadId}`);
  };

  const showConfirmDialog = (config: {
    title: string;
    content: React.ReactNode;
    onConfirm: () => Promise<void>;
  }) => {
    setConfirmDialogConfig(config);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDialogClose = () => {
    setIsConfirmDialogOpen(false);
    setConfirmDialogConfig(null);
  };

  const handleLogoutClick = () => {
    showConfirmDialog({
      title: "Confirm Logout",
      content: (
        <div className="text-muted-foreground">
          <p>Are you sure you want to log out?</p>
          {user?.wallet && (
            <p className="mt-2 text-sm">
              Note: This will not disconnect your wallet. You will need to
              reconnect to access your account again.
            </p>
          )}
        </div>
      ),
      onConfirm: async () => {
        try {
          await logout();
        } catch (error) {
          console.error("Error logging out:", error);
        }
      },
    });
  };

  return (
    <WalletProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Confirm Dialog */}
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirmDialogConfig?.title}</DialogTitle>
            </DialogHeader>
            <div className="py-4">{confirmDialogConfig?.content}</div>
            <DialogFooter>
              <Button variant="outline" onClick={handleConfirmDialogClose}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (confirmDialogConfig) {
                    await confirmDialogConfig.onConfirm();
                    handleConfirmDialogClose();
                  }
                }}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mobile sidebar overlay */}
        {isSidebarOpen && window.innerWidth < 768 && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 md:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar container */}
        <div
          className={`fixed md:static w-[260px] h-full z-30 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <Sidebar
            threads={threads}
            selectedThread={selectedThread}
            onSelectThread={handleSelectThread}
            onCreateThread={createThread}
            onDeleteClick={handleDeleteClick}
            isLoading={isLoading}
            onLogoutClick={handleLogoutClick}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 flex flex-col h-full">
          {showNavbar && <Navbar onMenuClick={toggleSidebar} />}
          <div className={`flex-1 overflow-y-auto brainpower-scrollbar ${showNavbar ? "mt-12" : ""}`}>
            {children}
          </div>
        </main>
      </div>
    </WalletProvider>
  );
}
