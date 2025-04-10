"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { useDeleteThread, chatKeys } from "../hooks/chat";
import { ThreadPreview } from "../types";
import { GetThreadsResponse } from "../types/api/chat";
import Navbar from "./Navbar";
import { usePrivy } from "@privy-io/react-auth";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WalletProvider } from "../providers/WalletProvider";
import { useInfiniteQuery } from "@tanstack/react-query";
import { chatClient } from "../clients/chat";

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // const { mutateAsync: createThreadMutation } = useCreateThread();
  const { mutateAsync: deleteThreadMutation } = useDeleteThread();
  const { user, logout } = usePrivy();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    title: string;
    content: React.ReactNode;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Fetch threads with infinite query
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: chatKeys.threads(),
    queryFn: async ({ pageParam }) => {
      return chatClient.getThreads({
        limit: 10,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage: GetThreadsResponse) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });

  // Flatten all threads from all pages
  const threads =
    data?.pages.flatMap((page: GetThreadsResponse) => page.threads) || [];

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Toggle sidebar collapse for desktop
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Set initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsSidebarOpen(!isMobile);
      // Reset collapsed state on mobile
      if (isMobile) {
        setIsSidebarCollapsed(false);
      }
    };

    // Initial setup
    handleResize();

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

  // const createThread = async () => {
  //   try {
  //     const response = await createThreadMutation();
  //     router.push(`/chat?chatId=${response.threadId}`);
  //   } catch (error) {
  //     console.error("Error creating thread:", error);
  //   }
  // };

  const createThread = async () => {
    router.push("/chat");
  };

  const handleDeleteClick = async (thread: ThreadPreview) => {
    try {
      await deleteThreadMutation(thread.threadId);
      if (selectedThread === thread.threadId) {
        router.push("/chat");
      }
      // Refresh the threads list after deletion
      refetch();
    } catch (error) {
      console.error("Error deleting thread:", error);
    }
  };

  const handleSelectThread = (threadId: string) => {
    router.push(`/chat?chatId=${threadId}`);
  };

  const handleLoadMore = () => {
    fetchNextPage();
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
              Note: Your embedded wallet will remain securely stored.
              You&apos;ll just need to log back in to access your account again.
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
      <div className="flex h-screen overflow-hidden bg-background relative">
        {/* Confirm Dialog */}
        <Dialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
        >
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
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] md:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar container */}
        <div
          className={`fixed md:static h-full z-[70] transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:z-0 ${
            isSidebarCollapsed && window.innerWidth >= 768
              ? "w-[60px]"
              : "w-[260px]"
          }`}
        >
          <Sidebar
            threads={threads}
            selectedThread={selectedThread}
            onSelectThread={handleSelectThread}
            onCreateThread={createThread}
            onDeleteClick={handleDeleteClick}
            isLoading={isLoading}
            onLogoutClick={handleLogoutClick}
            isCollapsed={isSidebarCollapsed && window.innerWidth >= 768}
            onToggleCollapse={toggleSidebarCollapse}
            hasMore={!!hasNextPage}
            isLoadingMore={isFetchingNextPage}
            onLoadMore={handleLoadMore}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {showNavbar && <Navbar onMenuClick={toggleSidebar} />}
          <div className="flex-1 overflow-y-auto brainpower-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </WalletProvider>
  );
}
