import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ThreadPreview } from "../types";
import { WalletInfo } from "./WalletInfo";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { usePrivy } from "@privy-io/react-auth";
import { useStoreWallet } from "../hooks/wallet";
import { ThemeToggle } from "./ThemeToggle";

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
          <button
            onClick={onCreateThread}
            disabled={isLoading}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg py-3 font-medium disabled:opacity-50 text-sm"
          >
            {isLoading ? "Creating..." : "New Chat"}
          </button>
          <ThemeToggle />
        </div>

        {!user?.wallet && (
          <button
            onClick={handleCreateSolanaWallet}
            disabled={isCreatingWallet}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg py-2 font-medium disabled:opacity-50 text-sm"
          >
            {isCreatingWallet
              ? "Creating Solana Wallet..."
              : "Create Solana Wallet"}
          </button>
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
                className={`flex justify-between items-center p-3 cursor-pointer rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 ${
                  selectedThread === thread.threadId
                    ? "bg-neutral-100 dark:bg-neutral-800 border"
                    : ""
                }`}
              >
                <span className="truncate text-foreground font-medium text-sm md:text-base">
                  {formatThreadName(thread)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(thread);
                  }}
                  className="text-destructive hover:text-destructive/90 p-1.5 rounded-lg transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex-shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
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
