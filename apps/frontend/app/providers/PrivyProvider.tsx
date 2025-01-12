"use client";

import { PrivyProvider as Privy } from "@privy-io/react-auth";
import { ReactNode } from "react";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

if (!PRIVY_APP_ID) {
  throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not defined");
}

export function PrivyProvider({ children }: { children: ReactNode }) {
  return (
    <Privy
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#F972A5",
        },
        loginMethods: ["google"],
        embeddedWallets: {
          createOnLogin: "off",
          showWalletUIs: true,
        },
        solanaClusters: [
          {
            name: "mainnet-beta",
            rpcUrl:
              process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL ||
              "https://api.mainnet-beta.solana.com",
          },
          {
            name: "devnet",
            rpcUrl:
              process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL ||
              "https://api.devnet.solana.com",
          },
        ],
      }}
    >
      {children}
    </Privy>
  );
}
