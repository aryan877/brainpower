import { XCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { ThreadPreview } from "../types";
import { WalletInfo } from "./WalletInfo";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { usePrivy } from "@privy-io/react-auth";
import { useStoreWallet } from "../hooks/wallet";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface SidebarProps {
  threads: ThreadPreview[];
  selectedThread: string | null;
  onSelectThread: (threadId: string) => void;
  onCreateThread: () => void;
  isLoading: boolean;
  onDeleteClick: (thread: ThreadPreview) => void;
  onLogoutClick: () => void;
}

export default function Sidebar({
  threads,
  selectedThread,
  onSelectThread,
  onCreateThread,
  isLoading,
  onDeleteClick,
  onLogoutClick,
}: SidebarProps) {
  const { createWallet } = useSolanaWallets();
  const { user } = usePrivy();
  const { mutateAsync: storeWallet } = useStoreWallet();
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);
  const [threadToDelete, setThreadToDelete] = useState<ThreadPreview | null>(
    null
  );

  const handleCreateSolanaWallet = async () => {
    try {
      setIsCreatingWallet(true);
      const wallet = await createWallet();
      await storeWallet({
        address: wallet.address,
        chainType: wallet.chainType,
      });
    } catch (error) {
      console.error("Error creating Solana wallet:", error);
    } finally {
      setIsCreatingWallet(false);
      setShowWalletDialog(false);
    }
  };

  const handleNewChatClick = () => {
    if (!user?.wallet) {
      setShowWalletDialog(true);
    } else {
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
    const date = new Date(thread.createdAt);
    return `Chat ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <>
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a Solana Wallet</DialogTitle>
            <DialogDescription className="pt-2">
              You need a Solana wallet to use BrainPower. Create one now to get
              started.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowWalletDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSolanaWallet}
              disabled={isCreatingWallet}
            >
              {isCreatingWallet ? "Creating..." : "Create Wallet"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

      <aside className="flex flex-col h-full bg-background border-r">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Button
              onClick={handleNewChatClick}
              disabled={isLoading}
              className="flex-1"
              variant="default"
              size="default"
            >
              {isLoading ? "Creating..." : "New Chat"}
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Chat threads list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pb-4">
          {threads.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm md:text-base">No chats yet</p>
              <p className="text-xs md:text-sm mt-2">
                {user?.wallet
                  ? "Click 'New Chat' to start a conversation"
                  : "Create a Solana wallet to start chatting"}
              </p>
            </div>
          ) : (
            <ul className="space-y-1 px-4">
              {threads.map((thread) => (
                <li
                  key={thread.threadId}
                  onClick={() => onSelectThread(thread.threadId)}
                  className={`flex justify-between items-center p-2 cursor-pointer rounded-lg hover:bg-muted transition-all duration-200 ${
                    selectedThread === thread.threadId ? "bg-muted border" : ""
                  }`}
                >
                  <span className="truncate text-foreground font-medium text-sm md:text-base">
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
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Wallet info at the bottom */}
        <div className="mt-auto border-t">
          <WalletInfo onLogoutClick={onLogoutClick} />
        </div>
      </aside>
    </>
  );
}
