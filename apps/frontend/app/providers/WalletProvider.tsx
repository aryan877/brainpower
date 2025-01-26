'use client';

import { createContext, useContext, useState, ReactNode } from "react";
import { WalletModal } from "../components/WalletModal";

interface WalletContextType {
  openWalletModal: () => void;
  closeWalletModal: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWalletModal() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletModal must be used within a WalletProvider");
  }
  return context;
}

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const openWalletModal = () => setIsWalletModalOpen(true);
  const closeWalletModal = () => setIsWalletModalOpen(false);

  return (
    <WalletContext.Provider value={{ openWalletModal, closeWalletModal }}>
      {children}
      <WalletModal isOpen={isWalletModalOpen} onClose={closeWalletModal} />
    </WalletContext.Provider>
  );
} 