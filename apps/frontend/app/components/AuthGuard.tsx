"use client";

import { usePrivy } from "@privy-io/react-auth";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { ready, authenticated, login } = usePrivy();

  if (!ready) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading authentication...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-6 bg-background">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome to BrainPower
        </h1>
        <p className="text-muted-foreground max-w-md text-center">
          Connect with your wallet or email to get started with your AI-powered
          chat experience.
        </p>
        <Button onClick={login} size="lg" className="font-medium">
          Login to continue
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
