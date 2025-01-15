"use client";

import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useState,
} from "react";
import Modal from "../components/Modal";

type ModalOptions = {
  title: string;
  content: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  onClose?: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
};

type ModalContextType = {
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;
  confirm: (
    options: Omit<ModalOptions, "footer" | "content"> & { content: ReactNode }
  ) => Promise<boolean>;
};

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalOptions, setModalOptions] = useState<ModalOptions | null>(null);
  const [resolveModal, setResolveModal] = useState<
    ((value: boolean) => void) | null
  >(null);

  const showModal = useCallback((options: ModalOptions) => {
    setModalOptions(options);
  }, []);

  const hideModal = useCallback(() => {
    setModalOptions(null);
    resolveModal?.(false);
    setResolveModal(null);
  }, [resolveModal]);

  const confirm = useCallback(
    (
      options: Omit<ModalOptions, "footer" | "content"> & { content: ReactNode }
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        setResolveModal(() => resolve);
        showModal({
          ...options,
          footer: (
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  resolve(false);
                  hideModal();
                }}
                className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-all duration-200 disabled:opacity-50"
                disabled={options.isLoading}
              >
                {options.cancelText || "Cancel"}
              </button>
              <button
                onClick={() => {
                  resolve(true);
                  hideModal();
                }}
                className={`px-4 py-2 rounded-xl text-white transition-all duration-200 disabled:opacity-50 ${
                  options.isDangerous
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
                }`}
                disabled={options.isLoading}
              >
                {options.isLoading
                  ? "Processing..."
                  : options.confirmText || "Confirm"}
              </button>
            </div>
          ),
        });
      });
    },
    [hideModal, showModal]
  );

  return (
    <ModalContext.Provider value={{ showModal, hideModal, confirm }}>
      {children}
      {modalOptions && (
        <Modal
          isOpen={true}
          onClose={() => {
            modalOptions.onClose?.();
            hideModal();
          }}
          title={modalOptions.title}
          size={modalOptions.size}
          footer={modalOptions.footer}
        >
          {modalOptions.content}
        </Modal>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
