"use client";

import { usePrivy } from "@privy-io/react-auth";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { WelcomePage } from "./WelcomePage";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { ready, authenticated, login } = usePrivy();
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!ready) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center">
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
          <motion.div
            animate={{
              opacity: [1, 0.5, 1],
              scale: [1, 0.97, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Image
              src={
                mounted && theme === "light"
                  ? "/logo-group-light.svg"
                  : "/logo-group.svg"
              }
              alt="BrainPower Logo"
              width={180}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!authenticated) {
    return <WelcomePage onLogin={login} />;
  }

  return <>{children}</>;
}
