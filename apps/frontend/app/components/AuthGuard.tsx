"use client";

import { usePrivy } from "@privy-io/react-auth";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { ready, authenticated, login } = usePrivy();

  if (!ready) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-[var(--background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        <p className="text-[var(--text-secondary)]">
          Loading authentication...
        </p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-6 bg-[var(--background)]">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Welcome to BrainPower
        </h1>
        <p className="text-[var(--text-secondary)] max-w-md text-center">
          Connect with your wallet or email to get started with your AI-powered
          chat experience.
        </p>
        <button
          onClick={login}
          className="px-6 py-3 gradient-button rounded-xl text-white font-medium hover:scale-105 transition-all duration-200"
        >
          Login to continue
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
