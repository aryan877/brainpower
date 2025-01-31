import {
  XCircle,
  Loader2,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";
import { ThreadPreview } from "../types";
import { WalletInfo } from "./WalletInfo";
import { usePrivy } from "@privy-io/react-auth";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WalletSetupButton } from "./WalletSetupButton";

export interface SidebarProps {
  threads: ThreadPreview[];
  selectedThread: string | null;
  onSelectThread: (threadId: string) => void;
  onCreateThread: () => void;
  isLoading: boolean;
  onDeleteClick: (thread: ThreadPreview) => void;
  onLogoutClick: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export default function Sidebar({
  threads,
  selectedThread,
  onSelectThread,
  onCreateThread,
  isLoading,
  onDeleteClick,
  onLogoutClick,
  isCollapsed = false,
  onToggleCollapse,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: SidebarProps) {
  const { user } = usePrivy();
  const [threadToDelete, setThreadToDelete] = useState<ThreadPreview | null>(
    null
  );

  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);

  const handleNewChatClick = () => {
    if (user?.wallet?.delegated) {
      onCreateThread();
    }
  };

  const handleDeleteClick = async (
    thread: ThreadPreview,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setThreadToDelete(thread);
  };

  const confirmDelete = async () => {
    if (!threadToDelete) return;

    setDeletingThreadId(threadToDelete.threadId);
    try {
      await onDeleteClick(threadToDelete);
    } finally {
      setDeletingThreadId(null);
      setThreadToDelete(null);
    }
  };

  const formatThreadName = (thread: ThreadPreview) => {
    if (thread.title) {
      return thread.title;
    }
    return "New Chat";
  };

  const canCreateNewChat = user?.wallet?.delegated;
  const needsWalletSetup = !user?.wallet || !user.wallet.delegated;

  return (
    <>
      <Dialog
        open={threadToDelete !== null}
        onOpenChange={(open) => !open && setThreadToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setThreadToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deletingThreadId !== null}
            >
              {deletingThreadId ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <aside className="flex flex-col h-full bg-background border-r relative">
        <div className={`p-4 ${isCollapsed ? "px-2" : ""}`}>
          <div
            className={`flex items-center gap-2 mb-4 ${
              isCollapsed ? "flex-col" : ""
            }`}
          >
            {onToggleCollapse && isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="w-full h-8"
                onClick={onToggleCollapse}
                title="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            )}
            {canCreateNewChat ? (
              <Button
                onClick={handleNewChatClick}
                disabled={isLoading}
                className={`flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 ${
                  isCollapsed ? "w-full p-2" : ""
                }`}
                variant="default"
                size={isCollapsed ? "icon" : "default"}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquarePlus
                    className={`h-4 w-4 ${!isCollapsed && "mr-2"}`}
                  />
                )}
                {!isCollapsed && (isLoading ? "Creating..." : "New Chat")}
              </Button>
            ) : (
              <WalletSetupButton
                className={`flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 ${
                  isCollapsed ? "w-full p-2" : ""
                }`}
                variant="default"
              />
            )}
            <div
              className={`flex items-center ${isCollapsed ? "flex-col" : ""} gap-2`}
            >
              <ThemeToggle />
              {onToggleCollapse && !isCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex h-8 w-8"
                  onClick={onToggleCollapse}
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Chat threads list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pb-4">
          {threads.length === 0 ? (
            !isCollapsed && (
              <div className="p-4 text-center text-muted-foreground">
                <p className="text-sm md:text-base">No chats yet</p>
                <p className="text-xs md:text-sm mt-2">
                  {canCreateNewChat
                    ? "Click 'New Chat' to start a conversation"
                    : needsWalletSetup && user?.wallet
                      ? "Activate your wallet to start chatting"
                      : "Create a Solana wallet to start chatting"}
                </p>
              </div>
            )
          ) : (
            <>
              <ul className={`space-y-1 ${isCollapsed ? "px-2" : "px-4"}`}>
                {threads.map((thread) => (
                  <li
                    key={thread.threadId}
                    onClick={() => onSelectThread(thread.threadId)}
                    className={`flex items-center p-2 cursor-pointer rounded-lg hover:bg-muted transition-all duration-200 ${
                      selectedThread === thread.threadId
                        ? "bg-muted border"
                        : ""
                    } ${isCollapsed ? "justify-center" : "justify-between"}`}
                    title={isCollapsed ? formatThreadName(thread) : undefined}
                  >
                    {isCollapsed ? (
                      <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <>
                        <span className="truncate text-foreground font-medium text-sm md:text-base flex-1 mr-2">
                          {formatThreadName(thread)}
                        </span>
                        <Button
                          onClick={(e) => handleDeleteClick(thread, e)}
                          variant="ghost"
                          size="icon"
                          disabled={deletingThreadId === thread.threadId}
                          className="text-destructive hover:text-destructive/90 hover:bg-muted flex-shrink-0"
                        >
                          {deletingThreadId === thread.threadId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 transition-transform hover:scale-110" />
                          )}
                        </Button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              {hasMore && !isCollapsed && (
                <div className="px-4 mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={onLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Wallet info at the bottom */}
        <div className="mt-auto border-t">
          <WalletInfo onLogoutClick={onLogoutClick} isCollapsed={isCollapsed} />
        </div>
      </aside>
    </>
  );
}
