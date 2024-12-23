import { Trash2 } from "lucide-react";
import { useState } from "react";
import Modal from "./Modal";
import { Thread, SidebarProps } from "../types";

export default function Sidebar({
  threads,
  selectedThread,
  onSelectThread,
  onCreateThread,
  onDeleteThread,
  isLoading,
}: SidebarProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<Thread | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatThreadName = (thread: Thread) => {
    if (thread.title) {
      return thread.title;
    }
    const date = new Date(thread.createdAt);
    return `Chat ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const handleDeleteClick = (e: React.MouseEvent, thread: Thread) => {
    e.stopPropagation();
    setThreadToDelete(thread);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!threadToDelete) return;

    setIsDeleting(true);
    try {
      await onDeleteThread(threadToDelete.threadId);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setThreadToDelete(null);
    }
  };

  const handleCloseModal = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setThreadToDelete(null);
    }
  };

  return (
    <>
      <aside className="w-64 gradient-panel flex flex-col h-full">
        <div className="p-4">
          <button
            onClick={onCreateThread}
            disabled={isLoading}
            className="w-full gradient-button text-white rounded-xl py-3 font-medium disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "New Chat"}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-4 text-center text-[var(--text-secondary)]">
              <p>No chats yet</p>
              <p className="text-sm mt-2">
                Click &apos;New Chat&apos; to start a conversation
              </p>
            </div>
          ) : (
            <ul className="space-y-1 px-2">
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
                  <span className="truncate text-[var(--text-primary)] font-medium">
                    {formatThreadName(thread)}
                  </span>
                  <button
                    onClick={(e) => handleDeleteClick(e, thread)}
                    className="text-red-400 hover:text-red-300 p-1.5 rounded-lg transition-all duration-200 hover:bg-red-500/10"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </aside>

      <Modal
        isOpen={deleteModalOpen}
        onClose={handleCloseModal}
        title="Delete Chat"
        footer={
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-all duration-200"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all duration-200 disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        }
      >
        <p className="text-[var(--text-secondary)]">
          Are you sure you want to delete{" "}
          <span className="text-[var(--text-primary)]">
            {threadToDelete ? formatThreadName(threadToDelete) : ""}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
}
