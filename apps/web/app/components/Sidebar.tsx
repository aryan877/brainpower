import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import {
  Loader2,
  LogIn,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";
import { ThreadPreview } from "../types";
import { ThemeToggle } from "./ThemeToggle";
import { WalletInfo } from "./WalletInfo";
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
  isAuthenticated?: boolean;
  onLogin?: () => void;
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
  isAuthenticated = false,
  onLogin,
}: SidebarProps) {
  const { user } = usePrivy();
  const [threadToDelete, setThreadToDelete] = useState<ThreadPreview | null>(
    null
  );

  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);

  const handleNewChatClick = () => {
    if (isAuthenticated && user?.wallet?.delegated) {
      onCreateThread();
    } else if (!isAuthenticated && onLogin) {
      onLogin();
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

  const canCreateNewChat = isAuthenticated && user?.wallet?.delegated;
  const needsWalletSetup =
    isAuthenticated && (!user?.wallet || !user.wallet.delegated);

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
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setThreadToDelete(null)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deletingThreadId !== null}
              className="w-full sm:w-auto"
            >
              {deletingThreadId ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <aside className="flex flex-col h-full bg-background border-r relative dark:border-border">
        <div className={cn("p-4", isCollapsed && "p-2")}>
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-6 mt-2">
              {onToggleCollapse && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onToggleCollapse}
                  title="Expand sidebar"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>
              )}

              {!isAuthenticated ? (
                <Button
                  onClick={onLogin}
                  className="p-2 h-10 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  variant="default"
                  size="icon"
                  title="Login"
                >
                  <LogIn className="h-4 w-4" />
                </Button>
              ) : canCreateNewChat ? (
                <Button
                  onClick={handleNewChatClick}
                  disabled={isLoading}
                  className="p-2 h-10 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  variant="default"
                  size="icon"
                  title={isLoading ? "Creating..." : "New Chat"}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquarePlus className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <WalletSetupButton
                  className="p-2 h-10 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  variant="default"
                  showIconOnly={true}
                />
              )}

              <ThemeToggle />
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center flex-1 gap-2">
                <div className="flex flex-1">
                  {!isAuthenticated ? (
                    <Button
                      onClick={onLogin}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 flex-1"
                      variant="default"
                    >
                      <LogIn className="h-4 w-4" />
                      <span className="ml-2">Login</span>
                    </Button>
                  ) : canCreateNewChat ? (
                    <Button
                      onClick={handleNewChatClick}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 flex-1"
                      variant="default"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MessageSquarePlus className="h-4 w-4" />
                      )}
                      <span className="ml-2">
                        {isLoading ? "Creating..." : "New Chat"}
                      </span>
                    </Button>
                  ) : (
                    <WalletSetupButton
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 flex-1"
                      variant="default"
                      showIconOnly={false}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                {onToggleCollapse && (
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
          )}
        </div>

        <div
          className={cn(
            "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pb-4",
            isCollapsed && "hidden"
          )}
        >
          {!isAuthenticated ? (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm md:text-base">Welcome to BrainPower</p>
              <p className="text-xs md:text-sm mt-2">
                Login to start chatting and create your own conversations
              </p>
              {!isCollapsed && (
                <Button
                  onClick={onLogin}
                  className="mt-4 w-full"
                  variant="outline"
                  size="sm"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login to Your Account
                </Button>
              )}
            </div>
          ) : threads.length === 0 ? (
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
                    className={`flex items-center p-2 cursor-pointer rounded-md hover:bg-muted transition-all duration-200 ${
                      selectedThread === thread.threadId
                        ? "bg-muted border-border"
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
                            <svg
                              className="h-4 w-4 transition-transform hover:scale-110 fill-current text-destructive"
                              viewBox="0 0 485 485"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g>
                                <g>
                                  <rect
                                    x="67.224"
                                    width="350.535"
                                    height="71.81"
                                  />
                                  <path d="M417.776,92.829H67.237V485h350.537V92.829H417.776z M165.402,431.447h-28.362V146.383h28.362V431.447z M256.689,431.447    h-28.363V146.383h28.363V431.447z M347.97,431.447h-28.361V146.383h28.361V431.447z" />
                                </g>
                              </g>
                            </svg>
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

        <div className="mt-auto border-t">
          {isAuthenticated ? (
            <WalletInfo
              onLogoutClick={onLogoutClick}
              isCollapsed={isCollapsed}
            />
          ) : (
            <div className={cn("p-4", isCollapsed && "hidden")}>
              <p className="text-xs text-muted-foreground">
                Login to access your wallet
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
