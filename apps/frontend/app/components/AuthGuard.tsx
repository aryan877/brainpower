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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="relative"
        >
          <Image
            src="/logo-group.svg"
            alt="BrainPower Logo"
            width={180}
            height={40}
            className="h-8 w-auto"
            priority
          />
          <motion.div
            className="absolute -inset-6 rounded-full"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.5, 1],
            }}
            style={{
              background:
                "radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)",
            }}
          />
        </motion.div>
      </div>
    );
  }

  if (!authenticated) {
    return <WelcomePage onLogin={login} />;
  }

  return <>{children}</>;
}
