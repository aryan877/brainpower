import { X } from "lucide-react";
import { ReactNode } from "react";
import { createPortal } from "react-dom";

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
} as const;

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof sizeClasses;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: ModalProps) {
  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-[var(--background)] rounded-2xl w-full ${sizeClasses[size]} overflow-hidden border border-[var(--border-color)] animate-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="p-4 border-b border-[var(--border-color)]">
          <div className="flex justify-between items-center">
            <h3
              id="modal-title"
              className="text-xl font-semibold text-[var(--text-primary)]"
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1 hover:bg-[var(--hover-bg)] rounded-lg"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">{children}</div>

        {footer && (
          <div className="p-4 border-t border-[var(--border-color)] bg-[var(--secondary-bg)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
