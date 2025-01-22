import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ThreadPreview } from "../types";
import { WalletInfo } from "./WalletInfo";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { usePrivy } from "@privy-io/react-auth";
import { useStoreWallet } from "../hooks/wallet";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

export interface SidebarProps {
  threads: ThreadPreview[];
  selectedThread: string | null;
  onSelectThread: (threadId: string) => void;
  onCreateThread: () => void;
  isLoading: boolean;
  onDeleteClick: (thread: ThreadPreview) => void;
  onLogoutClick: () => void;
  onWithdrawClick: () => void;
}

export default function Sidebar({
  threads,
  selectedThread,
  onSelectThread,
  onCreateThread,
  isLoading,
  onDeleteClick,
  onLogoutClick,
  onWithdrawClick,
}: SidebarProps) {
  const { createWallet } = useSolanaWallets();
  const { user } = usePrivy();
  const { mutateAsync: storeWallet } = useStoreWallet();
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

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
    <aside className="flex flex-col h-full bg-background border-r">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Button
            onClick={onCreateThread}
            disabled={isLoading}
            className="flex-1"
            variant="default"
            size="default"
          >
            {isLoading ? "Creating..." : "New Chat"}
          </Button>
          <ThemeToggle />
        </div>

        {!user?.wallet && (
          <Button
            onClick={handleCreateSolanaWallet}
            disabled={isCreatingWallet}
            className="w-full"
            variant="default"
            size="default"
          >
            {isCreatingWallet
              ? "Creating Solana Wallet..."
              : "Create Solana Wallet"}
          </Button>
        )}
      </div>

      {/* Chat threads list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pb-4">
        {threads.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p className="text-sm md:text-base">No chats yet</p>
            <p className="text-xs md:text-sm mt-2">
              Click &apos;New Chat&apos; to start a conversation
            </p>
          </div>
        ) : (
          <ul className="space-y-2 px-4">
            {threads.map((thread) => (
              <li
                key={thread.threadId}
                onClick={() => onSelectThread(thread.threadId)}
                className={`flex justify-between items-center p-3 cursor-pointer rounded-lg hover:bg-muted transition-all duration-200 ${
                  selectedThread === thread.threadId ? "bg-muted border" : ""
                }`}
              >
                <span className="truncate text-foreground font-medium text-sm md:text-base">
                  {formatThreadName(thread)}
                </span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(thread);
                  }}
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive/90 hover:bg-muted flex-shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Wallet info at the bottom */}
      <div className="mt-auto border-t">
        <WalletInfo
          onLogoutClick={onLogoutClick}
          onWithdrawClick={onWithdrawClick}
        />
      </div>
    </aside>
  );
}
