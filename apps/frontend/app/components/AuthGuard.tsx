"use client";

import { usePrivy } from "@privy-io/react-auth";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { WelcomePage } from "./WelcomePage";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { ready, authenticated, login } = usePrivy();

  if (!ready) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-background">
        <motion.div
          animate={{
            scale: 1.2,
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <Image
            src="/text-logo.svg"
            alt="BrainPower Logo"
            width={200}
            height={40}
            priority
          />
        </motion.div>
        <p className="text-muted-foreground">Loading authentication...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <WelcomePage onLogin={login} />;
  }

  return <>{children}</>;
}
