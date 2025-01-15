import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ThreadPreview } from "../types";
import { WalletInfo } from "./WalletInfo";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { usePrivy } from "@privy-io/react-auth";
import { walletClient } from "../clients/wallet";

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
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

  const handleCreateSolanaWallet = async () => {
    try {
      setIsCreatingWallet(true);
      const wallet = await createWallet();
      await walletClient.storeWallet(wallet.address, wallet.chainType);
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
    <aside className="flex flex-col h-full bg-[var(--background)] border-r border-[var(--border-color)]">
      <div className="p-4">
        <button
          onClick={onCreateThread}
          disabled={isLoading}
          className="w-full gradient-button text-white rounded-lg py-3 font-medium disabled:opacity-50 text-sm"
        >
          {isLoading ? "Creating..." : "New Chat"}
        </button>
      </div>

      {/* Chat threads list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--border-color)] scrollbar-track-transparent pb-4">
        {!user?.wallet && (
          <div className="px-4 mb-4">
            <button
              onClick={handleCreateSolanaWallet}
              disabled={isCreatingWallet}
              className="w-full gradient-button text-white rounded-lg py-2 font-medium disabled:opacity-50 text-sm"
            >
              {isCreatingWallet
                ? "Creating Solana Wallet..."
                : "Create Solana Wallet"}
            </button>
          </div>
        )}

        {threads.length === 0 ? (
          <div className="p-4 text-center text-[var(--text-secondary)]">
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
                className={`flex justify-between items-center p-3 cursor-pointer rounded-lg hover:bg-[var(--hover-bg)] transition-all duration-200 ${
                  selectedThread === thread.threadId
                    ? "bg-[var(--hover-bg)] border border-[var(--border-color)]"
                    : ""
                }`}
              >
                <span className="truncate text-[var(--text-primary)] font-medium text-sm md:text-base">
                  {formatThreadName(thread)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(thread);
                  }}
                  className="text-red-400 hover:text-red-300 p-1.5 rounded-lg transition-all duration-200 hover:bg-red-500/10 flex-shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Wallet info at the bottom */}
      <div className="mt-auto border-t border-[var(--border-color)] pt-6">
        <WalletInfo
          onLogoutClick={onLogoutClick}
          onWithdrawClick={onWithdrawClick}
        />
      </div>
    </aside>
  );
}
